# Hlasování SVJ — aplikace pro schůze

Jednoduchý nástroj pro vedení schůze shromáždění SVJ: prezence → usnášeníschopnost → hlasování → výsledky → protokol → archiv. Funguje **offline**, nic se neinstaluje, žádný účet ani internet nepotřebuje.

## Co je v balíčku

- **index.html** — samotná aplikace (jeden soubor)
- **README.md** — tento návod

## Jak ji spustit (nejjednodušší, na schůzi)

1. Rozbal ZIP.
2. Poklepej na **index.html** — otevře se v prohlížeči (Chrome, Edge nebo Firefox).
3. Hotovo. Funguje bez internetu.

Tip: dej si na `index.html` zástupce na plochu, ať ho máš na schůzi hned po ruce.

## Než ji poprvé použiješ

1. Otevři **⚙ Nastavení** a zkontroluj/uprav **vlastnické podíly a jména** vlastníků. Podíly jsou předvyplněné jako rovné (1/24) — nastav je podle **prohlášení vlastníka**. Součet musí být 100 %.
2. Udělej si **zkušební schůzi nanečisto** (založ schůzi, označ pár přítomných, zkus jedno hlasování), ať si osaháš ovládání.

## Jak to funguje na schůzi

1. **➕ Nová schůze** — vyplň datum, čas, typ a zapisovatele.
2. **Prezence** — u přítomných klikni „PŘÍTOMEN". Nahoře se hned ukáže, zda je schůze usnášeníschopná.
3. **Hlasování** — „Zahájit hlasování", napiš text usnesení, vyber potřebnou většinu. Všichni přítomní jsou přednastaveni na **ZDRŽEL SE** — ty jen proklikáš ty, co hlasovali **ANO** nebo **NE**. Výsledek se počítá živě podle podílů.
4. **Uzavřít hlasování** — výsledek se uloží pod schůzi.
5. **Přehled a protokol → UKONČIT SCHŮZI** — schůze se uzamkne.
6. **📄 Vytvořit protokol schůze** → **🖨 Vytisknout / Uložit jako PDF** — vznikne hotový dokument k založení do dokumentace SVJ.

## Data a zálohy (důležité)

- Schůze se ukládají **v prohlížeči** toho počítače (a té internetové adresy), kde aplikaci používáš. Nejsou nikde na internetu.
- Pro přenos na jiný počítač nebo pro jistotu použij tlačítka **Záloha** (uloží soubor `.json`) a **Načíst**.
- Doporučení: po každé důležité schůze si udělej Zálohu.

## Volitelné: nahrání na web (GitHub Pages)

Když chceš aplikaci otevírat přes odkaz z libovolného zařízení:

1. Založ repozitář na GitHubu a nahraj do něj **index.html** (název `index.html` je nutný, aby se stránka otevřela na hlavní adrese).
2. Settings → Pages → Source „Deploy from a branch", branch `main`, složka `/root` → Save.
3. Za chvíli běží na `https://tvojejmeno.github.io/nazev-repa/`.

**Pozor (GDPR):** na veřejný repozitář nahraj **jen index.html**. Nikdy tam nenahrávej zálohu `.json` — obsahuje jména vlastníků a podíly.

## Poznámka k pravidlům

Aplikace používá pravidla vašeho SVJ: usnášeníschopnost = přítomnost více než 50 % podílů; potřebné většiny — prostá většina přítomných, tříčtvrtinová přítomných, nadpoloviční všech vlastníků (volba výboru), souhlas všech. Hlasuje se podle vlastnických podílů. Usnášeníschopnost se zobrazuje, ale hlasování neblokuje — platnost usnesení posuď podle stanov.
