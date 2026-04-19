import { useState } from "react";
import styles from '../../pages/tasks/taskPage.module.css';

/**
 * Résztvevők táblázata + tag hozzáadása modal.
 * @param {Object} props
 * @param {Object[]} props.resztvevok - Résztvevők listája
 * @param {boolean} props.betoltes - Töltés alatt van-e
 * @param {Function} props.onRemove - (felhasznaloId) => void
 * @param {Function} props.getEligibleUsers - () => Promise<Object[]>
 * @param {Function} props.onAdd - (kivalasztottId) => Promise<void>
 */
export function MemberSection({ resztvevok, betoltes, onRemove, getEligibleUsers, onAdd }) {
    const [modalNyitva, setModalNyitva] = useState(false);
    const [modalHiba, setModalHiba] = useState('');
    const [modalBetoltes, setModalBetoltes] = useState(false);
    const [valaszthatoFelhasznalok, setValaszthatoFelhasznalok] = useState([]);
    const [kivalasztottId, setKivalasztottId] = useState('');

    const handleModalMegnyit = async () => {
        setModalHiba('');
        setKivalasztottId('');
        const lista = await getEligibleUsers();
        setValaszthatoFelhasznalok(lista);
        setModalNyitva(true);
    };

    const handleAddUser = async () => {
        if (!kivalasztottId) {
            setModalHiba('Válassz ki egy felhasználót.');
            return;
        }
        setModalBetoltes(true);
        setModalHiba('');
        try {
            await onAdd(kivalasztottId);
            setModalNyitva(false);
            setKivalasztottId('');
        } catch (err) {
            setModalHiba(err.response?.data?.uzenet ?? 'Hiba történt a hozzáadás során.');
        } finally {
            setModalBetoltes(false);
        }
    };

    return (
        <>
            {/* Résztvevők kártya */}
            <div className={styles.card} style={{ marginTop: '1rem' }}>
                <div className={styles.header}>
                    <span>Résztvevők {!betoltes && `(${resztvevok.length})`}</span>
                    <button className={styles.addButton} onClick={handleModalMegnyit} title="Tag hozzáadása">
                        <i className="bi bi-person-plus-fill me-1"></i>
                        <span className={styles.addButtonText}>Tag hozzáadása</span>
                    </button>
                </div>

                {betoltes ? (
                    <div className={styles.cardRow}>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        <span>Betöltés...</span>
                    </div>
                ) : resztvevok.length === 0 ? (
                    <div className={styles.cardRow}>
                        <span className={styles.cardLabel}>Nincsenek résztvevők.</span>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Név</th>
                                <th className={styles.th}>Email</th>
                                <th className={styles.th}>Szerepkör</th>
                                <th className={styles.th}>Csatlakozás</th>
                                <th className={styles.th}>Művelet</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resztvevok.map(r => (
                                <tr key={r.id} className={styles.tr}>
                                    <td className={styles.td}>{r.nev}</td>
                                    <td className={`${styles.td} ${styles.email}`}>{r.email}</td>
                                    <td className={`${styles.td}`}>
                                        <span className={`badge ${styles[`szerepkor_${r.szerepkor}`]}`}>
                                            {r.szerepkor}
                                        </span>
                                    </td>
                                    <td className={styles.td}>{r.hozzadas_datum}</td>
                                    <td className={`${styles.td}`}>
                                        <button className={styles.removeButton} onClick={() => onRemove(r.id)} title="Eltávolítás">
                                            <i className={`${styles.iconRemove} bi bi-person-dash-fill me-2`}></i>
                                            <span className={styles.removeButtonText}>Eltávolítás</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Tag hozzáadása modal */}
            {modalNyitva && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <span>Tag hozzáadása</span>
                            <button className={styles.modalClose} onClick={() => setModalNyitva(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {modalHiba && (
                                <div className="alert alert-danger py-2 px-3 mb-3" role="alert">
                                    <small><i className="bi bi-exclamation-triangle-fill me-2"></i>{modalHiba}</small>
                                </div>
                            )}
                            <label className={styles.modalLabel}>Felhasználó kiválasztása</label>
                            {valaszthatoFelhasznalok.length === 0 ? (
                                <p className={styles.modalUres}>Nincs hozzáadható tag a társaságban.</p>
                            ) : (
                                <select
                                    className={styles.modalInput}
                                    value={kivalasztottId}
                                    onChange={e => setKivalasztottId(e.target.value)}
                                >
                                    <option value="">— Válassz —</option>
                                    {valaszthatoFelhasznalok.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.nev} ({f.email})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.modalCancelButton} onClick={() => setModalNyitva(false)}>
                                Mégse
                            </button>
                            <button className={styles.modalSubmitButton} onClick={handleAddUser} disabled={modalBetoltes}>
                                {modalBetoltes ? (
                                    <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Hozzáadás...</>
                                ) : (
                                    <><i className="bi bi-person-plus-fill me-2"></i>Hozzáadás</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}