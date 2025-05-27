import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

async function getUsers() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
    const { data } = await axiosInstance.get("/super-admin/users", {
        headers,
    });

    return data;
}
export const useUsers = () => {
    return useQuery(["users"], () => getUsers());
};
