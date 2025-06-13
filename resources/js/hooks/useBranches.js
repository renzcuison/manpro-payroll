import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

export function useBranches(){
    return useQuery(["branches"], async () => {
        const branch = await axiosInstance.get("settings/getBranches", {
            headers,
        });
        return branch.data;
    });
}