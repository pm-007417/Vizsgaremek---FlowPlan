import { useNavigate } from "react-router";
import { allapotCimke } from "../../utils/status";
import { CollapsiblePanel } from "../common/CollapsiblePanel";
import styles from './projectTaskList.module.css';

export function ProjectTaskList({ feladatok }) {
    const navigate = useNavigate();

    const aktiv = feladatok.filter(f => f.allapot !== 'torolve' && f.allapot !== 'archivalt');
    const archivalt = feladatok.filter(f => f.allapot === 'archivalt');
    const torolt = feladatok.filter(f => f.allapot === 'torolve');

    const Tabla = ({ sorok }) => (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Cím</th>
                    <th>Határidő</th>
                    <th>Státusz</th>
                </tr>
            </thead>
            <tbody>
                {sorok.map(f => (
                    <tr key={f.id} onClick={() => navigate(`/feladatok/${f.id}`)}>
                        <td>{f.id}</td>
                        <td>{f.cim}</td>
                        <td>{f.hatarido}</td>
                        <td>{allapotCimke(f.allapot)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className={styles.wrapper}>
            {aktiv.length === 0 && archivalt.length === 0 && torolt.length === 0 ? (
                <p className={styles.empty}>Nincsenek feladatok ehhez a projekthez.</p>
            ) : (
                <>
                    {aktiv.length > 0 && <Tabla sorok={aktiv} />}
                    {archivalt.length > 0 && (
                        <CollapsiblePanel title="Archivált feladatok" count={archivalt.length}>
                            <Tabla sorok={archivalt} />
                        </CollapsiblePanel>
                    )}
                    {torolt.length > 0 && (
                        <CollapsiblePanel title="Törölt feladatok" count={torolt.length}>
                            <Tabla sorok={torolt} />
                        </CollapsiblePanel>
                    )}
                </>
            )}
        </div>
    );
}