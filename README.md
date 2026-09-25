# SVJ Buková — schůze, usnesení, úkoly

Jednoduchý nástroj pro výbor SVJ: vedení schůze (prezence → hlasování), evidence usnesení a úkolů, které z nich vznikají. Funguje **offline**, nic se neinstaluje, nepotřebuje účet ani internet.

## Spuštění

Otevřete **index.html** v prohlížeči (Chrome, Edge, Firefox, Safari). Hotovo.

## Jak je aplikace uspořádaná

Nahoře je stálá navigace se čtyřmi oblastmi:

- **Přehled** — co se právě děje: probíhající schůze, úkoly po termínu, co je potřeba udělat a poslední usnesení.
- **Schůze** — seznam schůzí a založení nové. V detailu schůze pracujete během jednání.
- **Usnesení** — všechna rozhodnutí shromáždění seřazená podle schůzí, s hledáním a tiskem.
- **Úkoly** — co je potřeba udělat (z usnesení, podnětů vlastníků i zákonných povinností).
- **Nastavení** — vlastníci a podíly, záloha dat.

## Před první schůzí

V **Nastavení** zkontrolujte jména vlastníků a **podíly podle prohlášení vlastníka**. Součet musí být 100 %.

## Průběh schůze

1. **Schůze → + Nová schůze** → vyplňte datum, typ a zapisovatele → **Zahájit schůzi**.
2. **Prezence** — u přítomných klikněte „Nepřítomen" → „✓ Přítomen". Nahoře se hned ukazuje, zda je schůze usnášeníschopná.
3. **Hlasování** — napište návrh usnesení, zvolte potřebnou většinu, **Zahájit hlasování**. Všichni jsou předvyplnění na „Zdržel se"; proklikejte ANO/NE (nebo „Nastavit všem"). Výsledek se počítá živě podle podílů. **Uzavřít hlasování** usnesení uloží.
4. **Úkoly** — u každého usnesení je „+ Úkol", úkol ale můžete přidat i bez vazby na usnesení.
5. **Ukončit schůzi** — výsledky se uzamknou. **Protokol** vytisknete nebo uložíte jako PDF (zjednodušený / kompletní).

## Úkoly

Aktivní úkoly jsou rozdělené na *Po termínu*, *Termín do 14 dnů*, *Později* a *Bez termínu*. Kliknutím na úkol změníte stav (V řešení / Splněno / Zrušeno) a poznámku. Splněný úkol se uzamkne.

## Data a zálohy (důležité)

Data jsou uložená **jen v tomto prohlížeči**. Po každé schůzi si v **Nastavení → Stáhnout zálohu** stáhněte soubor `.json` a uložte ho mimo počítač. Na Přehledu vás aplikace upozorní, když je záloha starší než 30 dní.

## Nahrání na web (GitHub Pages) — volitelné

Nahrajte do repozitáře **jen index.html** (Settings → Pages → branch `main`, složka `/root`).

**Pozor (GDPR):** zálohu `.json` nikdy nenahrávejte na veřejný web — obsahuje jména vlastníků a podíly.

---
© 2026 curim4am
