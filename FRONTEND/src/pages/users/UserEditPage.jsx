import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router";
import styles from "./UserEditPage.module.css";
import { BackButton } from "../../components/common/BackButton";

export function UserEditPage() {
    const { user, updateUserProfile, updatePassword } = useAuth();
    const navigate = useNavigate();

    const [nev, setNev] = useState(user?.nev || '');
    const [email, setEmail] = useState(user?.email || '');

    const [regiJelszo, setRegiJelszo] = useState('');
    const [ujJelszo, setUjJelszo] = useState('');
    const [ujJelszoMegerosites, setUjJelszoMegerosites] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await updateUserProfile(nev, email);
            setSuccess('Profil sikeresen frissítve!');
            setTimeout(() => {
                navigate('/profil');
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (ujJelszo.length < 6) {
            setError('Az új jelszónak legalább 6 karakter hosszúnak kell lennie');
            return;
        }

        if (ujJelszo !== ujJelszoMegerosites) {
            setError('Az új jelszavak nem egyeznek');
            return;
        }

        setLoading(true);

        try {
            await updatePassword(regiJelszo, ujJelszo);
            setSuccess('Jelszó sikeresen módosítva!');
            setRegiJelszo('');
            setUjJelszo('');
            setUjJelszoMegerosites('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <div className="row">
                <div className="col-md-6 mx-auto">
                    <div className={`card shadow mb-4 ${styles.card}`}>
                        <div className={styles.cardHeader}>
                            <h4 className={styles.cardTitle}>
                                <i className="bi bi-pencil-square me-2"></i>
                                Profil szerkesztése
                            </h4>
                        </div>
                        <div className={styles.cardBody}>
                            {error && (
                                <div className={`${styles.alert} ${styles.alertError}`} role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className={`${styles.alert} ${styles.alertSuccess}`} role="alert">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleProfileSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="nev" className={styles.label}>Név</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        id="nev"
                                        value={nev}
                                        onChange={(e) => setNev(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="email" className={styles.label}>Email</label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={() => navigate('/profil')}
                                    >
                                        Vissza a Felhasználói profilhoz
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Mentés...
                                            </>
                                        ) : 'Profil mentése'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className={`card shadow ${styles.card}`}>
                        <div className={styles.cardHeader}>
                            <h4 className={styles.cardTitle}>
                                <i className="bi bi-key me-2"></i>
                                Jelszó módosítása
                            </h4>
                        </div>
                        <div className={styles.cardBody}>
                            <form onSubmit={handlePasswordSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="regiJelszo" className={styles.label}>
                                        Jelenlegi jelszó
                                    </label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        id="regiJelszo"
                                        value={regiJelszo}
                                        onChange={(e) => setRegiJelszo(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="ujJelszo" className={styles.label}>
                                        Új jelszó
                                    </label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        id="ujJelszo"
                                        value={ujJelszo}
                                        onChange={(e) => setUjJelszo(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <small className={styles.helpText}>
                                        Legalább 8 karakter
                                    </small>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="ujJelszoMegerosites" className={styles.label}>
                                        Új jelszó megerősítése
                                    </label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        id="ujJelszoMegerosites"
                                        value={ujJelszoMegerosites}
                                        onChange={(e) => setUjJelszoMegerosites(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className={styles.actions}>
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
                                                <i className="bi bi-key me-2"></i>
                                                Jelszó módosítása
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <BackButton />
        </div>
    );
}