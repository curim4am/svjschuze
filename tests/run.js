// Testy aplikace (node + jsdom): node tests/run.js
// Načte index.html s daty ze svjdemo.json a prochází aplikaci tak, jak ji používá uživatel.
"use strict";
const fs = require("fs");
const path = require("path");
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require("jsdom")); }
catch (e) { console.error("Chybí jsdom – nainstalujte ho ve složce projektu: npm install --no-save jsdom"); process.exit(2); }

const ROOT = path.join(__dirname, "..");
const HTML = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const DEMO = fs.readFileSync(path.join(ROOT, "svjdemo.json"), "utf8");
const OPEN_ID = 1794470400002;   // naplánovaná schůze 12. 11. 2026 ve svjdemo.json
const CLOSED_ID = 1776297600001; // ukončená schůze 16. 4. 2026 ve svjdemo.json

// sady jednotek s ručně spočítaným součtem podílů (jmenovatel 13193)
const SET_6596 = ["2553/01", "2553/02", "2553/03", "2553/05", "2553/06", "2553/07", "2553/08", "2553/09", "2553/10", "2553/11", "2553/12", "2554/01", "2554/02"];
const SET_6597 = ["2553/02", "2553/03", "2553/04", "2553/06", "2553/08", "2553/09", "2553/11", "2553/12", "2554/01", "2554/03", "2554/04", "2554/13 – garáž"];
const GARAZ = "2554/13 – garáž";
// ¾ přítomných: přítomni všichni kromě garáže = 12480, ¾ = 9360
const SET_9360 = ["2553/01", "2553/02", "2553/03", "2553/04", "2553/05", "2553/06", "2553/07", "2553/08", "2553/09", "2553/11", "2553/12", "2554/01", "2554/02", "2554/03", "2554/04", "2554/05", "2554/06", "2554/07"];

// ---------- mini harness ----------
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function eq(a, b, msg) { if (a !== b) throw new Error((msg || "očekáváno") + ": " + JSON.stringify(b) + ", je " + JSON.stringify(a)); }
function ok(c, msg) { if (!c) throw new Error(msg); }
function has(text, part, msg) { if (!String(text).includes(part)) throw new Error((msg || "chybí text") + ": „" + part + "“"); }
function hasNot(text, part, msg) { if (String(text).includes(part)) throw new Error((msg || "nemá obsahovat") + ": „" + part + "“"); }

