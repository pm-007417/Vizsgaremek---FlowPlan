import { useState, useEffect } from "react";
import { useProjects } from "../context/ProjectContext";

export function useProject(id) {
    const { getProjectById } = useProjects();
    const [projekt, setProjekt] = useState(null);
    const [betolt, setBetolt] = useState(true);
    const [jogosultsagHiba, setJogosultsagHiba] = useState(false);
    const [nemTalalhato, setNemTalalhato] = useState(false);

    const betoltes = () => {
        if (!id) return;
        setBetolt(true);
        setJogosultsagHiba(false);
        setNemTalalhato(false);

        getProjectById(id)
            .then(data => setProjekt(data))
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

    return { projekt, setProjekt, betolt, jogosultsagHiba, nemTalalhato, frissit: betoltes };
}