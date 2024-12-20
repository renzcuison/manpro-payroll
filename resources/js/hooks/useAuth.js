import axios from "axios";
import { setStoredUser } from "../user-storage";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import { useUser } from "./useUser";
import { useNavigate } from "react-router-dom";


export function useAuth() {
    const SERVER_ERROR = 'There was an error contacting the server.';
    const { clearUser, updateUser } = useUser();
    const navigate = useNavigate()

    async function authServerCall(urlEndpoint, userDetails) {
        try {
            const { data, } = await axiosInstance({
                url: urlEndpoint,
                method: 'POST',
                data: userDetails,
                headers: { 'Content-Type': 'application/json' },
            });

            if ('user' in data && 'token' in data.user) {
                // update stored user data
                setStoredUser(data.user);
                updateUser(data.user);
            }

            return data;

        } catch (errorResponse) {
            console.log(errorResponse);
            const title =
                axios.isAxiosError(errorResponse) &&
                    errorResponse?.response?.data?.message
                    ? errorResponse?.response?.data?.message
                    : SERVER_ERROR;
            console.log({ errorResponse, title });
        }
    }

    async function login(userDetails) {
        return authServerCall('/login', userDetails);
    }
    async function signup(userDetails) {
        return authServerCall('/signup', userDetails);
    }

    async function logout() {
        try {
            // clear user from stored user data
            const storedUser = localStorage.getItem("nasya_user");
            if (storedUser) {
                const headers = getJWTHeader(JSON.parse(storedUser));
                await axiosInstance.post('/logout', {}, { headers });
            }
            clearUser();
            navigate('/login')
        } catch (err) {
            clearUser();
            navigate('/login')
            console.log(err);
        }
    }

    // Return the user object and auth methods
    return {
        login,
        signup,
        logout
    };
}
