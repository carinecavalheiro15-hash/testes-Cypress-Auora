/// <reference types="cypress" />

describe('Teste de Agendamento Auora - Hospital Modelo', () => {
    const urlLogin = 'https://testeportal.auora.com.br/login/hospital-modelo';
    const cpf = '12968489909'; 
    const senha = '2222';

    // Aumentando timeouts para maior estabilidade
    Cypress.config('defaultCommandTimeout', 20000); 
    Cypress.config('pageLoadTimeout', 70000); 

    it('Deve fazer login e agendar uma consulta com médico Elan (Fluxo Completo)', () => {
        
        // --- Configuração de Intercepts para Sincronização ---
        cy.intercept('GET', '**/getVisualSettingsByEstablishmentDTO/**').as('visualSettings');
        cy.intercept('GET', '**/checkForTerms/**').as('checkForTerms');
        cy.intercept('GET', '**/checkForPolicy/**').as('checkForPolicy');
        cy.intercept('POST', '**/auth/login').as('login'); 
        
        // INTERCEPT: Requisição que carrega os horários no card
        cy.intercept('GET', '**/consultationService/consultationScheduleSearch-new**').as('buscaHorarios');
        
        // INTERCEPT: Requisição para reservar/agendar o horário (Este endpoint pode variar)
        cy.intercept('POST', '**/consultationService/scheduleAppointment').as('reservaHorario'); 
        
        
        // --- 1. FLUXO DE LOGIN --- 
        cy.visit(urlLogin);
        
        cy.get('input[placeholder="Digite o número do seu CPF aqui"]', { timeout: 20000 })
            .should('be.visible')
            .clear() 
            .type(cpf);
        
        cy.get('input[placeholder="Digite sua senha aqui"]')
            .should('be.visible')
            .clear() 
            .type(senha, { log: false }); 
        
        cy.wait('@visualSettings', { timeout: 20000 });
        
        cy.contains('button', /entrar/i, { timeout: 20000 })
            .should('be.visible')
            .click();
        
        cy.wait('@login', { timeout: 30000 });
        cy.wait(['@checkForTerms', '@checkForPolicy'], { timeout: 30000 });
        
        cy.contains('O que você gostaria de agendar?', { timeout: 30000 }) 
            .should('be.visible');
        
        cy.log('✅ Login verificado com sucesso.');
        
        
        // --- 2. INÍCIO DO FLUXO DE AGENDAMENTO ---
        
        // 1. Clicar no card "Agendar Consulta"
        cy.contains(/Agendar Consulta/i, { timeout: 15000 })
            .should('be.visible')
            .click();
        
        // 2. Digitar 'elan' na caixa de busca
        cy.url({ timeout: 15000 }).should('include', '/appointment-search-function');
        cy.get('input[placeholder="Digite aqui a especialidade ou médico"]', { timeout: 20000 }) 
            .should('be.visible')
            .type('elan');
        
        // 3. Selecionar o médico "Elan"
        cy.contains('Elan de Lima Barbosa - Cardiologia / Dermatologia', { timeout: 20000 }) 
            .should('be.visible')
            .click();
        
        // 4. Selecionar o convênio "Particular"
        cy.get('input[placeholder="Selecione seu convênio e plano"]', { timeout: 15000 })
            .should('be.visible')
            .click();
        cy.contains('Particular', { timeout: 15000 }).should('be.visible').click();
        
        // 6. Clicar no botão "Pesquisar"
        cy.contains('button', 'Pesquisar', { timeout: 15000 }).should('be.visible').click();
        
        
        //  AGUARDA O CARREGAMENTO DOS HORÁRIOS DA API
        cy.log('Aguardando a requisição de busca de horários...');
        cy.wait('@buscaHorarios', { timeout: 30000 }); 
        
        // Valida que a tela de horários foi carregada
        cy.url({ timeout: 20000 }).should('include', '/scheduling-function');
        cy.contains('Escolha o local, data e horário da sua preferência', { timeout: 20000 }).should('be.visible');
        
        
        // 7. Selecionar o primeiro horário disponível
        cy.log('Buscando o primeiro horário disponível no Card do médico Elan...');
        
        //  SELEÇÃO DO HORÁRIO
        cy.contains('Dr(a). Elan de Lima Barbosa', { timeout: 30000 })
            .should('be.visible')
            .parents() 
            .filter(':has(button:not([disabled]))') // Encontra o container que possui o botão clicável
            .eq(0) 
            .scrollIntoView()
            .find('button:not([disabled])') // Procura o botão de horário
            .eq(0) // Pega o primeiro horário disponível (ex: 12:30)
            .click(); 
        
        
        // 8. Clicar no botão "Continuar o agendamento" no modal de confirmação (DISPARA A REQUISIÇÃO DE RESERVA)
        cy.log('Clicando em Continuar o agendamento no modal (dispara a reserva)...');
        cy.contains('button', 'Continuar o agendamento', { timeout: 15000 }) // Botão visível na imagem
            .should('be.visible')
            .click();

        // 9. AGUARDA A REQUISIÇÃO DE AGENDAMENTO (reserva) APÓS O CLIQUE
        cy.wait('@reservaHorario', { timeout: 20000 }); 
        
        // 10. Validar sucesso no MODAL FINAL 
        cy.contains('Agendamento confirmado!', { timeout: 20000 }) 
            .should('be.visible');
            
        // 11. Clicar em Pular no modal final de avaliação
        cy.contains('button', 'Pular', { timeout: 10000 })
            .should('be.visible')
            .click();
        
        cy.log('🎉 Agendamento concluído com sucesso!');
    });
    
    // Tratamento para erros não capturados (mantido)
    Cypress.on('uncaught:exception', (err, runnable) => {
        if (err.message.includes('status code 401') || err.message.includes('status code 500')) {
            return false; 
        }
        return true; 
    });
});