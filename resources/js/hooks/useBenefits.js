import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

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


