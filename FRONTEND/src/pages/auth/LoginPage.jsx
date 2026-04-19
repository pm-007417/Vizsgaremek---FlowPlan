import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import styles from "./LoginPage.module.css";

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [jelszo, setJelszo] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, jelszo);
            navigate('/');
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
                    
                    <h5 className={`${styles.title} text-center`}>Bejelentkezés</h5>

                    {error && (
                        <div className={`${styles.alert} ${styles.alertDanger}`} role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
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
                                autoFocus
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
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Bejelentkezés...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-box-arrow-in-right me-2"></i>
                                    Bejelentkezés
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p className="mb-0">
                            Nem rendelkezik még fiókkal?{' '}
                            <NavLink to="/regisztracio" className={styles.link}>
                                Regisztráljon itt!
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}