// Ecom Club - codigo do template (masterPage.js do Editor Wix classico).
// Igual ao do Studio, com duas diferencas: o letreiro da barra promocional e'
// um "Incorporar HTML" (#promoHtml, codigo em promo-letreiro.html), e banner e
// beneficios tem versao de computador e de celular - o codigo mostra a certa.
// Roda em todas as paginas: preenche cabecalho e rodape com os dados da loja
// do aluno, que o nosso backend grava no CMS (colecao EcomHome, 1 item).
// Cada elemento e' opcional: se um ID nao existir na pagina, so' pula.
import wixData from 'wix-data';
import wixWindow from 'wix-window';

// Executa sem quebrar o resto se o elemento nao existir
function el(id, fn) {
  try {
    const e = $w(id);
    if (e && e.id) fn(e);
  } catch (err) {
    // elemento ausente nesta pagina
  }
}

// Texto com link (Instagram/WhatsApp): troca o href mantendo o estilo do texto
function definirLink(e, url) {
  if (!url) {
    e.hide();
    return;
  }
  if ('link' in e) {
    e.link = url;
    e.target = '_blank';
  } else if (e.html && /href="/.test(e.html)) {
    e.html = e.html.replace(/href="[^"]*"/, `href="${url}"`);
  } else if (e.html) {
    e.html = `<a href="${url}" target="_blank">${e.html}</a>`;
  }
}

const HEX = /^#[0-9A-Fa-f]{6}$/;

// Preto ou branco, o que tiver mais contraste com o fundo
function textoSobre(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const x = parseInt(hex.slice(i, i + 2), 16) / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5 ? '#111111' : '#FFFFFF';
}

// Manda dados pra um HTML incorporado (agora e de novo quando ele avisa que carregou)
function mandar(id, dados) {
  el(id, (e) => {
    e.onMessage(() => e.postMessage(dados));
    e.postMessage(dados);
  });
}

$w.onReady(async () => {
  // Versoes do computador e do celular: o codigo mostra a certa
  const celular = wixWindow.formFactor === 'Mobile';
  el('#bannerDesktop', (e) => (celular ? e.collapse() : e.expand()));
  el('#bannerMobile', (e) => (celular ? e.expand() : e.collapse()));
  el('#beneficiosDesktop', (e) => (celular ? e.collapse() : e.expand()));
  el('#beneficiosMobile', (e) => (celular ? e.expand() : e.collapse()));

  let c;
  try {
    const { items } = await wixData.query('EcomHome').limit(1).find();
    c = items[0];
  } catch (err) {
    console.error('[ecomclub] EcomHome:', err);
  }
  if (!c) {
    el('#logoImg', (e) => e.show());
    return;
  }

  // Cores da marca
  const barra = HEX.test(c.corBarra || '') ? c.corBarra : null;
  const secundaria = HEX.test(c.corSecundaria || '') ? c.corSecundaria : null;
  if (barra) {
    el('#rodape', (e) => {
      try { e.style.backgroundColor = barra; } catch (err) {}
    });
  }
  if (secundaria) el('#promoBarra', (e) => (e.style.backgroundColor = secundaria));

  // Logo (fica "oculta ao carregar" no editor pra nao piscar a do template)
  el('#logoImg', (e) => {
    if (c.logo) e.src = c.logo;
    e.fitMode = 'fit';
    e.show();
  });

  // Top bar (HTML esticado): fundo na cor da barra + frases trocando
  mandar('#topbarHtml', {
    fundo: barra || undefined,
    cor: barra ? textoSobre(barra) : undefined,
    frases: [c.topbar1, c.topbar2],
  });

  // Letreiro (HTML esticado): frases e cores
  const dadosPromo = {
    frases: [c.promo1, c.promo2],
    fundo: secundaria || undefined,
    cor: secundaria ? textoSobre(secundaria) : undefined,
  };
  mandar('#promoHtml', dadosPromo);
  mandar('#promoLetreiro', dadosPromo);

  // Rodape: fundo de ponta a ponta (HTML esticado atras dos textos) + textos
  if (barra) mandar('#rodapeHtml', { fundo: barra });
  if (c.title) el('#rodapeNome', (e) => (e.text = c.title));
  if (c.missao) el('#rodapeMissao', (e) => (e.text = c.missao));
  el('#btnInstagram', (e) => definirLink(e, c.instagramUrl));
  el('#btnWhatsapp', (e) => definirLink(e, c.whatsappUrl));
  el('#copyText', (e) => (e.text = `© ${new Date().getFullYear()} ${c.title || ''}. Todos os direitos reservados.`));
});