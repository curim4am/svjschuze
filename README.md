# SVJ Buková — schůze, usnesení, úkoly

Jednoduchý nástroj pro výbor SVJ: vedení schůze (prezence → hlasování), evidence usnesení a úkolů, které z nich vznikají. Funguje **offline**, nic se neinstaluje, nepotřebuje účet ani internet.

## Spuštění

Otevřete **index.html** v prohlížeči (Chrome, Edge, Firefox, Safari). Hotovo.

## Jak je aplikace uspořádaná

Vlevo je stálá navigace (na mobilu dole) s pěti oblastmi:

- **Přehled** – co se právě děje: probíhající schůze, co vyžaduje pozornost (úkoly po termínu, naplánovaná schůze, neúplný zápis, stará záloha), úkoly na řadě a poslední schůze.
- **Schůze** – probíhající, naplánované a proběhlé schůze; založení nové. V detailu schůze pracujete během jednání.
- **Usnesení** – všechna rozhodnutí shromáždění seřazená podle schůzí, s hledáním a tiskem.
- **Úkoly** – co je potřeba udělat (z usnesení, podnětů vlastníků i zákonných povinností).
- **Nastavení** – výbor, vlastníci a podíly, záloha dat.

Stav dat a poslední zálohy je vidět vždy dole v navigaci. Každá obrazovka má vlastní adresu, takže funguje tlačítko Zpět v prohlížeči i obnovení stránky.

## Před první schůzí

V **Nastavení** vyplňte jednou centrální údaje – aplikace je pak sama použije u každé schůze:

- **Výbor** – jména a funkce členů výboru (předseda, členové, „+ Přidat člena“). Používá se při výběru předsedajícího a dalších osob, v návrhu volby orgánů schůze a v protokolu. Při změně složení stačí upravit jen tady; ukončená schůze si složení výboru uloží ke dni ukončení.
- **Vlastníci a podíly** – u každé jednotky všichni vlastníci, každý zvlášť (tlačítko „+ Přidat vlastníka“); u SJM nebo spoluvlastnictví doplňte „SJM“ nebo podíl (např. 1/2). **Jednotky a podíly jsou pevně nastavené podle prohlášení vlastníka** (25 jednotek: 24 bytů a garáž 2554/13, jmenovatel 13193) a nelze je měnit. Kdo za jednotku hlasuje, se vybírá až v Prezenci. Tamtéž tlačítkem **🖨 Listina k podpisu** vytisknete prezenční listinu (jednotka, vlastník, podíl, zástupce, podpis) – celá se vejde na jednu A4.

**Pravidlo:** každý údaj zadáte jen jednou, aplikace ho použije všude, kde je potřeba. Výchozí hodnoty jde u konkrétní schůze vždy upravit.

## Průběh schůze

**Nová schůze → Příprava → Prezence → Hlasování → Protokol**

1. **+ Nová schůze** – schůze se založí hned a otevře v Přípravě. Předvyplní se dnešní datum, čas a místo z poslední schůze, předsedající podle výboru a způsob svolání z poslední schůze.
2. **Příprava** – zkontrolujte datum a místo. **Předsedajícího, zapisovatele, ověřovatele zápisu** a kdo schůzi zahájil vyberete ze seznamu (výbor s funkcí, vlastníci s číslem jednotky); pro někoho jiného je volba „Jiná osoba…“. Dále svolavatel, datum pozvánky, **způsob svolání** (e-mailem, vyvěšením na nástěnce, vhozením do schránek, eDomovníkem – lze vybrat více) a **program** (každý bod na nový řádek). Dokud není zapsaná prezence, je schůze „V přípravě“ (s budoucím datem „Naplánovaná“).
3. **Prezence** – u přítomných klikněte „Nepřítomen“ → „✓ Přítomen“ a vyberte, **kdo za jednotku hlasuje**: jednoho z vlastníků, nebo „Zmocněnec (plná moc)…“ se jménem zmocněnce. U jednotky s jediným vlastníkem se vyplní sám. V protokolu je pak u každé jednotky vidět, kdo hlasoval; u zmocněnce je u jména „(plná moc)“. U SJM a spoluvlastníků se příznak neuvádí (řeší se dlouhodobým zmocněním). V hlavičce schůze je vidět, kolik podílů je přítomno a zda je schůze usnášeníschopná. Tlačítkem **Pokračovat na hlasování** přejdete dál.
4. **Hlasování** – **první usnesení je předvyplněné** podle Přípravy, např. *„Shromáždění volí předsedajícím Jana Dvořáka (předseda výboru), zapisovatelkou Petru Malou (2554/06) a ověřovatelem zápisu Martina Krále (2553/07), který není členem výboru.“* Jména se skloňují automaticky, text jde upravit. Další návrhy vložíte kliknutím na bod programu. Zvolte potřebnou většinu a **Zahájit hlasování**; proklikejte ANO/NE (nebo „Nastavit všem“). **Uzavřít hlasování** usnesení uloží; z oznámení můžete rovnou přidat úkol.
5. **Úkoly** – u každého usnesení je „+ Úkol z usnesení“, úkol ale můžete přidat i bez vazby na usnesení.
6. **Ukončit schůzi** – výsledky se uzamknou a **automaticky se stáhne záloha dat**. Po ukončení lze měnit už jen záložku **Zápis** (včetně času ukončení); ostatní údaje jen po „Odemknout pro opravu“. **Protokol** vytisknete nebo uložíte jako PDF (zjednodušený / kompletní). Sestaví se sám z přípravy, výboru, prezence a hlasování. Program je součástí pozvánky (příloha zápisu), v protokolu se znovu nevypisuje.

