import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

export function useDepartments(departmentId = null){
    const departments = useQuery(["departments"], async () => {
        const {data} = await axiosInstance.get("settings/getDepartments", {
            headers,
        });
        return data;
    });

    return{
        departments
    }

}