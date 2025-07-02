import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

// Get combined employee, branch, and department data
export function useEmployeesData() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

    return useQuery(["employeesData"], async () => {
        const [resEmployees, resDepartments, resBranches] = await Promise.all([
            axiosInstance.get("/employee/getEmployees", { headers }),
            axiosInstance.get("/settings/getDepartments", { headers }),
            axiosInstance.get("/settings/getBranches", { headers }),
        ]);

        return {
            employees: resEmployees.data.employees,
            departments: resDepartments.data.departments,
            branches: resBranches.data.branches,
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


// Get Unverified Employees
export function useUnverifiedEmployees() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : [];

    return useQuery(["employeesData"], async () => {
        const [resEmployees] = await Promise.all([
            axiosInstance.get("/employee/getEmployees", { headers }),
        ]);

        return {
            employees: resEmployees.data.employees,
        };
    });
}