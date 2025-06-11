import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";


const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
//all employees
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
//for one specific employee
export function useEmployeeAllowances(userName){
    return useQuery(["employeeAllowance", userName], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeAllowance", {
            headers, params: {username: userName},
        });
        return data;
    });
}

export function useSaveEmployeeAllowance() {
    return useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/saveEmployeeAllowance', data, { headers });
        return response.data;
    });
}

export function useUpdateEmployeeAllowance() {
    return useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/updateEmployeeAllowance', data, { headers });
        return response.data;
    });
}
