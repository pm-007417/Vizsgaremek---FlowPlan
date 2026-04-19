import { createContext, useState, useEffect, useRef } from 'react';
import { userApi } from '../api/userApi';
import axios from 'axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const lastActivityTime = useRef(Date.now());

    const getTokenExpirationTime = (token) => {
        if (!token) return null;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            const payload = JSON.parse(jsonPayload);
            return payload.exp ? payload.exp * 1000 : null; // Milliszekundumban
        } catch (error) {
            console.error('Token dekódolási hiba:', error);
            return null;
        }
    };

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            logout();
            return null;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/felhasznalok/refresh', {
                refreshToken
            });

            const newToken = response.data.token;

            setToken(newToken);
            localStorage.setItem('token', newToken);

            return newToken;

        } catch (error) {
            console.error('Token frissítés sikertelen:', error);
            logout();
            return null;
        }
    };

    useEffect(() => {
        const updateActivity = () => {
            lastActivityTime.current = Date.now();
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            window.addEventListener(event, updateActivity);
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateActivity);
            });
        };
    }, []);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        loadUserProfile();

        const checkAndRefreshToken = async () => {
            const expirationTime = getTokenExpirationTime(token);

            if (!expirationTime) {
                return;
            }

            const currentTime = Date.now();
            const timeUntilExpiration = expirationTime - currentTime;
            const timeSinceLastActivity = currentTime - lastActivityTime.current;

            if (timeUntilExpiration < 30 * 1000 && timeSinceLastActivity < 5 * 60 * 1000) {
                await refreshAccessToken();
            } else if (timeUntilExpiration < 0) {
                logout();
                alert('A munkamenet lejárt inaktivitás miatt. Kérjük, jelentkezz be újra!');
            }
        };

        checkAndRefreshToken();

        const interval = setInterval(() => {
            checkAndRefreshToken();
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [token]);

    const loadUserProfile = async () => {
        try {
            const data = await userApi.getProfile();
            setUser(data);
        } catch (error) {
            console.error('Profil betöltési hiba:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, jelszo) => {
        const data = await userApi.login(email, jelszo);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        lastActivityTime.current = Date.now();
        await loadUserProfile();
        return data;
    };

    const register = async (nev, email, jelszo) => {
        return await userApi.register(nev, email, jelszo);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        const currentPath = window.location.pathname;
        if (currentPath !== '/bejelentkezes' && currentPath !== '/regisztracio') {
            window.location.href = '/bejelentkezes';
        }
    };

    const updateUserProfile = async (nev, email) => {
        await userApi.updateProfile(nev, email);
        await loadUserProfile();
    };

    const updatePassword = async (regiJelszo, ujJelszo) => {
        try {
            await userApi.updatePassword(regiJelszo, ujJelszo);
        } catch (err) {
            throw new Error(err.message || 'Jelszó módosítás sikertelen');
        }
    };

    const deleteAccount = async () => {
        try {
            await userApi.deleteAccount();
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        } catch (err) {
            throw new Error(err.message || 'Fiók törlése sikertelen');
        }
    };

    const value = {
        token,
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        updatePassword,
        deleteAccount
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}