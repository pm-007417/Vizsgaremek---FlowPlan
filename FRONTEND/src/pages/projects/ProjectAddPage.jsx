import { BackButton } from "../../components/common/BackButton";
import { PageHeader } from "../../components/common/PageHeader";
import { ProjectForm } from "../../components/project/ProjectForm";

export function ProjectAddPage() {
    return (
        <div>
            <PageHeader title="Projektek" />
            <ProjectForm mode="create" />
            <BackButton />
        </div>
    );
}