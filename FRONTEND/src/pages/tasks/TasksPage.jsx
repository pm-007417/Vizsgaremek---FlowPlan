import { PageHeader } from "../../components/common/PageHeader";
import TaskTable from "../../components/task/TaskTable";
import { useTasks } from "../../context/TaskContext";
import { CollapsiblePanel } from "../../components/common/CollapsiblePanel";
import { useNavigate } from "react-router";
import styles from '../../components/task/taskTable.module.css';
import { BackButton } from "../../components/common/BackButton";

export function TasksPage() {
    const { feladatok, isLoading } = useTasks();
    const navigate = useNavigate();

    if (isLoading) return <p>Betöltés...</p>;

    const aktiv = feladatok.filter(f => f.allapot !== 'torolve' && f.allapot !== 'archivalt');
    const archivalt = feladatok.filter(f => f.allapot === 'archivalt');
    const torolt = feladatok.filter(f => f.allapot === 'torolve');

    return (
        <div>
            <PageHeader title="Feladatok" actionLabel="+ Új feladat" actionPath="/feladatok/uj_feladat" />
            <TaskTable feladatok={aktiv} />
            <CollapsiblePanel title="Archivált feladatok" count={archivalt.length}>
                <TaskTable feladatok={archivalt} />
            </CollapsiblePanel>
            <CollapsiblePanel title="Törölt feladatok" count={torolt.length}>
                <TaskTable feladatok={torolt} />
            </CollapsiblePanel>
            <BackButton />
        </div>
    )
}