// ---------- aplikace ----------
function app(modify) {
  const data = JSON.parse(DEMO);
  if (modify) modify(data);
  const vc = new VirtualConsole(), errors = [];
  vc.on("jsdomError", (e) => { if (!/Not implemented/.test(e.message)) errors.push(e.message); });
  const dom = new JSDOM(HTML, {
    runScripts: "dangerously", pretendToBeVisual: true, url: "http://localhost/", virtualConsole: vc,
    beforeParse(w) {
      w.localStorage.setItem("svj_schuze", JSON.stringify(data));
      w.print = () => {}; w.scrollTo = () => {};
      w.URL.createObjectURL = () => "blob:x"; w.URL.revokeObjectURL = () => {};
    },
  });
  const w = dom.window, d = w.document;
  const a = {
    w, d, errors,
    ev: (js) => w.eval(js),
    state: () => w.eval("state"),
    M: () => w.eval("M()"),
    // viditelný obsah stránky (bez zdrojového kódu skriptu)
    view: () => [...d.body.children].filter((e) => e.tagName !== "SCRIPT").map((e) => e.textContent).join(" ").replace(/\s+/g, " "),
    button: (re) => [...d.querySelectorAll("button")].find((b) => re.test(b.textContent)),
    modal: () => d.querySelector(".modal"),
    modalOk: () => d.querySelector('.modal [data-a="ok"]').click(),
    unitId: (unit) => { const u = a.M().roster.find((x) => x.unit === unit); if (!u) throw new Error("není jednotka " + unit); return u.id; },
    open: (tab) => w.eval(`openMeeting(${OPEN_ID},'${tab || "prezence"}')`),
    present: (units) => { units.forEach((u) => { const id = a.unitId(u); if (!a.M().att[id].present) w.eval(`togglePresent(${id})`); }); },
    absent: (units) => { units.forEach((u) => { const id = a.unitId(u); if (a.M().att[id].present) w.eval(`togglePresent(${id})`); }); },
    startButton: () => a.button(/Zahájit hlasování/),
    // zahájí hlasování přes formulář, jako by klikal uživatel
    // bod programu: "p1"… (body z Přípravy), "elect" (volba orgánů schůze), "off" (mimo program)
    pickProg: (val) => { const sel = d.getElementById("vProg"); sel.value = val; sel.dispatchEvent(new w.Event("change", { bubbles: true })); },
    startVote: (text, type, prog) => {
      w.eval("setTab('hlasovani')");
      if (d.getElementById("vProg")) a.pickProg(prog || "p1");
      d.getElementById("vText").value = text;
      d.querySelector(`input[name="vType"][value="${type}"]`).checked = true;
      a.startButton().click();
    },
    // hlasy: ANO u jednotek v seznamu yes, ostatní přítomní podle rest
    cast: (yes, rest) => {
      a.M().roster.forEach((u) => { if (a.M().att[u.id].present) w.eval(`cast(${u.id},'${yes.includes(u.unit) ? "ANO" : rest}')`); });
    },
    closeVote: () => { w.eval("closeVote()"); const t = a.modal().textContent; a.modalOk(); return t; },
    lastVote: () => { const v = a.M().votes; return v[v.length - 1]; },
    proto: (id, full) => w.eval(`protoDoc(byId(${id}),${!!full})`),
  };
  return a;
}
const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
// bloky usnesení v protokolu (prvky a jejich text)
const usnEls = (html) => [...JSDOM.fragment(html).querySelectorAll(".usn")];
const pairs = (el) => [...el.querySelectorAll("dl.uft dt")].map((dt) => dt.textContent.trim() + " " + dt.nextElementSibling.textContent.trim());
const cells = (tr) => [...tr.children].map((c) => c.textContent.trim());
const usnBlocks = (html) => usnEls(html).map((e) => e.textContent.replace(/\s+/g, " "));

// =============== KROK 1: usnášeníschopnost, většiny, garáž, protokol ===============
test("usnášeníschopnost: 6596 z 13193 podílů nestačí", () => {
  const a = app(); a.open(); a.present(SET_6596);
  eq(a.ev("isQuorate(M())"), false, "isQuorate");
  has(text(a.proto(OPEN_ID)), "6596 z 13193 hlasů"); has(text(a.proto(OPEN_ID)), "nebylo usnášeníschopné");
});
test("usnášeníschopnost: 6597 z 13193 podílů stačí", () => {
  const a = app(); a.open(); a.present(SET_6597);
  eq(a.ev("isQuorate(M())"), true, "isQuorate");
  has(text(a.proto(OPEN_ID)), "6597 z 13193 hlasů"); has(text(a.proto(OPEN_ID)), "bylo usnášeníschopné"); hasNot(text(a.proto(OPEN_ID)), "nebylo usnášeníschopné");
});

