import { useState } from "react";
import styles from "../companies/ChangeFounderModal.module.css";

export function ChangeFounderModal({ show, onClose, onSubmit, members }) {
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedMemberId) {
            setError('Válasszon ki egy új alapítót');
            return;
        }

        if (!window.confirm('FIGYELEM! Ez a művelet VISSZAVONHATATLAN! Biztosan átadod az alapítói jogokat?')) {
            return;
        }

        setLoading(true);
        try {
            await onSubmit(parseInt(selectedMemberId));
            setSelectedMemberId('');
        } catch (err) {
            setError(err.message || 'Hiba történt');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedMemberId('');
        setError('');
        onClose();
    };

    if (!show) return null;

    return (
        <>
            <div
                className={styles.backdrop}
                onClick={handleClose}
            ></div>

            <div className={styles.modal}>
                <div className={styles.modalDialog}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h5 className={styles.modalTitle}>
                                <i className="bi bi-person-badge me-2"></i>
                                Alapító módosítása
                            </h5>
                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={handleClose}
                                disabled={loading}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={`${styles.alert} ${styles.alertWarning}`} role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <strong>FIGYELEM!</strong> Ez a művelet visszavonhatatlan! Az új alapító teljes jogosultságot kap a társaság felett.
                            </div>

                            {error && (
                                <div className={`${styles.alert} ${styles.alertError}`} role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="newFounder" className={styles.label}>
                                        Új alapító <span className={styles.required}>*</span>
                                    </label>
                                    <select
                                        className={styles.select}
                                        id="newFounder"
                                        value={selectedMemberId}
                                        onChange={(e) => setSelectedMemberId(e.target.value)}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">-- Válasszon egy tagot --</option>
                                        {members.map((member) => (
                                            <option key={member.felhasznalo_id} value={member.felhasznalo_id}>
                                                {member.felhasznalo_nev} ({member.email}) - {member.szerepkor}
                                            </option>
                                        ))}
                                    </select>
                                    <small className={styles.helpText}>
                                        Az új alapító automatikusan admin szerepkört kap
                                    </small>
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={handleClose}
                                        disabled={loading}
                                    >
                                        Mégse
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Módosítás...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-person-badge me-2"></i>
                                                Alapító módosítása
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}