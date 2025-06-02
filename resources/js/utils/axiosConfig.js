import axios from "axios";

// LOCAL MANPRO
const baseURL = "http://localhost:8000/api";

console.log("Base URL: " + baseURL);

const axiosInstance = axios.create({ baseURL });

export function getJWTHeader(user) {
    return {
        Authorization: `Bearer ${user.token}`,
    };
}

export default axiosInstance;
