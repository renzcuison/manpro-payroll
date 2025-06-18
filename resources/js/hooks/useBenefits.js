import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
import Swal from "sweetalert2";

export function useBenefits({userName = null, loadEmployeesBenefits = false, loadBenefits = false, filters = {}, pagination = {}} = {}){
    //mostly will be used in the employees benefits list component
    const {name, branchId, departmentId, benefitId} = filters;
    const {page = 1, perPage = 10} = pagination;
    const params = {};
    
    if (name) params.name = name;
    if (branchId) params.branch_id = branchId;
    if (departmentId) params.department_id = departmentId;
    if (benefitId) params.benefit_id = benefitId;
    if (page) params.page = page;
    if (perPage) params.per_page = perPage;
    
    const employeesBenefits = useQuery(["employeesBenefits", {filters, pagination}], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesBenefits", {
            headers, params,
        });
        return data;
    }, {enabled: loadEmployeesBenefits});

    const benefits = useQuery(["benefits"], async () => {
        const { data } = await axiosInstance.get("compensation/getBenefits", {
            headers,
        });
        return data;
    }, {enabled: loadBenefits});

    const employeeBenefits = useQuery(["employeeBenefits", userName, filters.benefitId], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeBenefits", {
            headers, params: {username: userName, benefit_id: benefitId},
        });
        return data;
    },{
        enabled: !!userName,
    });

    const saveBenefits = useMutation(
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

    const updateBenefits = useMutation(
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
        saveBenefits,
        updateBenefits,
        saveEmployeeBenefits,
        updateEmployeeBenefit,
    }
}


