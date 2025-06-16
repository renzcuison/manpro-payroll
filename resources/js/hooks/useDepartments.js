import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

export function useDepartments(departmentId = null){
    const departments = useQuery(["departments"], async () => {
        const {data} = await axiosInstance.get("settings/getDepartments", { headers });
        return data;
    });

    const departmentsWithPositions = useQuery(['departmentsWithPositions'], async () => {
        const {data} = await axiosInstance.get('/settings/getDepartmentWithEmployeePosition', { headers });
        return data;
    });

    const departmentPositions = useQuery(['departmentPositions'], async () => {
        const {data} = await axiosInstance.get('/settings/getDepartmentPositions', { headers });
        return data;
    });

    return{
        departments, departmentPositions, departmentsWithPositions
    }

}