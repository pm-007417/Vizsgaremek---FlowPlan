import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { companyApi } from "../../api/companyApi";
import { AddMemberModal } from "./AddMemberModal";
import { ChangeFounderModal } from "./ChangeFounderModal";
import styles from "./CompanyDetailPage.module.css";
import { BackButton } from "../../components/common/BackButton";

export function CompanyDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [members, setMembers] = useState([]);
    const [projects, setProjects] = useState([]); 
    const [projectsLoading, setProjectsLoading] = useState(false); 
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [companyName, setCompanyName] = useState('');
    const [originalCompanyName, setOriginalCompanyName] = useState('');
    const [companyActive, setCompanyActive] = useState(1);
    const [editMode, setEditMode] = useState(false);

    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showChangeFounderModal, setShowChangeFounderModal] = useState(false);

    useEffect(() => {
        loadMembers();
        loadProjects();
    }, [id]);

    const loadMembers = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await companyApi.getCompanyMembers(id);
            setMembers(data.members);
            setCurrentUserId(data.currentUserId);

            if (data.members.length > 0) {
                const name = data.members[0].tarsasag_neve;
                setCompanyName(name);
                setOriginalCompanyName(name);
                setCompanyActive(data.members[0].tarsasag_aktiv);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadProjects = async () => {
        setProjectsLoading(true);
        try {
            const data = await companyApi.getCompanyProjects(id);
            setProjects(data);
        } catch (err) {
            console.error('Projektek betöltési hiba:', err);
        } finally {
            setProjectsLoading(false);
        }
    };

    const handleUpdateName = async () => {
        try {
            await companyApi.updateCompanyName(id, companyName);
            setOriginalCompanyName(companyName);
            setEditMode(false);
            loadMembers();
        } catch (err) {
            alert(err.message);
            setCompanyName(originalCompanyName);
            setEditMode(false);
        }
    };

    const handleRoleChange = async (felhasznaloId, ujSzerepkor) => {
        if (!window.confirm(`Biztosan módosítja a szerepkört: ${ujSzerepkor}?`)) {
            return;
        }

        try {
            await companyApi.updateMemberRole(id, felhasznaloId, ujSzerepkor);
            loadMembers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeactivateMember = async (felhasznaloId, nev) => {
        if (!window.confirm(`Biztosan deaktiválja: ${nev}?`)) {
            return;
        }

        try {
            await companyApi.deactivateMember(id, felhasznaloId);
            loadMembers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleActivateMember = async (felhasznaloId, nev) => {
        if (!window.confirm(`Biztosan aktiválja: ${nev}?`)) {
            return;
        }

        try {
            await companyApi.activateMember(id, felhasznaloId);
            loadMembers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeactivateCompany = async () => {
        if (!window.confirm('Biztosan deaktiválja a társaságot? A tagok nem fognak tudni dolgozni benne.')) {
            return;
        }

        try {
            await companyApi.deactivateCompany(id);
            alert('Társaság sikeresen deaktiválva');
            await loadMembers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleActivateCompany = async () => {
        if (!window.confirm('Biztosan aktiválja a társaságot?')) {
            return;
        }

        try {
            await companyApi.activateCompany(id);
            alert('Társaság sikeresen aktiválva');
            await loadMembers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleChangeFounder = async (uj_alapito_id) => {
        try {
            await companyApi.changeFounder(id, uj_alapito_id);
            setShowChangeFounderModal(false);
            alert('Alapító sikeresen módosítva');
            loadMembers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteCompany = async () => {
        if (!window.confirm('Biztosan törölni szeretné a társaságot? Ez a művelet visszavonhatatlan!')) {
            return;
        }

        try {
            await companyApi.deleteCompany(id);
            alert('Társaság sikeresen törölve');
            navigate('/tarsasagok');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddMember = async (email, szerepkor) => {
        try {
            await companyApi.addMember(id, email, szerepkor);
            setShowAddMemberModal(false);
            loadMembers();
        } catch (err) {
            throw err;
        }
    };

    if (loading) {
        return (
            <div className={styles.spinner}>
                <div className={`spinner-border ${styles.spinnerIcon}`} role="status">
                    <span className="visually-hidden">Betöltés...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className={`alert alert-danger ${styles.errorAlert}`} role="alert">
                    {error}
                </div>
            </div>
        );
    }

    const currentUserMember = members.find(m => m.felhasznalo_id === currentUserId);
    const isAdmin = currentUserMember?.isAdmin() || false;
    const isManager = currentUserMember?.isManager() || false;
    const isFounder = currentUserMember?.isFounder() || false;

    return (
        <div className="container mt-4">
            <div className={`card shadow mb-4 ${styles.headerCard}`}>
                <div className={styles.headerCardHeader}>
                    <div className={styles.headerTop}>
                        <div className={styles.titleContainer}>
                            {editMode ? (
                                <div className={styles.editContainer}>
                                    <input
                                        type="text"
                                        className={`form-control ${styles.titleInput}`}
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                    />
                                    <button
                                        className={styles.editButton}
                                        onClick={handleUpdateName}
                                    >
                                        <i className="bi bi-check-lg"></i>
                                    </button>
                                    <button
                                        className={styles.editButtonOutline}
                                        onClick={() => {
                                            setCompanyName(originalCompanyName);
                                            setEditMode(false);
                                        }}
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </div>
                            ) : (
                                <h4 className={styles.title}>
                                    <i className="bi bi-building me-2"></i>
                                    {companyName}
                                    {isAdmin && (
                                        <button
                                            className={`ms-2 ${styles.editButtonOutline}`}
                                            onClick={() => setEditMode(true)}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                    )}
                                </h4>
                            )}
                        </div>
                        <button
                            className={styles.backButton}
                            onClick={() => navigate('/tarsasagok')}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Vissza a Társaságaimhoz
                        </button>
                    </div>
                </div>
                <div className={styles.headerCardBody}>
                    <div className={styles.statsRow}>
                        <div className={styles.stats}>
                            <p className={styles.statItem}>
                                <strong>Tagok száma:</strong> {members.length}
                            </p>
                            <p className="mb-1">
                                <strong>Aktív tagok:</strong> {members.filter(m => m.isActive()).length}
                            </p>
                        </div>
                        <div className={styles.actionButtons}>
                            {isFounder && (
                                <button
                                    className={`${styles.actionButton} ${styles.changeFounderButton}`}
                                    onClick={() => setShowChangeFounderModal(true)}
                                >
                                    <i className="bi bi-person-badge me-2"></i>
                                    Alapító módosítása
                                </button>
                            )}

                            {isFounder && (
                                companyActive === 1 ? (
                                    <button
                                        className={`${styles.actionButton} ${styles.deactivateButton}`}
                                        onClick={handleDeactivateCompany}
                                    >
                                        <i className="bi bi-pause-circle me-2"></i>
                                        Társaság deaktiválása
                                    </button>
                                ) : (
                                    <button
                                        className={`${styles.actionButton} ${styles.activateButton}`}
                                        onClick={handleActivateCompany}
                                    >
                                        <i className="bi bi-play-circle me-2"></i>
                                        Társaság aktiválása
                                    </button>
                                )
                            )}

                            {isFounder && (
                                <button
                                    className={`${styles.actionButton} ${styles.deleteButton}`}
                                    onClick={handleDeleteCompany}
                                >
                                    <i className="bi bi-trash me-2"></i>
                                    Társaság törlése
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`card shadow ${styles.membersCard}`}>
                <div className={styles.membersCardHeader}>
                    <div className={styles.membersHeaderTop}>
                        <h5 className={styles.membersTitle}>
                            <i className="bi bi-people me-2"></i>
                            Tagok ({members.length})
                        </h5>
                        {isAdmin && (
                            <button
                                className={styles.addMemberButton}
                                onClick={() => setShowAddMemberModal(true)}
                            >
                                <i className="bi bi-person-plus-fill me-2"></i>
                                Tag hozzáadása
                            </button>
                        )}
                    </div>
                </div>
                <div className={styles.membersCardBody}>
                    <div className="table-responsive">
                        <table className={styles.table}>
                            <thead className={styles.tableHead}>
                                <tr>
                                    <th className={styles.th}>Név</th>
                                    <th className={styles.th}>Email</th>
                                    <th className={styles.th}>Szerepkör</th>
                                    <th className={styles.th}>Csatlakozás</th>
                                    <th className={styles.th}>Státusz</th>
                                    <th className={styles.th}>Műveletek</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.felhasznalo_id} className={styles.tr}>
                                        <td className={styles.td}>
                                            {member.felhasznalo_nev}
                                            {member.isFounder() && (
                                                <span className={styles.founderBadge}>
                                                    <i className="bi bi-star-fill"></i> Alapító
                                                </span>
                                            )}
                                        </td>
                                        <td className={styles.td}>{member.email}</td>
                                        <td className={styles.td}>
                                            <select
                                                className={`${styles.roleSelect} ${member.isAdmin() ? styles.roleAdmin :
                                                        member.isManager() ? styles.roleManager :
                                                            styles.roleTag
                                                    }`}
                                                value={member.szerepkor}
                                                onChange={(e) => handleRoleChange(member.felhasznalo_id, e.target.value)}
                                                disabled={
                                                    member.isFounder() ||
                                                    (!isAdmin && !isManager) ||
                                                    (isManager && member.szerepkor !== 'tag')
                                                }
                                            >
                                                <option value="admin" disabled={isManager}>Admin</option>
                                                <option value="manager">Manager</option>
                                                <option value="tag">Tag</option>
                                            </select>
                                        </td>
                                        <td className={styles.td}>
                                            <small className={styles.dateText}>
                                                {member.getFormattedDate()}
                                            </small>
                                        </td>
                                        <td className={styles.td}>
                                            {member.isActive() ? (
                                                <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                                                    Aktív
                                                </span>
                                            ) : (
                                                <span className={`${styles.statusBadge} ${styles.statusInactive}`}>
                                                    Inaktív
                                                </span>
                                            )}
                                        </td>
                                        <td className={`${styles.td} ${styles.actionsCell}`}>
                                            {!member.isFounder() && (
                                                (isAdmin || (isManager && member.szerepkor === 'tag')) && (
                                                    <div className={styles.actionButtonGroup}>
                                                        {member.isActive() ? (
                                                            <button
                                                                className={styles.deactivateMemberButton}
                                                                onClick={() => handleDeactivateMember(member.felhasznalo_id, member.felhasznalo_nev)}
                                                                title="Deaktiválás"
                                                            >
                                                                <i className="bi bi-x-circle"></i>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className={styles.activateMemberButton}
                                                                onClick={() => handleActivateMember(member.felhasznalo_id, member.felhasznalo_nev)}
                                                                title="Aktiválás"
                                                            >
                                                                <i className="bi bi-check-circle"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className={`card shadow mt-4 ${styles.projectsCard}`}>
                <div className={styles.projectsCardHeader}>
                    <div className={styles.projectsHeaderTop}>
                        <h5 className={styles.projectsTitle}>
                            <i className="bi bi-kanban me-2"></i>
                            Projektek ({projects.length})
                        </h5>
                        {(isAdmin || isManager) && (
                            <button
                                className={styles.addProjectButton}
                                onClick={() => navigate(`/projektek/uj_projekt`)}
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                Új projekt
                            </button>
                        )}
                    </div>
                </div>
                <div className={styles.projectsCardBody}>
                    {projectsLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border" style={{ color: 'var(--color-primary)' }} role="status">
                                <span className="visually-hidden">Betöltés...</span>
                            </div>
                        </div>
                    ) : projects.length > 0 ? (
                        <div className="table-responsive">
                            <table className={styles.table}>
                                <thead className={styles.tableHead}>
                                    <tr>
                                        <th className={styles.th}>Név</th>
                                        <th className={styles.th}>Leírás</th>
                                        <th className={styles.th}>Határidő</th>
                                        <th className={styles.th}>Állapot</th>
                                        <th className={styles.th}>Műveletek</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((project) => (
                                        <tr key={project.projekt_id} className={styles.tr} onClick={() => navigate(`/projektek/${project.projekt_id}`)}>
                                            <td className={styles.td}>
                                                <strong>{project.nev}</strong>
                                            </td>
                                            <td className={styles.td}>
                                                {project.leiras ? (
                                                    project.leiras.length > 60
                                                        ? project.leiras.substring(0, 60) + '...'
                                                        : project.leiras
                                                ) : 'Nincs leírás'}
                                            </td>
                                            <td className={styles.td}>
                                                <small className={styles.dateText}>
                                                    {project.hatarido || 'Nincs megadva'}
                                                </small>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={`${styles.statusBadge} ${project.allapot === 'kesz' ? styles.statusDone :
                                                        project.allapot === 'folyamatban' ? styles.statusInProgress :
                                                            project.allapot === 'uj' ? styles.statusNew : 
                                                                project.allapot === 'felfuggesztve' ? styles.statusPaused :
                                                                    project.allapot === 'archivalt' ? styles.statusArchived :  
                                                                        project.allapot === 'torolve' ? styles.statusDeleted : 
                                                                            styles.statusPaused
                                                    }`}>
                                                    {project.allapot === 'kesz' ? 'Kész' :
                                                        project.allapot === 'folyamatban' ? 'Folyamatban' :
                                                            project.allapot === 'uj' ? 'Új' :
                                                                project.allapot === 'felfuggesztve' ? 'Felfüggesztve' :
                                                                    project.allapot === 'archivalt' ? 'Archivált' :
                                                                        project.allapot === 'torolve' ? 'Törölve' :
                                                                            'uj'}
                                                </span>
                                            </td>
                                            <td className={`${styles.td} ${styles.actionsCell}`}>
                                                <button
                                                    className={styles.openProjectButton}
                                                    onClick={() => navigate(`/projektek/${project.projekt_id}`)}
                                                    title="Megnyitás"
                                                >
                                                    <i className="bi bi-box-arrow-up-right me-1"></i>
                                                    Megnyitás
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <i className="bi bi-kanban" style={{ fontSize: '3rem', color: 'var(--color-border)' }}></i>
                            <p>Még nincsenek projektek ebben a társaságban.</p>
                            {(isAdmin || isManager) && (
                                <button
                                    className={styles.addProjectButton}
                                    onClick={() => navigate(`/projektek/uj?tarsasag=${id}`)}
                                >
                                    <i className="bi bi-plus-lg me-2"></i>
                                    Első projekt létrehozása
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <AddMemberModal
                show={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
                onSubmit={handleAddMember}
            />

            <ChangeFounderModal
                show={showChangeFounderModal}
                onClose={() => setShowChangeFounderModal(false)}
                onSubmit={handleChangeFounder}
                members={members.filter(m => !m.isFounder())}
            />
            <BackButton />
        </div>
    );
}