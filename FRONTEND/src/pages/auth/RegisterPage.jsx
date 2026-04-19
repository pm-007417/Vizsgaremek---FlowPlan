import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import styles from "./RegisterPage.module.css";

export function RegisterPage() {
    const [nev, setNev] = useState('');
    const [email, setEmail] = useState('');
    const [jelszo, setJelszo] = useState('');
    const [jelszoMegerosites, setJelszoMegerosites] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (jelszo !== jelszoMegerosites) {
            setError('A jelszavak nem egyeznek');
            return;
        }

        if (jelszo.length < 6) {
            setError('A jelszónak legalább 6 karakter hosszúnak kell lennie');
            return;
        }

        setLoading(true);

        try {
            await register(nev, email, jelszo);
            setSuccess(true);
            setTimeout(() => {
                navigate('/bejelentkezes');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.cardBody}>
                    <h2 className={`${styles.logo} text-center`}>
                        <span className={styles.logoFlow}>Flow</span>
                        <span className={styles.logoPlan}>Plan</span>
                    </h2>
                    <p className={`${styles.slogan} text-center`}>
                        Projektmenedzsment mesterfokon
                    </p>
                    
                    <h5 className={`${styles.title} text-center`}>Regisztráció</h5>

                    {error && (
                        <div className={`${styles.alert} ${styles.alertDanger}`} role="alert">
                            <small>
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                            </small>
                        </div>
                    )}

                    {success && (
                        <div className={`${styles.alert} ${styles.alertSuccess}`} role="alert">
                            <small>
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Sikeres regisztráció! Átirányítás...
                            </small>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="nev" className={styles.label}>
                                Teljes név
                            </label>
                            <input
                                type="text"
                                className={styles.input}
                                id="nev"
                                value={nev}
                                onChange={(e) => setNev(e.target.value)}
                                required
                                autoFocus
                                placeholder="Nagy Péter"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Email cím
                            </label>
                            <input
                                type="email"
                                className={styles.input}
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="pelda@email.com"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="jelszo" className={styles.label}>
                                Jelszó
                            </label>
                            <input
                                type="password"
                                className={styles.input}
                                id="jelszo"
                                value={jelszo}
                                onChange={(e) => setJelszo(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                            <small className={styles.helpText}>
                                Legalább 8 karakter
                            </small>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="jelszoMegerosites" className={styles.label}>
                                Jelszó megerősítése
                            </label>
                            <input
                                type="password"
                                className={styles.input}
                                id="jelszoMegerosites"
                                value={jelszoMegerosites}
                                onChange={(e) => setJelszoMegerosites(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Regisztráció...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-person-plus-fill me-2"></i>
                                    Regisztráció
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p className="mb-0">
                            Már van fiókja?{' '}
                            <NavLink to="/bejelentkezes" className={styles.link}>
                                Jelentkezzen be
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}