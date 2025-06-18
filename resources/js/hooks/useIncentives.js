import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader }  from "../utils/axiosConfig";
const storedUser = localStorage.getItem("nasya_user");
const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

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

    const saveEmployeeIncentives = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/saveEmployeeIncentives', data, { headers });
        return response.data;
    });

    const updateEmployeeIncentive = useMutation(async (data) => {
        const response = await axiosInstance.post('/compensation/updateEmployeeIncentive', data, { headers });
        return response.data;
    });

    return{
        incentives,
        employeesIncentives,
        employeeIncentives,
        saveEmployeeIncentives,
        updateEmployeeIncentive,
    }
}

