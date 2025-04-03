import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

async function getDocuments() {
    try {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};
        const { data } = await axiosInstance.get("/admin/documents/", {
            headers,
        });
        return data;
    } catch (error) {
        if (error.response) {
            console.error("Server responded with error:", error.response.data);
        } else if (error.request) {
            console.error("No response received:", error.request);
        } else {
            console.error("Error setting up request:", error.message);
        }
    }
}
export function useDocuments() {
    const {
        data: documents,
        isLoading,
        isFetching,
    } = useQuery(["documents"], () => getDocuments());

    async function store(newDocJson) {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};
        const { data } = await axiosInstance.post(
            "/admin/documents/store",
            newDocJson,
            {
                headers,
            }
        );

        return data;
    }

    async function deleteDoc(docID) {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};

        const { data } = await axiosInstance.delete(
            `/admin/documents/${docID}`,
            {
                headers,
            }
        );
        return data;
    }

    return { documents, isLoading, isFetching, store, deleteDoc };
}
