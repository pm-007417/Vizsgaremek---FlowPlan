import { Task } from "../../models/Task";
import { useNavigate } from "react-router";
import styles from './taskTable.module.css';
import { allapotCimke } from "../../utils/status";
import { useSort } from "../../utils/useSort";

/** 
 * @param {Object} props
 * @param {Task[]} props.feladatok Feladatok tömb
 */

export default function TaskTable({ feladatok }) {
    const navigate = useNavigate();
    const { rendezettAdatok, rendezesOszlop, rendezesIrany, sorrendKezeles, mobilSorrendKezeles } = useSort(feladatok);

    const rendezesFejlec = (label, oszlop) => (
        <th onClick={() => sorrendKezeles(oszlop)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
            {label}{' '}
            {rendezesOszlop === oszlop ? rendezesIrany === 'asc' ? '▲' : '▼' : '⇅'}
        </th>
    );

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.mobilRendezes}>
                <div className={styles.selectWrapper}>
                    <select
                        onChange={(e) => mobilSorrendKezeles(e.target.value)}
                        defaultValue=""
                    >
                        <option value="" disabled>Rendezés</option>
                        <option value="id_asc">ID ▲</option>
                        <option value="id_desc">ID ▼</option>
                        <option value="cim_asc">Cím A-Z</option>
                        <option value="cim_desc">Cím Z-A</option>
                        <option value="hatarido_asc">Határidő ▲</option>
                        <option value="hatarido_desc">Határidő ▼</option>
                        <option value="allapot_asc">Státusz A-Z</option>
                        <option value="allapot_desc">Státusz Z-A</option>
                        <option value="projekt_cim_asc">Projekt A-Z</option>
                        <option value="projekt_cim_desc">Projekt Z-A</option>
                        <option value="tarsasag_nev_asc">Társaság A-Z</option>
                        <option value="tarsasag_nev_desc">Társaság Z-A</option>
                    </select>
                    <i className="bi bi-chevron-down"></i>
                </div>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr className={styles.header}>
                        {rendezesFejlec('ID', 'id')}
                        {rendezesFejlec('Cím', 'cim')}
                        {rendezesFejlec('Határidő', 'hatarido')}
                        {rendezesFejlec('Státusz', 'allapot')}
                        {rendezesFejlec('Projekt', 'projekt_cim')}
                        {rendezesFejlec('Társaság', 'tarsasag_nev')}
                    </tr>
                </thead>
                <tbody>
                    {rendezettAdatok.map((feladat) => (
                        <tr key={feladat.id} className={styles.row} onClick={() => navigate(`/feladatok/${feladat.id}`)}>
                            <td data-label="ID">{feladat.id}</td>
                            <td data-label="Cím">{feladat.cim}</td>
                            <td data-label="Határidő">{feladat.hatarido}</td>
                            <td data-label="Státusz">{allapotCimke(feladat.allapot)}</td>
                            <td data-label="Projekt">{feladat.projekt_cim}</td>
                            <td data-label="Társaság">{feladat.tarsasag_nev}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}