import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
    Box,
    Button,
    Typography,
    Grid,
    InputLabel,
    FormControl,
    OutlinedInput,
    InputAdornment,
    TablePagination,
    TextField,
    MenuItem
} from "@mui/material";
import Layout from "../../../../components/Layout/Layout";
import GroupLifeEmployeeTable from "./GroupLifeEmployeeTable";
import GroupLifeAssignEmployee from "./Modal/GroupLifeAssignEmployee";
import GroupLifeEditEmployee from "./Modal/GroupLifeEditEmployee";
import GroupLifeEditPlanModal from "./Modal/GroupLifeEditPlanModal";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

const GroupLifeEmployees = () => {
    const location = useLocation();
    const { id } = useParams();

    const storedPlanDetails = localStorage.getItem("selected_plan_details");
    const planDetails = storedPlanDetails ? JSON.parse(storedPlanDetails) : {};
    const navigator = useNavigate();
    const [search, setSearch] = useState("");
    const [openAssignEmployeeModal, setOpenAssignEmployeeModal] = useState(false);
    const [openEditEmployeeModal, setOpenEditEmployeeModal] = useState(false);
    const storedUser = localStorage.getItem("nasya_user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterByBranch, setFilterByBranch] = useState("");
    const [filterByDepartment, setFilterByDepartment] = useState("");

    const [selectedEmployeePlanId, setSelectedEmployeePlanId] = useState(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);

        axiosInstance
        .get(`/medicalRecords/getGroupLifeEmployees`, {
            headers: { Authorization: `Bearer ${user.token}` },
            params: { plan_id: id }
        })
        .then(res => {
            setEmployees(res.data.employees || []);
        })
        .catch(err => {
            setEmployees([]);
        })
        .finally(() => setLoading(false));
    }, [id]);

    const handleOnBackClick = () => {
        navigator("/admin/medical-records/group-life-masterlist-records");
    };

    const filteredRecords = employees.filter((employee) => {
        const matchesSearch = [
        employee.employee_name,
        employee.dependents_count,
        employee.enroll_date,
        employee.branch,
        employee.department,
        employee.role
        ].some((field) =>
            (typeof field === "number"
                ? field.toFixed(2)
                : (field ?? "").toString()
            )
                .toLowerCase()
                .includes(search.toLowerCase())
        );

        const matchesBranch = filterByBranch
            ? employee.branch?.name === filterByBranch
            : true;

        const matchesDepartment = filterByDepartment
            ? employee.department?.name === filterByDepartment
            : true;

        return matchesSearch && matchesBranch && matchesDepartment;
    });

    const resultsCount = filteredRecords.length;

    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);


    const paginatedRows = useMemo(() => {
        const startIndex = currentPage * rowsPerPage;
        return filteredRecords.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredRecords, currentPage, rowsPerPage]);

    const refreshEmployees = () => {

        setLoading(true);

        axiosInstance
            .get("/medicalRecords/getGroupLifeEmployees", {
                headers: { Authorization: `Bearer ${user.token}` },
                params: { plan_id: id },
            })
            .then(res => {
                const fetched = res.data.employees || [];
                setEmployees(fetched);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const uniqueBranches = [...new Set(employees.map(emp => emp.branch?.name).filter(Boolean))];
    const uniqueDepartments = [...new Set(employees.map(emp => emp.department?.name).filter(Boolean))];



    return (
        <Layout title="GroupLife Masterlist">
            <Box sx={{ mx: 'auto', width: '100%', px: { xs: 1, md: 3 } }}>
                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {planDetails.planType}
                    </Typography>
                    <Grid container spacing={2} gap={2}>
                        <Button
                            style={{ backgroundColor: "#727F91" }}
                            onClick={handleOnBackClick}
                            variant="contained"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={() => setOpenAssignEmployeeModal(true)}
                            variant="contained"
                            style={{ color: "#e8f1e6" }}
                        >
                            Assign
                        </Button>
                    </Grid>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={4} sx={{ width: '100%', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
                        <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px', height: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Group Life Details</Typography>
                            <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'space-around' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
                                    <Grid item xs={6} sm={4}>
                                        <Typography variant="subtitle1" fontWeight="bold">Payment Type:</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={8}>
                                        <Typography variant="body1">
                                            {planDetails.paymentType || 'N/A'}
                                            </Typography>
                                    </Grid>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
                                    <Grid item xs={6} sm={4}>
                                        <Typography variant="subtitle1" fontWeight="bold">Employer Share:</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={8}>
                                        <Typography variant="body1">
                                            {planDetails.employerShare !== undefined ? `₱${planDetails.employerShare.toFixed(2)}` : 'Unassigned'}
                                            </Typography>
                                    </Grid>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
                                    <Grid item xs={6} sm={4}>
                                        <Typography variant="subtitle1" fontWeight="bold">Employee Share:</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={8}>
                                        <Typography variant="body1">
                                            {planDetails.employeeShare !== undefined ? `₱${planDetails.employeeShare.toFixed(2)}` : 'N/A'}
                                            </Typography>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>

                <Grid item md={4} xs={12} sx={{ mt: 3, p: 3, bgcolor: "#fff", borderRadius: "8px", boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'  }}                >
                    <Box sx={{ bgcolor: "#ffffff", borderRadius: "8px" }} >
                    <Grid container sx={{ pb: 2, borderBottom: "1px solid #e0e0e0" }} >
                        <Grid container size={12} spacing={2}>
                            <Grid size={3} mr={45}>
                                <FormControl variant="outlined" sx={{ width: 300, mb: 1 }}>
                                    <InputLabel htmlFor="custom-search">
                                        Search
                                    </InputLabel>
                                    <OutlinedInput
                                        id="custom-search"
                                        size="medium"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        endAdornment={
                                            search && (
                                                <InputAdornment position="end">
                                                    <Typography variant="body2" sx={{ color: "gray" }}>
                                                        {resultsCount} {resultsCount === 1 || resultsCount === 0 ? "Match" : "Matches"}
                                                    </Typography>
                                                </InputAdornment>
                                            )
                                        }
                                        label="Search"
                                    />
                                    </FormControl>
                            </Grid>
                            <Grid size={3}>
                            {/* Branch Filter */}
                                <TextField
                                    select
                                    label="Filter by Branch"
                                    value={filterByBranch}
                                    onChange={(e) => setFilterByBranch(e.target.value)}
                                    sx={{ width: "100%" }}
                                    >
                                    <MenuItem value="">All Branches</MenuItem>
                                    {uniqueBranches.map((branchName) => (
                                        <MenuItem key={branchName} value={branchName}>
                                        {branchName}
                                        </MenuItem>
                                ))}
                                </TextField>
                            </Grid>
                            <Grid size={3}>
                                {/* Department Filter */}
                                <TextField
                                    select
                                    label="Filter by Department"
                                    value={filterByDepartment}
                                    onChange={(e) => setFilterByDepartment(e.target.value)}
                                    sx={{ width: "100%" }}
                                    >
                                    <MenuItem value="">All Departments</MenuItem>
                                    {uniqueDepartments.map((deptName) => (
                                        <MenuItem key={deptName} value={deptName}>
                                        {deptName}
                                    </MenuItem>
                                ))}
                                </TextField>
                            </Grid>
                        </Grid>
                    </Grid>
                    </Box>
                    <Grid>
                        <Box sx={{ pl: 1, pr: 1, bgcolor: '#ffffff', borderRadius: '8px', height: '100%' }}>
                            <GroupLifeEmployeeTable
                                employees={filteredRecords}
                                onRowClick={(row) => {
                                setSelectedEmployeePlanId(row.id);
                                setOpenEditEmployeeModal(true);
                                }}
                                search={search}
                                loading={loading}
                            />
                        </Box>
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
                    </Grid>
                </Grid>

                {openEditEmployeeModal && selectedEmployeePlanId && (
                    <GroupLifeEditEmployee
                        open={openEditEmployeeModal}
                        close={setOpenEditEmployeeModal}
                        employeePlanId={selectedEmployeePlanId}
                        refreshEmployees={refreshEmployees}
                    />
                )}

                {openAssignEmployeeModal && (
                    <GroupLifeAssignEmployee
                        open={openAssignEmployeeModal}
                        close={setOpenAssignEmployeeModal}
                        planId={id}
                        refreshEmployees={refreshEmployees}
                    />
                )}
                
            </Box>
        </Layout>
    );
};


export default GroupLifeEmployees;