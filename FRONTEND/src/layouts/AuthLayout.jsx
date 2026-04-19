import { Outlet } from "react-router";
import { Footer } from "../components/common/Footer";
import styles from "./AuthLayout.module.css";

export function AuthLayout() {
    return (
        <div className={styles.layout}>
            <div className={styles.content}>
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}