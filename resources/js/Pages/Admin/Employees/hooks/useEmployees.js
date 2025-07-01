import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

// Get combined employee, branch, and department data
export function useEmployeesData() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

    return useQuery(["employeesData"], async () => {
        const [empRes, depRes, brRes] = await Promise.all([
            axiosInstance.get("/employee/getEmployees", { headers }),
            axiosInstance.get("/settings/getDepartments", { headers }),
            axiosInstance.get("/settings/getBranches", { headers }),
        ]);

        return {
            employees: empRes.data.employees,
            departments: depRes.data.departments,
            branches: brRes.data.branches,
        };
    });
}

// Reusable filtered employees hook
export function useFilteredEmployees(employees, searchName, branchFilter, departmentFilter) {
    return useMemo(() => {
        return employees.filter((employee) => {
            const fullName = `${employee.first_name} ${employee.middle_name || ""} ${employee.last_name} ${employee.suffix || ""}`.toLowerCase();
            const nameMatch = fullName.includes(searchName.toLowerCase());
            const branchMatch = branchFilter === "" || employee.branch === branchFilter;
            const departmentMatch = departmentFilter === "" || employee.department === departmentFilter;
            return nameMatch && branchMatch && departmentMatch;
        });
    }, [employees, searchName, branchFilter, departmentFilter]);
}

// Optional: Basic getEmployees if needed elsewhere
export async function getEmployeesOnly() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];
    const { data } = await axiosInstance.get(`/employee/getEmployees`, { headers });
    return data;
}

export function useEmployeesOnly() {
    return useQuery(["employeesOnly"], getEmployeesOnly);
}
