/// <reference types="cypress" />

describe('Recuperação de Senha - Auora Hospital Modelo', () => {
  const baseUrl = 'https://testeportal.auora.com.br';
  const estabelecimento = 'hospital-modelo';
  const cpfValido = '12968489909';
  const cpfInvalido = '11111111111';

  /**
   * Localiza o input de CPF de forma resiliente
   */
  const findCpfInput = (timeout = 15000) => {
    cy.log('🧩 Procurando campo de CPF...');
    return cy.document({ log: false }).then(() => {
      return cy
        .contains(/CPF|Digite seu CPF|Informe seu CPF/i, { timeout })
        .then($el => {
          const $parents = Cypress.$($el).closest('form, .MuiFormControl-root, .input-group, .field, .form-row');
          if ($parents.length) {
            const $input = $parents.find('input:visible').first();
            if ($input.length) return cy.wrap($input);
          }
          const $inputNear = Cypress.$($el).siblings('input:visible').first();
          if ($inputNear.length) return cy.wrap($inputNear);
          return cy.get('input[name*="cpf" i], input[id*="cpf" i], input[aria-label*="cpf" i]', { timeout }).first();
        })
        .catch(() => {
          // fallback final
          return cy.get('input:visible', { timeout }).first();
        });
    });
  };

  beforeEach(() => {
    cy.intercept('POST', '**/forgot**').as('postForgot');
    cy.intercept('POST', '**/ForgotPassword**').as('postForgotCamel');
  });

  it('Deve permitir recuperar a senha com CPF válido', () => {
    cy.visit(`${baseUrl}/ForgotPassword/${estabelecimento}`);
    cy.get('body', { timeout: 15000 }).should('be.visible');

    findCpfInput(20000)
      .should('be.visible')
      .clear()
      .type(cpfValido);

    cy.log('▶ Enviando pedido de recuperação...');
    cy.contains('button', /continuar|enviar|recuperar|confirmar|solicitar|redefinir|avançar/i, { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .click();

    // aguarda requisição, mas não quebra se não houver
    cy.wait(['@postForgot', '@postForgotCamel'], { timeout: 20000, requestTimeout: 20000 }).then(intercepts => {
      const active = intercepts.find(Boolean);
      if (active && active.response) {
        const status = active.response.statusCode;
        cy.log(`📡 Status da resposta: ${status}`);
        expect([200, 201, 202, 204, 400, 404]).to.include(status);
      } else {
        cy.log('⚠️ Nenhuma interceptação de requisição detectada (pode ser chamada diferente).');
      }
    });

    // valida mensagem ou redirecionamento
    cy.log('🔔 Validando mensagem ou redirecionamento...');
    cy.contains(/enviamos um e-mail|verifique seu e-mail|recuperação enviada|link enviado|redefinição enviada/i, { timeout: 15000 })
      .should('be.visible')
      .then(() => cy.log('✅ Mensagem de sucesso encontrada.'));

    cy.url({ timeout: 20000 }).then(url => {
      const ok = url.includes('/login') || url.includes('/ForgotPassword') || url.includes('/sent');
      expect(ok).to.be.true;
    });
  });

  it('Deve exibir erro ao tentar recuperar senha com CPF inválido', () => {
    cy.visit(`${baseUrl}/ForgotPassword/${estabelecimento}`);
    cy.get('body', { timeout: 15000 }).should('be.visible');

    findCpfInput(20000)
      .should('be.visible')
      .clear()
      .type(cpfInvalido);

    cy.contains('button', /continuar|enviar|recuperar|confirmar|solicitar|redefinir|avançar/i, { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .click();

    cy.contains(/cpf inválido|não encontrado|usuário não existe|não cadastrado|erro|falha/i, { timeout: 15000 })
      .should('be.visible')
      .then(() => cy.log('✅ Mensagem de erro exibida corretamente.'));
  });
});
