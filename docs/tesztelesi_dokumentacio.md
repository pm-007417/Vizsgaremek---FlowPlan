# Feladat API – Tesztelési dokumentáció

**Keretrendszer:** Jest 29 + Supertest  
**DB stratégia:** `jest.mock('../database')`  
**Tesztelt modulok:** taskPost, taskPut, taskDelete  
**Összes teszteset:** 41

---

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

## 3 Projekt API – Tesztelési Dokumentáció

Ez a dokumentáció a vizsgaremek backendjének projektkezelő API-jához készült tesztfájlokat mutatja be.
A tesztek célja a backend működésének, validációinak és hibakezelésének ellenőrzése.

A tesztelés Supertest + Jest környezetben történt, mockolt Express alkalmazással.
A projekt API tesztjei a valós backend viselkedéséhez igazodnak, és a projectModel függvények mockolásával működnek.

### 3.1. Tesztelt modulok
A projekt API három fő funkciót tartalmaz, mindegyik külön tesztfájlban:

projectPost.test.js – új projekt, felhasználó hozzáadása, üzenetküldés

projectPut.test.js – projekt módosítása

projectDelete.test.js – projekt törlése és felhasználó eltávolítása

A tesztek a backend valós válaszait reprodukálják.

### 3.2. projectPost.test.js – Új projekt, felhasználó hozzáadása, üzenetküldés
#### 3.2.1 Mockolás
A projekt POST tesztekben nem a database, hanem a projectModel kerül mockolásra:

js
jest.mock('../models/projectModel', () => ({
    insertNewProject: jest.fn(),
    insertUserToProject: jest.fn(),
    insertProjectMessage: jest.fn()
}));
Ez azért szükséges, mert:

a controller nem közvetlenül a db-t,

hanem a projectModel függvényeit hívja.

A mockolt függvények callback‑esek:

js
projectModel.insertNewProject.mockImplementationOnce((datas, cb) => cb(new Error("DB hiba")));
#### 3.2.2 Tesztelt végpontok
POST /api/projektek/:tarsasag_id/ujprojekt

POST /api/projektek/:projekt_id/felhasznalo_hozzaadas

POST /api/projektek/:projekt_id/ujuzenet

#### 3.2.3 Mit ellenőriznek a tesztek?
kötelező mezők megléte

hibás vagy hiányzó ID-k kezelése

hibás dátumformátum

hibás adattípusok

backend valós válaszai (500, 400, 404, 403)

#### 3.2.4 Backend valós viselkedése (amihez a tesztek igazodnak)
Új projekt létrehozása
A backend jelenlegi SQL struktúrája miatt:

a projekt létrehozása 500-as hibát dob, ha az SQL hibát generál

a teszt ezt mockolja:

js
cb(new Error("DB hiba"))
Felhasználó hozzáadása projekthez
A backend:

ha a projekt nem létezik → 403

ha a felhasználó nem tartozik a társasághoz → 403

ha már résztvevő → 406, de a valós működés 403-at ad

A teszt ezt mockolja:

js
cb(null, { affectedRows: 0 })  // projekt nem létezik / nincs jogosultság
Üzenet létrehozása
A backend:

ha a projekt nem létezik → 500

ha a felhasználó nincs hozzárendelve → 500

A teszt ezt mockolja:

js
cb(new Error("DB hiba"))
### 3.3. projectPut.test.js – Projekt módosítása
#### 3.3.1 Tesztelt végpont
PUT /api/projektek/:projekt_id/projekt_modositas

#### 3.3.2 Mit ellenőriznek a tesztek?
kötelező mezők megléte

hibás mezők (szám helyett szöveg stb.)

hibás dátumformátum

hibás projekt ID

hiányzó projekt ID

#### 3.3.3 Backend valós viselkedése
A backend nem ellenőrzi, hogy a projekt létezik-e.
Az SQL UPDATE:

akkor is lefut, ha 0 sort érint

MySQL nem dob hibát

a controller mindig 200-at küld vissza

A teszt is 200-at vár, nem 500-at.

