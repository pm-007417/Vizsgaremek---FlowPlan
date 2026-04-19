import { createContext, useContext, useEffect, useState } from "react";
import { projectApi } from "../api/projectApi";
import { Project } from "../models/Project";
import { AuthContext } from "./AuthContext";

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
    const { token } = useContext(AuthContext);
    const [projektek, setProjektek] = useState([]);
    const [projekt, setProjekt] = useState([]);
    const [feladatok, setFeladatok] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // függvények

    /**
     * @param {Project} projekt
     */
    const getProjects = async () => {
        setIsLoading(true);
        try {
            const data = await projectApi.getAllProjects();
            setProjektek(data);
            return data;
        } catch (error) {
            console.error("Hiba a projektek lekérdezése során", error);
            return [];
        } finally {
            setIsLoading(false);
        }
    }

    const getProjectById = async (id) => {
        setIsLoading(true);
        try {
            const data = await projectApi.getProjectById(id);
            setProjekt(data);
            return data;
        } catch (error) {
            console.error("Hiba a projekt lekérdezése során", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const getProjectUsers = async (id) => {
        try {
            return await projectApi.getUsersByProject(id);
        } catch (error) {
            console.error("Hiba a résztvevők lekérdezése során", error);
            return [];
        }
    }

    const getProjectEligibleUsers = async (projektId) => {
        try {
            return await projectApi.getProjectEligibleUsers(projektId);
        } catch (error) {
            console.error("Hiba a hozzáadható felhasználók lekérdezése során", error);
            return [];
        }
    }

    const getProjectTasks = async (projektId) => {
        setIsLoading(true);
        try {
            const data = await projectApi.getTasksByProject(projektId);
            setFeladatok(data);
            return data;
        } catch (error) {
            console.error("Hiba a feladatok lekérdezése során", error);
            return [];
        } finally {
            setIsLoading(false);
        }
    }

    const addUserToProject = async (projektId, felhasznaloId) => {
        try {
            await projectApi.addUserToProject(projektId, felhasznaloId);
        } catch (error) {
            console.error("Hiba a felhasználó hozzáadása során", error);
            throw error;
        }
    }

    const updateProject = async (projektId, projekt) => {
        try {
            await projectApi.modifyProject(projektId, projekt);
            await getProjects();
        } catch (error) {
            console.error("Hiba a projekt módosítása során", error);
            throw error;
        }
    }

    const removeUserFromProject = async (projektId, felhasznaloId) => {
        try {
            await projectApi.removeUserFromProject(projektId, felhasznaloId);
        } catch (error) {
            console.error("Hiba a felhasználó eltávolítása során", error);
            throw error;
        }
    }

    /**
    * @param {Number} id törlendő projekt azonosítója
    */
    const deleteProject = async (id) => {
        try {
            await projectApi.deleteProject(id);
            await getProjects();
        } catch (error) {
            console.error("Hiba a projekt törlése során", error);
            throw error;
        }
    }

    const getProjectMessages = async (projektId) => {
        try {
            return await projectApi.getMessagesByProject(projektId);
        } catch (error) {
            console.error("Hiba az üzenetek lekérdezése során", error);
            return [];
        }
    }

    const addProjectMessage = async (projektId, tartalom) => {
        try {
            await projectApi.addProjectMessage(projektId, tartalom);
        } catch (error) {
            console.error("Hiba az üzenet küldése során", error);
            throw error;
        }
    }

    const createProject = async (projekt) => {
        try {
            await projectApi.createProject(projekt);
            await getProjects();
        } catch (error) {
            console.error("Hiba a projekt létrehozása során", error);
            throw error;
        }
    }

    useEffect(() => {
        if (!token) {
            setProjektek([]);
            return;
        }
        getProjects();
    }, [token]);

    return (
        <ProjectContext.Provider value={{
            projekt,
            projektek,
            feladatok,
            isLoading,
            getProjects,
            getProjectById,
            getProjectUsers,
            getProjectEligibleUsers,
            getProjectTasks,
            addUserToProject,
            updateProject,
            removeUserFromProject,
            deleteProject,
            getProjectMessages,
            addProjectMessage,
            createProject
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export const useProjects = () => {
    const context = useContext(ProjectContext);

    if (!context) {
        throw new Error("A ProjectProvideren belül tudod csak használni a useProjectet!");
    }

    return context;
}