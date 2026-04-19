import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                isRefreshing = false;
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/bejelentkezes';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post('http://localhost:3000/api/felhasznalok/refresh', {
                    refreshToken
                });

                const newToken = response.data.token;
                localStorage.setItem('token', newToken);
                
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                processQueue(null, newToken);
                isRefreshing = false;

                return api(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                
                alert('A munkamenet lejárt. Kérjük, jelentkezz be újra!');
                window.location.href = '/bejelentkezes';
                
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 403) {
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);