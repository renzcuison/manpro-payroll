import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader }  from "../utils/axiosConfig";
const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

export function useIncentives(userName = null){
    const incentives = useQuery(["incentives"], async () => {
        const { data } = await axiosInstance.get("compensation/getIncentives", {
            headers,
        });
        return data;
    }); 
    
    const employeesIncentives = useQuery(["employeesIncentives"], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesIncentives", {
            headers,
        });
        return data;
    });

    const employeeIncentives = useQuery(["employeeIncentives", userName], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeIncentives", {
            headers, params: {username: userName},
        });
        return data;
    },{
        enabled: !!userName,
    });

    const saveEmployeeIncentives = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/saveEmployeeIncentives', data, { headers });
        return response.data;
    });

    const updateEmployeeIncentive = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/updateEmployeeIncentive', data, { headers });
        return response.data;
    });

    return{
        incentives,
        employeesIncentives,
        employeeIncentives,
        saveEmployeeIncentives,
        updateEmployeeIncentive,
    }
}

