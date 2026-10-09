# SVJ Buková — aplikace pro schůze, usnesení a úkoly

Samostatný projekt: funkční prototyp aplikace pro výbor SVJ v domě č.p. 2553 a 2554, Praha 3 (IČO 26781816).
Repozitář: https://github.com/curim4am/svjschuze

## Soubory
- `index.html` – celá aplikace (HTML + CSS + JS v jednom souboru, bez knihoven, funguje offline).
- `svjdemo.json` – ukázková data (vymyšlená jména): SJM, podílové spoluvlastnictví, garáž; 1 ukončená schůze (16. 4. 2026) + 1 naplánovaná (12. 11. 2026); 7 úkolů.
- `demo.zip` – demo verze (index.html se zabudovanými daty ze svjdemo.json, vlastní klíč `svj_schuze_demo`).
- `svjprazdna.json` – prázdná data v aktuálním formátu: 25 jednotek s podíly, `people:[]`, prázdný výbor, žádné schůze ani úkoly.
- `README.md` – návod pro uživatele.
- `_puvodni/` – předchozí verze (neupravovat).
- `.claude/launch.json` – lokální server: `python3 -m http.server 8765`.

## Pevná pravidla
- **Měnit jen to, o co je výslovně požádáno. NIC JINÉHO NEMĚNIT** (vzhled, texty, strukturu dat).
- Jeden soubor `index.html`, žádné externí knihovny ani CDN, žádný backend, žádný účet.
- Data jen v `localStorage` (klíč `svj_schuze`, demo `svj_schuze_demo`); zálohy jako `.json`.
- Demo verze se sestavuje skriptem z `index.html` + `svjdemo.json` (vloží data, změní klíč, přidá lištu „Demo verze“ a skryje „Začít načisto“).
- **GDPR:** zálohy `.json` nikdy nezveřejňovat ani nenahrávat na GitHub (obsahují jména a podíly). Na GitHub Pages jen `index.html`.
- Patička: `© 2026 curim4am`.
- Jednotky a podíly podle prohlášení vlastníka: 25 jednotek (24 bytů + garáž 2554/13), jmenovatel **13 193** – těchto 25 jednotek ani jejich podíly nelze měnit. Při změně prohlášení lze v Nastavení → Vlastníci a podíly **přidat jednotku** (označení, typ byt / nebytový prostor, podíl jako čitatel `cit`, vlastníci; `added:true`, přidanou lze i odebrat). Jmenovatel hlasů = součet čitatelů všech jednotek (`jmen()`); když se liší od 13 193, Nastavení zobrazí upozornění „Součet podílů neodpovídá prohlášení vlastníka“. Neukončená schůze přebírá jednotky z Nastavení a ukládá si jmenovatel (`m.jmen`, ve snímku hlasování `snap.jmen`); ukončené schůze si ponechají svůj snímek (bez `m.jmen` = 13 193). Za garáž (4 spoluvlastníci) hlasuje jeden z nich – vybírá se v Prezenci.
- Před předáním změn: kontrola syntaxe JS (`node --check`) a funkční test (např. jsdom: načíst `svjdemo.json`, otevřít schůzi, vygenerovat protokol).

## Právní rámec, ze kterého aplikace vychází
- Občanský zákoník (zákon č. 89/2012 Sb.): § 1206 (hlasy podle podílů, usnášeníschopnost), § 1207 (svolání, ¼ hlasů), § 1208 (působnost shromáždění), § 254 + § 1221 (náležitosti zápisu, 30 dnů).
- Stanovy SVJ 2016: čl. VI A odst. 2–6 (zmocnění, většiny), čl. VI C (svolání, pozvánka 15 dní), čl. VI D odst. 2–4 (program, zápis, přílohy, podpisy, uložení), čl. VII A odst. 1 (volba výboru včetně funkcí).
- Typy většin v aplikaci (`TYPES`): prostá přítomných (VI A 3), ¾ přítomných (VI A 4), většina všech (VI A 5), všichni (VI A 6).

