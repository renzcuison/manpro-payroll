import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader }  from "../utils/axiosConfig";
const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

export function useEmployeesIncentives(){
    return useQuery(["employeesIncentives"], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesIncentives", {
            headers,
        });
        return data;
    });
}

export function useIncentives(){
    return useQuery(["incentives"], async () => {
        const { data } = await axiosInstance.get("compensation/getIncentives", {
            headers,
        });
        return data;
    });
}

export function useEmployeeIncentives(userName){
    return useQuery(["employeeIncentives", userName], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeIncentives", {
            headers, params: {username: userName},
        });
        return data;
    });
}

export function useSaveEmployeeIncentives() {
    return useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/saveEmployeeIncentives', data, { headers });
        return response.data;
    });
}
