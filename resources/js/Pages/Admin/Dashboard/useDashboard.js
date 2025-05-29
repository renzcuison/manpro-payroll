import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
async function getDashboard() {
    const { data } = await axiosInstance.get("/admin/dashboard", {
        headers,
    });

    return data;
}
export function useDashboard() {
    return useQuery(["dashboard"], () => getDashboard());
}

export function useTodaysAttendance() {
    return useQuery(["attendance_today"], async () => {
        const { data } = await axiosInstance.get(
            "/adminDashboard/getAttendanceToday",
            {
                headers,
            }
        );

        return data;
    });
}
