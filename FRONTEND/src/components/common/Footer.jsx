import styles from './Footer.module.css';

export function Footer() {
    return (
        <div className={styles.footer}>
            <div className={styles.text}>
                <h6 className='p-2'>Készítette:<br /><b>Hegedüs Veronika, Pelczhoffer Éva, Pető Melinda</b><br />2026</h6>
            </div>
            <div className={styles.bottom}>
                <div className='p-2'></div>
            </div>
        </div>
    )
}