test("prostá většina přítomných: 6597 ANO z 13193 přítomných = přijato", () => {
  const a = app(); a.open(); a.ev("setAllPresent(true)");
  a.startVote("Prostá – přijato", "prosta"); a.cast(SET_6597, "NE"); a.closeVote();
  eq(a.lastVote().result, true, "výsledek");
});
test("prostá většina přítomných: 6596 ANO z 13193 přítomných = nepřijato", () => {
  const a = app(); a.open(); a.ev("setAllPresent(true)");
  a.startVote("Prostá – nepřijato", "prosta"); a.cast(SET_6596, "NE"); a.closeVote();
  eq(a.lastVote().result, false, "výsledek");
});
test("¾ přítomných: 9360 ANO z 12480 přítomných (přesně 75 %) = přijato", () => {
  const a = app(); a.open(); a.ev("setAllPresent(true)"); a.absent([GARAZ]);
  a.startVote("Tříčtvrtinová – přijato", "ctvrt"); a.cast(SET_9360, "NE"); a.closeVote();
  eq(a.lastVote().result, true, "výsledek");
});
test("¾ přítomných: 9343 ANO z 12480 přítomných = nepřijato", () => {
  const a = app(); a.open(); a.ev("setAllPresent(true)"); a.absent([GARAZ]);
  // místo 2554/07 (525) hlasuje ANO 2554/08 (508): 9360 − 17
  const yes = SET_9360.filter((u) => u !== "2554/07").concat(["2554/08"]);
  a.startVote("Tříčtvrtinová – nepřijato", "ctvrt"); a.cast(yes, "NE"); a.closeVote();
  eq(a.lastVote().result, false, "výsledek");
});
test("většina všech: 6597 ANO (přítomni jen oni) = přijato", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Většina všech – přijato", "nadpvse"); a.cast(SET_6597, "NE"); a.closeVote();
  eq(a.lastVote().result, true, "výsledek");
});
test("většina všech: 6596 ANO z 7281 přítomných = nepřijato, prostá by prošla", () => {
  const a = app(); a.open(); a.present(SET_6596.concat(["2553/04"]));
  a.startVote("Většina všech – nepřijato", "nadpvse"); a.cast(SET_6596, "NE"); a.closeVote();
  eq(a.lastVote().result, false, "většina všech");
  a.startVote("Stejné hlasy prostou většinou", "prosta"); a.cast(SET_6596, "NE"); a.closeVote();
  eq(a.lastVote().result, true, "prostá většina");
});
test("všichni: všech 25 jednotek ANO = přijato", () => {
  const a = app(); a.open(); a.ev("setAllPresent(true)");
  a.startVote("Všichni – přijato", "vsichni"); a.cast(a.M().roster.map((u) => u.unit), "NE"); a.closeVote();
  eq(a.lastVote().result, true, "výsledek");
});
test("všichni: jedna jednotka se zdrží = nepřijato", () => {
  const a = app(); a.open(); a.ev("setAllPresent(true)");
  a.startVote("Všichni – zdržel se", "vsichni"); a.cast(a.M().roster.map((u) => u.unit).filter((u) => u !== "2553/05"), "ZDR"); a.closeVote();
  eq(a.lastVote().result, false, "výsledek");
});
test("všichni: chybí garáž, ostatní ANO = nepřijato", () => {
  const a = app(); a.open(); a.ev("setAllPresent(true)"); a.absent([GARAZ]);
  a.startVote("Všichni – chybí garáž", "vsichni"); a.cast(a.M().roster.map((u) => u.unit), "NE"); a.closeVote();
  eq(a.lastVote().result, false, "výsledek");
});

test("garáž hlasuje jako jedna jednotka (713/13193) zvoleným spoluvlastníkem", () => {
  const a = app(); a.open(); a.present(SET_6597);
  const gid = a.unitId(GARAZ);
  a.ev(`setWho(${gid},'Karel Hájek')`);
  a.startVote("Garáž hlasuje", "prosta"); a.cast([GARAZ], "NE"); a.closeVote();
  const v = a.lastVote(), g = v.snap.units.find((u) => u.unit === GARAZ);
  eq(v.snap.cA, 1, "počet ANO"); eq(g.who, "Karel Hájek", "hlasoval(a)"); eq(g.vote, "ANO", "hlas garáže");
  eq(Math.round(v.snap.ano * 13193 / 100), 713, "váha hlasu garáže");
  const p = text(a.proto(OPEN_ID, true));
  has(p, "Karel Hájek"); has(p, "713/13193");
});

