import dayjs from "dayjs";

export function useCSVExport() {
    const exportEmployees = (employees) => {
        if (!employees || employees.length === 0) return;

        const headers = [
            "User Name", "Last Name", "First Name", "Middle Name", "Suffix", "Birthday",
            "Gender", "Address", "Contact Number", "Email", "Salary Type", "Salary Grade",
            "Salary", "Branch", "Department", "Role", "Status", "Type", "Job Title",
            "Work Group", "Date Start"
        ];

        const rows = employees.map(emp => [
            emp.user_name || "",
            emp.last_name || "",
            emp.first_name || "",
            emp.middle_name || "",
            emp.suffix || "",
            dayjs(emp.birth_date).format('MM/DD/YYYY') || "",
            emp.gender || "",
            emp.address || "",
            emp.contact_number ? `'${emp.contact_number}` : "",
            emp.email || "",
            emp.salary_type || "",
            emp.salary_grade || "",
            emp.salary || "",
            emp.branch || "",
            emp.department || "",
            emp.role || "",
            emp.employment_status || "",
            emp.employment_type || "",
            emp.jobTitle || "",
            emp.work_group || "",
            dayjs(emp.date_start).format('MM/DD/YYYY') || "",
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row =>
                row.map(field => `"${(field + "").replace(/"/g, '""')}"`).join(",")
            )
        ].join("\r\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "employees.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return { exportEmployees };
}
