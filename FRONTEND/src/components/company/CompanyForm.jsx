import { useState } from "react";
import styles from "./CompanyForm.module.css";

export function CompanyForm({ onSubmit, onCancel, loading }) {
    const [nev, setNev] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (nev.trim().length < 3) {
            setError('A társaság neve legalább 3 karakter hosszú kell legyen');
            return;
        }

        onSubmit(nev);
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div className={`${styles.alert} ${styles.alertError}`} role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

            <div className={styles.formGroup}>
                <label htmlFor="companyName" className={styles.label}>
                    Társaság neve <span className={styles.required}>*</span>
                </label>
                <input
                    type="text"
                    className={styles.input}
                    id="companyName"
                    value={nev}
                    onChange={(e) => setNev(e.target.value)}
                    placeholder="pl. TechStartup Kft."
                    required
                    autoFocus
                    disabled={loading}
                />
                <small className={styles.helpText}>
                    Legalább 3 karakter
                </small>
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onCancel}
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
                            Létrehozás...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-plus-circle me-2"></i>
                            Létrehozás
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}