test("protokol ukončené schůze 16. 4. 2026 (zjednodušený i kompletní)", () => {
  const a = app();
  a.ev(`openProtokolFor(${CLOSED_ID})`);
  const simple = a.view();
  has(simple, "IČO 26781816"); has(simple, "Přítomno 20 z 25 jednotek s 10758 z 13193 hlasů"); has(simple, "Usnesení č. 5"); hasNot(simple, "Jmenovité hlasování");
  eq((simple.match(/✓ PŘIJATO/g) || []).length, 4, "přijatá usnesení"); eq((simple.match(/✗ NEPŘIJATO/g) || []).length, 1, "nepřijatá usnesení");
  a.ev("setProtoVariant('full')");
  has(a.view(), "Jmenovité hlasování");
  eq(a.errors.length, 0, "chyby JS: " + a.errors.join("; "));
});

// O1: bez usnášeníschopnosti nelze hlasovat
test("O1: neusnášeníschopná schůze – „Zahájit hlasování“ je neaktivní s vysvětlením", () => {
  const a = app(); a.open(); a.present(SET_6596); a.ev("setTab('hlasovani')");
  const b = a.startButton();
  ok(b.disabled, "tlačítko má být neaktivní");
  has(b.parentElement.textContent, "není usnášeníschopné", "vysvětlení u tlačítka");
  a.d.getElementById("vText").value = "Pokus o hlasování";
  a.ev("startVote()");
  eq(a.M().current, null, "hlasování nesmí začít");
});
test("O1: usnášeníschopná schůze – „Zahájit hlasování“ je aktivní", () => {
  const a = app(); a.open(); a.present(SET_6597); a.ev("setTab('hlasovani')");
  ok(!a.startButton().disabled, "tlačítko má být aktivní");
});
test("O1: ztráta usnášeníschopnosti během hlasování → NEPŘIJATO s důvodem", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Všichni přítomní pro", "prosta"); a.cast(SET_6597, "NE");
  a.absent([GARAZ]); // 5884 z 13193
  const dlg = a.closeVote();
  has(dlg, "NEPŘIJATO", "dialog předem ukáže výsledek"); has(dlg, "shromáždění nebylo usnášeníschopné", "dialog ukáže důvod");
  const v = a.lastVote();
  eq(v.result, false, "výsledek"); eq(v.reason, "shromáždění nebylo usnášeníschopné", "důvod");
  const el = usnEls(a.proto(OPEN_ID)).pop();
  has(el.textContent, "NEPŘIJATO"); has(pairs(el).join(" / "), "Důvod nepřijetí: shromáždění nebylo usnášeníschopné");
});

// V1: příznak usnášeníschopnosti ve snímku a v protokolu
test("V1: snímek hlasování obsahuje quorate", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Usnášeníschopné", "prosta"); a.cast(SET_6597, "NE"); a.closeVote();
  eq(a.lastVote().snap.quorate, true, "quorate po hlasování s 6597");
  a.startVote("Pak neusnášeníschopné", "prosta"); a.cast(SET_6597, "NE"); a.absent([GARAZ]); a.closeVote();
  eq(a.lastVote().snap.quorate, false, "quorate po odchodu garáže");
});
test("V1: protokol u každého usnesení uvádí usnášeníschopné / neusnášeníschopné", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("A", "prosta"); a.cast(SET_6597, "NE"); a.closeVote();
  a.startVote("B", "prosta"); a.cast(SET_6597, "NE"); a.absent([GARAZ]); a.closeVote();
  const b = usnBlocks(a.proto(OPEN_ID));
  eq(b.length, 2, "počet usnesení");
  has(b[0], "% hlasů – usnášeníschopné"); has(b[1], "% hlasů – neusnášeníschopné");
});
test("V1: stará usnesení bez příznaku – dopočet ze snap.pres/snap.tot", () => {
  const a = app((d) => {
    // druhé ukončené schůzi se snímkem 6596/13193 chybí příznak quorate
    const m = d.meetings.find((x) => x.id === CLOSED_ID), v = JSON.parse(JSON.stringify(m.votes[0]));
    v.num = 6; v.snap.pres = 6596 / 13193 * 100; delete v.snap.quorate; m.votes.push(v);
  });
  const b = usnBlocks(a.proto(CLOSED_ID));
  eq(b.length, 6, "počet usnesení");
  for (let i = 0; i < 5; i++) has(b[i], "% hlasů – usnášeníschopné", "usnesení č. " + (i + 1) + " (10758 z 13193)");
  has(b[5], "50,0 % hlasů – neusnášeníschopné", "usnesení se 6596 z 13193");
});

