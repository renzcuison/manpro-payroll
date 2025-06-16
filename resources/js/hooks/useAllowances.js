import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";


const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
//all employees

export function useAllowances(userName = null){
    const allowances = useQuery(["allowances"], async () => {
        const {data} = await axiosInstance.get('/compensation/getAllowances', { 
            headers,
        });
        return data;
    });
    
    const employeesAllowances = useQuery(["employeesAllowances"], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesAllowance", {
            headers,
        });
        return data;
    });

    const employeeAllowances = useQuery(["employeeAllowance", userName], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeAllowance", {
            headers, params: {username: userName},
        });
        return data;
    }, {
        enabled: !!userName,
    });

    const saveEmployeeAllowances = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/saveEmployeeAllowance', data, { headers });
        return response.data;
    });

    const updateEmployeeAllowance = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/updateEmployeeAllowance', data, { headers });
        return response.data;
    });

    return{
        allowances,
        employeesAllowances,
        employeeAllowances,
        saveEmployeeAllowances,
        updateEmployeeAllowance,
    }
}
