import { useQuery } from "@tanstack/react-query";
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