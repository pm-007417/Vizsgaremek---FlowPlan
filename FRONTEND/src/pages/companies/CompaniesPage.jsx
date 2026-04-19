import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import { useCompany } from "../../hooks/useCompany";
import { CreateCompanyModal } from "./CreateCompanyModal";
import { Company } from "../../models/Company";
import { formatDate } from '../../utils/formatDate';
import styles from "./CompaniesPage.module.css";
import { BackButton } from "../../components/common/BackButton";

export function CompaniesPage() {
    const { companies: rawCompanies, loadUserCompanies, createCompany, loading } = useCompany();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const companies = rawCompanies.map(c => Company.fromApi(c));

    useEffect(() => {
        loadUserCompanies();
    }, []);

    const handleCreateCompany = async (nev) => {
        setCreating(true);
        try {
            await createCompany(nev);
            setShowCreateModal(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className={styles.header}>
                <h2 className={styles.title}>
                    <i className={`bi bi-building ${styles.titleIcon}`}></i>
                    Társaságaim
                </h2>
                <button
                    className={styles.createButton}
                    onClick={() => setShowCreateModal(true)}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Új társaság
                </button>
            </div>

            {loading ? (
                <div className={styles.spinner}>
                    <div className={`spinner-border ${styles.spinnerIcon}`} role="status">
                        <span className="visually-hidden">Betöltés...</span>
                    </div>
                </div>
            ) : companies.length > 0 ? (
                <div className={styles.grid}>
                    {companies.map((company) => (
                        <div key={company.id} className={styles.card}>
                            <div className={styles.cardBody}>
                                <h5 className={styles.cardTitle}>
                                    <i className={`bi bi-building ${styles.cardIcon}`}></i>
                                    {company.nev}
                                </h5>
                                <p className={styles.cardText}>
                                    <small>
                                        <i className="bi bi-calendar me-1"></i>
                                        Csatlakozás: {formatDate(company.csatlakozas_datum)}
                                    </small>
                                </p>
                                <p className="mb-2">
                                    Szerepkör: <span className={`${styles.badge} ${company.isAdmin() ? styles.badgeAdmin :
                                            company.isManager() ? styles.badgeManager :
                                                styles.badgeTag
                                        }`}>
                                        {company.szerepkor}
                                    </span>
                                </p>
                                <p className="mb-0">
                                    Státusz: <span className={`${styles.badge} ${company.isActive() ? styles.statusActive : styles.statusInactive
                                        }`}>
                                        {company.isActive() ? (
                                            <>
                                                <i className="bi bi-check-circle-fill me-1"></i>
                                                Aktív
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-x-circle-fill me-1"></i>
                                                Deaktiválva
                                            </>
                                        )}
                                    </span>
                                </p>
                            </div>
                            <div className={styles.cardFooter}>
                                <NavLink
                                    to={`/tarsasagok/${company.id}`}
                                    className={styles.detailsButton}
                                >
                                    <i className="bi bi-eye me-2"></i>
                                    Részletek
                                </NavLink>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.alertInfo}>
                    <i className="bi bi-info-circle me-2"></i>
                    Még nincs társasága. Hozza létre az elsőt!
                </div>
            )}

            {showCreateModal && (
                <CreateCompanyModal
                    show={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateCompany}
                    loading={creating}
                />
            )}
            <BackButton />
        </div>
    );
}