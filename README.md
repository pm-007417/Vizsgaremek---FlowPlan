# Vizsgaremek - FlowPlan

**FlowPlan** egy modern, webalapú projektmenedzsment alkalmazás vállalatok, szervezetek és csapatok számára. Célja, hogy átláthatóbbá és hatékonyabbá tegye a projektek és feladatok kezelését, miközben támogatja a csapaton belüli együttműködést.

---

## Fő funkciók

- Több szervezet („társaság") kezelése egy felhasználói fiókon belül
- JWT token alapú hitelesítés (regisztráció, bejelentkezés, automatikus tokencsere)
- Szerepkör alapú jogosultságkezelés: **Alapító · Admin · Manager · Tag**
- Projektek és feladatok létrehozása, módosítása, törlése (kétlépéses)
- Komment / üzenetküldés projektekhez és feladatokhoz
- Állapotkövetés: `Új · Folyamatban · Felfüggesztve · Kész · Késik · Archivált · Törölt`
- Reszponzív megjelenés: asztali táblázatos és mobilos kártyás nézet

---

## Célközönség

Startupok, cégek, non-profit szervezetek, egyesületek, kis és közepes csapatok, egyéni felhasználók.

---

## Technológiai stack

| Réteg | Technológia |
|---|---|
| Frontend | React, Vite, CSS Modules |
| Backend | Node.js, Express |
| Adatbázis | MySQL (mysql2) |
| Hitelesítés | JWT (access + refresh token) |

---

## Jogosultsági mátrix

| Funkció | Alapító | Admin | Manager | Tag |
|---|---|---|---|---|
| Társaság létrehozása | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Társaság törlése / deaktiválása | :white_check_mark: | :x: | :x: | :x: |
| Társaság nevének módosítása | :white_check_mark: | :white_check_mark: | :x: | :x: |
| Tag hozzáadása | :white_check_mark: | :white_check_mark: | :x: | :x: |
| Tag szerepkör módosítása | :white_check_mark: | :white_check_mark: | :white_check_mark:* | :x: |
| Alapító átruházása | :white_check_mark: | :x: | :x: | :x: |

*\* Manager csak Tag szerepkörű felhasználókat módosíthat*

---

## Telepítés és futtatás

### Követelmények
- Node.js
- MySQL adatbázis

### Backend

```bash
git clone https://github.com/...
cd backend
npm install
```

Hozz létre egy `.env` fájlt az alábbi minta alapján:

```env
HOST = localhost
DB_USERNAME = root
PASSWORD = ''
DATABASE_NAME = flowplan
MULTIPLE_STATEMENTS = true
JWT_SECRET = valami_nagyon_hosszu_random_szoveg
JWT_REFRESH_SECRET = titkos-kulcs
```

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Projektstruktúra

```
backend/
├── controllers/
├── dumps/
├── middlewares/
├── models/
├── routes/
├── tests/
├── test_reports/
├── utils/
├── validators/
├── database.js
└── server.js

frontend/src/
├── api/
├── assets/
├── components/
│   ├── common/
│   ├── company/
│   ├── project/
│   └── task/
├── context/
├── hooks/
├── layouts/
├── models/
├── pages/
├── routes/
└── utils/

---

## Mellékelt anyagok

| Anyag | Elérhetőség |
|---|---|
| Forráskód | [`/BACKEND`](./BACKEND) · [`/FRONTEND`](./FRONTEND) |
| Adatbázis dump | [`/BACKEND/dumps/`](./BACKEND/dumps) |
| Adatbázis modell diagram | [`/docs/db_diagram.png`](./docs/db_diagram.png) |
| Dokumentáció | [`/docs/FlowPlan_dokumentacio.md`](./docs/FlowPlan_dokumentacio.md) |
| Teszt dokumentáció | [`/docs/tesztelesi_dokumentacio.md`](./docs/tesztelesi_dokumentacio.md) |
| Tesztkód | [`/BACKEND/tests/`](./BACKEND/tests) |
| Teszteredmények | [`/BACKEND/test_reports/`](./BACKEND/test_reports) |

---

## Projekt állapota

Fejlesztés alatt

---

## Készítők

- Hegedüs Veronika
- Pelczhoffer Éva
- Pető Melinda
