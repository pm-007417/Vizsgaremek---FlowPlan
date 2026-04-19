import { useNavigate } from "react-router";
import styles from '../../components/task/taskForm.module.css';

export function BackButton() {
    const navigate = useNavigate();

    return (
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
            ← vissza
        </button>
    );
}