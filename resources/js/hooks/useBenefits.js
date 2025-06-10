import { useQuery, useMutation } from "@tanstack/react-query";
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

export function useEmployeeBenefits(userName){
    return useQuery(["employeeBenefits", userName], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeBenefits", {
            headers, params: {username: userName},
        });
        return data;
    });
}

export function useSaveEmployeeBenefits() {
    return useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/saveEmployeeBenefits', data, { headers });
        return response.data;
    });
}