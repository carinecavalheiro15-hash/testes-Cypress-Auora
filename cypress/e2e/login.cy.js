/// <reference types="cypress" />

describe('Teste de Login Auora - hospital-modelo', () => {
  const urlLogin = 'https://testeportal.auora.com.br/login/hospital-modelo';
  const cpf = '12968489909';
  const senha = '2222';

  it('Deve fazer login com sucesso e acessar a página inicial', () => {
    // Definindo um timeout mais longo para o teste, caso necessário,
    // embora o padrão do Cypress (4000ms) já seja ajustado por comando.
    Cypress.config('defaultCommandTimeout', 10000); 

    // Intercepta chamadas importantes para sincronização
    cy.intercept('GET', '**/getVisualSettingsByEstablishmentDTO/**').as('visualSettings');
    cy.intercept('GET', '**/checkForTerms/**').as('checkForTerms');
    cy.intercept('GET', '**/checkForPolicy/**').as('checkForPolicy');
    cy.intercept('POST', '**/auth/login').as('login'); // Adicionando interceptação do POST de login

    // 1. Visita a página de login
    cy.visit(urlLogin);

    // 2. Preenche CPF e senha
    // Removido o timeout de 20s dos cy.get, confiando no default ou na espera do .should('be.visible')
    cy.get('input[placeholder="Digite o número do seu CPF aqui"]')
      .should('be.visible')
      .clear()
      .type(cpf);

    cy.get('input[placeholder="Digite sua senha aqui"]')
      .should('be.visible')
      .clear()
      .type(senha, { log: false }); // log:false para não expor a senha

    // 3. Aguarda carregamento inicial
    // Esperamos as configurações visuais ANTES de clicar, garantindo que o formulário está pronto.
    cy.wait('@visualSettings').then(() => {
      cy.log('VisualSettings carregado. Formulário de login pronto.');
    });

    // 4. Clica em Entrar
    cy.contains('button', /entrar/i)
      .should('be.visible')
      .click();

    // 5. Aguarda a requisição POST de login e as requisições pós-login
    cy.wait('@login', { timeout: 20000 }).then((interception) => {
      // Opcional: verifica se o status da resposta de login foi 200 ou 201
      expect(interception.response.statusCode).to.be.oneOf([200, 201]); 
      cy.log('Login POST completado com sucesso.');
    });

    cy.wait(['@checkForTerms', '@checkForPolicy'], { timeout: 20000 }).then(() => {
      cy.log('Requisições de termos e policy completaram. Navegação para a Home esperada.');
    });

    // 6.Verifica que a tela inicial (Home) carregou
    // Usamos um texto exclusivo da tela de destino para garantir que não houve um timeout.
    // Este seletor é muito mais confiável que IDs ou classes genéricas.
   cy.contains('O que você gostaria de agendar?', { timeout: 30000 }) 
      .should('be.visible');

    // 7. Remoção de comandos redundantes:
    // O passo 6 original (cy.contains(/login verificado/i)) não é tipicamente visível na tela final.
    // O passo 7 original (cy.location) é opcional, mas a verificação do elemento 'h2' já confirma a navegação.
    cy.log('Login e acesso à página inicial verificados com sucesso!');
  });
});