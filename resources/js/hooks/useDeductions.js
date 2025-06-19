import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";

const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

export function useDeductions({userName = null, loadDeductions = false, loadEmployeesDeductions = false, filters = {}, pagination = {}} = {}){
    
    const {name, branchId, departmentId, deductionId} = filters;
    const {page = 1, perPage = 10} = pagination;
    const params = {};
    
    if (name) params.name = name;
    if (branchId) params.branch_id = branchId;
    if (departmentId) params.department_id = departmentId;
    if (deductionId) params.deduction_id = deductionId;
    if (page) params.page = page;
    if (perPage) params.per_page = perPage;

    const deductions = useQuery(["deductions"], async () => {
        const { data } = await axiosInstance.get("compensation/getDeductions", {
            headers,
        });
        return data;
    }, {enabled: loadDeductions});

    const employeesDeductions = useQuery(["employeesDeductions", {filters, pagination}], async () => {
        const { data } = await axiosInstance.get("compensation/getEmployeesDeductions", {
            headers, params,
        });
        return data;
    }, {enabled: loadEmployeesDeductions});

    const employeeDeductions = useQuery(["employeeDeductions", userName, filters.deductionId], async () => {
        const {data} = await axiosInstance.get("compensation/getEmployeeDeductions", {
            headers, params: {username: userName, deduction_id: deductionId},
        });
        return data;
    },{
        enabled: !!userName,
    });

    const saveEmployeeDeductions = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/saveEmployeeDeductions', data, { headers });
        return response.data;
    });

    const updateEmployeeDeduction = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/updateEmployeeDeduction', data, { headers });
        return response.data;
    });

    return{
        employeesDeductions,
        deductions,
        employeeDeductions,
        saveEmployeeDeductions,
        updateEmployeeDeduction,
    }
}
