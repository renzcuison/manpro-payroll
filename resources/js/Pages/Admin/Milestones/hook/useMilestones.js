import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

export function useMilestones() {
    const { data, isLoading, isFetched, isFetching, refetch, isError } =
        useQuery(["milestones"], async () => {
            const storedUser = localStorage.getItem("nasya_user");
            const headers = storedUser
                ? getJWTHeader(JSON.parse(storedUser))
                : {};
            const { data } = await axiosInstance.get("/admin/milestones/", {
                headers,
            });
            return data;
        });

    return { data, isLoading, isFetching, isFetched, refetch, isError };
}
