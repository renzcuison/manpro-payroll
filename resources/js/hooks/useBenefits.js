import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

export function useEmployeesBenefits(){
    return useQuery(["employeesBenefits"], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesBenefits", {
            headers,
        });
        return data;
    });
}

export function useBenefits(){
    return useQuery(["benefits"], async () => {
        const { data } = await axiosInstance.get("compensation/getBenefits", {
            headers,
        });
        return data;
    });
}