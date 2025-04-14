import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
export function useClients() {
    const {
        data: clients,
        isLoading,
        refetch,
    } = useQuery(["clients"], async () => {
        const { data } = await axiosInstance.get("/super-admin/clients", {
            headers,
        });

        return data;
    });

    async function storeClient(formData) {
        const { data } = await axiosInstance.post(
            "/super-admin/clients",
            formData,
            {
                headers,
            }
        );
        return data;
    }

    async function updateClient(formData, id) {
        const { data } = await axiosInstance.put(
            `/super-admin/clients/${id}`,
            formData,
            {
                headers,
            }
        );
        return data;
    }

    return {
        clients,
        isLoading,
        refetch,
        storeClient,
        updateClient,
    };
}

export function useClient(id) {
    const {
        data: client,
        isFetched,
        isFetching,
        isLoading,
        refetch,
    } = useQuery(["client", id], async () => {
        const { data } = await axiosInstance.get(`/super-admin/clients/${id}`, {
            headers,
        });
        return data;
    });

    async function updateClient(formData, id) {
        const { data } = await axiosInstance.put(
            `/super-admin/clients/${id}`,
            formData,
            {
                headers,
            }
        );
        return data;
    }

    async function storeCompany(formData) {
        const { data } = await axiosInstance.post(
            "/super-admin/companies",
            formData,
            {
                headers,
            }
        );
        return data;
    }

    return {
        client,
        isFetched,
        isFetching,
        isLoading,
        refetch,
        storeCompany,
        updateClient,
    };
}
