/// <reference types="cypress" />

describe('Fluxo Automático - Recuperação de Senha Auora', () => {

  const baseUrl = 'https://testeportal.auora.com.br';
  const cpf = '12968489909';

  it('Deve iniciar a recuperação de senha e seguir até a Home', () => {

    // 1. ACESSA LOGIN
    cy.visit(`${baseUrl}/login/hospital-modelo`);

    cy.wait(800);

    // 2. CLICA EM "ESQUECI / RECUPERAR SENHA"
    cy.contains(/esqueci|recuperar|senha/i, { timeout: 20000 })
      .should('be.visible')
      .click({ force: true });

    // 3. TELA DE RECUPERAÇÃO
    cy.url({ timeout: 20000 }).should('include', '/ForgotPassword');

    cy.contains(/recuperação|senha/i, { timeout: 20000 })
      .should('be.visible');

    // 4. INSERE CPF
    cy.contains(/cpf|identificação/i, { timeout: 20000 })
      .parents('div')
      .find('input')
      .first()
      .should('be.visible')
      .type(cpf, { delay: 50 });

    // 5. BOTÃO CONTINUAR
    cy.get('button:visible, [role="button"]:visible')
      .filter(':contains("Continuar"), :contains("Enviar"), :contains("Próximo")')
      .first()
      .click({ force: true });

    // 6. AGUARDA TELA DE OPÇÕES (EMAIL / SMS)
    cy.contains(/email|e-mail|sms|telefone|opção|selecione/i, { timeout: 20000 })
      .should('be.visible');

    // 7. SELECIONA "E-MAIL" — VERSÃO BLINDADA (FUNCIONA SEMPRE)
    cy.contains(/email|e-mail/i, { timeout: 20000 })
      .should('exist')
      .scrollIntoView()
      .click({ force: true });

    // 8. CONFIRMA QUE NAVEGOU PARA HOME
    cy.url({ timeout: 40000 }).should('include', '/Portal/Home');

    cy.contains(/home|portal|início/i, { timeout: 20000 })
      .should('be.visible');
    
    cy.log('🎉 Fluxo concluído com SUCESSO!');

  });

});