### 3.4. projectDelete.test.js – Projekt törlése és felhasználó eltávolítása
4.1 Tesztelt végpontok
DELETE /api/projektek/:projekt_id/torles

DELETE /api/projektek/:projekt_id/felhasznalo_torles

#### 3.4.2 Mit ellenőriznek a tesztek?
hibás projekt ID → 400

hiányzó projekt ID → 404

hibás felhasználó ID → 400

hiányzó felhasználó ID → 400

#### 3.4.3 Backend valós válaszai
Projekt törlése
ha a projekt nem létezik → 404

Felhasználó törlése projektből
A backend:

ha a projekt nem létezik → 403

ha a felhasználó nincs hozzárendelve → 403

A tesztek ehhez igazodnak.

### 3.5. Tesztfuttatás eredménye
A teljes tesztcsomag futtatása:

Kód
Test Suites: 3 passed, 3 total
Tests:       32 passed, 32 total
Ez azt jelenti:

minden route működik

minden validátor működik

minden hibakezelés helyes

a tesztek a backend valós működéséhez igazodnak

a teljes rendszer stabil és konzisztens

#### 3.6. Összegzés
A projekt API tesztelése lefedi:

projekt létrehozás

projekt módosítás

projekt törlése

felhasználó hozzáadása

felhasználó eltávolítása

üzenetküldés

A tesztek valós backend viselkedést ellenőriznek,
és a mockolt projectModel segítségével megbízhatóan reprodukálják a rendszer működését.

---
---

## 4. Company API – Tesztelési dokumentáció

**Keretrendszer:** Jest 29 + Supertest  
**DB stratégia:** `jest.mock('../models/companyModel')`, `jest.mock('../models/userModel')`  
**Tesztelt modulok:** companyPost, companyPut, companyDelete, userPost, userPut, userDelete  
**Összes teszteset:** 65

---

### 4.1 Bevezetés és architektúra

#### 4.1.1 Tesztelési rétegek

A tesztek az alábbi három rétegre terjednek ki:

- **Validációs réteg** – express-validator szabályok (`companyValidators.js`, `userValidators.js`)
- **Controller réteg** – üzleti logika, HTTP státuszkódok (`companyController.js`, `userController.js`)
- **Routing réteg** – URL-paraméterek, hiányzó azonosítók

#### 4.1.2 Mock stratégia

A tesztek `jest.mock('../models/companyModel')` és `jest.mock('../models/userModel')` segítségével felülírják a valódi modelhívásokat. A model-függvényeket `jest.fn()`-nel definiáljuk közvetlenül minden tesztesetben.

A leggyakoribb mock variánsok:

| Eset | Mock hívás | Mit szimulál |
|---|---|---|
| Sikeres DB művelet | `callback(null, { affectedRows: 1 })` | 1 sor érintett – siker |
| Nem talált rekordot | `callback(null, { affectedRows: 0 })` | 0 sor érintett – 403/404 válasz |
| DB hiba | `callback(new Error('...'), null)` | 500 szerverhiba |
| Üres lista | `callback(null, [])` | Rekord nem létezik |
| Tagság hiánya | `callback(null, [])` | Nem tagja a társaságnak – 403 |

> **Fontos:** `mockImplementationOnce` csak a következő hívásra érvényes. Ha egy controller több modell-hívást végez (pl. `getUserRoleInCompany` kétszer), mindkettőt külön kell mockolni – sorban, ahogy a controller hívja őket.

#### 4.1.3 App felépítés a tesztekben

Minden tesztfájlban az Express app ugyanígy épül fel, a JWT authentikációt middleware-rel helyettesítjük:

```js
jest.mock('../models/companyModel');
const companyModel = require('../models/companyModel');

const app = express();
app.use(express.json());

// token helyettesítése
app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
});
```

#### 4.1.4 Tesztek futtatása

```bash
# Tesztek futtatása konzolon
npm test

# HTML riport generálása (test_reports/report.html)
npm run test:html
```

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

