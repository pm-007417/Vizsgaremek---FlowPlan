import { useState } from "react";
import styles from "../companies/AddMemberModal.module.css";

export function AddMemberModal({ show, onClose, onSubmit }) {
    const [email, setEmail] = useState('');
    const [szerepkor, setSzerepkor] = useState('tag');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onSubmit(email, szerepkor);
            setEmail('');
            setSzerepkor('tag');
        } catch (err) {
            setError(err.message || 'Hiba történt a tag hozzáadása során');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setSzerepkor('tag');
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
                                <i className="bi bi-person-plus-fill me-2"></i>
                                Tag hozzáadása a társasághoz
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
                            {error && (
                                <div className={`${styles.alert} ${styles.alertError}`} role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email" className={styles.label}>
                                        Felhasználó azonosító <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="pl. user@example.com"
                                        required
                                        autoFocus
                                        disabled={loading}
                                    />
                                    <small className={styles.helpText}>
                                        Add meg a hozzáadni kívánt felhasználó email címét
                                    </small>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="szerepkor" className={styles.label}>
                                        Szerepkör <span className={styles.required}>*</span>
                                    </label>
                                    <select
                                        className={styles.select}
                                        id="szerepkor"
                                        value={szerepkor}
                                        onChange={(e) => setSzerepkor(e.target.value)}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="tag">Tag</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <small className={styles.helpText}>
                                        Válaszd ki a felhasználó szerepkörét a társaságban
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
                                                Hozzáadás...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-person-plus-fill me-2"></i>
                                                Hozzáadás
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