import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import styles from "./homePage.module.css";

export function HomePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const cards = [
        {
            title: "Profilom",
            desc: "Kezeld a fiókodhoz tartozó adataidat.",
            path: "/profil",
        },
        {
            title: "Társaságok",
            desc: "Kezeld a társaságokat és tagjaikat.",
            path: "/tarsasagok",
        },
        {
            title: "Projektek",
            desc: "Tekintsd át az aktív projektjeidet, vagy hozz létre újat.",
            path: "/projektek",
        },
        {
            title: "Feladatok",
            desc: "Kövesd nyomon a nyitott és elvégzett feladataidat.",
            path: "/feladatok",
        },
    ];

    return (
        <div className={styles.wrap}>
            <div className={styles.hero}>
                {user && (
                    <div className={styles.userBar}>
                        <h1>Üdv, <em>{user.nev}</em>!</h1>
                        <span className={styles.userBarHint}>
                            Nem te vagy?{" "}
                            <button className={styles.logoutLink} onClick={logout}>
                                Kijelentkezés
                            </button>
                        </span>
                    </div>
                )}
                <br />
                <p className={styles.heroSub}>
                    Kezeld projektjeidet, feladataidat és csapatodat egy helyen.
                </p>

            </div>
            <div className={styles.grid}>
                {cards.map((card) => (
                    <div
                        key={card.path}
                        className={`${styles.card} ${styles[card.color]}`}
                        onClick={() => navigate(card.path)}
                    >
                        <h3>{card.title}</h3>
                        <p className={`${styles.card_p}`}>{card.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}