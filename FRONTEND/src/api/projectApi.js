import { Message } from '../models/Message';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { api } from './api';

export const projectApi = {
    /**
     * 
     * @returns {Project[]} projektek tömb
     */
    getAllProjects: async () => {
        const response = await api.get("/projektek/felhasznalo");
        const projektek = response.data.map(elem => Project.fromApi(elem));
        return projektek;
    },

    getProjectById: async (id) => {
        const response = await api.get(`/projektek/${id}`);
        const projekt = Project.fromApi(response.data);
        return projekt;
    },

    getUsersByProject: async (projektId) => {
        const response = await api.get(`/projektek/${projektId}/felhasznalok`);
        return response.data.map(elem => User.fromApi(elem));
    },

    getProjectEligibleUsers: async (projektId) => {
        const response = await api.get(`/projektek/${projektId}/hozzaadhato_felhasznalok`);
        return response.data;
    },

    removeUserFromProject: async (projektId, felhasznaloId) => {
        const response = await api.delete(`/projektek/${projektId}/felhasznalo_torles`, {
            data: { torlendo_felhasznalo_id: felhasznaloId }
        });
        return response.data;
    },

    addUserToProject: async (projektId, felhasznaloId) => {
        const response = await api.post(`/projektek/${projektId}/felhasznalo_hozzaadas`, {
            felhasznalo_id: felhasznaloId
        });
        return response.data;
    },

    getMessagesByProject: async (projektId) => {
        const response = await api.get(`/projektek/${projektId}/uzenetek`);
        return response.data.map(elem => Message.fromApi(elem));
    },

    addProjectMessage: async (projektId, tartalom) => {
        const response = await api.post(`/projektek/${projektId}/ujuzenet`, { tartalom });
        return response.data;
    },

    modifyProject: async (projektId, adatok) => {
        const response = await api.put(`/projektek/${projektId}/projekt_modositas`, adatok);
        return response.data;
    },

    createProject: async (adatok) => {
        const { tarsasag_id, allapot, ...body } = adatok;
         const tisztitott = {
            ...body,
            tarsasag_id: Number(body.tarsasag_id) || undefined,
            leiras: body.leiras || undefined,
            hatarido: body.hatarido || undefined,
        };
        const response = await api.post(`/projektek/${adatok.tarsasag_id}/ujprojekt`, tisztitott);
        return response.data;
    },

    deleteProject: async (projektId) => {
        const response = await api.delete(`/projektek/${projektId}/torles`);
        return response.data;
    },

    getTasksByProject: async (projektId) => {
        const response = await api.get(`/projektek/${projektId}/feladatok`);
        const projektFeladatok = response.data.map(elem => Task.fromApi(elem));
        return projektFeladatok;
    }
}