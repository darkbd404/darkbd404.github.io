// ⚠️ আপনার Render ব্যাকএন্ড URL টি এখানে বসান
const API_URL = 'https://salam-ip-calling-system.onrender.com/api'; 

export const authAPI = {
    async register(name, email, password) {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    },
    async login(email, password) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    }
};
