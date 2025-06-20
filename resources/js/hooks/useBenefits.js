import { useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
import Swal from "sweetalert2";

const buildParams = (filters = {}, pagination = {}) => {
    const {name, branch_id, department_id, benefit_id} = filters;
    const {page = 1, per_page = 10} = pagination;
    const params = {};
    
    if (name) params.name = name;
    if (branch_id) params.branch_id = branch_id;
    if (department_id) params.department_id = department_id;
    if (benefit_id) params.allowance_id = benefit_id;
    if (page) params.page = page;
    if (per_page) params.per_page = per_page;
    return params;
}

export function useBenefit(enabled = true){
    const query = useQuery(["benefits"], async () => {
        const { data } = await axiosInstance.get("compensation/getBenefits", {
            headers,
        });
        return data;
    }, {enabled});
    return{
        benefitsData: query.data,
        isBenefitsLoading: query.isLoading,
        isBnefitsError: query.isError,
        refetchBenefits: query.refetch,
    }
}

export function useEmployeesBenefits(filters = {}, pagination = {}, enabled = true) {
    const params = buildParams(filters, pagination);
    const query = useQuery(["employeesBenefits", {filters, pagination}], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesBenefits", {
            headers, params,
        });
        return data;
    }, {enabled});
    return{
        employeesBenefits: query.data,
        isEmployeesBenefitsLoading: query.isLoading,
        isEmployeesBenefitsError: query.isError,
        refetchEmployeesBenefits: query.refetch,
    }
}

export function useEmployeeBenefits(userName, benefitId = null){
    const query = useQuery(["employeeBenefits", userName, benefitId], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeBenefits", {
            headers, params: {username: userName, benefit_id: benefitId},
        });
        return data;
    },{enabled: !!userName,});
    return {
        employeeBenefits: query.data,
        isEmployeeBenefitsLoading: query.isLoading,
        isEmployeeBenefitsError: query.isError,
        refetchEmployeeBenefits: query.refetch,
    }
}

export function useSaveBenefits() {
    const queryClient = useQueryClient();
    return useMutation(
        async ({ data }) => {
            return await axiosInstance.post('/compensation/saveBenefits', data, { headers });
        },
        {
            onSuccess: (response, variables) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Benefits Saved successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        if (variables?.onSuccessCallback) {
                            variables.onSuccessCallback();
                        }
                    });
                }
            },
            onError: (error) => {
                console.error("Error:", error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error saving allowance!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            }
        }
    );
}

export function useUpdateBenefits(){
    const queryClient = useQueryClient();
    return useMutation(
        async ({ data }) => {
            return await axiosInstance.post('/compensation/updateBenefits', data, { headers });
        },
        {
            onSuccess: (response, variables) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Benefits Updated successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        if (variables?.onSuccessCallback) {
                            queryClient.invalidateQueries({queryKey: ['employeesBenefits']});
                            queryClient.invalidateQueries({queryKey: ['employeeBenefits']});
                            variables.onSuccessCallback();
                        }
                    });
                }
            },
            onError: (error) => {
                console.error("Error:", error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error saving benefit!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            }
        }
    );
}

export function useSaveEmployeeBenefits () {
    const queryClient = useQueryClient();
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/saveEmployeeBenefits', data, { headers });
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Benefits Saved successfully!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: 'Proceed',
                    confirmButtonColor: '#177604',
                }).then(() => {
                    if (variables?.onSuccessCallback) {
                        variables.onSuccessCallback();
                    }
                });
            }
        },
        onError: (error) => {
            console.error("Error:", error);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Error saving benefit!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });
}

export function useUpdateEmployeeBenefit (){
    const queryClient = useQueryClient();
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/updateEmployeeBenefit', data, { headers });
    }, 
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Benefit Updated successfully!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: 'Proceed',
                    confirmButtonColor: '#177604',
                }).then(() => {
                    if (variables?.onSuccessCallback) {
                        variables.onSuccessCallback();
                    }
                });
            }
        },
        onError: (error) => {
            console.error("Error:", error);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Error updating benefit!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });
}