## Stav aplikace k 2. 10. 2026 (po finální QA)
Detail schůze – záložky: neukončená **Příprava → Prezence → Hlasování → Zápis → Úkoly**; ukončená **Usnesení, Zápis, Údaje, Prezence, Úkoly**.
- **Příprava / Údaje**: datum, čas, typ (Řádné / Mimořádné shromáždění), místo (výchozí „velká sušárna“), předsedající, zapisovatel, ověřovatel, zahájil(a) (výběr z výboru a vlastníků, „Jiná osoba…“), svolavatel, pozvánka ze dne (upozornění při < 15 dnech), způsob svolání (e-mail, nástěnka, schránky, eDomovník – více možností + jiný způsob), program (bod na řádek).
- **Zápis**: průběh a poznámky, čas ukončení (vyplní se při „Ukončit schůzi“, lze upravit), námitky, přílohy (4 zaškrtávací standardní – výchozí všechny – a „Další přílohy“ po řádcích).
- **Zamykání**: po ukončení lze měnit jen záložku Zápis; vše ostatní až po „Odemknout pro opravu“ (v protokolu se uvede oprava).
- **Snímek**: neukončená schůze bere jména vlastníků i výbor z Nastavení; při ukončení si je uloží. Staré schůze (i po odemčení) se nedoplňují.
- **První usnesení** se předvyplní z Přípravy (volba předsedajícího, zapisovatele, ověřovatele, se skloňováním).
- **Nastavení → Vlastníci a podíly**: u jednotky seznam vlastníků `people:[{name,share}]` (share = podíl nebo „SJM“); `owner` = odvozený popisek („SJM: A a B“, „A (1/2), B (1/2)“). Starší data (`owner` + text `owners`) se převedou automaticky. Výběr osob a výbor pracují s každým vlastníkem zvlášť.
- **Prezence**: u přítomné jednotky se vybírá, kdo hlasuje (`att.who`, `att.pm` = plná moc); jediný vlastník se doplní sám. Ukládá se i do snímku hlasování (`snap.units[].who/pm`). Protokol: listina přítomných (zjednodušený i kompletní: jen přítomné jednotky) Jednotka · Vlastníci · Podíl (zlomek + % v závorce) · Hlasoval(a) – u zmocněnce „(plná moc)“ u jména, samostatný sloupec Plná moc není; jmenovité hlasování (kompletní verze): u každého usnesení celé znění a výsledky (stejný rámeček jako v části Usnesení) a pod ním tabulka Jednotka · Hlasoval(a) · Podíl · Hlas.
- **Listina k podpisu**: Jednotka · Vlastník · Podíl · Zástupce · Podpis (spoluvlastníci každý na svém řádku); vždy na jednu A4 (ověřeno tiskem do PDF).
- **Nastavení → Data a záloha → Začít načisto**: potvrzení slovem SMAZAT, nejdřív `backup()`, pak smaže `meetings` a `tasks`; roster a výbor zůstanou (v demo verzi skryto).
- **Úkoly**: rychlé termíny za měsíc / půl roku / rok. Splněný úkol je uzamčený, lze jen „Doplnit poznámku“ (s datem, zápis do historie); znovu otevřít ani upravit nejde.

## Protokol
Hlavička (IČO, sídlo, S 3907 MS v Praze), datum a čas včetně ukončení, druh, místo, svolavatel, svolání (pozvánka + způsob), zahájil, předsedající, zapisovatel, ověřovatel, výbor SVJ; prezence a usnášeníschopnost (stav na konci, x z 13 193 hlasů); průběh; usnesení ve tvaru „PRO n (x %) · PROTI … · ZDRŽEL SE … z hlasů přítomných / z hlasů všech vlastníků“ + potřebná většina, přítomno %, čas; úkoly; námitky; ukončení a věta o vyhotovení do 30 dnů, uložení u výboru a eDomovníku; přílohy (zaškrtnuté standardní + další, číslované); podpisy; listina přítomných; kompletní verze navíc jmenovité hlasování. Program se v protokolu nevypisuje (ani jako bod, ani jako příloha) – je v pozvánce.

## Ověřeno
- Podíly všech 25 jednotek odpovídají prohlášení vlastníka (PDF ve složce); garáž 2554/13 je nebytová jednotka 71,3 m², podíl 713/13193.
- Stanovy jsou ve složce i jako `stanovy.txt`. Per rollam (čl. VI E) a náhradní shromáždění aplikace neřeší.

## Rozhodnuto neřešit
Souběh rolí (zapisovatel = ověřovatel), pořadí a číslování příloh, propsání volby výboru do Nastavení, rovnost hlasů, upozornění na vývěsku, mobilní tabulka v Nastavení, skloňování zvláštních jmen, výběr výboru ze seznamu vlastníků.
