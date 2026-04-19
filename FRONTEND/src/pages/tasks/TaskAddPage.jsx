import { BackButton } from "../../components/common/BackButton";
import { PageHeader } from "../../components/common/PageHeader";
import { TaskForm } from "../../components/task/TaskForm";

export function TaskAddPage() {
    return (
        <div>
            <PageHeader title="Feladatok" />
            <TaskForm mode="create" />
            <BackButton />
        </div>
    );
}