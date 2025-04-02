import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

async function getDocuments() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};
    const { data } = await axiosInstance.get("/admin/documents/", {
        headers,
    });
    return data;
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
