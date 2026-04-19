import { createContext, useContext, useEffect, useState } from "react";
import { taskApi } from "../api/taskApi";
import { Task } from "../models/Task";
import { AuthContext } from "./AuthContext";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
    const { token } = useContext(AuthContext);
    const [feladatok, setFeladatok] = useState([]);
    const [feladat, setFeladat] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // függvények

    /**
     * @param {Task} feladat
     */
    const refreshTasks = async () => {
        setIsLoading(true);
        try {
            const data = await taskApi.getAllTasks();
            setFeladatok(data);
        } catch (error) {
            console.error("Hiba a feladatok lekérdezése során", error);
        } finally {
            setIsLoading(false);
        }
    }

    const getTaskById = async (id) => {

        setIsLoading(true);
        try {
            const data = await taskApi.getTaskById(id);
            setFeladat(data);
            return data;
        } catch (error) {
            console.error("Hiba a feladat lekérdezése során", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const getTaskUsers = async (id) => {
        try {
            return await taskApi.getUsersByTask(id);
        } catch (error) {
            console.error("Hiba a résztvevők lekérdezése során", error);
            return [];
        }
    }

    const getTaskEligibleUsers = async (feladatId) => {
        try {
            return await taskApi.getTaskEligibleUsers(feladatId);
        } catch (error) {
            console.error("Hiba a hozzáadható felhasználók lekérdezése során", error);
            return [];
        }
    }

    const addUserToTask = async (feladatId, felhasznaloId) => {
        try {
            await taskApi.addUserToTask(feladatId, felhasznaloId);
        } catch (error) {
            console.error("Hiba a felhasználó hozzáadása során", error);
            throw error;
        }
    }

    /**
     * @param {Task} feladat
     */
    const updateTask = async (feladatId, feladat) => {
        try {
            await taskApi.modifyTask(feladatId, feladat);
            await refreshTasks();
        } catch (error) {
            console.error("Hiba a feladat módosítása során", error);
            throw error;
        }
    }

    const removeUserFromTask = async (feladatId, felhasznaloId) => {
        try {
            await taskApi.removeUserFromTask(feladatId, felhasznaloId);
        } catch (error) {
            console.error("Hiba a felhasználó eltávolítása során", error);
            throw error;
        }
    }

    /**
     * @param {Number} id törlendő feladat azonosítója
     */
    const deleteTask = async (id) => {
        try {
            await taskApi.deleteTask(id);
            await refreshTasks();
        } catch (error) {
            console.error("Hiba a feladat törlése során", error);
            throw error;
        }
    }

    const getTaskMessages = async (feladatId) => {
        try {
            return await taskApi.getMessagesByTask(feladatId);
        } catch (error) {
            console.error("Hiba az üzenetek lekérdezése során", error);
            return [];
        }
    }

    const addTaskMessage = async (feladatId, tartalom) => {
        try {
            await taskApi.addTaskMessage(feladatId, tartalom);
        } catch (error) {
            console.error("Hiba az üzenet küldése során", error);
            throw error;
        }
    }

    const createTask = async (feladat) => {
        try {
            await taskApi.createTask(feladat);
            await refreshTasks();
        } catch (error) {
            console.error("Hiba a feladat létrehozása során", error);
            throw error;
        }
    }

    useEffect(() => {
        if (!token) {
            setFeladatok([]);
            return;
        }
        refreshTasks();
    }, [token]);

    return (
        <TaskContext.Provider value={{
            feladat,
            feladatok,
            isLoading,
            refreshTasks,
            updateTask,
            deleteTask,
            getTaskById,
            getTaskUsers,
            removeUserFromTask,
            addUserToTask,
            getTaskEligibleUsers,
            getTaskMessages,
            addTaskMessage,
            createTask
        }}>
            {children}
        </TaskContext.Provider>
    );
}

export const useTasks = () => {
    const context = useContext(TaskContext);

    if (!context) {
        throw new Error("A TaskProvideren belül tudod csak használni a useTaskot!");
    }

    return context;
}