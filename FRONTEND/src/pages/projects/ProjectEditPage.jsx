import { useParams } from "react-router";
import { PageHeader } from "../../components/common/PageHeader";
import { useProjects } from "../../context/ProjectContext";
import { ProjectForm } from "../../components/project/ProjectForm";
import { BackButton } from "../../components/common/BackButton";
import { useProject } from "../../utils/useProject";
import { Spinner } from "../../components/common/Spinner";

export function ProjectEditPage() {
    const { id } = useParams();

    const { projekt, betolt, jogosultsagHiba } = useProject(id);

    if (betolt) return <Spinner />;
    if (jogosultsagHiba) return <div>Nincs jogosultságod az adott oldal megtekintéséhez</div>;

    return (
        <div>
            <PageHeader title="Projektek" />
            <ProjectForm projekt={projekt} mode="edit" />
            <BackButton />
        </div>
    );
}