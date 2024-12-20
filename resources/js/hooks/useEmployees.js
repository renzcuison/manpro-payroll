import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

export async function getEmployees() {
    try {
        const storedUser = await AsyncStorage.getItem("nasya_user");
        const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};
        const { data } = await axiosInstance.get(`/employees`, {
            headers,
            "Content-Type": "application/json;charset=utf-8",
        });
        return data;
    } catch (err) {
        console.log(err);
    }
}

export function useEmployees() {
    return useQuery(["employees"], () => getEmployees());
}
