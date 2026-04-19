import { useEffect, useRef, useState } from "react";

/**
 * Általános üzenet hook feladathoz és projekthez.
 * @param {string|number} id - Az entitás azonosítója
 * @param {Function} getMessages - Üzenetek lekérő függvény (id) => Promise
 * @param {Function} addMessage - Üzenet küldő függvény (id, tartalom) => Promise
 */
export function useMessages(id, getMessages, addMessage) {
    const [uzenetek, setUzenetek] = useState([]);
    const [uzenetekBetolt, setUzenetekBetolt] = useState(true);
    const [ujUzenet, setUjUzenet] = useState('');
    const [uzenetKuldesBetolt, setUzenetKuldesBetolt] = useState(false);
    const [uzenetHiba, setUzenetHiba] = useState('');
    const [ujUzenetKuldve, setUjUzenetKuldve] = useState(false);
    const uzenetekAljaRef = useRef(null);

    useEffect(() => {
        if (!id) return;
        getMessages(id)
            .then(data => setUzenetek(data))
            .finally(() => setUzenetekBetolt(false));
    }, [id]);

    useEffect(() => {
        if (ujUzenetKuldve && uzenetekAljaRef.current) {
            uzenetekAljaRef.current.scrollIntoView({ behavior: 'smooth' });
            setUjUzenetKuldve(false);
        }
    }, [uzenetek]);

    const handleUzenetKuldes = async () => {
        if (!ujUzenet.trim()) return;
        setUzenetKuldesBetolt(true);
        setUzenetHiba('');
        try {
            await addMessage(id, ujUzenet.trim());
            setUjUzenet('');
            setUjUzenetKuldve(true);
            const data = await getMessages(id);
            setUzenetek(data);
        } catch {
            setUzenetHiba('Hiba történt az üzenet küldése során.');
        } finally {
            setUzenetKuldesBetolt(false);
        }
    };

    const handleUzenetKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUzenetKuldes();
        }
    };

    return {
        uzenetek,
        uzenetekBetolt,
        ujUzenet,
        setUjUzenet,
        uzenetKuldesBetolt,
        uzenetHiba,
        uzenetekAljaRef,
        handleUzenetKuldes,
        handleUzenetKeyDown,
    };
}