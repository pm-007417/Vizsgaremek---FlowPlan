import { useState } from 'react';
import { companyApi } from '../api/companyApi';

export function useCompany() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadUserCompanies = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await companyApi.getUserCompanies();
            setCompanies(data);
            return data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createCompany = async (nev) => {
        setLoading(true);
        setError(null);
        try {
            const data = await companyApi.createCompany(nev);
            await loadUserCompanies();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteCompany = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await companyApi.deleteCompany(id);
            await loadUserCompanies();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        companies,
        loading,
        error,
        loadUserCompanies,
        createCompany,
        deleteCompany
    };
}