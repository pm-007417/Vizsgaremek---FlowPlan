import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { NavLink, useNavigate } from "react-router";
import { useCompany } from "../../hooks/useCompany";
import styles from "./UserProfilePage.module.css";
import { BackButton } from "../../components/common/BackButton";

export function UserProfilePage() {
    const { user, logout, deleteAccount } = useAuth();
    const { companies, loadUserCompanies, loading } = useCompany();
    const navigate = useNavigate();

    useEffect(() => {
        loadUserCompanies();
    }, []);

    const handleLogout = () => {
        if (window.confirm('Biztosan ki szeretnél jelentkezni?')) {
            logout();
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('FIGYELEM! Biztosan törölni szeretné a fiókot?\n\nEz a művelet VISSZAVONHATATLAN!\n\n- Minden társaságból eltávolításra kerül\n- Létrehozott társaságai is törlődnek\n- Az adatai véglegesen törlődnek\n- A bejelentkezési lehetőség megszűnik')) {
            return;
        }

        if (!window.confirm('Biztos benne? A művelet visszavonhatatlan.')) {
            return;
        }

        try {
            await deleteAccount();
            alert('Fiók sikeresen törölve. Átirányítás a főoldalra...');
            navigate('/');
        } catch (err) {
            alert(err.message || 'Hiba történt a fiók törlése során');
        }
    };

    if (!user) {
        return (
            <div className={styles.spinner}>
                <div className={`spinner-border ${styles.spinnerIcon}`} role="status">
                    <span className="visually-hidden">Betöltés...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div className={`card shadow ${styles.card}`}>
                        <div className={styles.cardHeader}>
                            <h4 className={styles.cardTitle}>
                                <i className="bi bi-person-circle me-2"></i>
                                Felhasználói profil
                            </h4>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>Név:</div>
                                <div className={styles.infoValue}>{user.nev}</div>
                            </div>
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>Email:</div>
                                <div className={styles.infoValue}>{user.email}</div>
                            </div>
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>Regisztráció:</div>
                                <div className={styles.infoValue}>
                                    {user.letrehozas_datum ? user.letrehozas_datum.split('T')[0] : 'Nincs adat'}
                                </div>
                            </div>

                            <hr className={styles.divider} />

                            <h5 className={styles.sectionTitle}>
                                <i className="bi bi-building me-2"></i>
                                Társaságaim ({companies.length})
                            </h5>

                            {loading ? (
                                <div className="text-center">
                                    <div className="spinner-border spinner-border-sm" style={{ color: 'var(--color-primary)' }} role="status"></div>
                                </div>
                            ) : companies.length > 0 ? (
                                <div className={styles.companiesList}>
                                    {companies.map((company) => (
                                        <div key={company.tarsasag_id} className={styles.companyItem}>
                                            <div className={styles.companyItemContent}>
                                                <div className={styles.companyInfo}>
                                                    <h6>{company.tarsasag_nev}</h6>
                                                    <small className={styles.companyRole}>
                                                        Szerepkör: <span className={`${styles.badge} ${company.szerepkor === 'admin' ? styles.badgeAdmin :
                                                            company.szerepkor === 'manager' ? styles.badgeManager :
                                                                styles.badgeTag
                                                            }`}>{company.szerepkor}</span>
                                                    </small>
                                                </div>
                                                <NavLink
                                                    to={`/tarsasagok/${company.tarsasag_id}`}
                                                    className={styles.openButton}
                                                >
                                                    Megnyitás
                                                </NavLink>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.alertInfo}>
                                    <i className="bi bi-info-circle me-2"></i>
                                    Még nem vagy tagja egyetlen társaságnak sem.
                                </div>
                            )}

                            <hr className={styles.divider} />

                            <div className={styles.actions}>
                                <NavLink to="/profil/profil_modositas" className={styles.editButton}>
                                    <i className="bi bi-pencil me-2"></i>
                                    Profil szerkesztése
                                </NavLink>
                                <button onClick={handleLogout} className={styles.logoutButton}>
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Kijelentkezés
                                </button>
                            </div>

                            <hr className={styles.divider} />

                            <div className={styles.dangerZone}>
                                <h5 className={styles.dangerZoneTitle}>
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    Fiók törlése
                                </h5>
                                <p className={styles.dangerZoneText}>
                                    A fiók törlése <strong>VISSZAVONHATATLAN</strong> művelet. Minden adata véglegesen törlődik.
                                </p>
                                <button onClick={handleDeleteAccount} className={styles.deleteAccountButton}>
                                    <i className="bi bi-trash-fill me-2"></i>
                                    Fiók végleges törlése
                                </button>
                            </div>
                        </div>
                    </div>
                    <BackButton />
                </div>
            </div>
        </div>
    );
}