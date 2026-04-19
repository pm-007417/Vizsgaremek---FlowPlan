import { useState, useEffect } from "react";
import { useTasks } from "../context/TaskContext";

export function useTask(id) {
    const { getTaskById } = useTasks();
    const [feladat, setFeladat] = useState(null);
    const [betolt, setBetolt] = useState(true);
    const [jogosultsagHiba, setJogosultsagHiba] = useState(false);
    const [nemTalalhato, setNemTalalhato] = useState(false);

    const betoltes = () => {
        if (!id) return;
        setBetolt(true);
        setJogosultsagHiba(false);
        setNemTalalhato(false);

        getTaskById(id)
            .then(data => setFeladat(data))
            .catch(err => {
                if (err.response?.status === 403) {
                    setJogosultsagHiba(true);
                } else {
                    setNemTalalhato(true);
                }
            })
            .finally(() => setBetolt(false));
    };

    useEffect(() => {
        betoltes();
    }, [id]);

    return { feladat, setFeladat, betolt, jogosultsagHiba, nemTalalhato, frissit: betoltes };
}