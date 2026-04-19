import { RouterProvider } from "react-router";
import { router } from "./routes/router";
import { TaskProvider } from "./context/TaskContext";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";

export function AppProvider() {
    return (
        <AuthProvider>
            <ProjectProvider>
                <TaskProvider>
                    <RouterProvider router={router} />
                </TaskProvider>
            </ProjectProvider>
        </AuthProvider>
    );
};