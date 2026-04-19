import { Project } from "../../models/Project";
import { useNavigate } from "react-router";
import { useSort } from "../../utils/useSort";
import styles from "../task/taskTable.module.css";
import { allapotCimke } from "../../utils/status";

/** 
 * @param {Object} props
 * @param {Project[]} props.projektek Projektek tömb
 */

export default function ProjectTable({ projektek }) {
    const navigate = useNavigate();
    const { rendezettAdatok, rendezesOszlop, rendezesIrany, sorrendKezeles, mobilSorrendKezeles } = useSort(projektek);

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
                        {rendezesFejlec('Társaság', 'tarsasag_nev')}
                        <th>Műveletek</th>
                    </tr>
                </thead>
                <tbody>
                    {rendezettAdatok.map((projekt) => (
                        <tr key={projekt.id} className={styles.row} onClick={() => navigate(`/projektek/${projekt.id}`)}>
                            <td data-label="ID">{projekt.id}</td>
                            <td data-label="Cím">{projekt.cim}</td>
                            <td data-label="Határidő">{projekt.hatarido}</td>
                            <td data-label="Státusz">{allapotCimke(projekt.allapot)}</td>
                            <td data-label="Társaság">{projekt.tarsasag_nev}</td>
                            <td>
                                <button className={styles.newTaskButton} onClick={(e) => { e.stopPropagation(); navigate(`/feladatok/uj_feladat?projekt_id=${projekt.id}`) }}>
                                    Feladat hozzáadása
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}