// =============== Výchozí hlas „Zdržel se“ ===============
test("po zahájení mají všichni přítomní předvyplněno „Zdržel se“", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Výchozí zdržel se", "prosta");
  const b = a.M().current.ballots;
  eq(Object.keys(b).length, 12, "předvyplněné hlasy");
  ok(Object.values(b).every((x) => x === "ZDR"), "všechny hlasy jsou Zdržel se");
  a.ev(`cast(${a.unitId("2553/04")},'ANO')`);
  a.closeVote();
  const s = a.lastVote().snap; eq(s.cA, 1, "ANO"); eq(s.cZ, 11, "Zdržel se");
});
test("jednotka přihlášená během hlasování hlasuje jako „Zdržel se“", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Pozdní příchod", "prosta"); a.cast(SET_6597, "NE");
  a.present(["2553/01"]); a.closeVote();
  const u = a.lastVote().snap.units.find((x) => x.unit === "2553/01");
  ok(u, "pozdě příchozí jednotka je ve snímku"); eq(u.vote, "ZDR", "hlas pozdě příchozí jednotky");
});

// =============== KROK 3: průvodce většinou, bod programu ===============
const radioType = (a) => (a.d.querySelector('input[name="vType"]:checked') || {}).value;
const pickSubj = (a, label) => {
  const sel = a.d.getElementById("vSubj"), o = [...sel.options].find((x) => x.textContent === label);
  if (!o) throw new Error("není volba „" + label + "“"); sel.value = o.value; sel.dispatchEvent(new a.w.Event("change", { bubbles: true }));
};
test("N1: „O čem se hlasuje“ nastaví většinu a ukáže článek stanov", () => {
  const a = app(); a.open(); a.present(SET_6597); a.ev("setTab('hlasovani')");
  const cases = [
    ["Účetní závěrka a zpráva o hospodaření", "prosta", "čl. VI A odst. 3"],
    ["Změna stanov, domovního řádu nebo směrnic", "ctvrt", "čl. VI A odst. 4"],
    ["Modernizace a rekonstrukce zvyšující hodnotu (zateplení, okna)", "ctvrt", "čl. VI A odst. 4"],
    ["Volba člena výboru", "nadpvse", "čl. VI A odst. 5"],
    ["Změna podílů nebo poměru příspěvků do fondu oprav", "vsichni", "čl. VI A odst. 6"],
  ];
  cases.forEach(([label, type, art]) => {
    pickSubj(a, label);
    eq(radioType(a), type, "většina pro „" + label + "“");
    has(a.d.getElementById("vSubjArt").textContent, art, "článek pro „" + label + "“");
  });
});
test("N1: nabídka obsahuje všechny okruhy ze stanov (4 skupiny, 21 položek)", () => {
  const a = app(); a.open(); a.present(SET_6597); a.ev("setTab('hlasovani')");
  const groups = [...a.d.querySelectorAll("#vSubj optgroup")];
  eq(groups.length, 4, "skupiny");
  eq(groups.map((g) => g.querySelectorAll("option").length).join(","), "8,8,2,3", "položky ve skupinách");
  const all = [...a.d.querySelectorAll("#vSubj option")].map((o) => o.textContent);
  ["Běžná správa domu", "Volba orgánů schůze", "Úvěr", "Odměny výboru", "Jiné", "Zástavní právo k jednotce", "Členství v právnické osobě", "Změna účelu užívání stavby", "Změna stavby"].forEach((x) => ok(all.includes(x), "chybí „" + x + "“"));
});
test("N1: většinu lze po výběru ručně změnit", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.ev("setTab('hlasovani')"); a.pickProg("p2");
  pickSubj(a, "Změna stanov, domovního řádu nebo směrnic");
  a.d.querySelector('input[name="vType"][value="prosta"]').checked = true;
  a.d.getElementById("vText").value = "Ručně prostá většina";
  a.startButton().click(); a.cast(SET_6597, "NE"); a.closeVote();
  eq(a.lastVote().type, "prosta", "uložený typ většiny");
});

