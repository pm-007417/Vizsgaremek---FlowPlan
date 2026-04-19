import { useNavigate, useSearchParams } from "react-router";
import { useTasks } from "../../context/TaskContext";
import { useEffect, useState } from "react";
import { formatInputDate } from "../../utils/formatInputDate";
import styles from '../../pages/tasks/taskPage.module.css';
import editStyles from "./taskForm.module.css";
import { useProjects } from "../../context/ProjectContext";
import { ALLAPOTOK } from "../../utils/status";

/**
 * @param {Object} props
 * @param {Object|null} props.feladat - Meglévő feladat (módosításhoz), null = új feladat
 * @param {'edit'|'create'} props.mode - 'edit' (módosítás) vagy 'create' (új)
 */
export function TaskForm({ feladat = null, mode = 'edit' }) {
    const navigate = useNavigate();
    const { updateTask, createTask, isLoading } = useTasks();
    const { getProjects } = useProjects();
    const [searchParams] = useSearchParams();

    const isEdit = mode === 'edit';

    const [form, setForm] = useState({
        cim: '',
        leiras: '',
        hatarido: '',
        allapot: '',
        projekt_id: '',
        tarsasag_id: '',
        projekt_nev: '',
    })

    const [projektek, setProjektek] = useState([]);
    const [projektetBetolt, setProjektekBetolt] = useState(true);
    const [modosit, setModosit] = useState(false);
    const [hiba, setHiba] = useState('');
    const [siker, setSiker] = useState(false);

    // Projektek betöltése
    useEffect(() => {
        getProjects()
            .then(data => {
                setProjektek(data);

                const projektIdParam = searchParams.get('projekt_id');
                if (!projektIdParam) return;

                const kivalasztott = data.find(p => String(p.id) === String(projektIdParam));
                if (kivalasztott) {
                    setForm(prev => ({
                        ...prev,
                        projekt_id: kivalasztott.id,
                        tarsasag_id: kivalasztott.tarsasag_id,
                    }));
                } else {
                    const tarsasagIdParam = searchParams.get('tarsasag_id');
                    const projektNevParam = searchParams.get('projekt_nev');
                    if (tarsasagIdParam) {
                        setForm(prev => ({
                            ...prev,
                            projekt_id: Number(projektIdParam),
                            tarsasag_id: Number(tarsasagIdParam),
                            projekt_nev: projektNevParam ?? '',
                        }));
                    }
                }
            })
            .finally(() => setProjektekBetolt(false));
    }, []);

    //Módosítás esetén a feladat adatainak betöltése a formba
    useEffect(() => {
        if (!feladat) return;
        setForm({
            cim: feladat.cim ?? '',
            projekt_nev: feladat.projekt_nev ?? 0,
            leiras: feladat.leiras ?? '',
            hatarido: formatInputDate(feladat.hatarido),
            allapot: feladat.allapot ?? '',
        })
    }, [feladat])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    }

    const handleProjektChange = (e) => {
        const kivalasztott = projektek.find(p => p.id === Number(e.target.value));
        setForm(prev => ({
            ...prev,
            projekt_id: kivalasztott?.id ?? '',
            tarsasag_id: kivalasztott?.tarsasag_id ?? '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setHiba('');
        setSiker(false);

        if (!form.cim.trim()) {
            setHiba('A címet meg kell adni');
            return;
        }

        setModosit(true);
        try {
            const kuldendoAdatok = {
                ...form
            };

            if (isEdit) {
                await updateTask(feladat.id, kuldendoAdatok);
                setSiker(true);
                setTimeout(() => navigate(`/feladatok/${feladat.id}`), 1200);
            } else {
                await createTask(kuldendoAdatok);
                setSiker(true);
                setTimeout(() => navigate('/feladatok'), 1200);
            }
        } catch (error) {
            setHiba(error.response?.data?.uzenet ?? 'Hiba történt a művelet során.')
        } finally {
            setModosit(false);
        }
    }

    if (isLoading) return (
        <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Betöltés...</span>
            </div>
        </div>
    )

    if (isEdit && !feladat) return (
        <div className={styles.card}>
            <div className={styles.header}>Feladat módosítása</div>
            <div className={styles.cardRow}>
                <span className={styles.cardLabel}>A feladat nem található.</span>
            </div>
        </div>
    )

    return (
        <div>
            <form onSubmit={handleSubmit} noValidate>
                <div className={styles.card}>
                    <div className={styles.header}>
                        {isEdit ? 'Feladat módosítása' : 'Új feladat'}
                        <i className={`bi ${isEdit ? 'bi-pencil-fill' : 'bi-plus-lg'} me-2`}></i>
                    </div>

                    {/* Visszajelzések */}
                    {hiba && (
                        <div className="alert alert-danger py-2 px-3 mx-3 mt-3 mb-0" role="alert">
                            <small><i className="bi bi-exclamation-triangle-fill me-2"></i>{hiba}</small>
                        </div>
                    )}
                    {siker && (
                        <div className="alert alert-success py-2 px-3 mx-3 mt-3 mb-0" role="alert">
                            <small><i className="bi bi-check-circle-fill me-2"></i>
                                {isEdit ? 'Feladat sikeresen mentve!' : 'Feladat sikeresen létrehozva!'} Átirányítás...
                            </small>
                        </div>
                    )}

                    {/* Cím */}
                    <div className={editStyles.formRow}>
                        <label className={editStyles.formLabel} htmlFor="cim">
                            Cím <span className={editStyles.required}>*</span>
                        </label>
                        <input
                            id="cim"
                            name="cim"
                            type="text"
                            className={editStyles.formInput}
                            value={form.cim}
                            onChange={handleChange}
                            placeholder="Feladat megnevezése"
                            maxLength={255}
                            required
                        />
                    </div>

                    {/* Leírás */}
                    <div className={editStyles.formRow}>
                        <label className={editStyles.formLabel} htmlFor="leiras">
                            Leírás
                        </label>
                        <textarea
                            id="leiras"
                            name="leiras"
                            className={editStyles.formTextarea}
                            value={form.leiras}
                            onChange={handleChange}
                            placeholder="Feladat részletes leírása..."
                            rows={4}
                        />
                    </div>

                    {/* Projekt */}
                    {!isEdit && (
                        <div className={editStyles.formRow}>
                            <label className={editStyles.formLabel} htmlFor="projekt_id">
                                Projekt <span className={editStyles.required}>*</span>
                            </label>
                            <div className={editStyles.selectWrapper}>
                                {projektetBetolt ? (
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                    <>
                                        <select
                                            id="projekt_id"
                                            name="projekt_id"
                                            className={editStyles.formSelect}
                                            value={form.projekt_id}
                                            onChange={handleProjektChange}
                                            required
                                        >
                                            <option value="">— Válassz projektet —</option>
                                            {form.projekt_id && !projektek.find(p => p.id === Number(form.projekt_id)) && (
                                                <option value={form.projekt_id} disabled>
                                                    {form.projekt_nev || `Projekt #${form.projekt_id}`}
                                                </option>
                                            )}

                                            {projektek.map(p => (
                                                <option key={p.id} value={p.id}>{p.cim}</option>
                                            ))}
                                        </select>
                                        <i className="bi bi-chevron-down"></i>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Határidő */}
                    <div className={editStyles.formRow}>
                        <label className={editStyles.formLabel} htmlFor="hatarido">
                            Határidő
                        </label>
                        <input
                            id="hatarido"
                            name="hatarido"
                            type="date"
                            className={editStyles.formInput}
                            value={form.hatarido}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Állapot */}
                    {isEdit && (
                        <div className={editStyles.formRow}>
                            <label className={editStyles.formLabel} htmlFor="allapot">
                                Állapot
                            </label>
                            <div className={editStyles.selectWrapper}>
                                <select
                                    id="allapot"
                                    name="allapot"
                                    className={editStyles.formSelect}
                                    value={form.allapot}
                                    onChange={handleChange}
                                >
                                    {ALLAPOTOK.map(a => (
                                        <option key={a.value} value={a.value}>{a.label}</option>
                                    ))}
                                </select>
                                <i className="bi bi-chevron-down"></i>
                            </div>
                        </div>
                    )}

                    {/* Gombok */}
                    <div className={editStyles.formActions}>
                        <button
                            type="button"
                            className={editStyles.backButton}
                            onClick={() => navigate(isEdit ? `/feladatok/${feladat.id}` : -1)}
                        >
                            Mégse
                        </button>
                        <button
                            type="submit"
                            className={editStyles.submitButton}
                            disabled={modosit || siker}
                        >
                            {modosit ? (
                                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Mentés...</>
                            ) : (
                                <>{isEdit ? 'Módosítás' : 'Mentés'}</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}