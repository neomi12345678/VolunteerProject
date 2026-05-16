import { Paths } from "../routes/paths"
import axios from "../services/axios"

// ← רץ מיד כשהקובץ נטען — לפני כל קומפוננטה!
// מגדיר את הטוקן ב-axios אם קיים ב-localStorage
const token = localStorage.getItem('token')
if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
}

export const setSession = (token: string) => {
    localStorage.setItem('token', token)
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
}

export const getSession = () => {
    return localStorage.getItem('token')
}

export const removeSession = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common.Authorization
    location.href = Paths.login
}