const express = require('express');
const router = express.Router();
const { notAllowed } = require('../utils/error');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/auth');
const { taskPostNewTaskValidator, taskPostNewUserToTaskValidator, taskDeleteRemoveUserValidator, taskPutValidator, taskDeleteValidator, taskPostNewMessageValidator } = require('../validators/taskValidators');

// Felhasználóhoz tartozó feladatok lekérése
router.get('/felhasznalo', authMiddleware.verifyToken, taskController.getAllUserTasks);

// Feladat adatainak lekérése
router.get('/:feladat_id', authMiddleware.verifyToken, taskController.getTaskById);

// Feladathoz tartozó felhasználók lekérdezése
router.get('/:feladat_id/felhasznalok', authMiddleware.verifyToken, taskController.getAllUsersByTask)

// Feladathoz még hozzá nem adott felhasználók listája (adott társaságon belül)
router.get('/:feladat_id/hozzaadhato_felhasznalok', authMiddleware.verifyToken, authMiddleware.requireTaskRole(['admin', 'manager']), taskController.getEligibleUsersForTask);

// Feladat üzenetek lekérdezése
router.get('/:feladat_id/uzenetek/', authMiddleware.verifyToken, taskController.getAllTaskMessages);

// Feladat létrehozása
router.post('/:projekt_id/ujfeladat', taskPostNewTaskValidator, authMiddleware.verifyToken, authMiddleware.requireProjectRole(['admin', 'manager']), taskController.postNewTask);

// Felhasználó hozzáadása feladathoz
router.post('/:feladat_id/felhasznalo_hozzaadas', taskPostNewUserToTaskValidator, authMiddleware.verifyToken, authMiddleware.requireTaskRole(['admin', 'manager']), taskController.postUserToTask);

// Feladat üzenet létrehozása
router.post('/:feladat_id/ujuzenet', taskPostNewMessageValidator, authMiddleware.verifyToken, taskController.postMessageToTask);

// Feladat módosítása
router.put('/:feladat_id/feladat_modositas', taskPutValidator, authMiddleware.verifyToken, authMiddleware.requireTaskRole(['admin', 'manager']), taskController.modifyTask);

// Felhasználó eltávolítása feladat résztvevői közül
router.delete('/:feladat_id/felhasznalo_torles', taskDeleteRemoveUserValidator, authMiddleware.verifyToken, authMiddleware.requireTaskRole(['admin', 'manager']), taskController.removeUserFromTask);

// Feladat törlése
router.delete('/:feladat_id/torles', taskDeleteValidator, authMiddleware.verifyToken, authMiddleware.requireTaskRole(['admin', 'manager']), taskController.deleteUserTask);

// Nem engedélyezett kérés
router.all(['/', '/uzenetek/:feladat_id', '/:feladat_id/ujuzenet', '/:feladat_id/torles', '/:feladat_id/feladat_modositas',
    '/:feladat_id/:felhasznaloId/felhasznalo_torles', '/:feladat_id/felhasznalo_hozzaadas', '/:projekt_id/ujfeladat',
    '/:feladat_id', '/felhasznalo/allapot', '/felhasznalo/abc', '/felhasznalo', '/felhasznalo/hatarido'], notAllowed);

module.exports = router;