import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

export function useAllowances({userName = null, loadAllowances = false, loadEmployeesAllowances = false, filters = {}, pagination = {}} = {}){

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

    const saveEmployeeAllowances = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/saveEmployeeAllowance', data, { headers });
        return response.data;
    });

    const updateEmployeeAllowance = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/updateEmployeeAllowance', data, { headers });
        return response.data;
    });

    return{
        allowances,
        employeesAllowances,
        employeeAllowances,
        saveEmployeeAllowances,
        updateEmployeeAllowance,
    }
}
