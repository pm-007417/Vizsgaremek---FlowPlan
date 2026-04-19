import { CompanyForm } from "../../components/company/CompanyForm";
import styles from "./CreateCompanyModal.module.css";

export function CreateCompanyModal({ show, onClose, onSubmit, loading }) {
    if (!show) return null;

    return (
        <>
            <div
                className={styles.backdrop}
                onClick={onClose}
            ></div>

            <div className={styles.modal}>
                <div className={styles.modalDialog}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h5 className={styles.modalTitle}>
                                <i className="bi bi-building me-2"></i>
                                Új társaság létrehozása
                            </h5>
                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={onClose}
                                disabled={loading}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <CompanyForm
                                onSubmit={onSubmit}
                                onCancel={onClose}
                                loading={loading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}