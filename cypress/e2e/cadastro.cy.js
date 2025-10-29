/// <reference types="cypress" />

describe('🏥 Fluxo completo de Cadastro - Hospital Modelo (Auora)', () => {
  // ... (variáveis de dados) ...
  const urlLogin = 'https://testeportal.auora.com.br/login/hospital-modelo';
  const cpf = '171.552.960-07'; 
  const nome = 'Maria';
  const sobrenome = 'Luiza';
  const dataNascimento = '2000-10-29'; 
  const email = 'carine.cavalheiro@auora.com.br';
  const telefone = '47996718612';
  const senha = '2222';
  const token = '123456'; 

  it('Deve realizar o cadastro completo com sucesso', () => {
    Cypress.config('defaultCommandTimeout', 40000);

    cy.visit(urlLogin);

    // === 1. Clica em “Cadastre-se” ===
    cy.contains('Cadastre-se', { matchCase: false, timeout: 20000 })
      .should('be.visible')
      .click();

    // === 2. Espera pelo texto da tela de cadastro ===
    cy.contains('Digite seu CPF', { timeout: 35000 }).should('be.visible');

    // === 3. Digita o CPF (ÚLTIMA TENTATIVA DE SELETOR GENÉRICO) ===
    // *** SUBSTITUA A LINHA ABAIXO PELO SELETOR EXATO APÓS INSPECIONAR O ELEMENTO. ***
    cy.get('input[name*="cpf"], input[placeholder="CPF"], input#cpfInput', { timeout: 15000 }) 
      .should('be.visible')
      .should('not.have.attr', 'disabled')
      .type(cpf, { force: true, delay: 10 }); 
      
    // Espera para a validação do CPF
    cy.wait(1000);

    cy.contains('button', /continuar/i).should('be.enabled').click();

    // === 4. Aceita Termos e Política (Lógica condicional) ===
    cy.get('body').then(($body) => {
      if ($body.text().match(/termo de uso/i)) {
        cy.log('Termos de aceite encontrados. Marcando checkboxes...');
        cy.get('input[type="checkbox"]').eq(0).check({ force: true });
        cy.get('input[type="checkbox"]').eq(1).check({ force: true }); 
        cy.contains('button', /continuar|prosseguir/i)
          .should('be.enabled')
          .click({ force: true });
      }
    });

    // === 5. Digita e-mail e confirmação ===
    cy.get('input[placeholder*="E-mail"]', { timeout: 15000 })
      .should('be.visible')
      .type(email);
    cy.get('input[placeholder*="Confirmação do e-mail"], input[name="confirmEmail"]').last() 
      .should('be.visible')
      .type(email);

    cy.contains('button', /continuar/i).should('be.enabled').click();

    // === 6. Digita telefone ===
    cy.get('input[placeholder*="Telefone"], input[name="telefone"], input#telefone', { timeout: 15000 })
      .should('be.visible')
      .type(telefone, { delay: 10 });

    cy.contains('button', /continuar/i).should('be.enabled').click();

    // === 7. Digita nome, sobrenome e data ===
    cy.get('input[placeholder*="Nome"], input[name="firstName"]', { timeout: 15000 })
      .should('be.visible')
      .type(nome);
    cy.get('input[placeholder*="Sobrenome"], input[name="lastName"]')
      .should('be.visible')
      .type(sobrenome);
    
    cy.get('input[placeholder*="DD/MM/AAAA"], input[type="date"]', { timeout: 15000 })
      .should('be.visible')
      .type(dataNascimento); 

    cy.contains('button', /continuar/i).should('be.enabled').click();

    // === 8. Cria senha ===
    cy.get('input[placeholder*="Senha"], input[name="password"]', { timeout: 15000 })
      .should('be.visible')
      .type(senha, { log: false });
    cy.get('input[placeholder*="Confirmar senha"], input[name="confirmPassword"]').last()
      .should('be.visible')
      .type(senha, { log: false });

    cy.contains('button', /continuar/i).should('be.enabled').click();

    // === 9. Recebe código de verificação e continua ===
    cy.contains('button', /continuar/i, { timeout: 20000 }).click();
      
    // === 10. Digita token ===
    const tokenDigits = token.split('');
    cy.get('input[type="number"], input[pattern="[0-9]*"]', { timeout: 20000 }).as('tokenInputs');

    tokenDigits.forEach((digit, index) => {
        cy.get('@tokenInputs').eq(index).type(digit, { delay: 100 });
    });

    cy.contains('Finalizar', { timeout: 10000 }).should('be.enabled').click();

    // === 11. Valida sucesso do cadastro ===
    cy.url({ timeout: 30000 }).should('include', '/Portal/Home');
    cy.contains('O que você gostaria de agendar?', { timeout: 30000 }).should('be.visible');

    cy.log('🎉 Cadastro completo realizado com sucesso!');
  });
});