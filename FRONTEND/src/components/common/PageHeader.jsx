import { useNavigate } from 'react-router';
import styles from './PageHeader.module.css';

/**
 * @param {Object} props
 * @param {string} props.title - Fejléc szövege
 * @param {string} [props.actionLabel] - Gomb felirata (opcionális)
 * @param {string} [props.actionPath] - Gomb útvonala (opcionális)
 */
export function PageHeader({ title, actionLabel, actionPath }) {
    const navigate = useNavigate();

    return (
        <div className={styles.card}>
            <div className={styles.header} onClick={() => navigate(`/${title}/`)}>
                {title}
                {actionLabel && actionPath && (
                    <button
                        className={styles.actionButton}
                        onClick={(e) => { e.stopPropagation(); navigate(actionPath); }}
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}