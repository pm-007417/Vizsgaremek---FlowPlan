import { api } from './api';

export const userApi = {
    // Regisztráció (nincs token)
    register: async (nev, email, jelszo) => {
        try {
            const response = await api.post('/felhasznalok/register', { nev, email, jelszo });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || error.response?.data?.valasz || 'Regisztrációs hiba');
        }
    },

    // Bejelentkezés (nincs token)
    login: async (email, jelszo) => {
        try {
            const response = await api.post('/felhasznalok/login', { email, jelszo });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Bejelentkezési hiba');
        }
    },

    // Saját profil lekérése
    getProfile: async () => {
        try {
            const response = await api.get('/felhasznalok/profile');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Profil betöltési hiba');
        }
    },

    // Profil módosítása
    updateProfile: async (nev, email) => {
        try {
            const response = await api.put('/felhasznalok/profile', { nev, email });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Profil frissítési hiba');
        }
    },

    // Jelszó módosítása
    updatePassword: async (regiJelszo, ujJelszo) => {
        try {
            const response = await api.put('/felhasznalok/password', { regiJelszo, ujJelszo });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Jelszó módosítási hiba');
        }
    },

    // Felhasználó törlése
    deleteAccount: async () => {
        try {
            const response = await api.delete('/felhasznalok/profile');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.uzenet || 'Fiók törlési hiba');
        }
    }
};