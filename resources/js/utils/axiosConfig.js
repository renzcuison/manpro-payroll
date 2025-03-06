import axios from "axios";

// LIVE MANPRO - unrbqdtuvg - 2nPGvdYJ6j
// const baseURL = "https://team.manpromanagement.com/api";
// const baseURL = "https://phplaravel-719501-5238307.cloudwaysapps.com/api"

// STAGING MANPRO - hecfbkmxjy - eusM38kvx3
// const baseURL = "https://phplaravel-719501-3975047.cloudwaysapps.com/api";

// LOCAL MANPRO
const baseURL = "http://localhost:8000/api";
// const baseURL = "http://localhost:8080/api";
    
console.log("Base URL: " + baseURL);

const axiosInstance = axios.create({ baseURL });

export function getJWTHeader(user) {
    return {
        Authorization: `Bearer ${user.token}`
    };
}

export default axiosInstance; ``


        