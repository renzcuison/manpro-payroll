import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

export function useDeductions({userName = null, loadDeductions = false, loadEmployeesDeductions = false} = {}){
    const employeesDeductions = useQuery(["employeesDeductions"], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesDeductions", {
            headers,
        });
        return data;
    }, {enabled: loadEmployeesDeductions});

    const deductions = useQuery(["deductions"], async () => {
        const { data } = await axiosInstance.get("compensation/getDeductions", {
            headers,
        });
        return data;
    }, {enabled: loadDeductions});

    const employeeDeductions = useQuery(["employeeDeductions", userName], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeDeductions", {
            headers, params: {username: userName},
        });
        return data;
    },{
        enabled: !!userName,
    });

    const saveEmployeeDeductions = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/saveEmployeeDeductions', data, { headers });
        return response.data;
    });

    const updateEmployeeDeduction = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/updateEmployeeDeduction', data, { headers });
        return response.data;
    });

    return{
        employeesDeductions,
        deductions,
        employeeDeductions,
        saveEmployeeDeductions,
        updateEmployeeDeduction,
    }
}
