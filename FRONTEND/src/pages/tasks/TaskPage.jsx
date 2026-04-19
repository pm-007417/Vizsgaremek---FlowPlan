import { useNavigate, useParams } from "react-router";
import { useTasks } from "../../context/TaskContext";
import styles from "./taskPage.module.css";
import { useState, useEffect } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { allapotCimke, VALASZTHATO_ALLAPOTOK } from "../../utils/status";
import { formatInputDate } from "../../utils/formatInputDate";
import { useMessages } from "../../utils/useMessages";
import { MemberSection } from "../../components/common/MemberSection";
import { BackButton } from "../../components/common/BackButton";
import { Spinner } from "../../components/common/Spinner";
import { useTask } from "../../utils/useTask";

export function TaskPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoading, getTaskUsers, removeUserFromTask, addUserToTask, getTaskEligibleUsers, getTaskMessages, addTaskMessage, updateTask, deleteTask } = useTasks();
    const { feladat, setFeladat, betolt, jogosultsagHiba, nemTalalhato, frissit } = useTask(id);
    const [resztvevok, setResztvevok] = useState([]);
    const [resztvevokBetoltes, setResztvevokBetoltes] = useState(true);
    const [allapotValtas, setAllapotValtas] = useState(false);
    const { uzenetek, uzenetekBetolt, ujUzenet, setUjUzenet, uzenetKuldesBetolt, uzenetHiba, uzenetekAljaRef, handleUzenetKuldes, handleUzenetKeyDown } = useMessages(id, getTaskMessages, addTaskMessage);

    useEffect(() => {
        if (!id) return;
        getTaskUsers(id)
            .then(data => setResztvevok(data))
            .finally(() => setResztvevokBetoltes(false));
    }, [id]);

    const handleRemoveUser = async (felhasznaloId) => {
        if (!window.confirm('Biztosan eltávolítod ezt a tagot?')) return;
        try {
            await removeUserFromTask(id, felhasznaloId);
            setResztvevok(prev => prev.filter(r => r.id !== felhasznaloId));
        } catch {
            alert('Hiba történt az eltávolítás során.');
        }
    };

    const handleAddUser = async (kivalasztottId) => {
        await addUserToTask(id, kivalasztottId);
        const frissitett = await getTaskUsers(id);
        setResztvevok(frissitett);
    };

    const handleAllapotValtas = async (ujAllapot) => {
        if (ujAllapot === feladat.allapot) return;
        setAllapotValtas(true);
        try {
            await updateTask(feladat.id, {
                cim: feladat.cim,
                leiras: feladat.leiras ?? '',
                hatarido: formatInputDate(feladat.hatarido),
                allapot: ujAllapot,
            });
            setFeladat(prev => ({ ...prev, allapot: ujAllapot }));
        } catch {
            alert('Hiba történt az állapot módosítása során.');
        } finally {
            setAllapotValtas(false);
        }
    };

    const handleArchival = async () => {
        if (feladat.allapot === 'archivalt') { alert('A feladat már archiválva van!'); return; }
        if (!window.confirm('Bizotsan archiválni szeretné?')) return;
        try {
            await updateTask(id, { cim: feladat.cim, leiras: feladat.leiras ?? '', hatarido: formatInputDate(feladat.hatarido), allapot: 'archivalt' });
            setFeladat(prev => ({ ...prev, allapot: 'archivalt' }));
            window.scrollTo(0, 0);
        } catch {
            alert('Hiba az archiválás során!');
        }
    };

    const handleTorles = async () => {
        const vegleges = feladat.allapot === 'torolve';
        const megerosites = vegleges
            ? 'A feladat már töröltek között van — biztosan véglegesen törlni szeretné? E a művelet nem visszavonható.'
            : 'Biztosan törölni szeretné ezt a feladatot?';
        if (!window.confirm(megerosites)) return;
        try {
            await deleteTask(feladat.id);
            navigate('/feladatok');
        } catch {
            alert('Hiba történt a törlés során.');
        }
    };

    if (isLoading || betolt) return <Spinner />;
    if (jogosultsagHiba) return <div><p>Nincs jogosultságod az adott oldal megtekintéséhez</p><BackButton /></div>;
    if (nemTalalhato) return <div><p>A feladat nem található.</p><BackButton /></div>;


    return (
        <div>
            <PageHeader title="Feladatok" />

            {/* Feladat adatok */}
            <div className={styles.card}>
                <div className={`${styles.header} ${styles.headerTitle}`}>
                    <span>{feladat.id} - {feladat.cim}</span>
                    <button className={styles.modifyButton} onClick={() => navigate(`/feladatok/${id}/modositas`)} title="Módosítás">
                        <span>Módosítás</span>
                    </button>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Leírás</span>
                    <span className={styles.cardValue}>{feladat.leiras ?? ''}</span>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Határidő</span>
                    <span>{feladat.hatarido ?? ''}</span>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Státusz</span>
                    <div className={styles.allapotWrapper}>
                        <select className={styles.allapotSelect} value={feladat.allapot} onChange={e => handleAllapotValtas(e.target.value)} disabled={allapotValtas}>
                            <option key={feladat.allapot} value={feladat.allapot} disabled>{allapotCimke(feladat.allapot)}</option>
                            {VALASZTHATO_ALLAPOTOK.map(a => (
                                <option key={a.value} value={a.value}>{a.label}</option>
                            ))}
                        </select>
                        {allapotValtas && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                    </div>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Projekt</span>
                    <button className={styles.linkButton} onClick={() => navigate(`/projektek/${feladat.projekt_id}`)}>
                        <span className={styles.linkButtonText}>{feladat.projekt_cim ?? ''}</span>
                    </button>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Létrehozva</span>
                    <span className={styles.cardValue}>{feladat.letrehozas_datum ?? ''}</span>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Tulajdonos</span>
                    <span>{feladat.tulajdonos_nev ?? ''}</span>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Társaság</span>
                    <button className={styles.linkButton} onClick={() => navigate(`/tarsasagok/${feladat.tarsasag_id}`)}>
                        <span className={styles.linkButtonText}>{feladat.tarsasag_nev ?? ''}</span>
                    </button>
                </div>
            </div>

            {/* Résztvevők */}
            <MemberSection
                resztvevok={resztvevok}
                betoltes={resztvevokBetoltes}
                onRemove={handleRemoveUser}
                getEligibleUsers={() => getTaskEligibleUsers(id)}
                onAdd={handleAddUser}
            />

            {/* Üzenetek */}
            <div className={styles.card} style={{ marginTop: '1rem' }}>
                <div className={styles.header}>
                    Üzenetek {!uzenetekBetolt && `(${uzenetek.length})`}
                </div>
                {uzenetekBetolt ? (
                    <div className={styles.cardRow}>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        <span>Betöltés...</span>
                    </div>
                ) : uzenetek.length === 0 ? (
                    <div className={styles.cardRow}>
                        <span className={styles.cardLabel}>Még nincsenek üzenetek.</span>
                    </div>
                ) : (
                    <div className={styles.uzenetekLista}>
                        {uzenetek.map((uzenet, index) => (
                            <div key={uzenet.id ?? index} className={styles.uzenetBuborek}>
                                <div className={styles.uzenetMeta}>
                                    <span className={styles.uzenetNev}>{uzenet.felhasznalo_nev ?? 'Ismeretlen'}</span>
                                    <span className={styles.uzenetDatum}>{uzenet.letrehozas_datum ?? ''}</span>
                                </div>
                                <p className={styles.uzenetTartalom}>{uzenet.tartalom}</p>
                            </div>
                        ))}
                        <div ref={uzenetekAljaRef} />
                    </div>
                )}
                <div className={styles.uzenetKuldo}>
                    {uzenetHiba && (
                        <div className="alert alert-danger py-2 px-3 mb-1" role="alert">
                            <small><i className="bi bi-exclamation-triangle-fill me-2"></i>{uzenetHiba}</small>
                        </div>
                    )}
                    <div className={styles.uzenetKuldoSor}>
                        <textarea
                            className={styles.uzenetTextarea}
                            rows={2}
                            placeholder="Új üzenetet..."
                            value={ujUzenet}
                            onChange={e => setUjUzenet(e.target.value)}
                            onKeyDown={handleUzenetKeyDown}
                        />
                        <button className={styles.uzenetKuldesGomb} onClick={handleUzenetKuldes} disabled={uzenetKuldesBetolt || !ujUzenet.trim()} title="Küldés (Enter)">
                            {uzenetKuldesBetolt
                                ? <span className="spinner-border spinner-border-sm" role="status"></span>
                                : <i className="bi bi-send-fill"></i>
                            }
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.actionRow}>
                <button className={styles.backButton} onClick={() => navigate('/feladatok')} title="Vissza a listához">
                    <i className="bi bi-arrow-left me-2"></i>
                    <span className={styles.backButtonText}>Vissza a feladatok listához</span>
                </button>
                <div className={styles.actionRowRight}>
                    <button className={styles.archiveButton} onClick={handleArchival}>Archiválás</button>
                    <button className={styles.deleteButton} onClick={handleTorles}>Törlés</button>
                </div>
            </div>

            <BackButton />
        </div>
    );
}