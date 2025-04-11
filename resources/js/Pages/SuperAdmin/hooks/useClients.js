import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

export function useClients() {
    return useQuery(["clients"], async () => {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

        const { data } = await axiosInstance.get("/super-admin/features", {
            headers,
        });

        return data;
    });
}
