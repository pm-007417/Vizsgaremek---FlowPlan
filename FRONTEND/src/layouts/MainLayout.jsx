import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Footer } from "../components/common/Footer";
import styles from "./MainLayout.module.css";
import { NavigationBar } from "../components/common/NavigationBar";

export function MainLayout() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className={styles.layout}>
            <NavigationBar/>
            <div className={styles.content}>
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}