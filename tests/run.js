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
    startVote: (text, type) => {
      w.eval("setTab('hlasovani')");
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
// bloky usnesení v protokolu
const usnBlocks = (html) => html.split('<div class="usn keep').slice(1).map((b) => text(b.split("</div></div>")[0]));

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
  const blk = usnBlocks(a.proto(OPEN_ID)).pop();
  has(blk, "NEPŘIJATO"); has(blk, "shromáždění nebylo usnášeníschopné");
});

// V1: příznak usnášeníschopnosti ve snímku a v protokolu
test("V1: snímek hlasování obsahuje quorate", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Usnášeníschopné", "prosta"); a.cast(SET_6597, "NE"); a.closeVote();
  eq(a.lastVote().snap.quorate, true, "quorate po hlasování s 6597");
  a.startVote("Pak neusnášeníschopné", "prosta"); a.cast(SET_6597, "NE"); a.absent([GARAZ]); a.closeVote();
  eq(a.lastVote().snap.quorate, false, "quorate po odchodu garáže");
});
test("V1: protokol u každého usnesení uvádí usnášeníschopné ano/ne", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("A", "prosta"); a.cast(SET_6597, "NE"); a.closeVote();
  a.startVote("B", "prosta"); a.cast(SET_6597, "NE"); a.absent([GARAZ]); a.closeVote();
  const b = usnBlocks(a.proto(OPEN_ID));
  eq(b.length, 2, "počet usnesení");
  has(b[0], "usnášeníschopné: ano"); has(b[1], "usnášeníschopné: ne");
});
test("V1: stará usnesení bez příznaku – dopočet ze snap.pres/snap.tot", () => {
  const a = app((d) => {
    // druhé ukončené schůzi se snímkem 6596/13193 chybí příznak quorate
    const m = d.meetings.find((x) => x.id === CLOSED_ID), v = JSON.parse(JSON.stringify(m.votes[0]));
    v.num = 6; v.snap.pres = 6596 / 13193 * 100; delete v.snap.quorate; m.votes.push(v);
  });
  const b = usnBlocks(a.proto(CLOSED_ID));
  eq(b.length, 6, "počet usnesení");
  for (let i = 0; i < 5; i++) has(b[i], "usnášeníschopné: ano", "usnesení č. " + (i + 1) + " (10758 z 13193)");
  has(b[5], "usnášeníschopné: ne", "usnesení se 6596 z 13193");
});

// =============== KROK 2: nezapsaný hlas ===============
const closeButton = (a) => a.button(/^\s*Uzavřít hlasování\s*$/);
const restButton = (a) => a.button(/Zbývající označit jako Zdržel se/);
test("O3: po zahájení nemá přítomná jednotka hlas – je „nezapsáno“", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Nezapsané hlasy", "prosta");
  eq(Object.keys(a.M().current.ballots).length, 0, "předvyplněné hlasy");
  const rows = [...a.d.querySelectorAll(".vrow:not(.head)")];
  eq(rows.length, 12, "řádky přítomných");
  rows.forEach((r) => { has(r.textContent, "nezapsáno"); eq(r.querySelectorAll('.vb[aria-pressed="true"]').length, 0, "vybraný hlas v řádku"); });
});
test("O3: „Uzavřít hlasování“ je neaktivní, dokud všichni přítomní nemají hlas", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Uzavření až po všech hlasech", "prosta");
  SET_6597.slice(0, 11).forEach((u) => a.ev(`cast(${a.unitId(u)},'ANO')`)); // garáž ještě nehlasovala
  ok(closeButton(a).disabled, "Uzavřít má být neaktivní");
  a.ev("closeVote()");
  ok(!a.modal(), "dialog uzavření se nemá otevřít"); eq(a.M().votes.length, 0, "uložená usnesení");
  a.ev(`cast(${a.unitId(GARAZ)},'NE')`);
  ok(!closeButton(a).disabled, "po zapsání všech hlasů je Uzavřít aktivní");
});
test("O3: „Zbývající označit jako Zdržel se“ změní jen nezapsané", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Zbývající zdržel se", "prosta");
  a.ev(`cast(${a.unitId("2553/04")},'ANO');cast(${a.unitId("2553/02")},'NE')`);
  restButton(a).click();
  const b = a.M().current.ballots;
  eq(b[a.unitId("2553/04")], "ANO", "zapsané ANO"); eq(b[a.unitId("2553/02")], "NE", "zapsané NE"); eq(b[a.unitId(GARAZ)], "ZDR", "nezapsaná garáž");
  eq(Object.keys(b).length, 12, "hlasy všech přítomných");
  ok(!closeButton(a).disabled, "Uzavřít je aktivní");
  a.closeVote();
  const s = a.lastVote().snap; eq(s.cA, 1, "ANO"); eq(s.cN, 1, "NE"); eq(s.cZ, 10, "Zdržel se");
});
test("O3: jednotka přihlášená během hlasování je „nezapsáno“", () => {
  const a = app(); a.open(); a.present(SET_6597);
  a.startVote("Pozdní příchod", "prosta"); a.cast(SET_6597, "NE");
  a.present(["2553/01"]); a.ev("setTab('hlasovani')");
  eq(a.M().current.ballots[a.unitId("2553/01")], undefined, "hlas pozdě příchozí jednotky");
  const row = [...a.d.querySelectorAll(".vrow:not(.head)")].find((r) => r.textContent.includes("2553/01"));
  has(row.textContent, "nezapsáno"); ok(closeButton(a).disabled, "Uzavřít má být neaktivní");
});
test("O3: starší uzavřená usnesení se nemění", () => {
  const before = JSON.parse(DEMO).meetings.find((m) => m.id === CLOSED_ID).votes;
  const a = app(); a.ev(`openMeeting(${CLOSED_ID})`);
  eq(JSON.stringify(a.state().meetings.find((m) => m.id === CLOSED_ID).votes), JSON.stringify(before), "usnesení ukončené schůze");
});

// ---------- běh ----------
let failed = 0;
for (const t of tests) {
  try { t.fn(); console.log("OK    " + t.name); }
  catch (e) { failed++; console.log("FAIL  " + t.name + "\n      " + e.message); }
}
console.log("\n" + (tests.length - failed) + " / " + tests.length + " testů prošlo");
process.exit(failed ? 1 : 0);
