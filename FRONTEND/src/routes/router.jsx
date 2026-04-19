import { createBrowserRouter } from "react-router";
import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../pages/HomePage";
import { AuthLayout } from "../layouts/AuthLayout";
import { NotFoundPage } from "../pages/NotFoundPage";
import { TasksPage } from "../pages/tasks/TasksPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { UserProfilePage } from "../pages/users/UserProfilePage";
import { UserEditPage } from "../pages/users/UserEditPage";
import { CompaniesPage } from "../pages/companies/CompaniesPage";
import { CompanyDetailPage } from "../pages/companies/CompanyDetailPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { TaskPage } from "../pages/tasks/TaskPage";
import { TaskEditPage } from "../pages/tasks/TaskEditPage";
import { TaskAddPage } from "../pages/tasks/TaskAddPage";
import { ProjectsPage } from "../pages/projects/ProjectsPage";
import { ProjectPage } from "../pages/projects/ProjectPage";
import { ProjectEditPage } from "../pages/projects/ProjectEditPage";
import { ProjectAddPage } from "../pages/projects/ProjectAddPage";

export const router = createBrowserRouter(
    [
        {
            element: <AuthLayout />,
            children: [
                {
                    path: "bejelentkezes",
                    element: <LoginPage />
                },
                {
                    path: "regisztracio",
                    element: <RegisterPage />
                }
            ]
        },
        {
            element: <ProtectedRoute />,
            children: [
                {
                    path: "/",
                    element: <MainLayout />,
                    errorElement: <NotFoundPage />,
                    children: [
                        {
                            index: true,
                            element: <HomePage />
                        },
                        {
                            path: "profil",
                            children: [
                                {
                                    index: true,
                                    element: <UserProfilePage />
                                },
                                {
                                    path: "profil_modositas",
                                    element: <UserEditPage />
                                },
                            ]
                        },
                        {
                            path: "tarsasagok",
                            children: [
                                {
                                    index: true,
                                    element: <CompaniesPage />
                                },
                                {
                                    path: ":id",
                                    element: <CompanyDetailPage />
                                }
                            ]
                        },
                        {
                            path: "feladatok",
                            children: [
                                {
                                    index: true,
                                    element: <TasksPage />,
                                },
                                {
                                    path: ":id",
                                    element: <TaskPage />
                                },
                                {
                                    path: ":id/modositas",
                                    element: <TaskEditPage />
                                },
                                {
                                    path: "uj_feladat",
                                    element: <TaskAddPage />
                                }
                            ]
                        },
                        {
                            path: "projektek",
                            children: [
                                {
                                    index: true,
                                    element: <ProjectsPage />
                                },
                                {
                                    path: ":id",
                                    element: <ProjectPage />
                                },
                                {
                                    path: ":id/modositas",
                                    element: <ProjectEditPage />
                                },
                                {
                                    path: "uj_projekt",
                                    element: <ProjectAddPage />
                                }
                            ]
                        },
                        {
                            path: "*",
                            element: <NotFoundPage />
                        },

                    ]
                }
            ]
        }

    ]
)