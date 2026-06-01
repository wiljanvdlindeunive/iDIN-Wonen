const steps = ["Basisgegevens", "Premie berekenen", "Aanvullende gegevens", "Overzicht", "Afronden"];
const banks = ["ING", "Rabobank", "ABN AMRO", "SNS", "ASN Bank", "RegioBank"];
const productOptions = {
  inboedel: { label: "Inboedel", price: 8.95, checks: ["Schade door vallen en stoten", "Schade door een ongelukje", "Schade ontstaan door cybercriminaliteit"] },
  opstal: { label: "Opstal", price: 12.75, checks: ["Schade door brand, neerslag, storm", "Kosten voor vervangende woonruimte bij schade", "Herbouw- of herstelkosten"] }
};

const state = {
  step: 0,
  idinPhase: "intro",
  selectedBank: "",
  form: {
    postcode: "3511 AA",
    huisnummer: "12",
    products: ["inboedel"],
    inwonend: "Ja",
    slotvraag1: "Nee",
    slotvraag2: "Nee",
    slotvraag3: "Nee",
    email: "sam@example.nl",
    telefoon: "",
    rekening: "",
    optin: false
  }
};

const app = document.getElementById("app");
const euro = value => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(value || 0);
const premium = () => state.form.products.reduce((sum, key) => sum + productOptions[key].price, 0);
const setState = patch => { Object.assign(state, patch); render(); };
const updateForm = (key, value) => { state.form[key] = value; render(); };
const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char]));

function shell(inner, { external = false, hideProgress = false, back = null } = {}) {
  app.innerHTML = `
    <div class="page">
      <div class="wrap">
        <header class="top">
          <div><p class="eyebrow">Prototype verzekering aanvragen</p><h1 class="title">Woonverzekering</h1></div>
          <div class="pill ${external ? "external" : ""}">${external ? "Externe iDIN omgeving" : "Aanvraagomgeving"}</div>
        </header>
        ${hideProgress ? "" : stepper()}
        <section class="card">${inner}</section>
        ${back ? `<button class="btn ghost" data-action="${back}">← Terug</button>` : ""}
      </div>
    </div>`;
  bindEvents();
}

function stepper() {
  return `<div class="stepper">${steps.map((label, i) => {
    const cls = i < state.step ? "done" : i === state.step ? "active" : "";
    return `<div class="step ${cls}"><div class="dot">${i < state.step ? "✓" : i + 1}</div><span>${label}</span></div>`;
  }).join("")}</div>`;
}

function benefits() {
  return `<aside class="side"><div class="benefits"><h3>Daarom woonverzekering aanvragen</h3><ul class="checklist"><li><span class="check">✓</span>Nooit onderverzekerd</li><li><span class="check">✓</span>Tot 10% pakketkorting</li><li><span class="check">✓</span>Dagelijks opzegbaar</li></ul></div></aside>`;
}

function stepCard(title, eyebrow, body, cta = "Volgende", action = "next") {
  return `<div class="grid"><div class="content"><p class="section-label">${eyebrow}</p><h2>${title}</h2><div class="stack">${body}</div><button class="btn" data-action="${action}">${cta}</button></div>${benefits()}</div>`;
}

function field(key, label, placeholder, type = "text") {
  return `<label class="field"><span>${label}</span><input data-field="${key}" type="${type}" value="${escapeHtml(state.form[key])}" placeholder="${placeholder}"></label>`;
}

function yesNo(key, question) {
  return `<div class="question"><p>${question}</p><div class="choice-row">${["Ja", "Nee"].map(v => `<button class="choice ${state.form[key] === v ? "active" : ""}" data-yn="${key}" data-value="${v}">${v}</button>`).join("")}</div></div>`;
}

function renderBasis() {
  shell(stepCard("Basisgegevens", "Stap 1", `${field("postcode", "Postcode", "1234 AB")}${field("huisnummer", "Huisnummer", "12")}`));
}

function renderPremie() {
  const products = Object.entries(productOptions).map(([key, product]) => {
    const selected = state.form.products.includes(key);
    return `<button class="product ${selected ? "selected" : ""}" data-product="${key}"><div class="product-head"><span class="box">${selected ? "✓" : ""}</span><div><b>${product.label}</b><br><span class="muted">vanaf ${euro(product.price)} per maand</span></div></div><ul class="checklist">${product.checks.map(c => `<li><span class="check">✓</span>${c}</li>`).join("")}</ul></button>`;
  }).join("");
  shell(stepCard("Premie berekenen", "Stap 2", `<div><span class="field"><span>Kies je verzekering</span></span><div class="product-grid">${products}</div></div><div class="notice"><b>Indicatieve premie:</b> ${euro(premium())} per maand</div>`), { back: "back" });
}

function renderAanvullend() {
  shell(stepCard("Aanvullende gegevens", "Stap 3", `${yesNo("inwonend", "Woont er iemand in de woning?")}<div class="notice">Hier kun je aanvullende productspecifieke vragen plaatsen, bijvoorbeeld over het type woning, beveiliging of gewenste ingangsdatum.</div>`), { back: "back" });
}

function renderOverzicht() {
  const chosen = state.form.products.map(p => productOptions[p].label).join(", ") || "Nog niet gekozen";
  const body = `<div class="summary"><b>Controleer je gegevens</b><br>Adres: ${escapeHtml(state.form.postcode)} ${escapeHtml(state.form.huisnummer)}<br>Verzekering: ${chosen}<br>Premie: ${euro(premium())} per maand</div>
  ${yesNo("slotvraag1", "Is in de afgelopen 5 jaar een verzekering van u of een belanghebbende bij deze verzekering geweigerd, opgezegd of geaccepteerd onder bijzondere voorwaarden?")}
  ${yesNo("slotvraag2", "Bent u of een belanghebbende bij deze verzekering in de afgelopen 8 jaar in aanraking geweest met politie of justitie, of verdacht of veroordeeld voor een strafbaar feit?")}
  ${yesNo("slotvraag3", "Heeft u of een belanghebbende bij deze verzekering in de afgelopen 5 jaar meer dan 2 schades geclaimd op een vergelijkbare verzekering?")}`;
  shell(stepCard("Overzicht en slotvragen", "Stap 4", body, "Naar afronden", "next"), { back: "back" });
}

