const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const {createCompanyValidator,updateCompanyNameValidator,
    deleteCompanyHardValidator, addMemberValidator, updateMemberRoleValidator, getAllMembersOfCompanyValidator,
    deactivateMemberValidator, activateMemberValidator, companyStatusValidator, changeFounderValidator} = require ("../validators/companyValidators");
const authMiddleware = require('../middlewares/auth');

// Társaság összes tagja
router.get('/:tarsasag_id/members', authMiddleware.verifyToken , getAllMembersOfCompanyValidator, companyController.getAllMembers);

// Társaság összes projektje
router.get('/:tarsasag_id/projektek', authMiddleware.verifyToken, companyController.getCompanyProjects);

//Társaság létrehozása
router.post('/company',authMiddleware.verifyToken, createCompanyValidator, companyController.postCreateCompany);

//Társaság név Módosítás
router.put('/company/:id',authMiddleware.verifyToken, updateCompanyNameValidator, companyController.putUpdateCompanyName);

//Társaság törlése
router.delete("/:id/torles", authMiddleware.verifyToken, deleteCompanyHardValidator, companyController.deleteCompanyHard);

//Új tag hozzáadása
router.post('/:id/tagok', authMiddleware.verifyToken, addMemberValidator, companyController.addMemberToCompany);

//Szerepkör módosítása
router.put('/:id/tagok/:felhasznaloId', authMiddleware.verifyToken, updateMemberRoleValidator, companyController.updateMemberRole);

//Felhasználó deaktiválása
router.put('/:tarsasag_id/member/:felhasznaloId/deactivate', authMiddleware.verifyToken, deactivateMemberValidator, companyController.deactivateMember);

//Felhasználó aktiválása
router.put('/:tarsasag_id/member/:felhasznaloId/activate', authMiddleware.verifyToken, activateMemberValidator, companyController.activateMember);

//Társaság deaktiválása
router.put('/:tarsasag_id/deaktival', authMiddleware.verifyToken, companyStatusValidator, companyController.deactivateCompany);

//Társaság aktiválása
router.put('/:tarsasag_id/aktival', authMiddleware.verifyToken, companyStatusValidator, companyController.activateCompany);

//Társaság tulajdonos Módosítás
router.put('/:tarsasag_id/alapito', authMiddleware.verifyToken, changeFounderValidator, companyController.changeFounder);

module.exports = router;