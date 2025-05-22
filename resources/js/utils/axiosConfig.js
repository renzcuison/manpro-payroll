import axios from "axios";

// LIVE MANPRO - unrbqdtuvg - cknevjydbm
// const baseURL = "https://team.manpromanagement.com/api";

// STAGING MANPRO - anxrqwcazv
const baseURL = "https://phplaravel-719501-5268927.cloudwaysapps.com/api";

// LOCAL MANPRO
<<<<<<< HEAD
// const baseURL = "http://localhost:8000/api";
=======
const baseURL = "http://localhost:8000/api";
>>>>>>> 17abefd1 (Add/Feat Forms and Create Evaluation Form for Performance Evaluation Module)

console.log("Base URL: " + baseURL);

const axiosInstance = axios.create({ baseURL });

export function getJWTHeader(user) {    
    return {
        Authorization: `Bearer ${user.token}`,
    };
}

export default axiosInstance;
