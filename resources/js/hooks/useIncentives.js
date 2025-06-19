import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader }  from "../utils/axiosConfig";
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

export function useIncentive(enabled = true){
    const query = useQuery(["incentives"], async () => {
        const { data } = await axiosInstance.get("compensation/getIncentives", {
            headers,
        });
        return data;
    }, {enabled});
    return{
        incentivesData: query.data,
        isIncentivesLoading: query.isLoading,
        isIncentivesError: query.isError,
        refetchIncentives: query.refetch,
    }
}

export function useEmployeesIncentives(filters = {}, pagination = {}, enabled = true) {
    const params = buildParams(filters, pagination);
    const query = useQuery(["employeesIncentives", {filters, pagination}], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesIncentives", {
            headers, params,
        });
        return data;
    }, {enabled});
    return{
        employeesIncentives: query.data,
        isEmployeesIncentivesLoading: query.isLoading,
        isEmployeesIncentivesError: query.isError,
        refetchEmployeesIncentives: query.refetch,
    }
}

export function useEmployeeIncentives (userName, incentiveId = null){
    const query = useQuery(["employeeIncentives", userName, incentiveId], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeIncentives", {
            headers, params: {username: userName, incentive_id: incentiveId},
        });
        return data;
    },{enabled: !!userName,});
    return{
        employeeIncentives: query.data,
        isEmployeeIncentivesLoading: query.isLoading,
        isEmployeeIncentivesError: query.isError,
        refetchEmployeeIncentives: query.refetch,
    }
}

export function useSaveIncentives() {
    return useMutation(
        async ({ data }) => {
            return await axiosInstance.post('/compensation/saveIncentives', data, { headers });
        },
        {
            onSuccess: (response, variables) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Incentive Saved successfully!",
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
                    text: "Error saving incentive!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            }
        }
    );
}

export function useUpdateIncentive(){
    const queryClient = useQueryClient();
    return useMutation(
        async ({ data }) => {
            return await axiosInstance.post('/compensation/updateIncentives', data, { headers });
        },
        {
            onSuccess: (response, variables) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Incentive Updated successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        if (variables?.onSuccessCallback) {
                            queryClient.invalidateQueries({queryKey: ['employeesIncentives']});
                            queryClient.invalidateQueries({queryKey: ['employeeIncentives']});
                            variables.onSuccessCallback();
                        }
                    });
                }
            },
            onError: (error) => {
                console.error("Error:", error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error updating incentive!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            }
        }
    );
}

export function useSaveEmployeeIncentives(){
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/saveEmployeeIncentives', data, { headers });
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Incentive Saved successfully!",
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
                text: "Error saving incentive!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });
}

export function useUpdateEmployeeIncentive(){
    return useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/updateEmployeeIncentive', data, { headers });  
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Incentive Updated successfully!",
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
                text: "Error updating incentives!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });

}

export function useIncentives({userName = null, loadIncentives = false, loadEmployeesIncentives = false, filters = {}, pagination = {}} ={}){
    const queryClient = useQueryClient();
    const {name, branchId, departmentId, incentiveId} = filters;
    const {page = 1, perPage = 10} = pagination;
    const params = {};
    
    if (name) params.name = name;
    if (branchId) params.branch_id = branchId;
    if (departmentId) params.department_id = departmentId;
    if (incentiveId) params.incentive_id = incentiveId;
    if (page) params.page = page;
    if (perPage) params.per_page = perPage;

    const incentives = useQuery(["incentives"], async () => {
        const { data } = await axiosInstance.get("compensation/getIncentives", {
            headers,
        });
        return data;
    }, {enabled: loadIncentives}); 
    
    const employeesIncentives = useQuery(["employeesIncentives", {filters, pagination}], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesIncentives", {
            headers, params,
        });
        return data;
    }, {enabled: loadEmployeesIncentives});

    const employeeIncentives = useQuery(["employeeIncentives", userName, filters.incentiveId], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeIncentives", {
            headers, params: {username: userName, incentive_id: incentiveId},
        });
        return data;
    },{enabled: !!userName,});

    const saveIncentives = useMutation(
        async ({ data }) => {
            return await axiosInstance.post('/compensation/saveIncentives', data, { headers });
        },
        {
            onSuccess: (response, variables) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Incentive Saved successfully!",
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
                    text: "Error saving incentive!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            }
        }
    );

    const updateIncentives = useMutation(
        async ({ data }) => {
            return await axiosInstance.post('/compensation/updateIncentives', data, { headers });
        },
        {
            onSuccess: (response, variables) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Incentive Updated successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        if (variables?.onSuccessCallback) {
                            queryClient.invalidateQueries({queryKey: ['employeesIncentives']});
                            queryClient.invalidateQueries({queryKey: ['employeeIncentives']});
                            variables.onSuccessCallback();
                        }
                    });
                }
            },
            onError: (error) => {
                console.error("Error:", error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error updating incentive!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            }
        }
    );

    const saveEmployeeIncentives = useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/saveEmployeeIncentives', data, { headers });
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Incentive Saved successfully!",
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
                text: "Error saving incentive!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });

    const updateEmployeeIncentive = useMutation(async ({data}) => {
        return await axiosInstance.post('/compensation/updateEmployeeIncentive', data, { headers });  
    },
    {
        onSuccess: (response, variables) => {
            if (response.data.status === 200) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Incentive Updated successfully!",
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
                text: "Error updating incentives!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    });

    return{
        incentives,
        employeesIncentives,
        employeeIncentives,
        saveIncentives,
        updateIncentives,
        saveEmployeeIncentives,
        updateEmployeeIncentive,
    }
}

