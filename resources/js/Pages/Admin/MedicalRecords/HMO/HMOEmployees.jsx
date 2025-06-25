import React, { useState, useMemo, useEffect, useRef } from "react";
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
import HMOEmployeeTable from "./HMOEmployeeTable";
import HMOAssignEmployee from "./Modal/HMOAssignEmployee";
import HMOEditEmployee from "./Modal/HMOEditEmployee";
import HMOEditPlanModal from "./Modal/HMOEditPlanModal";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import Swal from 'sweetalert2';

const HMOEmployees = () => {
    const location = useLocation(); // CHECK


    const { id } = useParams();
    const [plan, setPlan] = useState(null); // CHECK
    const hasError = useRef(false); 

    const justDeleted = location.state?.justDeleted || false;


    const storedPlanDetails = localStorage.getItem("selected_plan_details");
    const planDetails = storedPlanDetails ? JSON.parse(storedPlanDetails) : {};
    const navigator = useNavigate();
    const [search, setSearch] = useState("");
    const [openAssignEmployeeModal, setOpenAssignEmployeeModal] = useState(false);
    const [openEditEmployeeModal, setOpenEditEmployeeModal] = useState(false);
    const storedUser = localStorage.getItem("nasya_user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const [employees, setEmployees] = useState([]);    // CHECK
    const [loading, setLoading] = useState(true); // CHECK
    const [filterByBranch, setFilterByBranch] = useState("");
    const [filterByDepartment, setFilterByDepartment] = useState("");
    const [openEditModal, setOpenEditModal] = useState(false);

    const [selectedEmployeePlanId, setSelectedEmployeePlanId] = useState(null);
    const [hasHandledError, setHasHandledError] = useState(false);
  
    // Fetch Plan Details
    useEffect(() => {
    if (!id || !user) return;

    axiosInstance
        .get(`/medicalRecords/getHMOPlan/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => {
        setPlan(res.data.plan);
        
        }
    )
    .catch((err) => {
        if (err.response?.status === 404) {
            navigator("/admin/medical-records/hmo-masterlist-records", { replace: true });
        } else {
            console.error("Unexpected error:", err);
        }
        });
    }, [id]);

    // Fetch Employees 
    useEffect(() => {
        if (!id || !user) return;

        setLoading(true);
        axiosInstance
        .get(`/medicalRecords/getHMOEmployees`, {
            headers: { Authorization: `Bearer ${user.token}` },
            params: { plan_id: id },
        })
        .then((res) => {
            setEmployees(res.data.employees || []);
        })
        .catch((err) => {
            setEmployees([]);
            console.error("Failed to fetch employees", err);
        })
        .finally(() => setLoading(false));
    }, [id]);

    const handleOnBackClick = () => {
        navigator("/admin/medical-records/hmo-masterlist-records");
    };

    const filteredRecords = employees.filter((employee) => {
        const matchesSearch = [
        employee.employee_name,
        employee.dependents_count,
        employee.enroll_date,
        employee.branch?.name,
        employee.department?.name,
        employee.role?.name
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
            .get("/medicalRecords/getHMOEmployees", {
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

    const handleDelete = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will delete the plan if there are no employees assigned.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
        }).then((result) => {
            if (result.isConfirmed) {
            axiosInstance
                .delete(`/medicalRecords/deleteHMOPlan/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
                })
                .then((res) => {
                Swal.fire("Deleted!", "HMO Plan deleted successfully", "success").then(() => {
                    navigator("/admin/medical-records/hmo-masterlist-records");
                });
                })
                .catch((err) => {
                Swal.fire(
                    "Delete failed", "Something went wrong", "error"
                );
                });
            }
        });
    };

    return (
        <Layout title="HMO Masterlist">
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {plan?.plan_name}
                        </Typography>
                        <Grid container spacing={2} gap={2}>
                            <Button
                                style={{ backgroundColor: "#727F91" }} onClick={handleOnBackClick} variant="contained">
                                Back
                            </Button>
                            <Button
                                onClick={() => setOpenAssignEmployeeModal(true)} variant="contained" style={{ color: "#e8f1e6" }}>
                                Assign
                            </Button>
                            <Button variant="contained" color="secondary" onClick={() => setOpenEditModal(true)}>
                                Edit Plan
                            </Button>
                            <Button variant="contained" color="error" onClick={handleDelete}>
                                Delete Plan
                            </Button>
                        </Grid>
                    </Box>

                    <HMOEditPlanModal
                        open={openEditModal}
                        onClose={() => setOpenEditModal(false)}
                        plan={plan}
                        user={user}
                        onSave={(updatedPlan) => {
                            setPlan(updatedPlan); 
                            setOpenEditModal(false);
                            Swal.fire("Success", "Plan updated successfully.", "success");
                        }}
                    />

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4} sx={{ width: '100%'}}>
                            <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px', height: '100%' }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Group Life Details</Typography>
                                <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'space-around' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="subtitle1" fontWeight="bold">Payment Type:</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={8}>
                                            <Typography variant="body1">
                                                {plan?.type || 'N/A'}
                                                </Typography>
                                        </Grid>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="subtitle1" fontWeight="bold">Employer Share:</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={8}>
                                            <Typography variant="body1">
                                                    {plan?.employer_share !== undefined
                                                        ? `₱${parseFloat(plan.employer_share).toFixed(2)}`
                                                        : 'Unassigned'}
                                            </Typography>
                                        </Grid>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="subtitle1" fontWeight="bold">Employee Share:</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={8}>
                                            <Typography variant="body1">
                                                    {plan?.employee_share !== undefined
                                                        ? `₱${parseFloat(plan.employee_share).toFixed(2)}`
                                                        : 'N/A'}
                                            </Typography>
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>

                    <Grid item md={4} xs={12} sx={{ mt: 3, p: 3, bgcolor: "#fff", borderRadius: "8px"}}>
                        <Box sx={{ bgcolor: "#ffffff", borderRadius: "8px" }} >
                        <Grid
                            container
                            spacing={2}
                            sx={{ pl:1, pr: 1, mt: 3, bgcolor: "#fff", borderRadius: "8px", flexWrap: 'wrap', }}
                            >
                                <Grid size={3}>
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
                                <Grid size={3}  sx={{ml:42, justifyContent: 'flex-end'}}>
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
                                <Grid size={3} sx={{justifyContent: 'flex-end'}}>
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

                        </Box>
                        <Grid>
                            <Box sx={{ pl: 1, pr: 1, bgcolor: '#ffffff', borderRadius: '8px', height: '100%' }}>
                                <HMOEmployeeTable
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
                        <HMOEditEmployee
                            open={openEditEmployeeModal}
                            close={setOpenEditEmployeeModal}
                            employeePlanId={selectedEmployeePlanId}
                            refreshEmployees={refreshEmployees}
                        />
                    )}

                    {openAssignEmployeeModal && (
                        <HMOAssignEmployee
                            open={openAssignEmployeeModal}
                            close={setOpenAssignEmployeeModal}
                            planId={id}
                            refreshEmployees={refreshEmployees}
                        />
                    )}
                </Box>    
            </Box>
        </Layout>
    );
};


export default HMOEmployees;