/// <reference types="cypress" />

describe('Cancelar última agenda corretamente sem cair em Suporte', () => {
  const urlLogin = 'https://testeportal.auora.com.br/login/hospital-modelo';
  const cpf = '12968489909';
  const senha = '2222';

  it('Login automático + abrir agenda correta + cancelar', () => {

    Cypress.config('defaultCommandTimeout', 25000);

    // BLOQUEIA rota de suporte para impedir acesso
    cy.intercept('GET', '**/Portal/Support/**', {
      statusCode: 204,
      body: ''
    }).as('blockSupport');

    // LOGIN
    cy.visit(urlLogin);

    cy.get('input[placeholder="Digite o número do seu CPF aqui"]').type(cpf);
    cy.get('input[placeholder="Digite sua senha aqui"]').type(senha, { log: false });

    cy.contains('button', /entrar/i).click();

    // CORREÇÃO: Espera por um elemento mais confiável (Minhas Agendas) após o login
    // Isso substitui a busca pelo texto "o que você gostaria de agendar"
    cy.contains('Minhas Agendas', { timeout: 30000 }).should('be.visible');

    // IR PARA MINHAS AGENDAS
    cy.contains('Minhas Agendas').click();

    cy.location('pathname').should('include', '/MyAppointments');

    // AGUARDA LISTA DE AGENDAS
    cy.get('div.MuiCard-root', { timeout: 30000 })
      .should('have.length.greaterThan', 0);

    // ABRE A ÚLTIMA AGENDA REAL (Usando .first() para clicar no botão de detalhes)
    cy.get('div.MuiCard-root').last().within(() => {
      cy.get('button').first().click({ force: true });
    });

    // AGORA ESTAMOS NA AGENDA ABERTA
    cy.contains(/cancelar/i, { timeout: 20000 }).click({ force: true });

    cy.contains(/confirmar/i, { timeout: 20000 }).click({ force: true });

    // VALIDA SUCESSO REAL
    cy.contains(/sucesso|cancelado/i, { timeout: 20000 })
      .should('be.visible');
  });
});