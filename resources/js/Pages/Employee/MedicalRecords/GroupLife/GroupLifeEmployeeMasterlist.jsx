import React, { useState, useMemo } from "react";
import {
    Grid,
    Box,
    Typography,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    TablePagination
} from "@mui/material";
import Layout from "../../../../components/Layout/Layout";
import GroupLifeEmployeeTable from "./GroupLifeEmployeeTable";
import { useNavigate } from "react-router-dom";
import useEmployeeGroupLifePlans from '../../../../hooks/useEmployeeGroupLifePlans';

const GroupLifeEmployeeMasterlist = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const storedUser = useMemo(() => {
        const item = localStorage.getItem("nasya_user");
        return item ? JSON.parse(item) : null;
    }, []);
    const token = storedUser?.token;

    // Use the hook!
    const { plans, loading, error } = useEmployeeGroupLifePlans(token);

    // Map plans to the table rows shape
    const rows = useMemo(() =>
        (plans || []).map(row => ({
            planName: row.plan_name,
            dependentsCount: row.dependents_count,
            enrollDate: row.enroll_date,
            branch: row.branch,
            department: row.department,
            role: row.role,
        })), [plans]);

    const filteredRecords = rows.filter(row =>
        [
            row.id,
            row.groupLifeName,
            row.planType,
            row.paymentType,
            row.employerShare,
            row.employeeShare
        ].some(field =>
            (typeof field === "number"
                ? field.toFixed(2)
                : (field ?? "").toString()
            )
            .toLowerCase()
            .includes(search.toLowerCase())
        )
    );

    const resultsCount = filteredRecords.length;

    const paginatedRows = useMemo(() => {
        const startIndex = currentPage * rowsPerPage;
        return filteredRecords.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredRecords, currentPage, rowsPerPage]);

    const handleOnRowClick = (row) => {
        navigate(`/employee/medical-records/group-life-employee-masterlist/view/${row.id}`, { state: row });
    };

    return (
        <Layout title="Group Life Plans">
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1100px" } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>My Group Life Plans</Typography>
                    </Box>
                    <Box>
                        <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px'}}>
                            <FormControl variant="outlined" sx={{ width: 300, mb: 1 }}>
                                <InputLabel htmlFor="custom-search">
                                    Search
                                </InputLabel>
                                <OutlinedInput
                                    id="custom-search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    endAdornment={
                                    search && (
                                        <InputAdornment position="end">
                                            <Typography variant="body2" sx={{ color: "gray" }}>
                                                {resultsCount} {resultsCount === 1 ? "Match" : "Matches"}
                                            </Typography>
                                        </InputAdornment>
                                    )
                                    }
                                    label="Search"
                                />
                            </FormControl>
                        </Box>
                    </Box>
                    <Box sx={{ backgroundColor: "white", borderRadius: 2, padding: 2, mt: 3 }}>
<GroupLifeEmployeeTable
    employees={plans}
    onRowClick={handleOnRowClick}
    search={search}
    loading={loading}
    data={rows}
/>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredRecords.length}
                                rowsPerPage={rowsPerPage}
                                page={currentPage}
                                onPageChange={(event, newPage) => setCurrentPage(newPage)}
                                onRowsPerPageChange={(event) => {
                                    setRowsPerPage(parseInt(event.target.value, 10));
                                    setCurrentPage(0);
                                }}
                                sx={{
                                    ".MuiTablePagination-actions": { mb: 2 },
                                    ".MuiInputBase-root": { mb: 1 },
                                    bgcolor: "#ffffff",
                                    borderRadius: "8px",
                                    width: "fit-content",
                                    mt: 2
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default GroupLifeEmployeeMasterlist;