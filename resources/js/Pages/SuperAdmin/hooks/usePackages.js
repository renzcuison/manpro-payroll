import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

async function getPackages() {
    try {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
        const { data } = await axiosInstance.get("/super-admin/packages", {
            headers,
        });

        return data;
    } catch (error) {
        console.error(error);
    }
}
export function usePackages() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

    const {
        data: packages,
        isFetched,
        isFetching,
        refetch,
    } = useQuery(["packages"], () => getPackages());

    async function store(packageData) {
        const response = await axiosInstance.post(
            "/super-admin/packages",
            packageData,
            {
                headers,
            }
        );
        return response.data;
    }

    async function update(formData, id) {
        const response = await axiosInstance.post(
            `/super-admin/packages/${id}`,
            formData,
            {
                headers,
            }
        );
        return response.data;
    }

    async function assignFeature(packageID, featureID) {
        const response = await axiosInstance.post(
            `/super-admin/packages/${packageID}/assignFeature`,
            {
                feature_id: featureID,
            },
            {
                headers,
            }
        );
        return response.data;
    }

    return {
        packages,
        isFetched,
        isFetching,
        refetch,
        store,
        update,
        assignFeature,
    };
}
