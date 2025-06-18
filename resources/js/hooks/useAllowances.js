import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
import Swal from "sweetalert2";

export function useAllowances({userName = null, loadAllowances = false, loadEmployeesAllowances = false, filters = {}, pagination = {}} = {}){
    const queryClient = useQueryClient();
    const {name, branchId, departmentId, allowanceId} = filters;
    const {page = 1, perPage = 10} = pagination;
    const params = {};
    
    if (name) params.name = name;
    if (branchId) params.branch_id = branchId;
    if (departmentId) params.department_id = departmentId;
    if (allowanceId) params.allowance_id = allowanceId;
    if (page) params.page = page;
    if (perPage) params.per_page = perPage;

    const allowances = useQuery(["allowances"], async () => {
        const {data} = await axiosInstance.get('/compensation/getAllowances', { 
            headers,
        });
        return data;
    }, {enabled: loadAllowances});
    
    const employeesAllowances = useQuery(["employeesAllowances", {filters, pagination}], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesAllowance", {
            headers, params,
        });
        return data;
    }, {enabled: loadEmployeesAllowances});

    const employeeAllowances = useQuery(["employeeAllowance", userName, filters.allowanceId], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeAllowance", {
            headers, params: {username: userName, allowance_id: allowanceId},
        });
        return data;
    }, {
        enabled: !!userName,
    });

    const saveAllowance = useMutation(
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

    const updateAllowance = useMutation(
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

    const saveEmployeeAllowances = useMutation(async ({data}) => {
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

    const updateEmployeeAllowance = useMutation(async ({data}) => {
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

    return{
        allowances,
        employeesAllowances,
        employeeAllowances,
        saveAllowance,
        updateAllowance,
        saveEmployeeAllowances,
        updateEmployeeAllowance,
    }
}