test("O5: nabídka bodů programu = body z Přípravy + Mimo program (volba orgánů už v programu je)", () => {
  const a = app(); a.open(); a.present(SET_6597); a.ev("setTab('hlasovani')");
  const opts = [...a.d.querySelectorAll("#vProg option")].filter((o) => o.value).map((o) => o.textContent);
  eq(JSON.stringify(opts), JSON.stringify(["1. Volba orgánů schůze", "2. Oprava střechy – výběr zhotovitele", "3. Zvýšení příspěvku do fondu oprav od 1. 1. 2027", "4. Různé", "Mimo program"]), "body programu");
});
test("O5: bez programu v Přípravě se nabídne Volba orgánů schůze a Mimo program", () => {
  const a = app((d) => { d.meetings.find((m) => m.id === OPEN_ID).zapis.program = ""; });
  a.open(); a.present(SET_6597); a.ev("setTab('hlasovani')");
  const opts = [...a.d.querySelectorAll("#vProg option")].filter((o) => o.value).map((o) => o.textContent);
  eq(JSON.stringify(opts), JSON.stringify(["Volba orgánů schůze", "Mimo program"]), "body programu");
});
test("O5: bez vybraného bodu programu hlasování nezačne", () => {
  const a = app(); a.open(); a.present(SET_6597); a.ev("setTab('hlasovani')");
  a.d.getElementById("vText").value = "Bez bodu programu";
  a.startButton().click();
  eq(a.M().current, null, "hlasování nesmí začít");
  has(a.view(), "Vyberte bod programu");
});
test("O5: bod programu se uloží do snímku a uvede v protokolu", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Shromáždění schvaluje zhotovitele střechy.", "prosta", "p2"); a.cast(SET_6597, "NE"); a.closeVote();
  eq(JSON.stringify(a.lastVote().snap.prog), JSON.stringify({ num: 2, text: "Oprava střechy – výběr zhotovitele" }), "snap.prog");
  has(usnBlocks(a.proto(OPEN_ID)).pop(), "Bod programu: 2. Oprava střechy – výběr zhotovitele");
});
test("O5: Mimo program – bez 100 % přítomných je hlasování neaktivní i se souhlasem", () => {
  const a = app(); a.open(); a.present(SET_6597); a.ev("setTab('hlasovani')");
  a.pickProg("off");
  const chk = a.d.getElementById("vOff"); chk.checked = true; chk.dispatchEvent(new a.w.Event("change", { bubbles: true }));
  ok(a.startButton().disabled, "tlačítko má být neaktivní");
  has(a.startButton().parentElement.textContent, "100 %", "vysvětlení");
  a.d.getElementById("vText").value = "Mimo program"; a.ev("startVote()");
  eq(a.M().current, null, "hlasování nesmí začít");
});
test("O5: Mimo program – při 100 % přítomných až po zaškrtnutí souhlasu všech", () => {
  const a = app(); a.open(); a.ev("setAllPresent(true)"); a.ev("setTab('hlasovani')");
  a.pickProg("off");
  ok(a.startButton().disabled, "bez souhlasu neaktivní");
  has(a.view(), "Všichni vlastníci souhlasí s projednáním bodu mimo program (čl. VI D odst. 2 stanov)");
  const chk = a.d.getElementById("vOff"); chk.checked = true; chk.dispatchEvent(new a.w.Event("change", { bubbles: true }));
  ok(!a.startButton().disabled, "se souhlasem aktivní");
  a.d.getElementById("vText").value = "Shromáždění schvaluje věc mimo program.";
  a.startButton().click(); a.cast(a.M().roster.map((u) => u.unit), "NE"); a.closeVote();
  eq(JSON.stringify(a.lastVote().snap.prog), JSON.stringify({ off: true }), "snap.prog");
  has(usnBlocks(a.proto(OPEN_ID)).pop(), "Mimo program – se souhlasem všech vlastníků");
});
test("O5: starší usnesení bez bodu programu – protokol bod neuvádí", () => {
  const a = app();
  usnBlocks(a.proto(CLOSED_ID)).forEach((b) => { hasNot(b, "Bod programu"); hasNot(b, "Mimo program"); });
});

