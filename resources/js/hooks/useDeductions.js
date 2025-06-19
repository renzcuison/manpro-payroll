import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
import Swal from "sweetalert2";

const buildParams = (filters = {}, pagination = {}) => {
    const {name, branchId, departmentId, allowanceId} = filters;
    const {page = 1, perPage = 10} = pagination;
    const params = {};
    
    if (name) params.name = name;
    if (branchId) params.branch_id = branchId;
    if (departmentId) params.department_id = departmentId;
    if (allowanceId) params.allowance_id = allowanceId;
    if (page) params.page = page;
    if (perPage) params.per_page = perPage;
    return params;
}

export function useDeduction(enabled = true){
    const query = useQuery(["deductions"], async () => {
        const { data } = await axiosInstance.get("compensation/getDeductions", {
            headers,
        });
        return data;
    }, {enabled});
    return {
        deductionsData: query.data,
        isDeductionsLoading: query.isLoading,
        isDeductionsError: query.isError,
        refetchDeductions: query.refetch,
    }
}

export function useEmployeesDeductions(filters = {}, pagination = {}, enabled = true){
    const params = buildParams(filters, pagination);
    const query = useQuery(["employeesDeductions", {filters, pagination}], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesDeductions", {
            headers, params,
        });
        return data;
    }, {enabled});

    return {
        employeesDeductions: query.data,
        isEmployeesDeductionsLoading: query.isLoading,
        isEmployeesDeductionsError: query.isError,
        refetchEmployeesDeductions: query.refetch,
    }
}

export function useEmployeeDeductions(userName, deductionId = null){
    const query = useQuery(["employeeDeductions", userName, deductionId], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeDeductions", {
            headers, params: {username: userName, deduction_id: deductionId},
        });
        return data;
    },{
        enabled: !!userName,
    });
    return{
        employeeDeductions: query.data,
        isEmployeeDeductionsLoading: query.isLoading,
        isEmployeDeductionsError: query.isError,
        refetchEmployeeDeductions: query.refetch,
    }
}

export function useSaveDeductions() {
    return useMutation(
        async ({ data }) => {
            return await axiosInstance.post('/compensation/saveDeductions', data, { headers });
        },
        {
            onSuccess: (response, variables) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Deduction Saved successfully!",
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
                    text: "Error saving deduction!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            }
        }
    );
}

export function useUpdateDeduction(){
    const queryClient = useQueryClient();
    return useMutation(
        async ({ data }) => {
            return await axiosInstance.post('/compensation/updateDeductions', data, { headers });
        },
        {
            onSuccess: (response, variables) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Deduction updated successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        if (variables?.onSuccessCallback) {
                            queryClient.invalidateQueries({queryKey: ['employeesDeductions']});
                            queryClient.invalidateQueries({queryKey: ['employeeDeductions']});
                            variables.onSuccessCallback();
                        }
                    });
                }
            },
            onError: (error) => {
                console.error("Error:", error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error saving deduction!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            }
        }
    );
}

export function useSaveEmployeeDeductions(){
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/saveEmployeeDeductions', data, { headers });
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Deduction Saved successfully!",
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
                text: "Error saving deduction!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });
}

export function useUpdateEmployeeDeduction(){
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/updateEmployeeDeduction', data, { headers });
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Deduction updated successfully!",
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
                text: "Error saving deduction!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });
}

