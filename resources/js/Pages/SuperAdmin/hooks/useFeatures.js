import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

export function useFeatures() {
    return useQuery(["features"], async () => {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

        const { data } = await axiosInstance.get("/super-admin/features", {
            headers,
        });

        return data;
    });
}

export function useFeature(id) {
    return useQuery(["feature", id], async () => {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
        const { data } = await axiosInstance.get(
            `/super-admin/features/${id}`,
            {
                headers,
            }
        );
        return data;
    });
}
