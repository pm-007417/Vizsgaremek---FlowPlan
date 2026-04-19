import { useNavigate, useParams } from "react-router";
import styles from "../tasks/taskPage.module.css";
import { useState, useEffect } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { allapotCimke, VALASZTHATO_ALLAPOTOK } from "../../utils/status";
import { formatInputDate } from "../../utils/formatInputDate";
import { useMessages } from "../../utils/useMessages";
import { MemberSection } from "../../components/common/MemberSection";
import { useProjects } from "../../context/ProjectContext";
import { ProjectTaskList } from "../../components/project/ProjectTaskList";
import { BackButton } from "../../components/common/BackButton";
import { useProject } from "../../utils/useProject";
import { Spinner } from "../../components/common/Spinner";

export function ProjectPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getProjectById, isLoading, getProjectUsers, getProjectTasks, removeUserFromProject, addUserToProject, getProjectEligibleUsers, getProjectMessages, addProjectMessage, updateProject, deleteProject } = useProjects();
    const { projekt, setProjekt, betolt, jogosultsagHiba, nemTalalhato, frissit } = useProject(id);
    const [resztvevok, setResztvevok] = useState([]);
    const [resztvevokBetoltes, setResztvevokBetoltes] = useState(true);
    const [allapotValtas, setAllapotValtas] = useState(false);
    const [projektFeladatok, setProjektFeladatok] = useState([]);
    const [feladatokBetolt, setFeladatokBetolt] = useState(true);
    const { uzenetek, uzenetekBetolt, ujUzenet, setUjUzenet, uzenetKuldesBetolt, uzenetHiba, uzenetekAljaRef, handleUzenetKuldes, handleUzenetKeyDown } = useMessages(id, getProjectMessages, addProjectMessage);

    useEffect(() => {
        if (!id) return;
        getProjectUsers(id)
            .then(data => setResztvevok(data))
            .finally(() => setResztvevokBetoltes(false));
        setFeladatokBetolt(true);

        getProjectTasks(id)
            .then(data => setProjektFeladatok(data))
            .finally(() => setFeladatokBetolt(false));
    }, [id]);

    const handleRemoveUser = async (felhasznaloId) => {
        if (!window.confirm('Biztosan eltávolítod ezt a tagot?')) return;
        try {
            await removeUserFromProject(id, felhasznaloId);
            setResztvevok(prev => prev.filter(r => r.id !== felhasznaloId));
        } catch {
            alert('Hiba történt az eltávolítás során.');
        }
    };

    const handleAddUser = async (kivalasztottId) => {
        await addUserToProject(id, kivalasztottId);
        const frissitett = await getProjectUsers(id);
        setResztvevok(frissitett);
    };

    const handleAllapotValtas = async (ujAllapot) => {
        if (ujAllapot === projekt.allapot) return;
        setAllapotValtas(true);
        try {
            await updateProject(projekt.id, {
                cim: projekt.cim,
                leiras: projekt.leiras ?? '',
                hatarido: formatInputDate(projekt.hatarido),
                allapot: ujAllapot,
            });
            setProjekt(prev => ({ ...prev, allapot: ujAllapot }));
        } catch {
            alert('Hiba történt az állapot módosítása során.');
        } finally {
            setAllapotValtas(false);
        }
    };

    const handleArchival = async () => {
        if (projekt.allapot === 'archivalt') { alert('A projekt már archiválva van!'); return; }
        if (!window.confirm('Bizotsan archiválni szeretné?')) return;
        try {
            await updateProject(id, { cim: projekt.cim, leiras: projekt.leiras ?? '', hatarido: formatInputDate(projekt.hatarido), allapot: 'archivalt' });
            setProjekt(prev => ({ ...prev, allapot: 'archivalt' }));
            window.scrollTo(0, 0);
        } catch {
            alert('Hiba az archiválás során!');
        }
    };

    const handleTorles = async () => {
        const vegleges = projekt.allapot === 'torolve';
        const megerosites = vegleges
            ? 'A projekt már töröltek között van — biztosan véglegesen törlni szeretné? E a művelet nem visszavonható.'
            : 'Biztosan törölni szeretné ezt a projektet?';
        if (!window.confirm(megerosites)) return;
        try {
            await deleteProject(projekt.id);
            navigate('/projektek');
        } catch {
            alert('Hiba történt a törlés során.');
        }
    };

    if (isLoading || feladatokBetolt || betolt) return <Spinner />;
    if (jogosultsagHiba) return <div><p>Nincs jogosultságod az adott oldal megtekintéséhez</p><BackButton />
    </div>;
    if (nemTalalhato) return <div><p>A projekt nem található.</p><BackButton /></div>;

    return (
        <div>
            <PageHeader title="Projektek" />

            {/* Projekt adatok */}
            <div className={styles.card}>
                <div className={`${styles.header} ${styles.headerTitle}`}>
                    <span>{projekt.id} - {projekt.cim}</span>
                    <button className={styles.modifyButton} onClick={() => navigate(`/projektek/${id}/modositas`)} title="Módosítás">
                        <span>Módosítás</span>
                    </button>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Leírás</span>
                    <span className={styles.cardValue}>{projekt.leiras ?? ''}</span>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Határidő</span>
                    <span>{projekt.hatarido ?? ''}</span>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Státusz</span>
                    <div className={styles.allapotWrapper}>
                        <select className={styles.allapotSelect} value={projekt.allapot} onChange={e => handleAllapotValtas(e.target.value)} disabled={allapotValtas}>
                            <option key={projekt.allapot} value={projekt.allapot} disabled>{allapotCimke(projekt.allapot)}</option>
                            {VALASZTHATO_ALLAPOTOK.map(a => (
                                <option key={a.value} value={a.value}>{a.label}</option>
                            ))}
                        </select>
                        {allapotValtas && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                    </div>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Létrehozva</span>
                    <span className={styles.cardValue}>{projekt.letrehozas_datum ?? ''}</span>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Tulajdonos</span>
                    <span>{projekt.tulajdonos_nev ?? ''}</span>
                </div>
                <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Társaság</span>
                    <button className={styles.linkButton} onClick={() => navigate(`/tarsasagok/${projekt.tarsasag_id}`)}>
                        <span className={styles.linkButtonText}>{projekt.tarsasag_nev ?? ''}</span>
                    </button>
                </div>
            </div>

            {/* Résztvevők */}
            <MemberSection
                resztvevok={resztvevok}
                betoltes={resztvevokBetoltes}
                onRemove={handleRemoveUser}
                getEligibleUsers={() => getProjectEligibleUsers(id)}
                onAdd={async (kivalasztottId) => {
                    await addUserToProject(id, kivalasztottId);
                    const frissitett = await getProjectUsers(id);
                    setResztvevok(frissitett);
                }}
            />

            {/* Feladatok */}
            <div className={styles.card} style={{ marginTop: '1rem' }}>
                <div className={styles.header}>
                    <span>Feladatok ({projektFeladatok.length})</span>
                    <button className={styles.addButton} onClick={(e) => { e.stopPropagation(); navigate(`/feladatok/uj_feladat?projekt_id=${projekt.id}&tarsasag_id=${projekt.tarsasag_id}&projekt_nev=${encodeURIComponent(projekt.cim)}`) }}>
                        <span>+ Új feladat</span>
                    </button>
                </div>
                <ProjectTaskList feladatok={projektFeladatok} />
            </div>

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
                <button className={styles.backButton} onClick={() => navigate('/projektek')} title="Vissza a listához">
                    <i className="bi bi-arrow-left me-2"></i>
                    <span className={styles.backButtonText}>Vissza a projektek listájához</span>
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