import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Button,
    Typography,
    Grid,
    InputLabel,
    FormControl,
    OutlinedInput,
    InputAdornment
} from "@mui/material";
import Layout from "../../../../components/Layout/Layout";
import GroupLifeEmployeeTable from "./GroupLifeEmployeeTable";
import GroupLifeAssignEmployee from "./Modal/GroupLifeAssignEmployee";
import GroupLifeEditEmployee from "./Modal/GroupLifeEditEmployee";

const GroupLifeEmployees = () => {
    const location = useLocation();
    const planDetails = location.state || {};
    const navigator = useNavigate();
    const [search, setSearch] = useState("");
    const [openAssignEmployeeModal, setOpenAssignEmployeeModal] = useState(false);
    const [openEditEmployeeModal, setOpenEditEmployeeModal] = useState(false);

    // Dummy data
    const employees = [
        {
            employee: "Samuel Christian D. Nacar",
            dependents: "0",
            enrollDate: "May 25, 2025",
            branch: "Davao",
            department: "Accounting Department",
            role: "Accounting Operations",
        }
    ];

    const handleOnBackClick = () => {
        navigator("/admin/medical-records/group-life-masterlist-records");
    };

    // Filter records based on search string (case-insensitive)
    const filteredRecords = employees.filter((employee) =>
        [
            employee.employee,
            employee.dependents,
            employee.enrollDate,
            employee.branch,
            employee.department,
            employee.role,
        ].some((field) =>
            (typeof field === "number"
                ? field.toFixed(2)
                : (field ?? "").toString()
            )
                .toLowerCase()
                .includes(search.toLowerCase())
        )
    );

    const resultsCount = filteredRecords.length;

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
                            <i className="fa fa-plus pr-2"></i> Assign
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
                                        <Typography variant="body1">{planDetails.paymentType || 'N/A'}</Typography>
                                    </Grid>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
                                    <Grid item xs={6} sm={4}>
                                        <Typography variant="subtitle1" fontWeight="bold">Employer Share:</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={8}>
                                        <Typography variant="body1">{planDetails.employerShare !== undefined ? `₱${planDetails.employerShare.toFixed(2)}` : 'Unassigned'}</Typography>
                                    </Grid>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
                                    <Grid item xs={6} sm={4}>
                                        <Typography variant="subtitle1" fontWeight="bold">Employee Share:</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={8}>
                                        <Typography variant="body1">{planDetails.employeeShare !== undefined ? `₱${planDetails.employeeShare.toFixed(2)}` : 'N/A'}</Typography>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>

                <Grid item
                    md={4}
                    xs={12}
                    sx={{
                        mt: 3,
                        p: 3,
                        bgcolor: "#fff",
                        borderRadius: "8px",
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Grid item>
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
                                                {resultsCount} {resultsCount === 1 || resultsCount === 0 ? "Match" : "Matches"}
                                            </Typography>
                                        </InputAdornment>
                                    )
                                }
                                label="Search"
                            />
                        </FormControl>
                    </Grid>

                    <Grid>
                        <Box sx={{ pl: 1, pr: 1, bgcolor: '#ffffff', borderRadius: '8px', height: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', }}>Assigned Employees</Typography>
                            <GroupLifeEmployeeTable
                                employees={filteredRecords}
                                onRowClick={() => setOpenEditEmployeeModal(true)}
                                search={search} // <--- pass the search prop!
                            />
                        </Box>
                    </Grid>
                </Grid>

                {openEditEmployeeModal && (
                    <GroupLifeEditEmployee
                        open={openEditEmployeeModal}
                        close={setOpenEditEmployeeModal}
                    />
                )}

                {openAssignEmployeeModal && (
                    <GroupLifeAssignEmployee
                        open={openAssignEmployeeModal}
                        close={setOpenAssignEmployeeModal}
                    />
                )}
                
            </Box>
        </Layout>
    );
};

export default GroupLifeEmployees;