// =============== Úkol z usnesení ===============
// vlastní úkoly s pevnými termíny (nezávislé na dnešním datu)
const T = (id, text, owner, due, status, extra) => Object.assign({ id, text, owner, due, status, source: "jine", meetingId: null, voteNum: null, note: "", created: "2020-01-01" }, extra || {});
const withTasks = (d) => {
  d.tasks = [
    T(1, "Opravit zvonek u vchodu 2553", "Jan Novák", "2020-03-31", "open"),
    T(2, "Objednat revizi výtahu", "Eva Černá", "2099-12-31", "open"),
    T(3, "Vymalovat sušárnu", "Filip Urban", "2026-01-31", "done", { doneAt: "2026-01-20" }),
    T(4, "Poptat pronájem sušárny", "Jan Novák", "", "cancelled"),
  ];
};

test("V2: úkol z usnesení – odpovědná osoba i termín jsou povinné", () => {
  const a = app(withTasks); a.open(); a.present(SET_6597);
  a.startVote("Usnesení s úkolem", "prosta"); a.cast(SET_6597, "NE"); a.closeVote();
  const n0 = a.state().tasks.length;
  a.ev("taskFromVote(1)");
  const add = () => a.button(/Přidat úkol/).click();
  a.d.getElementById("tText").value = "Zajistit tři nabídky"; add();
  eq(a.state().tasks.length, n0, "bez odpovědné osoby a termínu se úkol nepřidá"); has(a.view(), "odpovídá");
  a.d.getElementById("tOwner").value = "Jan Novák"; add();
  eq(a.state().tasks.length, n0, "bez termínu se úkol nepřidá");
  a.d.getElementById("tDue").value = "2026-12-31"; add();
  eq(a.state().tasks.length, n0 + 1, "s odpovědnou osobou a termínem se úkol přidá");
  const t = a.state().tasks[n0]; eq(t.voteNum, 1, "vazba na usnesení"); eq(t.owner, "Jan Novák", "odpovídá"); eq(t.due, "2026-12-31", "termín");
});
test("V2: úkol z usnesení – při úpravě nelze odpovědnou osobu ani termín smazat", () => {
  const a = app((d) => { withTasks(d); d.tasks.push(T(5, "Úkol z usnesení", "Jan Novák", "2099-06-30", "open", { source: "usneseni", meetingId: CLOSED_ID, voteNum: 2 })); });
  a.ev("go('ukoly')"); a.ev("toggleTask(5)");
  a.ev("ui.draft.owner=''"); a.ev("saveTask(5)");
  eq(a.state().tasks.find((t) => t.id === 5).owner, "Jan Novák", "odpovědná osoba zůstala");
  a.ev("ui.draft.owner='Jan Novák';ui.draft.due=''"); a.ev("saveTask(5)");
  eq(a.state().tasks.find((t) => t.id === 5).due, "2099-06-30", "termín zůstal");
});
test("V2: úkol mimo usnesení jde dál přidat bez odpovědné osoby a termínu", () => {
  const a = app(withTasks); a.open("ukoly");
  const n0 = a.state().tasks.length;
  a.ev("openMeetingTaskForm(0)");
  a.d.getElementById("tText").value = "Úkol bez termínu"; a.button(/Přidat úkol/).click();
  eq(a.state().tasks.length, n0 + 1, "úkol přidán");
});

