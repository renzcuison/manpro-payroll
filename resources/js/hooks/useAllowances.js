import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
import Swal from "sweetalert2";

const buildParams = (filters = {}, pagination = {}) => {
    const {name, branchId, departmentId, allowanceId} = filters;
    const {page = 1, per_page = 10} = pagination;
    const params = {};
    
    if (name) params.name = name;
    if (branchId) params.branch_id = branchId;
    if (departmentId) params.department_id = departmentId;
    if (allowanceId) params.allowance_id = allowanceId;
    if (page) params.page = page;
    if (per_page) params.per_page = per_page;
    return params;
}

export function useAllowance(enabled = true){
    const query = useQuery(["allowances"], async () => {
        const {data} = await axiosInstance.get('/compensation/getAllowances', { 
            headers,
        });
        return data;
    }, {enabled});

    return{
        allowancesData: query.data,
        isAllowancesLoading: query.isLoading,
        isAllowancesError: query.isError,
        refetchAllowances: query.refetch,
    }
}

export function useEmployeesAllowances(filters = {}, pagination = {}, enabled = true) {
    const params = buildParams(filters, pagination);
    const query =  useQuery(["employeesAllowances", {filters, pagination}], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesAllowance", {
            headers, params,
        });
        return data;
    }, {enabled});

    return {
        employeesAllowances: query.data,
        isEmployeesAllowancesLoading: query.isLoading,
        isEmployeesAllowancesError: query.isError,
        refetchEmployeesAllowances: query.refetch,
    }
}

export function useEmployeeAllowances(userName, allowanceId = null){
    const query = useQuery(["employeeAllowance", userName, allowanceId], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeAllowance", {
            headers, params: {username: userName, allowance_id: allowanceId},
        });
        return data;
    }, {enabled: !!userName,});

    return {
        employeeAllowances: query.data,
        isEmployeeAllowancesLoading: query.isLoading,
        isEmployeeAllowancesError: query.isError,
        refetchEmployeeAllowances: query.refetch,
    }
}

export function useSaveAllowance(){
    return useMutation(
        async ({ data }) => {
            return await axiosInstance.post('/compensation/saveAllowance', data, { headers });
        },
        {
            onSuccess: (response, variables) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Allowance Saved successfully!",
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

export function useUpdateAllowance() {
    const queryClient = useQueryClient();
    return useMutation(
        async ({ data }) => {
            return await axiosInstance.post('/compensation/updateAllowance', data, { headers });
        },
        {
            onSuccess: (response, variables) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Allowance updated successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        if (variables?.onSuccessCallback) {
                            queryClient.invalidateQueries({queryKey: ['employeesAllowances']});
                            queryClient.invalidateQueries({queryKey: ['employeeAllowance']});
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

export function useSaveEmployeeAllowances () {
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/saveEmployeeAllowance', data, { headers });
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Allowance Saved successfully!",
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
    }); 
}

export function useUpdateEmployeeAllowance () {
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/updateEmployeeAllowance', data, { headers });
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Allowance updated successfully!",
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
    });
}
