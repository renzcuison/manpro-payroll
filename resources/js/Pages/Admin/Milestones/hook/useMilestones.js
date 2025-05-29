import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

async function getMilestones() {
    try {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};
        const { data } = await axiosInstance.get("/admin/milestones/", {
            headers,
        });
        return data;
    } catch (error) {
        console.error(error);
    }
}

export function useMilestones() {
    return useQuery(["milestones"], () => getMilestones());
}
