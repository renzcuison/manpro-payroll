import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clearStoredUser, setStoredUser } from "../user-storage";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

export async function getUser(signal) {
    let user = localStorage.getItem("nasya_user");
    if (!user) {
        // Logout the user
        return null;
    }

    const { data } = await axiosInstance.get("/auth", {
        signal, // abortSignal from React Query
        headers: getJWTHeader(JSON.parse(user)),
    });
    return data.user;
}

export const useUser = () => {
    const queryClient = useQueryClient();
    // call useQuery to update user data from server
    const {
        data: user,
        isLoading,
        isFetching,
        isFetched,
        refetch,
    } = useQuery(["user"], ({ signal }) => getUser(signal), {
        onSuccess: (received) => {
            if (!received) {
                clearStoredUser();
            } else {
                setStoredUser(received);
            }
        },
        onError: (err) => {
            console.log(err);
            clearUser();
        },
    });

    // meant to be called from useAuth
    function updateUser(newUser) {
        // update the user
        queryClient.setQueryData(["user"], newUser);
    }

    // meant to be called from useAuth
    function clearUser() {
        // reset user to null
        queryClient.setQueryData(["user"], null);
        queryClient.clear();
        clearStoredUser();
    }
    return {
        user,
        isLoading,
        isFetching,
        isFetched,
        refetchUser: refetch,
        updateUser,
        clearUser,
    };
};
