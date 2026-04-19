import { useState } from "react";
import styles from '../../pages/tasks/taskPage.module.css';

/**
 * Általános csukható lista komponens.
 * @param {Object} props
 * @param {string} props.title - A fejléc szövege
 * @param {number} props.count - A zárójelben megjelenő darabszám
 * @param {boolean} [props.defaultOpen=false] - Alapértelmezetten nyitva legyen-e
 * @param {React.ReactNode} props.children - A megjelenítendő tartalom
 */
export function CollapsiblePanel({ title, count, defaultOpen = false, children }) {
    const [nyitva, setNyitva] = useState(defaultOpen);

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <div className={styles.collapsibleHeader} onClick={() => setNyitva(!nyitva)}>
                <span>{title} ({count})</span>
                <i className={`bi bi-chevron-${nyitva ? 'up' : 'down'}`}></i>
            </div>
            {nyitva && children}
        </div>
    );
}
