import { api } from './api';
import { CompanyMember } from '../models/CompanyMember';

export const companyApi = {

    getUserCompanies: async () => {
        try {
            const response = await api.get('/felhasznalok/tarsasagok');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Társaságok betöltési hiba');
        }
    },

    /**
     * Új társaság létrehozása
     * @param {string} nev - Társaság neve
     * @returns {Promise<Object>}
     */
    createCompany: async (nev) => {
        try {
            const response = await api.post('/tarsasagok/company', { nev });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Társaság létrehozási hiba');
        }
    },

    /**
     * Társaság tagjai
     * @param {number} tarsasag_id - Társaság ID
     * @returns {Promise<Object>}
     */
    getCompanyMembers: async (tarsasag_id) => {
        try {
            const response = await api.get(`/tarsasagok/${tarsasag_id}/members`);
            return {
                members: response.data.members.map(elem => CompanyMember.fromApi(elem)),
                currentUserId: response.data.currentUserId
            };
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Tagok betöltési hiba');
        }
    },

    /**
     * Tag hozzáadása EMAIL alapján
     * @param {number} tarsasagId - Társaság ID
     * @param {string} email - Tag email címe
     * @param {string} szerepkor - Szerepkör (admin, manager, tag)
     * @returns {Promise<Object>}
     */
    addMember: async (tarsasagId, email, szerepkor) => {
        try {
            const response = await api.post(`/tarsasagok/${tarsasagId}/tagok`, { email, szerepkor });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Tag hozzáadása sikertelen');
        }
    },

    /**
     * Társaság név módosítása
     * @param {number} id - Társaság ID
     * @param {string} nev - Új név
     * @returns {Promise<Object>}
     */
    updateCompanyName: async (id, nev) => {
        try {
            const response = await api.put(`/tarsasagok/company/${id}`, { nev });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Név módosítási hiba');
        }
    },

    /**
     * Szerepkör módosítása
     * @param {number} tarsasag_id - Társaság ID
     * @param {number} felhasznaloId - Felhasználó ID
     * @param {string} szerepkor - Új szerepkör
     * @returns {Promise<Object>}
     */
    updateMemberRole: async (tarsasag_id, felhasznaloId, szerepkor) => {
        try {
            const response = await api.put(`/tarsasagok/${tarsasag_id}/tagok/${felhasznaloId}`, { szerepkor });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Szerepkör módosítási hiba');
        }
    },

    /**
     * Tag deaktiválása
     * @param {number} tarsasag_id - Társaság ID
     * @param {number} felhasznaloId - Felhasználó ID
     * @returns {Promise<Object>}
     */
    deactivateMember: async (tarsasag_id, felhasznaloId) => {
        try {
            const response = await api.put(`/tarsasagok/${tarsasag_id}/member/${felhasznaloId}/deactivate`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Tag deaktiválási hiba');
        }
    },

    /**
     * Tag aktiválása
     * @param {number} tarsasag_id - Társaság ID
     * @param {number} felhasznaloId - Felhasználó ID
     * @returns {Promise<Object>}
     */
    activateMember: async (tarsasag_id, felhasznaloId) => {
        try {
            const response = await api.put(`/tarsasagok/${tarsasag_id}/member/${felhasznaloId}/activate`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Tag aktiválási hiba');
        }
    },

    /**
     * Társaság deaktiválása
     * @param {number} tarsasag_id - Társaság ID
     * @returns {Promise<Object>}
     */
    deactivateCompany: async (tarsasag_id) => {
        try {
            const response = await api.put(`/tarsasagok/${tarsasag_id}/deaktival`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Társaság deaktiválási hiba');
        }
    },

    /**
     * Társaság aktiválása
     * @param {number} tarsasag_id - Társaság ID
     * @returns {Promise<Object>}
     */
    activateCompany: async (tarsasag_id) => {
        try {
            const response = await api.put(`/tarsasagok/${tarsasag_id}/aktival`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Társaság aktiválási hiba');
        }
    },

    /**
     * Alapító módosítása
     * @param {number} tarsasag_id - Társaság ID
     * @param {number} uj_alapito_id - Új alapító ID
     * @returns {Promise<Object>}
     */
    changeFounder: async (tarsasag_id, uj_alapito_id) => {
        try {
            const response = await api.put(`/tarsasagok/${tarsasag_id}/alapito`, { uj_alapito_id });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Alapító módosítási hiba');
        }
    },

    /**
     * Társaság törlése
     * @param {number} id - Társaság ID
     * @returns {Promise<Object>}
     */
    deleteCompany: async (id) => {
        try {
            const response = await api.delete(`/tarsasagok/${id}/torles`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Törlési hiba');
        }
    },

    /**
     * Társaság projektjei
     * @param {number} tarsasag_id - Társaság ID
     * @returns {Promise<Array>}
     */
    getCompanyProjects: async (tarsasag_id) => {
        try {
            const response = await api.get(`/tarsasagok/${tarsasag_id}/projektek`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Projektek betöltési hiba');
        }
    }
};