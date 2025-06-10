import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

export function useEmployeesAllowances(){
    return useQuery(["employeesAllowances"], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesAllowance", {
            headers,
        });
        return data;
    });
}

export function useAllowances(){
    return useQuery(["allowances"], async () => {
        const {data} = await axiosInstance.get('/compensation/getAllowances', { 
            headers,
        });
        return data;
    });
}
