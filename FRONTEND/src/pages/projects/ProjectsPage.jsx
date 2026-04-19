import { PageHeader } from "../../components/common/PageHeader";
import ProjectTable from "../../components/project/ProjectTable";
import { useProjects } from "../../context/ProjectContext";
import { CollapsiblePanel } from "../../components/common/CollapsiblePanel";
import { useNavigate } from "react-router";
import styles from "../../components/task/taskTable.module.css";
import { BackButton } from "../../components/common/BackButton";

export function ProjectsPage() {
    const { projektek, isLoading } = useProjects();
    const navigate = useNavigate();

    if (isLoading) return <p>Betöltés...</p>;

    const aktiv = projektek.filter(f => f.allapot !== 'torolve' && f.allapot !== 'archivalt');
    const archivalt = projektek.filter(f => f.allapot === 'archivalt');
    const torolt = projektek.filter(f => f.allapot === 'torolve');

    return (
        <div>
            <PageHeader title="Projektek" actionLabel="+ Új projekt" actionPath="/projektek/uj_projekt" />
            <ProjectTable projektek={aktiv} />
            <CollapsiblePanel title="Archivált projektek" count={archivalt.length}>
                <ProjectTable projektek={archivalt} />
            </CollapsiblePanel>
            <CollapsiblePanel title="Törölt projektek" count={torolt.length}>
                <ProjectTable projektek={torolt} />
            </CollapsiblePanel>
            <BackButton />
        </div>
    )
}