import { useParams } from "react-router";
import { TaskForm } from "../../components/task/TaskForm";
import { PageHeader } from "../../components/common/PageHeader";
import { BackButton } from "../../components/common/BackButton";
import { Spinner } from "../../components/common/Spinner";
import {useTask} from "../../utils/useTask";

export function TaskEditPage() {
    const { id } = useParams();
    const { feladat, betolt, jogosultsagHiba } = useTask(id);

    if (betolt) return <Spinner />;
    if (jogosultsagHiba) return <div>Nincs jogosultságod az adott oldal megtekintéséhez</div>;

    return (
        <div>
            <PageHeader title="Feladatok" />
            <TaskForm feladat={feladat} mode="edit" />
            <BackButton />
        </div>
    );
}