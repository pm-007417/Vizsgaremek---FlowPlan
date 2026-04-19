import { api } from '../api/api';
import { Message } from '../models/Message';
import { Task } from '../models/Task';
import { User } from '../models/User';

export const taskApi = {
    /**
     * 
     * @returns {Task[]} feladatok tömb
     */
    getAllTasks: async () => {
        const response = await api.get("/feladatok/felhasznalo");
        const feladatok = response.data.map(elem => Task.fromApi(elem));
        return feladatok;
    },

    getTaskById: async (id) => {
        const response = await api.get(`/feladatok/${id}`);
        const feladat = Task.fromApi(response.data);
        return feladat;
    },

    getUsersByTask: async (feladatId) => {
        const response = await api.get(`/feladatok/${feladatId}/felhasznalok`);
        return response.data.map(elem => User.fromApi(elem));
    },

    getTaskEligibleUsers: async (feladatId) => {
        const response = await api.get(`/feladatok/${feladatId}/hozzaadhato_felhasznalok`);
        return response.data;
    },

    removeUserFromTask: async (feladatId, felhasznaloId) => {
        const response = await api.delete(`/feladatok/${feladatId}/felhasznalo_torles`, {
            data: { torlendo_felhasznalo_id: felhasznaloId }
        });
        return response.data;
    },

    addUserToTask: async (feladatId, felhasznaloId) => {
        const response = await api.post(`/feladatok/${feladatId}/felhasznalo_hozzaadas`, {
            felhasznalo_id: felhasznaloId
        });
        return response.data;
    },

    getMessagesByTask: async (feladatId) => {
        const response = await api.get(`/feladatok/${feladatId}/uzenetek`);
        return response.data.map(elem => Message.fromApi(elem));
    },

    addTaskMessage: async (feladatId, tartalom) => {
        const response = await api.post(`/feladatok/${feladatId}/ujuzenet`, { tartalom });
        return response.data;
    },

    modifyTask: async (feladatId, adatok) => {
        const response = await api.put(`/feladatok/${feladatId}/feladat_modositas`, adatok);
        return response.data;
    },

    createTask: async (adatok) => {
        const { projekt_id, allapot, ...body } = adatok;
        const tisztitott = {
            ...body,
            tarsasag_id: Number(body.tarsasag_id) || undefined,
            leiras: body.leiras || undefined,
            hatarido: body.hatarido || undefined,
        };
        const response = await api.post(`/feladatok/${adatok.projekt_id}/ujfeladat`, tisztitott);
        return response.data;
    },

    deleteTask: async (feladatId) => {
        const response = await api.delete(`/feladatok/${feladatId}/torles`);
        return response.data;
    }
}