function renderIdin() {
  let html = "";
  if (state.idinPhase === "intro") {
    html = `<div class="idin-screen"><div class="idin-box"><img class="idin-logo" src="assets/idin-logo.png" alt="iDIN logo"><p class="section-label" style="color:#047857">Je verlaat tijdelijk de aanvraag</p><h2>Bevestig je identiteit met iDIN</h2><p class="muted" style="line-height:1.8">We vragen je bank om je identiteit te bevestigen. Je keert daarna automatisch terug naar de aanvraag om ontbrekende gegevens aan te vullen.</p><button class="btn green" data-action="idin-bank">Start iDIN check</button></div></div>`;
  } else if (state.idinPhase === "bank") {
    html = `<div class="idin-screen"><div class="idin-box"><h2>Kies je bank</h2><p class="muted">Selecteer je bank om door te gaan met identificeren.</p><div class="bank-grid">${banks.map(b => `<button class="bank ${state.selectedBank === b ? "selected" : ""}" data-bank="${b}">${b}</button>`).join("")}</div><button class="btn green" data-action="idin-app" ${state.selectedBank ? "" : "disabled"} style="margin-top:22px">Verder naar bank app</button></div></div>`;
  } else {
    html = `<div class="idin-screen"><div class="phone"><div class="phone-inner"><div class="phone-top"></div><p class="muted"><b>${escapeHtml(state.selectedBank)}</b> app</p><h2>Identiteit bevestigen</h2><div class="notice">Naam: Sam de Vries<br>Geboortedatum: 14-05-1988<br>Adres: Voorbeeldstraat 12</div><button class="btn green" data-action="idin-done" style="width:100%;margin-top:18px">Bevestigen in app</button></div></div></div>`;
  }
  shell(html, { external: true, back: "back-to-overzicht" });
}

function renderAfronden() {
  const html = `<div class="grid"><div class="content"><p class="section-label">Stap 5</p><h2>Gegevens aanvullen</h2><div class="idin-success"><b>iDIN succesvol</b><br>Naam, geboortedatum en adres zijn opgehaald via ${escapeHtml(state.selectedBank)}.</div><div class="stack" style="margin-top:18px"><div class="form-row">${field("email", "E-mailadres", "naam@email.nl")}${field("telefoon", "Telefoonnummer", "06 12345678")}</div>${field("rekening", "Rekeningnummer", "NL00 BANK 0123 4567 89")}<label class="optin"><input data-field="optin" type="checkbox" ${state.form.optin ? "checked" : ""}> Ik ontvang graag tips en aanbiedingen over mijn verzekering.</label></div><button class="btn" data-action="finish" style="margin-top:26px">Verzekering afsluiten</button></div>${benefits()}</div>`;
  shell(html, { back: "back" });
}

function renderThanks() {
  shell(`<div class="center"><div class="icon-circle">✓</div><h2>Bedankt, je aanvraag is ontvangen</h2><p class="muted" style="line-height:1.8">Je woonverzekering is afgesloten. Je ontvangt een bevestiging op ${escapeHtml(state.form.email || "je e-mailadres")}.</p><button class="btn outline" data-action="restart">Prototype opnieuw starten</button></div>`, { hideProgress: true });
}

function render() {
  if (state.step === 0) renderBasis();
  else if (state.step === 1) renderPremie();
  else if (state.step === 2) renderAanvullend();
  else if (state.step === 3) renderOverzicht();
  else if (state.step === 4 && state.idinPhase !== "done") renderIdin();
  else if (state.step === 4) renderAfronden();
  else renderThanks();
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", e => {
    const action = e.currentTarget.dataset.action;
    if (action === "next") setState({ step: state.step + 1 });
    if (action === "back") setState({ step: Math.max(0, state.step - 1) });
    if (action === "back-to-overzicht") setState({ step: 3 });
    if (action === "idin-bank") setState({ idinPhase: "bank" });
    if (action === "idin-app") setState({ idinPhase: "app" });
    if (action === "idin-done") setState({ idinPhase: "done" });
    if (action === "finish") setState({ step: 5 });
    if (action === "restart") {
      state.step = 0; state.idinPhase = "intro"; state.selectedBank = ""; render();
    }
  }));
  document.querySelectorAll("[data-field]").forEach(el => el.addEventListener("input", e => {
    const key = e.currentTarget.dataset.field;
    state.form[key] = e.currentTarget.type === "checkbox" ? e.currentTarget.checked : e.currentTarget.value;
  }));
  document.querySelectorAll("[data-product]").forEach(el => el.addEventListener("click", e => {
    const key = e.currentTarget.dataset.product;
    const selected = state.form.products.includes(key) ? state.form.products.filter(p => p !== key) : [...state.form.products, key];
    updateForm("products", selected);
  }));
  document.querySelectorAll("[data-yn]").forEach(el => el.addEventListener("click", e => {
    updateForm(e.currentTarget.dataset.yn, e.currentTarget.dataset.value);
  }));
  document.querySelectorAll("[data-bank]").forEach(el => el.addEventListener("click", e => {
    setState({ selectedBank: e.currentTarget.dataset.bank });
  }));
}

render();
