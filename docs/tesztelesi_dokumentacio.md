# Feladat API – Tesztelési dokumentáció

## Tartalomjegyzék

1. [Bevezetés és architektúra](#1-bevezetés-és-architektúra)
2. [Feladatok – Api tesztelési dokumentáció](#2-feladatok-task---api-tesztelési-dokumentáció)
3. [Projektek – Api tesztelési dokumentáció](#3-projekt-api--tesztelési-dokumentáció)
4. [Company - Api tesztelési dokumentáció](#4-company-api--tesztelési-dokumentáció)
5. [User - Api tesztelési dokumentáció](#5-user-api--tesztelési-dokumentáció)

---
---

## 1. Bevezetés és architektúra

Ez a dokumentum a Feladat API task-kezelő végpontjainak tesztelési stratégiáját és az összes tesztesetét írja le. A tesztek Jest + Supertest kombinációval futnak, valódi adatbázis-kapcsolat nélkül.

### 1.1 Tesztelési rétegek

A tesztek az alábbi három rétegre terjednek ki:

- **Validációs réteg** – express-validator szabályok (`taskValidators.js`)
- **Controller réteg** – üzleti logika, HTTP státuszkódok (`taskController.js`)
- **Routing réteg** – URL-paraméterek, hiányzó azonosítók

### 1.2 Mock stratégia

A tesztek `jest.mock('../database')` segítségével felülírják a valódi MySQL kapcsolatot. Így a tesztek determinisztikusak, gyorsak, és nem függnek a tesztadatbázis állapotától.

Az alapminta minden „sikeres eset" tesztnél:

```js
db.query.mockImplementationOnce((sql, params, cb) => cb(null, { affectedRows: 1 }));
```

A négy leggyakoribb mock variáns:

| Eset | Mock hívás | Mit szimulál |
|---|---|---|
| Sikeres DB művelet | `cb(null, { affectedRows: 1 })` | 1 sor érintett – siker |
| Nem talált rekordot | `cb(null, { affectedRows: 0 })` | 0 sor érintett – 403/404 válasz |
| DB hiba | `cb(new Error('...'), null)` | 500 szerverhiba |
| Duplikált rekord | `cb({ code: 'ER_DUP_ENTRY' }, null)` | 406 – már résztvevő |
| Multi-statement SQL | `cb(null, [{ affectedRows: 1 }, { affectedRows: 1 }])` | `insertNewTask` – 2 INSERT egyszerre |

> **Fontos:** `mockImplementationOnce` csak a következő hívásra érvényes, így az egymást követő tesztesetek nem zavarják egymást. Ha egy controller két `db.query` hívást tesz, mindkettőt külön kell mockolni – sorban, ahogy a controller hívja őket.

### 1.3 App felépítés a tesztekben

Minden tesztfájlban az Express app ugyanígy épül fel, a JWT authentikációt middleware-rel helyettesítjük:

```js
jest.mock('../database');
const db = require('../database');

const app = express();
app.use(express.json());

// token helyettesítése
app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
});
```

### 1.4 Tesztek futtatása

```bash
# Tesztek futtatása konzolon
npm test

# HTML riport generálása (test_reports/report.html)
npm run test:html
```

---

## 2. Feladatok (task) - Api tesztelési dokumentáció

**Keretrendszer:** Jest 29 + Supertest  
**DB stratégia:** `jest.mock('../database')`  
**Tesztelt modulok:** taskPost, taskPut, taskDelete  
**Összes teszteset:** 41

---

### 2.1 taskPost.test.js – POST végpontok

#### 2.1.1 POST `/:projekt_id/ujfeladat` – Új feladat létrehozása

A végpont egy új feladatot hoz létre a megadott projekthez. A controller `insertNewTask()` hívással dolgozik, amely multi-statement SQL-t tartalmaz (két INSERT egyszerre).

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres feladat létrehozás | `201` | `cb(null, [{affectedRows:1},{affectedRows:1}])` | `uzenet: 'Feladat sikeresen létrehozva'` |
| 2 | Hiányzó projekt_id az URL-ben | `404` | – (validátor dobja el) | Express 404 |
| 3 | Érvénytelen projekt_id (szöveg) | `400` | – (validátor dobja el) | `hibak[].mezo === 'projekt_id'` |
| 4 | Hiányzó cím (üres string) | `400` | – (validátor dobja el) | `hibak[].mezo === 'cim'` |
| 5 | Cím szám helyett string | `400` | – (validátor dobja el) | `hibak[].mezo === 'cim'` |
| 6 | Leírás szám helyett string | `400` | – (validátor dobja el) | `hibak[].mezo === 'leiras'` |
| 7 | Helytelen dátumformátum (pont helyett kötőjel) | `400` | – (validátor dobja el) | `hibak[].mezo === 'hatarido'` |
| 8 | Hiányzó tarsasag_id | `400` | – (validátor dobja el) | `hibak[].mezo === 'tarsasag_id'` |
| 9 | Szöveges tarsasag_id | `400` | – (validátor dobja el) | `hibak[].mezo === 'tarsasag_id'` |

#### 2.1.2 POST `/:feladat_id/felhasznalo_hozzaadas` – Felhasználó hozzáadása

A végpont egy felhasználót ad hozzá egy feladathoz. A controller `insertUserToTask()` SQL-je csak akkor szúr be sort, ha a felhasználó tagja az adott társaságnak – különben `affectedRows = 0` → 403.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres felhasználó hozzáadás | `201` | `cb(null, { affectedRows: 1 })` | `uzenet: 'Felhasználó sikeresen hozzáadva a feladathoz.'` |
| 2 | Felhasználó és feladat eltérő társaság | `403` | `cb(null, { affectedRows: 0 })` | `uzenet: 'A felhasználó és a feladat nem egy társasághoz tartozik.'` |
| 3 | Felhasználó már résztvevő (duplikáció) | `406` | `cb({ code: 'ER_DUP_ENTRY' }, null)` | `uzenet: 'A felhasználó már résztvevője...'` |
| 4 | Hiányzó feladat_id az URL-ben | `404` | – (validátor dobja el) | Express 404 |
| 5 | Érvénytelen feladat_id (szöveg) | `400` | – (validátor dobja el) | `hibak[].mezo === 'feladat_id'` |
| 6 | Hiányzó felhasznalo_id | `400` | – (validátor dobja el) | `hibak[].mezo === 'felhasznalo_id'` |
| 7 | Szöveges felhasznalo_id | `400` | – (validátor dobja el) | `hibak[].mezo === 'felhasznalo_id'` |

#### 2.1.3 POST `/:feladat_id/ujuzenet` – Üzenet küldése

A végpont egy új üzenetet hoz létre az adott feladathoz. Nincs jogosultság-ellenőrzés – bármely bejelentkezett felhasználó küldhet üzenetet.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres üzenet létrehozás | `201` | `cb(null, { affectedRows: 1 })` | `uzenet: 'Üzenet sikeresen hozzáadva'` |
| 2 | Hiányzó feladat_id az URL-ben | `404` | – (validátor dobja el) | Express 404 |
| 3 | Érvénytelen feladat_id (szöveg) | `400` | – (validátor dobja el) | `hibak[].mezo === 'feladat_id'` |
| 4 | Hiányzó tartalom (üres string) | `400` | – (validátor dobja el) | `hibak[].mezo === 'tartalom'` |
| 5 | Tartalom szám helyett string | `400` | – (validátor dobja el) | `hibak[].mezo === 'tartalom'` |

---

### 2.2 taskPut.test.js – PUT végpont

#### 2.2.1 PUT `/:feladat_id/feladat_modositas` – Feladat módosítása

A controller `updateTask()` hívással dolgozik – a jogosultság-ellenőrzés SQL-szinten történik (admin/manager szerepkör JOIN).

> **Megjegyzés a `leiras` mezőről:** A `taskPutValidator`-ban a `leiras` mező opcionális: ha nincs megadva vagy üres, elfogadja. Ha meg van adva, szövegnek kell lennie (szám esetén 400 hibát ad). Ez konzisztens a `projectPutValidator` viselkedésével.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres feladat módosítás | `200` | `cb(null, { affectedRows: 1 })` | `uzenet: 'Feladat módosítva.'` |
| 2 | Hiányzó feladat_id az URL-ben | `404` | – (validátor dobja el) | Express 404 |
| 3 | Érvénytelen feladat_id (szöveg) | `400` | – (validátor dobja el) | `hibak[].mezo === 'feladat_id'` |
| 4 | Hiányzó cím (üres string) | `400` | – (validátor dobja el) | `hibak[].mezo === 'cim'` |
| 5 | Cím szám | `400` | – (validátor dobja el) | `hibak[].mezo === 'cim'` |
| 6 | Helytelen dátumformátum | `400` | – (validátor dobja el) | `hibak[].mezo === 'hatarido'` |
| 7 | Hiányzó állapot (üres string) | `400` | – (validátor dobja el) | `hibak[].mezo === 'allapot'` |
| 8 | Állapot szám | `400` | – (validátor dobja el) | `hibak[].mezo === 'allapot'` |

---

### 2.3 taskDelete.test.js – DELETE végpontok

#### 2.3.1 DELETE `/:feladat_id/torles` – Feladat törlése

A controller kétlépéses logikát alkalmaz: először lekéri a feladat aktuális állapotát, majd dönt:

- Ha az állapot `'torolve'`: végleges törlés (hard delete)
- Egyéb esetben: soft delete (állapot → `'torolve'`)

Mivel a controller két `db.query` hívást tesz, mindkettőt mockolni kell `mockImplementationOnce`-szal – sorban:

```js
// soft delete esetén
db.query.mockImplementationOnce((sql, params, cb) => cb(null, [{ id: 1, allapot: 'uj' }]));   // selectTaskById
db.query.mockImplementationOnce((sql, params, cb) => cb(null, { affectedRows: 1 }));           // softDeleteTask
```

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Soft delete (állapot: `'uj'` → `'torolve'`) | `200` | 1. `cb(null,[{allapot:'uj'}])` 2. `cb(null,{affectedRows:1})` | `uzenet: 'A feladat a töröltek közé helyezve'` |
| 2 | Hard delete (állapot: `'torolve'`) | `200` | 1. `cb(null,[{allapot:'torolve'}])` 2. `cb(null,{affectedRows:1})` | `uzenet: 'Feladat véglegesen törölve'` |
| 3 | Feladat nem létezik | `404` | `cb(null, [])` | `uzenet: 'A feladat nem található'` |
| 4 | Érvénytelen feladat_id (szöveg) | `400` | – (validátor dobja el) | `hibak[].mezo === 'feladat_id'` |
| 5 | Hiányzó feladat_id az URL-ben | `404` | – (validátor dobja el) | Express 404 |

#### 2.3.2 DELETE `/:feladat_id/felhasznalo_torles` – Felhasználó eltávolítása

A controller először ellenőrzi a kérelmező szerepkörét (`selectTaskUserRole`), majd végrehajtja a törlést (`deleteUserFromTask`). Szintén kétlépéses mock szükséges.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres felhasználó eltávolítás | `200` | 1. `cb(null,[{szerepkor:'admin'}])` 2. `cb(null,{affectedRows:1})` | `uzenet: 'Felhasználó törölve a feladat résztvevői közül'` |
| 2 | Kérelmezőnek nincs jogosultsága | `403` | `cb(null, [])` | `uzenet: 'Nincs admin/manager jogosultság...'` |
| 3 | Törlendő felhasználó nem résztvevő | `404` | 1. `cb(null,[{szerepkor:'admin'}])` 2. `cb(null,{affectedRows:0})` | `uzenet: 'A felhasználó nem résztvevője a feladatnak'` |
| 4 | Hiányzó feladat_id az URL-ben | `404` | – (validátor dobja el) | Express 404 |
| 5 | Érvénytelen feladat_id (szöveg) | `400` | – (validátor dobja el) | `hibak[].mezo === 'feladat_id'` |
| 6 | Hiányzó torlendo_felhasznalo_id | `400` | – (validátor dobja el) | `hibak[].mezo === 'torlendo_felhasznalo_id'` |
| 7 | Szöveges torlendo_felhasznalo_id | `400` | – (validátor dobja el) | `hibak[].mezo === 'torlendo_felhasznalo_id'` |

---

### 2.4 Összefoglalás

| Fájl | Tesztesetek | Sikeres eset | Validációs eset |
|---|:---:|:---:|:---:|
| taskPost.test.js | 19 | 3 | 16 |
| taskPut.test.js | 8 | 1 | 7 |
| taskDelete.test.js | 12 | 5 | 7 |
| **Összesen** | **39** | **9** | **30** |

---
---

## 3. Projekt API – Tesztelési dokumentáció

**Keretrendszer:** Jest 29 + Supertest  
**DB stratégia:** `jest.mock('../database')` / `jest.mock('../models/projectModel')`  
**Tesztelt modulok:** projectPost, projectPut, projectDelete  
**Összes teszteset:** 32

---

## 3.1 Tesztelt modulok

A projekt API három fő funkciót tartalmaz, mindegyik külön tesztfájlban:

- **projectPost.test.js** – új projekt, felhasználó hozzáadása, üzenetküldés
- **projectPut.test.js** – projekt módosítása
- **projectDelete.test.js** – projekt törlése és felhasználó eltávolítása

---

## 3.2 projectPost.test.js – POST végpontok

### 3.2.1 POST `/:tarsasag_id/ujprojekt` – Új projekt létrehozása

Az `insertNewProject()` multi-statement SQL-t tartalmaz (két INSERT egyszerre). Ha az SQL hibát generál, a backend 500-as hibát dob.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | DB hiba létrehozáskor | `500` | `cb(new Error('DB hiba'))` | szerverhiba |
| 2 | Hiányzó társaság ID az URL-ben | `404` | – (routing) | Express 404 |
| 3 | Érvénytelen társaság ID (szöveg) | `400` | – (validátor) | `hibak[].mezo === 'tarsasag_id'` |
| 4 | Hiányzó cím | `400` | – (validátor) | `hibak[].mezo === 'cim'` |
| 5 | Helytelen dátumformátum | `400` | – (validátor) | `hibak[].mezo === 'hatarido'` |

### 3.2.2 POST `/:projekt_id/felhasznalo_hozzaadas` – Felhasználó hozzáadása projekthez

Ha a felhasználó és a projekt nem egy társasághoz tartozik, az SQL 0 sort érint → 403.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Felhasználó és projekt eltérő társaság | `403` | `cb(null, { affectedRows: 0 })` | – |
| 2 | Hiányzó projekt ID az URL-ben | `404` | – (routing) | Express 404 |
| 3 | Érvénytelen projekt ID (szöveg) | `400` | – (validátor) | `hibak[].mezo === 'projekt_id'` |
| 4 | Hiányzó felhasználó ID | `400` | – (validátor) | `hibak[].mezo === 'felhasznalo_id'` |
| 5 | Érvénytelen felhasználó ID (szöveg) | `400` | – (validátor) | `hibak[].mezo === 'felhasznalo_id'` |

### 3.2.3 POST `/:projekt_id/ujuzenet` – Üzenet létrehozása projekthez

Nincs jogosultság-ellenőrzés – bármely bejelentkezett felhasználó küldhet üzenetet. DB hiba esetén 500-as válasz.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | DB hiba üzenetküldéskor | `500` | `cb(new Error('DB hiba'))` | szerverhiba |
| 2 | Hiányzó projekt ID az URL-ben | `404` | – (routing) | Express 404 |
| 3 | Érvénytelen projekt ID (szöveg) | `400` | – (validátor) | `hibak[].mezo === 'projekt_id'` |
| 4 | Hiányzó tartalom | `400` | – (validátor) | `hibak[].mezo === 'tartalom'` |
| 5 | Érvénytelen tartalom (szám) | `400` | – (validátor) | `hibak[].mezo === 'tartalom'` |

---

## 3.3 projectPut.test.js – PUT végpont

### 3.3.1 PUT `/:projekt_id/projekt_modositas` – Projekt módosítása

A controller `updateProject()` hívással dolgozik. A backend nem ellenőrzi, hogy a projekt létezik-e – az SQL UPDATE akkor is lefut, ha 0 sort érint, és a controller mindig 200-at küld vissza.

> **Megjegyzés a `leiras` mezőről:** A `projectPutValidator`-ban a `leiras` mező kötelező és szöveg típusú; szám esetén 400 hibát ad.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres projekt módosítás (0 érintett sor esetén is) | `200` | – | `res.status === 200` |
| 2 | Hiányzó projekt ID az URL-ben | `404` | – (routing) | Express 404 |
| 3 | Érvénytelen projekt ID (szöveg) | `400` | – (validátor) | `hibak[].mezo === 'projekt_id'` |
| 4 | Hiányzó cím (üres string) | `400` | – (validátor) | `hibak[].mezo === 'cim'` |
| 5 | Cím szám | `400` | – (validátor) | `hibak[].mezo === 'cim'` |
| 6 | Leírás szám | `400` | – (validátor) | `hibak[].mezo === 'leiras'` |
| 7 | Helytelen dátumformátum (pont elválasztó) | `400` | – (validátor) | `hibak[].mezo === 'hatarido'` |
| 8 | Hiányzó állapot (üres string) | `400` | – (validátor) | `hibak[].mezo === 'allapot'` |
| 9 | Állapot szám | `400` | – (validátor) | `hibak[].mezo === 'allapot'` |

---

## 3.4 projectDelete.test.js – DELETE végpontok

### 3.4.1 DELETE `/:projekt_id/torles` – Projekt törlése

A controller kétlépéses logikát alkalmaz: először lekéri a projekt aktuális állapotát, majd dönt:

- Ha az állapot `'torolve'`: végleges törlés (hard delete)
- Egyéb esetben: soft delete (állapot → `'torolve'`)

```js
// soft delete esetén
db.query.mockImplementationOnce((sql, params, cb) => cb(null, [{ id: 1, allapot: 'uj' }]));
db.query.mockImplementationOnce((sql, params, cb) => cb(null, { affectedRows: 1 }));
```

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Projekt nem létezik | `404` | `cb(null, [])` | – |
| 2 | Hiányzó projekt ID az URL-ben | `404` | – (routing) | Express 404 |
| 3 | Érvénytelen projekt ID (szöveg) | `400` | – (validátor) | `hibak[].mezo === 'projekt_id'` |

### 3.4.2 DELETE `/:projekt_id/felhasznalo_torles` – Felhasználó eltávolítása projektből

A controller először ellenőrzi a kérelmező szerepkörét (`selectProjectUserRole`), majd végrehajtja a törlést (`deleteUserFromProject`).

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Projekt nem létezik (nincs jogosultság) | `403` | `cb(null, [])` | – |
| 2 | Hiányzó projekt ID az URL-ben | `404` | – (routing) | Express 404 |
| 3 | Érvénytelen projekt ID (szöveg) | `400` | – (validátor) | `hibak[].mezo === 'projekt_id'` |
| 4 | Hiányzó törlendő felhasználó ID | `400` | – (validátor) | `hibak[].mezo === 'torlendo_felhasznalo_id'` |
| 5 | Érvénytelen törlendő felhasználó ID (szöveg) | `400` | – (validátor) | `hibak[].mezo === 'torlendo_felhasznalo_id'` |

---

## 3.5 Tesztfuttatás eredménye

```
Test Suites: 3 passed, 3 total
Tests:       32 passed, 32 total
```

---

## 3.6 Összefoglalás

| Fájl | Tesztesetek | Sikeres eset | Validációs / hiba eset |
|---|:---:|:---:|:---:|
| projectPost.test.js | 15 | 0 | 15 |
| projectPut.test.js | 9 | 1 | 8 |
| projectDelete.test.js | 8 | 0 | 8 |
| **Összesen** | **32** | **1** | **31** |

---
---

## 4. Company API – Tesztelési dokumentáció

**Keretrendszer:** Jest 29 + Supertest  
**DB stratégia:** `jest.mock('../models/companyModel')`, `jest.mock('../models/userModel')`  
**Tesztelt modulok:** companyPost, companyPut, companyDelete, userPost, userPut, userDelete  
**Összes teszteset:** 80

---

### 4.1 Bevezetés és architektúra

#### 4.1.1 Tesztelési rétegek

A tesztek az alábbi három rétegre terjednek ki:

- **Validációs réteg** – express-validator szabályok (`companyValidators.js`, `userValidators.js`)
- **Controller réteg** – üzleti logika, HTTP státuszkódok (`companyController.js`, `userController.js`)
- **Routing réteg** – URL-paraméterek, hiányzó azonosítók

---

### 4.2 companyPost.test.js – POST végpontok

#### 4.2.1 POST `/api/tarsasagok/company` – Új társaság létrehozása

A végpont létrehozza az új társaságot és az alapítói tagságot. A bejelentkezett felhasználó automatikusan admin szerepkörrel válik taggá.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres társaság létrehozás | `201` | `callback(null, { insertId: 7, tarsasag_id: 7 })` | `uzenet: 'Új társaság sikeresen létrehozva'`, `tarsasag_id: 7` |
| 2 | Hiányzó név (üres string) | `400` | – (validátor) | `hibak[].mezo === 'nev'` |
| 3 | Név szám helyett string | `400` | – (validátor) | `hibak[].mezo === 'nev'` |
| 4 | DB hiba létrehozáskor | `500` | `callback(new Error('...'))` | szerverhiba |

> **Megjegyzés:** A `createCompany` mock-ot `tarsasag_id` mezővel kell visszaadni, mivel a controller `eredmeny.tarsasag_id`-t használ.

#### 4.2.2 POST `/api/tarsasagok/:id/tagok` – Tag hozzáadása

A végpont email cím alapján keres felhasználót, ellenőrzi, hogy az admin jogosultsággal rendelkező hívó tagja-e a társaságnak, majd hozzáadja az új tagot. A `getUserRoleInCompany` kétszer kerül meghívásra: először a hívó jogosultságának, másodszor az új tag meglétének ellenőrzésekor – ezért `mockImplementationOnce` láncolással kell megadni mindkét hívást.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres tag hozzáadás | `201` | `getUserRoleInCompany` 1.: `admin`; 2.: `[]`; `selectUserByEmail`: `[{id:2}]`; `insertMember`: `{affectedRows:1}` | `uzenet: 'Tag sikeresen hozzáadva'` |
| 2 | Hiányzó társaság azonosító az URL-ben | `404` | – (router) | Express 404 |
| 3 | Érvénytelen társaság azonosító (szöveg) | `400` | – (validátor) | `hibak[].mezo === 'id'` |
| 4 | Hiányzó email (üres string) | `400` | – (validátor) | `hibak[].mezo === 'email'` |
| 5 | Érvénytelen email formátum | `400` | – (validátor) | `hibak[].mezo === 'email'` |
| 6 | Hiányzó szerepkör (üres string) | `400` | – (validátor) | `hibak[].mezo === 'szerepkor'` |
| 7 | Érvénytelen szerepkör (nem admin/manager/tag) | `400` | – (validátor) | `hibak[].mezo === 'szerepkor'` |
| 8 | Felhasználó emailje nem létezik | `404` | `selectUserByEmail`: `[]` | `uzenet: 'A megadott email címmel nem található felhasználó'` |
| 9 | Felhasználó már tagja a társaságnak | `409` | `getUserRoleInCompany` 1.: `admin`; 2.: `[{szerepkor:'manager'}]` | `uzenet: 'Ez a felhasználó már tagja a társaságnak'` |
| 10 | Nincs admin jogosultság (tag szerepkör) | `403` | `getUserRoleInCompany`: `[{szerepkor:'tag'}]` | `uzenet: 'Csak adminisztrátorok adhatnak hozzá tagokat'` |

---

### 4.3 companyPut.test.js – PUT végpontok

#### 4.3.1 PUT `/api/tarsasagok/company/:id` – Társaság nevének módosítása

A controller jogosultság-ellenőrzés után `updateCompanyName()` hívással frissíti a nevet.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres névmódosítás | `200` | admin + `affectedRows: 1` | `uzenet: 'Társaság neve sikeresen módosítva'` |
| 2 | Hiányzó társaság ID az URL-ben | `404` | – (routing) | Express 404 |
| 3 | Érvénytelen társaság ID (szöveg) | `400` | – (validátor) | `hibak[].mezo === 'id'` |
| 4 | Hiányzó név (üres string) | `400` | – (validátor) | `hibak[].mezo === 'nev'` |
| 5 | Név szám | `400` | – (validátor) | `hibak[].mezo === 'nev'` |
| 6 | Nem tagja a társaságnak | `403` | `callback(null, [])` | `uzenet: 'Nem tagja a társaságnak'` |
| 7 | Nem admin (tag szerepkör) | `403` | `callback(null, [{ szerepkor: 'tag' }])` | `uzenet: 'Nincs jogosultsága a név módosításához'` |

#### 4.3.2 PUT `/api/tarsasagok/:tarsasag_id/alapito` – Alapító módosítása

A controller először `checkIsFounder()`-rel ellenőrzi, hogy a kérelmező valóban az alapító-e, majd tranzakcióban hajtja végre az alapítóváltást.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres alapítóváltás | `200` | kérelmező az alapító, tranzakció sikeres | `uzenet: 'Új alapító sikeresen kinevezve'` |
| 2 | Hiányzó új alapító ID | `400` | – (validátor) | `hibak[].mezo === 'uj_alapito_id'` |
| 3 | Kérelmező nem az alapító | `403` | `checkIsFounder` más ID-t ad vissza | `uzenet: 'Csak a jelenlegi alapító nevezhet ki új alapítót'` |
| 4 | Társaság nem található | `404` | `checkIsFounder` üres tömböt ad vissza | `uzenet: 'Társaság nem található'` |
| 5 | Új alapító nem tagja a társaságnak | `403` | tranzakció `statusCode: 403` hibát dob | `uzenet: 'Az új alapító nem tagja a társaságnak'` |

#### 4.3.3 PUT `/api/tarsasagok/:tarsasag_id/member/:felhasznaloId/deactivate` – Tag deaktiválása

A controller megakadályozza az öndeaktiválást, majd ellenőrzi a kérelmező és a célfelhasználó szerepkörét.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres tag deaktiválás | `200` | kérelmező admin, célfelhasználó tag, `affectedRows: 1` | `uzenet: 'Felhasználó deaktiválva'` |
| 2 | Saját maga deaktiválása | `400` | – (controller, `felhasznaloId === req.user.id`) | `uzenet: 'Nem deaktiválhatja saját magát!'` |

#### 4.3.4 PUT `'/api/tarsasagok/:tarsasag_id/member/:felhasznaloId/activate'` – Társaság aktiválása

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres aktiválás | `200` | admin + `affectedRows: 1` | `uzenet: 'Társaság sikeresen aktiválva'` |

#### 4.3.5 PUT `/api/tarsasagok/:tarsasag_id/deaktival', companyStatusValidator` – Társaság deaktiválása

Csak admin deaktiválhat társaságot. A `deactivateCompany()` SQL-je ezen felül azt is ellenőrzi, hogy a kérelmező az alapító-e (`WHERE alapito_id = ?`).

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres deaktiválás | `200` | admin + `affectedRows: 1` | `uzenet: 'Társaság sikeresen deaktiválva'` |
| 2 | Nem admin (manager) | `403` | `callback(null, [{ szerepkor: 'manager' }])` | `uzenet: 'Csak admin deaktiválhatja a társaságot'` |

#### 4.3.6 PUT `/api/tarsasagok/:id/tagok/:felhasznaloId` – Szerepkör módosítása

A controller kétlépéses ellenőrzést végez: kérelmező jogosultsága, majd a célfelhasználó szerepköre. Manager nem módosíthat admin/manager szerepkörű tagot.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres szerepkör módosítás | `200` | kérelmező admin, célfelhasználó létezik, `affectedRows: 1` | `uzenet: 'Szerepkör frissítve'` |
| 2 | Saját szerepkör módosítása | `400` | – (controller, `felhasznaloId === req.user.id`) | `uzenet: 'Nem módosíthatja saját szerepkörét!...'` |
| 3 | Érvénytelen szerepkör | `400` | – (validátor) | `hibak[].mezo === 'szerepkor'` |
| 4 | Nem tagja a társaságnak | `403` | `callback(null, [])` | `uzenet: 'Nem tagja a társaságnak'` |
| 5 | Nincs jogosultsága (tag szerepkör) | `403` | `callback(null, [{ szerepkor: 'tag' }])` | `uzenet: 'Nincs jogosultsága szerepkör módosítására'` |
| 6 | Célfelhasználó nem található | `404` | kérelmező admin, célfelhasználó `[]` | `uzenet: 'Felhasználó nem található a társaságban'` |
| 7 | Manager admin-t próbál módosítani | `403` | kérelmező manager, célfelhasználó admin | `uzenet: 'Manager csak tag szerepkörű felhasználókat módosíthat'` |

---

### 4.4 companyDelete.test.js – DELETE végpontok

#### 4.4.1 DELETE `/api/tarsasagok/:id/torles` – Társaság végleges törlése

Kétlépéses jogosultság-ellenőrzés: (1) tagság ellenőrzése, (2) admin szerepkör ellenőrzése. Csak admin végezheti el. SQL-szinten az alapítói feltétel is ellenőrződik – ha `affectedRows = 0`, a controller 403-at ad vissza.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Hiányzó társaság azonosító az URL-ben | `404` | – (router) | Express 404 |
| 2 | Érvénytelen társaság azonosító (szöveg) | `400` | – (validátor) | `hibak[].mezo === 'id'` |
| 3 | Nem tagja a társaságnak | `403` | `getUserRoleInCompany`: `[]` | `uzenet: 'Nem tagja a társaságnak'` |
| 4 | Tagja, de nem admin (manager) | `403` | `getUserRoleInCompany`: `[{szerepkor:'manager'}]` | `uzenet: 'Csak az alapító törölheti a társaságot'` |
| 5 | Admin, de nem alapító (0 érintett sor) | `403` | `getUserRoleInCompany`: `admin`; `deleteCompanyHard`: `{affectedRows:0}` | `uzenet: 'Nem létezik a társaság vagy nem Ön az alapító'` |
| 6 | Sikeres törlés (admin + alapító) | `200` | `getUserRoleInCompany`: `admin`; `deleteCompanyHard`: `{affectedRows:1}` | `uzenet: 'Társaság véglegesen törölve'` |
| 7 | DB hiba törléskor | `500` | `deleteCompanyHard`: `Error` | szerverhiba |

> **Megjegyzés:** Az 5. teszteset elkülönített `testApp`-ot igényel `req.user = { id: 2 }` beállítással, mivel az alapértelmezett app `req.user.id = 1` értékkel dolgozik, és az SQL alapítói feltételre van bízva a megkülönböztetés.

---

### 4.5 Összefoglalás

| Fájl | Tesztesetek | Sikeres eset | Validációs eset |
|---|:---:|:---:|:---:|
| companyPost.test.js | 14 | 2 | 12 |
| companyPut.test.js | 24 | 7 | 17 |
| companyDelete.test.js | 7 | 1 | 6 |
| **Összesen** | **45** | **10** | **35** |

---

## 5 User API – Tesztelési dokumentáció

---

### 5.1 userPost.test.js – POST végpontok

#### 5.1.1 POST `/api/felhasznalok/register` – Regisztráció

A végpont új felhasználót hoz létre. A jelszó `bcrypt.hash()`-sel kerül titkosításra. Duplikált email esetén az adatbázis `ER_DUP_ENTRY` hibát dob.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres regisztráció | `201` | `callback(null, { insertId: 9 })` | `uzenet: 'Sikeres regisztráció'` |
| 2 | Hiányzó név (üres string) | `400` | – (validátor) | `hibak[].mezo === 'nev'` |
| 3 | Név szám helyett string | `400` | – (validátor) | `hibak[].mezo === 'nev'` |
| 4 | Hiányzó email | `400` | – (validátor) | `hibak[].mezo === 'email'` |
| 5 | Helytelen email formátum | `400` | – (validátor) | `hibak[].mezo === 'email'` |
| 6 | Hiányzó jelszó | `400` | – (validátor) | `hibak[].mezo === 'jelszo'` |
| 7 | Jelszó rövidebb 8 karakternél | `400` | – (validátor) | `hibak[].mezo === 'jelszo'` |
| 8 | Már regisztrált email | `400` | `callback({ code: 'ER_DUP_ENTRY' }, null)` | `valasz: 'Ezzel az email címmel már regisztráltak'` |
| 9 | Adatbázis hiba | `500` | `callback(new Error('...'), null)` | szerverhiba |

#### 5.1.2 POST `/api/felhasznalok/login` – Bejelentkezés

A controller `loginUser`-rel keresi a felhasználót, `bcrypt.compare`-rel ellenőrzi a jelszót, majd `jwt.sign`-nal generál access és refresh tokent.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres bejelentkezés | `200` | `loginUser`: `[{...}]`; `bcrypt.compare`: `true`; `jwt.sign`: 2x mock | `uzenet: 'Sikeres bejelentkezés'`, `token`, `refreshToken` |
| 2 | Hibás email (nem létezik) | `401` | `loginUser`: `[]` | `uzenet: 'Hibás email vagy jelszó'` |
| 3 | Hibás jelszó | `401` | `loginUser`: `[{...}]`; `bcrypt.compare`: `false` | `uzenet: 'Hibás email vagy jelszó'` |
| 4 | Hiányzó email (üres string) | `400` | – (validátor) | `hibak[].mezo === 'email'` |
| 5 | Hiányzó jelszó (üres string) | `400` | – (validátor) | `hibak[].mezo === 'jelszo'` |

#### 5.1.3 POST `/api/felhasznalok/refresh` – Token frissítés

A refresh token `jwt.verify`-vel validálódik. Érvényes token esetén új access token generálódik `jwt.sign`-nal.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres token frissítés | `200` | `jwt.verify`: `callback(null, payload)`; `jwt.sign`: `'new_access_token'` | `token: 'new_access_token_789'` |
| 2 | Hiányzó refresh token | `401` | – | `uzenet: 'Refresh token hiányzik'` |
| 3 | Érvénytelen refresh token | `403` | `jwt.verify`: `callback(Error)` | `uzenet: 'Érvénytelen refresh token'` |

---

### 5.2 userPut.test.js – PUT végpontok

#### 5.2.1 PUT `/api/felhasznalok/profile` – Profil módosítása

A controller `updateUserProfile`-lal frissíti a nevet és az email címet. A validátor mindkét mező érvényességét ellenőrzi.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres profil módosítás | `200` | `updateUserProfile`: `callback(null)` | `uzenet: 'Profil sikeresen frissítve'` |
| 2 | Hiányzó név (üres string) | `400` | – (validátor) | `hibak[].mezo === 'nev'` |
| 3 | Név szám helyett string | `400` | – (validátor) | `hibak[].mezo === 'nev'` |
| 4 | Hiányzó email (üres string) | `400` | – (validátor) | `hibak[].mezo === 'email'` |
| 5 | Érvénytelen email formátum | `400` | – (validátor) | `hibak[].mezo === 'email'` |
| 6 | DB hiba módosításkor | `500` | `updateUserProfile`: `Error` | szerverhiba |

#### 5.2.2 PUT `/api/felhasznalok/password` – Jelszó módosítása

Háromfázisú ellenőrzés: (1) régi jelszó helyességének bcrypt ellenőrzése, (2) az új jelszó különbözik-e a régitől, (3) ha minden rendben, titkosítás és mentés.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Hiányzó régi jelszó | `400` | – (validátor) | `hibak[].mezo === 'regiJelszo'` |
| 2 | Hiányzó új jelszó | `400` | – (validátor) | `hibak[].mezo === 'ujJelszo'` |
| 3 | Új jelszó rövidebb mint 8 karakter | `400` | – (validátor) | `hibak[].mezo === 'ujJelszo'` |
| 4 | Helytelen jelenlegi jelszó | `401` | `selectUserByEmail`: `[{...}]`; `bcrypt.compare`: `false` | `uzenet: 'Helytelen a jelenlegi jelszó'` |
| 5 | Új jelszó megegyezik a jelenlegivel | `400` | `bcrypt.compare`: 1. `true`, 2. `true` | `uzenet: 'Az új jelszó nem egyezhet meg a jelenlegivel'` |
| 6 | Sikeres jelszó módosítás | `200` | `bcrypt.compare`: 1. `true`, 2. `false`; `bcrypt.hash`: mock; `updateUserPassword`: `null` | `uzenet: 'Jelszó sikeresen módosítva'` |
| 7 | Felhasználó nem található | `404` | `selectUserByEmail`: `[]` | `uzenet: 'Felhasználó nem található'` |
| 8 | DB hiba módosításkor | `500` | `updateUserPassword`: `Error` | szerverhiba |

> **Megjegyzés a `bcrypt.compare` sorrendjéről:** Az első `mockImplementationOnce` hívás a régi jelszó ellenőrzése, a második az új jelszó egyezőségének vizsgálata. Sorrendjük kritikus – a controller pontosan ebben a sorrendben hívja őket.

---

### 5.3 userDelete.test.js – DELETE végpontok

#### 5.3.1 DELETE `/api/felhasznalok/profile` – Felhasználó törlése

A `deleteUserUser` modell-hívás kaszkád törléssel eltávolítja az alapított társaságokat és a tagságokat is. A visszaadott eredmény tartalmazza a törölt rekordok számát.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres törlés (2 társaság, 5 tagság) | `200` | `deleteUserUser`: `{affectedRows:1, deletedCompanies:2, deletedMemberships:5}` | `uzenet: 'Felhasználó sikeresen törölve'`, `torolt_tarsasagok: 2`, `torolt_tagsagok: 5` |
| 2 | Sikeres törlés (nincs alapított társaság) | `200` | `deleteUserUser`: `{deletedCompanies:0, deletedMemberships:3}` | `torolt_tarsasagok: 0`, `torolt_tagsagok: 3` |
| 3 | Sikeres törlés (0 tagság, 0 társaság) | `200` | `deleteUserUser`: `{affectedRows:0, deletedCompanies:0, deletedMemberships:0}` | `torolt_tarsasagok: 0`, `torolt_tagsagok: 0` |
| 4 | DB hiba törléskor | `500` | `deleteUserUser`: `Error` | szerverhiba |

> **Megjegyzés:** A controller nem különbözteti meg a `0 affectedRows` esetet – mindig 200-at küld vissza, ha nincs hiba. A 3. teszteset ezt a viselkedést fedezi le.

---

### 5.4 Összefoglalás

| Fájl | Tesztesetek | Sikeres eset | Validációs eset |
|---|:---:|:---:|:---:|
| userPost.test.js | 17 | 3 | 14 |
| userPut.test.js | 14 | 2 | 12 |
| userDelete.test.js | 4 | 3 | 1 |
| **Összesen** | **35** | **8** | **27** |