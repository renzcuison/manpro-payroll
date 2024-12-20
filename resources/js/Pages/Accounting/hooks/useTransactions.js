import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

async function getTransactions() {
    try {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};
        const { data } = await axiosInstance.get("/accounting/transactions", {
            headers,
        });

        return data;
    } catch (error) {
        console.error(error);
    }
}

export function useTransactions() {
    return useQuery(["transactions"], () => getTransactions());
}
