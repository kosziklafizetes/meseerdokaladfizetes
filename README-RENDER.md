# Meseerdő Családi Kalandnap 2026 – Render telepítés

Ez a projekt közvetlenül Renderre való. A `render.yaml` automatikusan létrehoz egy Node.js webszolgáltatást és egy PostgreSQL adatbázist, majd a `DATABASE_URL` változót összeköti a weboldallal.

## 1. Fontos: GitHub kell

A legegyszerűbb telepítéshez töltsd fel ezt a mappát egy GitHub repositoryba.

## 2. Render

Nyisd meg a Render Dashboardot, majd válaszd a **New → Blueprint** lehetőséget, és csatlakoztasd a GitHub repositoryt. A Render a repository gyökerében található `render.yaml` alapján felajánlja a webszolgáltatást és az adatbázist.

A kezdeti beállításkor három titkos/egyedi értéket kér:

- `ADMIN_PASSWORD` → `kosziklanapok`
- `ACCOUNT_NAME` → a valódi számlatulajdonos neve
- `ACCOUNT_NUMBER` → a valódi bankszámlaszám

## 3. Telepítés

Kattints a **Deploy Blueprint** gombra. A weboldalnak a telepítés után lesz egy `onrender.com` címe.

## 4. Fontos az adatbázis miatt

A projekt Render PostgreSQL-t használ, ezért a regisztrációk nem a webszolgáltatás ideiglenes fájlrendszerébe kerülnek.

A Render jelenlegi Free Postgres szolgáltatása 30 nap után lejár. Ez a jelenlegi, 2026. október 11-i rendezvényig várhatóan elegendő, ha a telepítést most, szeptemberben végzed el, de a rendezvény után vagy hosszabb távú használathoz érdemes fizetős adatbázisra váltani, illetve biztonsági mentést készíteni.

## 5. Helyi használat

Ha nincs `DATABASE_URL`, a program automatikusan visszavált a korábbi SQLite helyi adatbázisra. A `START-WINDOWS.bat` ezért továbbra is használható helyben.

## 6. Admin

Az admin felület az oldal alján található. A belépési jelszót a Render környezeti változóként kezeli.

## 7. Bankszámlaadatok

A weboldalon jelenleg csak az `ACCOUNT_NAME` és `ACCOUNT_NUMBER` környezeti változókban megadott adatok jelennek meg. Ezeket a Renderben a saját valódi adataidra kell beállítani.
