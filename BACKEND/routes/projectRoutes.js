const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const projectController = require('../controllers/projectController');
const { projectPostNewProjectValidator, projectPostNewUserToProjectValidator, projectPostNewMessageValidator, projectPutValidator, projectDeleteValidator, projectDeleteRemoveUserValidator } = require('../validators/projectValidators');

// Felhasználóhoz tartozó projektek kilistázása
router.get('/felhasznalo', authMiddleware.verifyToken, projectController.getProjectsByUser);

// Projekt adatainak lekérése
router.get('/:projekt_id', authMiddleware.verifyToken, projectController.getProjectById);

// Projekthez tartozó felhasználók lekérdezése
router.get('/:projekt_id/felhasznalok', authMiddleware.verifyToken, projectController.getAllUsersByProject);

// Projekthez még hozzá nem adott felhasználók listája (adott társaságon belül)
router.get('/:projekt_id/hozzaadhato_felhasznalok', authMiddleware.verifyToken, authMiddleware.requireProjectRole(['admin', 'manager']), projectController.getEligibleUsersForProject);

// Projekt feladatainak lekérdezése
router.get('/:projekt_id/feladatok', authMiddleware.verifyToken, projectController.getProjectTasks);

// Projekt üzenetek lekérdezése
router.get('/:projekt_id/uzenetek', authMiddleware.verifyToken, projectController.getAllProjectMessages);

// Projekt létrehozása
router.post('/:tarsasag_id/ujprojekt', projectPostNewProjectValidator, authMiddleware.verifyToken, authMiddleware.requireCompanyRole(['admin', 'manager']), projectController.postNewProjekt);

// Felhasználó hozzáadása projekthez
router.post('/:projekt_id/felhasznalo_hozzaadas', projectPostNewUserToProjectValidator, authMiddleware.verifyToken, authMiddleware.requireProjectRole(['admin', 'manager']), projectController.postUserToProjekt);

// Projekt üzenet létrehozása
router.post('/:projekt_id/ujuzenet', projectPostNewMessageValidator, authMiddleware.verifyToken, projectController.postMessageToProject);

// Projekt módosítása
router.put('/:projekt_id/projekt_modositas', projectPutValidator, authMiddleware.verifyToken, authMiddleware.requireProjectRole(['admin', 'manager']), projectController.modifyProjekt);

// Projekt törlése
router.delete('/:projekt_id/torles', projectDeleteValidator, authMiddleware.verifyToken, authMiddleware.requireProjectRole(['admin', 'manager']), projectController.deleteUserProject);

// Felhasználó eltávolítása projekt résztvevői közül
router.delete('/:projekt_id/felhasznalo_torles', projectDeleteRemoveUserValidator, authMiddleware.verifyToken, authMiddleware.requireProjectRole(['admin', 'manager']), projectController.removeUserFromProject);

module.exports = router;