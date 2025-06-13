import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

async function getMilestones() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};
    const { data } = await axiosInstance.get("/admin/milestones/", {
        headers,
    });
    return data;
}
async function getMilestone(id) {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};
    const { data } = await axiosInstance.get(`/admin/milestones/${id}`, {
        headers,
    });
    return data;
}

export function useMilestones() {
    return useQuery(["milestones"], () => getMilestones());
}

export function useMileStone(id) {
    const { data, isFetching, isFetched, refetch, isLoading } = useQuery(
        ["milestone", id],
        () => getMilestone(id)
    );

    async function sendGreetings(commentJson) {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};
        const { data } = await axiosInstance.post(
            `/admin/milestones/${id}`,
            commentJson,
            {
                headers,
            }
        );
        return data;
    }

    return { data, isFetching, isFetched, refetch, isLoading, sendGreetings };
}
