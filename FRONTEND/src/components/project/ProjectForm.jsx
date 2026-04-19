import { useNavigate } from "react-router"
import { useProjects } from "../../context/ProjectContext";
import { useEffect, useState } from "react";
import { useCompany } from "../../hooks/useCompany";
import styles from '../../pages/tasks/taskPage.module.css';
import editStyles from "../task/taskForm.module.css";
import { ALLAPOTOK } from "../../utils/status";
import { formatInputDate } from "../../utils/formatInputDate";

/**
 * @param {Object} props
 * @param {Object|null} props.projekt - Meglévő projekt (módosításhoz), null = új projekt
 * @param {'edit'|'create'} props.mode - 'edit' (módosítás) vagy 'create' (új)
 */
export function ProjectForm({ projekt = null, mode = 'edit' }) {
    const navigate = useNavigate();
    const { updateProject, createProject, isLoading } = useProjects();
    const { loadUserCompanies } = useCompany();

    const isEdit = mode === 'edit';

    const [form, setForm] = useState({
        cim: '',
        leiras: '',
        hatarido: '',
        allapot: '',
        tarsasag_id: '',
    })

    const [tarsasagok, setTarsasagok] = useState([]);
    const [tarsasagBetolt, setTarsasagBetolt] = useState(true);
    const [modosit, setModosit] = useState(false);
    const [hiba, setHiba] = useState('');
    const [siker, setSiker] = useState(false);

    //Társaságok betöltés
    useEffect(() => {
        loadUserCompanies()
            .then(data => setTarsasagok(data ?? []))
            .then(data => console.log(data))
            .finally(() => setTarsasagBetolt(false));
    }, []);

    //Módosítás esetén a projekt adatainak betöltése a formba
    useEffect(() => {
        if (!projekt) return;
        setForm({
            cim: projekt.cim ?? '',
            tarsasag_nev: projekt.tarsasag_nev ?? 0,
            leiras: projekt.leiras ?? '',
            hatarido: formatInputDate(projekt.hatarido),
            allapot: projekt.allapot ?? '',
        })
    }, [projekt])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    }

    const handleCompanyChange = (e) => {
        const kivalasztott = tarsasagok.find(t => t.tarsasag_id === Number(e.target.value));
        setForm(prev => ({
            ...prev,
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
                await updateProject(projekt.id, kuldendoAdatok);
                setSiker(true);
                setTimeout(() => navigate(`/projektek/${projekt.id}`), 1200);
            } else {
                await createProject(kuldendoAdatok);
                setSiker(true);
                setTimeout(() => navigate('/projektek'), 1200);
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

    if (isEdit && !projekt) return (
        <div className={styles.card}>
            <div className={styles.header}>Projekt módosítása</div>
            <div className={styles.cardRow}>
                <span className={styles.cardLabel}>A projekt nem található.</span>
            </div>
        </div>
    )

    return (
        <div>
            <form onSubmit={handleSubmit} noValidate>
                <div className={styles.card}>
                    <div className={styles.header}>
                        {isEdit ? 'Projekt módosítása' : 'Új projekt'}
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
                                {isEdit ? 'Projekt sikeresen mentve!' : 'Projekt sikeresen létrehozva!'} Átirányítás...
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
                            placeholder="Projekt megnevezése"
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
                            placeholder="Projekt részletes leírása..."
                            rows={4}
                        />
                    </div>

                    {/* Társaság */}
                    {!isEdit && (
                        <div className={editStyles.formRow}>
                            <label className={editStyles.formLabel} htmlFor="tarsasag_id">
                                Társaság <span className={editStyles.required}>*</span>
                            </label>
                            <div className={editStyles.selectWrapper}>
                                {tarsasagBetolt ? (
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                    <>
                                        <select
                                            id="tarsasag_id"
                                            name="tarsasag_id"
                                            className={editStyles.formSelect}
                                            value={form.tarsasag_id}
                                            onChange={handleCompanyChange}
                                            required
                                        >
                                            <option value="">— Válassz társaságot —</option>
                                            {tarsasagok.map(t => (
                                                <option key={t.tarsasag_id} value={t.tarsasag_id}>{t.tarsasag_nev}</option>
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
                            onClick={() => navigate(isEdit ? `/projektek/${projekt.id}` : '/projektek')}
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

                <div className="mx-3 mt-2 mb-1">
                    <small className="text-muted">
                        A <span className={editStyles.required}>*</span>-gal jelölt mezők kitöltése kötelező.
                    </small>
                </div>

            </form>
        </div>
    )
}