import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
export function useEmployees() {
    return useQuery(["employees"], async () => {
        const { data } = await axiosInstance.get("/employee/getEmployees", {
            headers,
        });

        return data;
    });
}