// =============== Blok usnesení v protokolu ===============
test("blok usnesení: záhlaví, bod programu, citace, tabulka hlasů, patička", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Shromáždění schvaluje zhotovitele střechy.", "prosta", "p2"); a.cast(SET_6597.slice(0, 10), "NE"); a.closeVote();
  const time = a.lastVote().time;
  [false, true].forEach((full) => {
    const el = usnEls(a.proto(OPEN_ID, full))[0];
    // 1. záhlaví na jednom řádku: číslo vlevo, výrazný štítek vpravo
    const uh = el.firstElementChild;
    ok(uh.classList.contains("uh"), "záhlaví je první"); has(uh.textContent, "Usnesení č. 1");
    eq(uh.querySelector(".ub").textContent, "✓ PŘIJATO", "štítek výsledku");
    // 2. bod programu pod záhlavím
    eq(uh.nextElementSibling.textContent, "Bod programu: 2. Oprava střechy – výběr zhotovitele", "bod programu");
    // 3. znění v citaci
    const ut = el.querySelector("blockquote.ut"); ok(ut, "citace znění"); eq(ut.textContent, "Shromáždění schvaluje zhotovitele střechy.", "znění");
    // 4. tabulka PRO | PROTI | ZDRŽEL SE
    const tb = el.querySelector("table.uvt"); ok(tb, "tabulka výsledku");
    eq(cells(tb.querySelector("thead tr")).join("|"), "PRO|PROTI|ZDRŽEL SE", "záhlaví tabulky");
    const rows = [...tb.querySelectorAll("tbody tr")];
    // 10 ANO: 2553/02,03,04,06,08,09,11,12, 2554/01,03 = 3×508 + 6×525 + 685 = 5359 z 6597; 2 NE: 2554/04 + garáž = 525 + 713 = 1238
    eq(cells(rows[0]).join("|"), "10 jednotek|2 jednotky|0 jednotek", "počty jednotek");
    eq(cells(rows[1]).join("|"), "81,23 %|18,77 %|0,0 %", "podíly v %");
    eq(rows[1].querySelectorAll("b").length, 3, "procenta tučně");
    eq(tb.nextElementSibling.textContent, "% z hlasů přítomných", "základ procent");
    // 5. patička popisek: hodnota
    eq(JSON.stringify(pairs(el)), JSON.stringify(["Potřebná většina: Prostá většina přítomných (> 50 %)", "Přítomno: 50,0 % hlasů – usnášeníschopné", "Čas hlasování: " + time]), "patička " + (full ? "kompletní" : "zjednodušená"));
  });
});
test("blok usnesení: většina všech, nepřijato s důvodem, 1 jednotka", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Volba člena výboru", "nadpvse", "p1"); a.cast(["2553/04"], "ZDR"); a.absent([GARAZ]); a.closeVote();
  const el = usnEls(a.proto(OPEN_ID))[0];
  eq(el.querySelector(".ub").textContent, "✗ NEPŘIJATO", "štítek výsledku");
  eq(cells(el.querySelectorAll("table.uvt tbody tr")[0]).join("|"), "1 jednotka|0 jednotek|10 jednotek", "počty jednotek");
  eq(el.querySelector("table.uvt").nextElementSibling.textContent, "% z hlasů všech vlastníků", "základ procent");
  const p = pairs(el);
  has(p.join(" / "), "Přítomno: 44,6 % hlasů – neusnášeníschopné"); eq(p[p.length - 1], "Důvod nepřijetí: shromáždění nebylo usnášeníschopné", "důvod");
});
test("blok usnesení: starší usnesení bez bodu programu – řádek bodu chybí", () => {
  const a = app();
  usnEls(a.proto(CLOSED_ID)).forEach((el) => { const n = el.querySelector(".uh").nextElementSibling; ok(n.matches("blockquote.ut"), "po záhlaví hned znění"); });
});

// ---------- běh ----------
let failed = 0;
for (const t of tests) {
  try { t.fn(); console.log("OK    " + t.name); }
  catch (e) { failed++; console.log("FAIL  " + t.name + "\n      " + e.message); }
}
console.log("\n" + (tests.length - failed) + " / " + tests.length + " testů prošlo");
process.exit(failed ? 1 : 0);