## Zápis ze schůze

Záložka **Zápis** (lze vyplňovat i po ukončení schůze; u ukončené schůze jsou údaje z přípravy v záložce **Údaje**):

- **Průběh a poznámky** – volný text; předvyplní se kontrola úkolů z minula. Formátování: `# nadpis`, `- odrážka`, `*tučně*` (tlačítka nad polem). U odrážky v náhledu tlačítko **+ úkol** vytvoří úkol.
- **Ukončení zasedání** – čas ukončení (vyplní se sám při „Ukončit schůzi“, lze ho upravit); propíše se do protokolu.
- **Námitky a přílohy** – námitky na žádost účastníka; přílohy zaškrtnete (pozvánka s programem, listina přítomných, plné moci, písemné podklady) a další dopíšete po řádcích.
- Vše se propíše do **protokolu**: údaje, usnášeníschopnost, program, průběh, usnesení s výsledky, úkoly ze schůze, podpisy a listina přítomných (kompletní verze navíc jmenovité hlasování). Protokol vytisknete, podepíšete a založíte.

## Úkoly

Aktivní úkoly jsou rozdělené na *Po termínu*, *Termín do 14 dnů*, *Později* a *Bez termínu*. Filtrovat je můžete i podle odpovědné osoby.

- Kroužkem vlevo úkol **jedním klikem splníte** (6 sekund jde akce vrátit).
- Kliknutím na úkol otevřete detail: upravíte popis, odpovědnou osobu, termín, poznámku i stav (V řešení / Splněno / Zrušeno). Každá změna se zapíše do **historie** úkolu.
- Splněný úkol se uzamkne – lze k němu jen doplnit poznámku (uloží se s datem a zapíše do historie).
- **🖨 Tisk přehledu** vytiskne stav úkolů k dnešnímu dni (po termínu, v řešení, splněné za posledních 12 měsíců) – hodí se k referování na shromáždění.

## Soubory v balíčku

- **index.html** – aplikace.
- **svjdemo.json** – ukázková data (vymyšlená jména, 6 proběhlých schůzí s usneseními, úkoly a zápisy a 1 naplánovaná schůze – na ní si vyzkoušíte celý průběh od prezence po protokol). Nahrajete přes **Nastavení → Obnovit ze zálohy**.
- **svjprazdna.json** – prázdná data pro **začátek načisto**: 25 jednotek s podíly podle prohlášení, bez jmen, schůzí a úkolů. Nahrajete stejně přes **Obnovit ze zálohy**.

Pozor: obnovení ze zálohy vždy **nahradí** data v prohlížeči – případná vlastní data si předtím stáhněte jako zálohu.

## Data a zálohy (důležité)

Data jsou uložená **jen v tomto prohlížeči**. Po každé schůzi si v **Nastavení → Stáhnout zálohu** stáhněte soubor `.json` a uložte ho mimo počítač. Na Přehledu vás aplikace upozorní, když je záloha starší než 30 dní. Když se data nedaří uložit (plné úložiště, anonymní okno), zobrazí se nahoře červená lišta s tlačítkem pro zálohu.

**Tip:** aplikaci mějte otevřenou jen v jednom okně/záložce prohlížeče – dvě otevřená okna by si mohla navzájem přepsat data. Když aplikace pozná, že se data změnila v jiném okně, nabídne načtení stránky znovu. Nepoužívejte anonymní (inkognito) okno, data by se po zavření smazala.

## Nahrání na web (GitHub Pages) — volitelné

Nahrajte do repozitáře **jen index.html** (Settings → Pages → branch `main`, složka `/root`).

**Pozor (GDPR):** zálohu `.json` nikdy nenahrávejte na veřejný web — obsahuje jména vlastníků a podíly.

---
© 2026 curim4am
