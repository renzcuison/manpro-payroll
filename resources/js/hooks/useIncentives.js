import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader }  from "../utils/axiosConfig";
const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
import Swal from "sweetalert2";

export function useIncentives({userName = null, loadIncentives = false, loadEmployeesIncentives = false, filters = {}, pagination = {}} ={}){
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

