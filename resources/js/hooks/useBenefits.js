import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

export function useBenefits(userName = null){
    const employeesBenefits = useQuery(["employeesBenefits"], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesBenefits", {
            headers,
        });
        return data;
    });

    const benefits = useQuery(["benefits"], async () => {
        const { data } = await axiosInstance.get("compensation/getBenefits", {
            headers,
        });
        return data;
    });

    const employeeBenefits = useQuery(["employeeBenefits", userName], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeBenefits", {
            headers, params: {username: userName},
        });
        return data;
    },{
        enabled: !!userName,
    });

    const saveEmployeeBenefits = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/saveEmployeeBenefits', data, { headers });
        return response.data;
    });

    const updateEmployeeBenefit = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/updateEmployeeBenefit', data, { headers });
        return response.data;
    });

    return{
        employeesBenefits,
        benefits,
        employeeBenefits,
        saveEmployeeBenefits,
        updateEmployeeBenefit,
    }
}

// export function useEmployeesBenefits(){
//     return useQuery(["employeesBenefits"], async () => {
//         const { data } = await axiosInstance.get("compensation/getEmployeesBenefits", {
//             headers,
//         });
//         return data;
//     });
// }

// export function useBenefits(){
//     return useQuery(["benefits"], async () => {
//         const { data } = await axiosInstance.get("compensation/getBenefits", {
//             headers,
//         });
//         return data;
//     });
// }

// export function useEmployeeBenefits(userName){
//     return useQuery(["employeeBenefits", userName], async () => {
//         const {data} = await axiosInstance.get("compensation/getEmployeeBenefits", {
//             headers, params: {username: userName},
//         });
//         return data;
//     });
// }

// export function useSaveEmployeeBenefits() {
//     return useMutation(async (data) => {
//         const response = await axiosInstance.post('/compensation/saveEmployeeBenefits', data, { headers });
//         return response.data;
//     });
// }

// export function useUpdateEmployeeBenefit() {
//     return useMutation(async (data) => {
//         const response = await axiosInstance.post('/compensation/updateEmployeeBenefit', data, { headers });
//         return response.data;
//     });
// }

