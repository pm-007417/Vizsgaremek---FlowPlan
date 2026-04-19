import { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import styles from "./NavigationBar.module.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useAuth } from '../../hooks/useAuth';

export function NavigationBar() {
    const [open, setOpen] = useState(false);
    const closeTimer = useRef(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleMouseLeave = () => {
        closeTimer.current = setTimeout(() => setOpen(false), 400);
    }

    const handleMouseEnter = () => {
        clearTimeout(closeTimer.current);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    return (
        <div>
            {/* Fejléc */}
            <nav className={styles.topbar}>
                <NavLink className={styles.logo_img} to="/"></NavLink>
                <NavLink className={styles.logo}>
                    <span className={styles.flow}>Flow</span>
                    <span className={styles.logo_plan}>Plan</span>
                    <span className={styles.slogan}>- Projektmanagement mesterfokon</span>
                </NavLink>

                {user && (
                    <div className={styles.userInfo} onClick={() => navigate(`/profil`)}>
                        <i className="bi bi-person-circle"></i>
                        <span>{user.nev}</span>
                    </div>
                )}

            </nav>

            {/* Oldalsáv */}
            <nav className={`${styles.navbarstyle}`} onMouseLeave={handleMouseLeave} onMouseEnter={handleMouseEnter}>

                {/* Hamburger gomb LEGFELÜL */}
                <button className={`navbar-toggler ${styles.hamburger}`} type="button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
                    <i className="bi bi-list"></i>
                </button>

                {/* Menüpontok – csak ha open */}
                <div className={`${styles.menuItems} ${open ? styles.menuOpen : ""}`}>
                    <ul className="navbar-nav">

                        <li className="nav-item">
                            <NavLink className={`nav-link ${styles.link}`} to="/" onClick={() => setOpen(false)}>
                                Főoldal
                            </NavLink>
                        </li>

                        <li className="nav-item dropdown">
                            <NavLink className={`nav-link dropdown-toggle ${styles.link}`} to="/profil" role="button" data-bs-toggle="dropdown">
                                Felhasználói fiók
                            </NavLink>
                            <ul className="dropdown-menu">
                                <li><NavLink className="dropdown-item" to="/profil" onClick={() => setOpen(false)}>Áttekintés</NavLink></li>
                                <li><NavLink className="dropdown-item" to="/profil/profil_modositas" onClick={() => setOpen(false)}>Adatok módosítása</NavLink></li>
                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            <NavLink className={`nav-link dropdown-toggle ${styles.link}`} to="/tarsasagok" role="button" data-bs-toggle="dropdown">
                                Társaságok
                            </NavLink>
                            <ul className="dropdown-menu">
                                <li><NavLink className="dropdown-item" to="/tarsasagok" onClick={() => setOpen(false)}>Lista</NavLink></li>
                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            <NavLink className={`nav-link dropdown-toggle ${styles.link}`} to="/projektek" role="button" data-bs-toggle="dropdown">
                                Projektek
                            </NavLink>
                            <ul className="dropdown-menu">
                                <li><NavLink className="dropdown-item" to="/projektek" onClick={() => setOpen(false)}>Lista</NavLink></li>
                                <li><NavLink className="dropdown-item" to="/projektek/uj_projekt" onClick={() => setOpen(false)}>Új projekt</NavLink></li>
                            </ul>
                        </li>

                        <li className="nav-item dropdown">
                            <NavLink className={`nav-link dropdown-toggle ${styles.link}`} to="/feladatok" role="button" data-bs-toggle="dropdown">
                                Feladatok
                            </NavLink>
                            <ul className="dropdown-menu">
                                <li><NavLink className="dropdown-item" to="/feladatok" onClick={() => setOpen(false)}>Lista</NavLink></li>
                                <li><NavLink className="dropdown-item" to="/feladatok/uj_feladat" onClick={() => setOpen(false)}>Új feladat</NavLink></li>
                            </ul>
                        </li>

                        <li className="nav-item">
                            <NavLink className={`nav-link ${styles.linkLogout}`} to="/bejelentkezes" onClick={handleLogout}>
                                <span className="{`${styles.linkLogout}`}">Kijelentkezés</span>
                            </NavLink>
                        </li>

                    </ul>
                </div>
            </nav>
        </div>
    );
}