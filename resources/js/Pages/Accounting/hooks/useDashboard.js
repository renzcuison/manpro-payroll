import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

async function getDashboard() {
    try {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};
        const { data } = await axiosInstance.get("/accounting/dashboard", {
            headers,
        });
        return data;
    } catch (err) {
        console.log(err);
    }
}

export function useDashboard() {
    return useQuery(["dashboard"], () => getDashboard());
}
