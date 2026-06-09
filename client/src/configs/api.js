import axios from 'axios'

const api = axios.create({
        baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
        timeout: 60000,
})

// Attach token from localStorage for every request if available
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                config.headers = config.headers || {}
                if (!config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`
            }
        } catch (err) {
            // ignore (e.g., server-side rendering)
        }
        return config
    },
    (error) => Promise.reject(error)
)

export default api