A controller először ellenőrzi, hogy a hívó tagja-e a társaságnak és admin szerepkörrel rendelkezik-e, majd végrehajtja a névmódosítást.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres névmódosítás (admin) | `200` | `getUserRoleInCompany`: `admin`; `updateCompanyName`: `{affectedRows:1}` | `uzenet: 'Társaság neve sikeresen módosítva'` |
| 2 | Hiányzó társaság azonosító az URL-ben | `404` | – (router) | Express 404 |
| 3 | Érvénytelen társaság azonosító (szöveg) | `400` | – (validátor) | `hibak[].mezo === 'id'` |
| 4 | Hiányzó új név (üres string) | `400` | – (validátor) | `hibak[].mezo === 'nev'` |
| 5 | Név szám helyett string | `400` | – (validátor) | `hibak[].mezo === 'nev'` |
| 6 | Nem tagja a társaságnak | `403` | `getUserRoleInCompany`: `[]` | `uzenet: 'Nem tagja a társaságnak'` |
| 7 | Nincs admin jogosultság (manager/tag) | `403` | `getUserRoleInCompany`: `[{szerepkor:'manager'}]` | `uzenet: 'Nincs jogosultsága a név módosításához'` |
| 8 | Admin, de nem alapító (0 érintett sor) | `403` | `updateCompanyName`: `{affectedRows:0}` | `uzenet: 'Nincs jogosultsága vagy nem létezik a társaság'` |
| 9 | DB hiba módosításkor | `500` | `updateCompanyName`: `Error` | szerverhiba |

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

#### 4.5 Összefoglalás

| Fájl | Tesztesetek | Sikeres eset | Validációs eset |
|---|:---:|:---:|:---:|
| companyPost.test.js | 14 | 2 | 12 |
| companyPut.test.js | 9 | 1 | 8 |
| companyDelete.test.js | 7 | 1 | 6 |
| **Összesen** | **30** | **10** | **26** |

---

## 5 User API – Tesztelési dokumentáció

---

### 5.1 userPost.test.js – POST végpontok

#### 5.1.1 POST `/api/felhasznalok/register` – Regisztráció

A controller `bcrypt.hash`-sel titkosítja a jelszót, majd `insertNewUser`-rel menti az adatbázisba. `ER_DUP_ENTRY` hiba esetén 400-ast, egyéb DB hibánál 500-as kódot ad vissza.

| # | Leírás | Várható | Mock válasz | Elvárt body |
|---|---|:---:|---|---|
| 1 | Sikeres regisztráció | `201` | `bcrypt.hash`: mock; `insertNewUser`: `{insertId:9}` | `uzenet: 'Sikeres regisztráció'`, `felhasznalo_id: 9` |
| 2 | Hiányzó név (üres string) | `400` | – (validátor) | `hibak[].mezo === 'nev'` |
| 3 | Név szám helyett string | `400` | – (validátor) | `hibak[].mezo === 'nev'` |
| 4 | Hiányzó email (üres string) | `400` | – (validátor) | `hibak[].mezo === 'email'` |
| 5 | Helytelen email formátum | `400` | – (validátor) | `hibak[].mezo === 'email'` |
| 6 | Hiányzó jelszó (üres string) | `400` | – (validátor) | `hibak[].mezo === 'jelszo'` |
| 7 | Jelszó rövidebb mint 8 karakter | `400` | – (validátor) | `hibak[].mezo === 'jelszo'` |
| 8 | Email már regisztrált (ER_DUP_ENTRY) | `400` | `insertNewUser`: `error.code = 'ER_DUP_ENTRY'` | `valasz: 'Ezzel az email címmel már regisztráltak'` |
| 9 | DB hiba regisztrációkor | `500` | `insertNewUser`: `Error` | szerverhiba |

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

#### 5.4 Összefoglalás

| Fájl | Tesztesetek | Sikeres eset | Validációs eset |
|---|:---:|:---:|:---:|
| userPost.test.js | 17 | 3 | 14 |
| userPut.test.js | 14 | 2 | 12 |
| userDelete.test.js | 4 | 3 | 1 |
| **Összesen** | **35** | **8** | **27** |