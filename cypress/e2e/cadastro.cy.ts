/// <reference types="cypress" />

describe('Cadastro automático completo - Auora', () => {

  // =========================================================
  // ⚙️ FUNÇÕES AUXILIARES
  // =========================================================
  function gerarCPF() {
    let n = Math.floor(Math.random() * 999999999) + 1;
    let nStr = ("000000000" + n).slice(-9);
    let total = 0;
    for (let i = 0; i <= 8; i++) total += parseInt(nStr[i]) * (10 - i);
    let resto = 11 - (total % 11);
    let dv1 = resto >= 10 ? 0 : resto;
    total = 0;
    for (let i = 0; i <= 8; i++) total += parseInt(nStr[i]) * (11 - i);
    total += dv1 * 2;
    resto = 11 - (total % 11);
    let dv2 = resto >= 10 ? 0 : resto;
    return nStr + dv1.toString() + dv2.toString();
  }

  function aguardarIrParaHome() {
    cy.log("⏳ Aguardando conclusão do cadastro…");
    // Usamos um timeout de 90 segundos para a URL final
    cy.url({ timeout: 90000 }).then((url) => {
      if (url.includes("/Portal/Home")) {
        cy.log("🎉 URL final carregada!");
        return;
      }
      cy.wait(2000);
      // Chamada recursiva para continuar esperando se não chegou na Home
      aguardarIrParaHome(); 
    });
  }

  // =========================================================
  // 🚀 TESTE PRINCIPAL (COM ETAPA DE SENHA ADICIONADA)
  // =========================================================
  it('Deve realizar o cadastro completo automaticamente em etapas', () => {

    const cpfGerado = gerarCPF();

    // 🌟 DADOS A SEREM PREENCHIDOS AUTOMATICAMENTE
    const NOME = "ANA";
    const SOBRENOME = "PAULA";
    const DATA_NASCIMENTO = "17/11/2000";
    const DDD = "47";
    const TELEFONE_NUMERO = "996718612";
    const EMAIL_FIXO = "carinecavalheiro15@gmail.com";
    const CONFIRMACAO_EMAIL = EMAIL_FIXO;
    // NOVO: SENHA
    const SENHA = "1234"; 
    const CONFIRMACAO_SENHA = "1234";
    
    const TELEFONE_COMPLETO = DDD + TELEFONE_NUMERO;

    cy.log("📌 CPF Gerado: " + cpfGerado);

    // 1. Navega e clica em "Cadastre-se"
    cy.visit("https://testeportal.auora.com.br/login/hospital-modelo");
    cy.contains(/cadastre-se/i, { timeout: 15000 }).should("be.visible").click({ force: true });
    cy.url().should("include", "/Register");

    // --- ETAPA 1: CPF ---
    cy.get("input:visible").first().clear().type(cpfGerado, { delay: 40 });
    cy.contains('Continuar').click(); 

    cy.wait(2000);

    // --- ETAPA 2: NOME, SOBRENOME, DATA DE NASCIMENTO ---
    cy.log("📝 ETAPA 2: Preenchendo Nome, Sobrenome e Data de Nascimento");
    
    cy.contains('label', 'Nome').parent().find('input').clear().type(NOME, { delay: 20 });
    cy.contains('label', 'Sobrenome').parent().find('input').clear().type(SOBRENOME, { delay: 20 });
    cy.contains('label', 'Data de nascimento').parent().find('input').clear().type(DATA_NASCIMENTO, { delay: 20 });
    
    cy.contains('Continuar').click(); 

    cy.wait(1000);

    // --- ETAPA 3: CELULAR ---
    cy.log("📞 ETAPA 3: Preenchendo Celular Completo: " + TELEFONE_COMPLETO);
    
    // O campo Celular é o segundo input visível
    cy.get('input:visible').eq(1).clear().type(TELEFONE_COMPLETO, { delay: 20 });
    cy.log("✅ Celular preenchido usando input:visible.eq(1)");

    cy.contains('Continuar').click(); 

    cy.wait(1000);

    // --- ETAPA 4: E-MAIL e CONFIRMAÇÃO ---
    cy.log("📩 ETAPA 4: Preenchendo E-mail (usando índices)");

    // E-MAIL (Primeiro input visível na Etapa 4)
    cy.get('input:visible').eq(0).clear().type(EMAIL_FIXO, { delay: 20 });
    cy.log("✅ E-mail preenchido usando input:visible.eq(0)");
    
    // CONFIRMAÇÃO DO E-MAIL (Segundo input visível na Etapa 4)
    cy.get('input:visible').eq(1).clear().type(CONFIRMACAO_EMAIL, { delay: 20 });
    cy.log("✅ Confirmação preenchida usando input:visible.eq(1)");

    cy.contains('Continuar').click(); 

    cy.wait(1000); // Aguarda carregamento da próxima tela (Etapa 5)

    // --- NOVO: ETAPA 5: SENHA e CONFIRMAÇÃO ---
    cy.log("🔑 ETAPA 5: Preenchendo Senha (1234)");

    // SENHA (Primeiro input visível na Etapa 5)
    cy.get('input:visible').eq(0).clear().type(SENHA, { delay: 20 });
    cy.log("✅ Senha preenchida (input:visible.eq(0))");

    // CONFIRMAÇÃO DA SENHA (Segundo input visível na Etapa 5)
    cy.get('input:visible').eq(1).clear().type(CONFIRMACAO_SENHA, { delay: 20 });
    cy.log("✅ Confirmação de Senha preenchida (input:visible.eq(1))");

    cy.contains('Continuar').click(); 

    cy.wait(3000); // Aguarda submissão e carregamento da Home

    // --- FINALIZAÇÃO ---
    aguardarIrParaHome();

    cy.location("pathname", { timeout: 90000 })
      .should("include", "/Portal/Home");

    cy.log("🎉 CADASTRO FINALIZADO COM SUCESSO!");
  });

});