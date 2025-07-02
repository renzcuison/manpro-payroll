import React, { useState, useEffect, useMemo } from "react";
import {
    Grid,
    Box,
    Button,
    Typography,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    TablePagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Layout from "../../../../components/Layout/Layout";
import HMOAddPlanModal from "./Modal/HMOAddPlanModal";
import HMOAddCompanyModal from "./Modal/HMOAddCompanyModal";
import HMOCompanyTable from "./HMOCompanyTable";
import HMOOverview from "./HMOOverview";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

const HMOMasterlist = () => {
    const navigator = useNavigate();
    const [openAddHMOModal, setOpenAddHMOModal] = useState(false);
    const [openAddCompanyModal, setOpenAddCompanyModal] = useState(false);
    const [search, setSearch] = useState("");
    const [listOfCompanies, setListOfCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const storedUser = useMemo(() => {
        const item = localStorage.getItem("nasya_user");
        return item ? JSON.parse(item) : null;
    }, []);
    const user = storedUser;
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        axiosInstance
            .get("/medicalRecords/getHMOCompanies", { headers: { Authorization: `Bearer ${user.token}` } })
            .then(res => {
                setListOfCompanies(
                    (res.data.companies || []).map(company => ({
                        companyMenuItem: company.name,
                        id: company.id
                    }))
                );
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    useEffect(() => {

        if (!user) return;
        setLoading(true);
        axiosInstance
            .get("/medicalRecords/getHMOPlans", { headers: { Authorization: `Bearer ${user.token}` } })
            .then(res => {
                const plans = res.data.plans || [];
                setRows(
                    plans.map(row => ({
                        id: row.id,
                        hmoName: row.hmo_company_name,
                        planType: row.plan_name,
                        paymentType: row.type,
                        employerShare: row.employer_share,
                        employeeShare: row.employee_share,
                        employeesAssignedCount: row.employees_assigned_count
                    }))
                );
            })
            .catch(console.error);
    }, [user]);

    const refreshCompanies = () => {
        if (!user) return;
        setLoading(true);
        axiosInstance.get('/group-life-companies', { headers: { Authorization: `Bearer ${user.token}` } })
            .then(res => {
                setListOfCompanies(
                    res.data.map(company => ({
                        companyMenuItem: company.name,
                        id: company.id
                    }))
                );
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const refreshPlans = () => {
        setLoading(true);
        axiosInstance
            .get("/medicalRecords/getHMOPlans", {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(res => {
                const plans = res.data.plans || [];
                setRows(
                    plans.map(row => ({
                        id: row.id,
                        hmoName: row.hmo_company_name,
                        planType: row.plan_name,
                        paymentType: row.type,
                        employerShare: row.employer_share,
                        employeeShare: row.employee_share,
                        employeesAssignedCount: row.employees_assigned_count
                    }))
                );
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const filteredRecords = rows
        .filter((row) => [
            row.id,
            row.hmoName,
            row.planType,
            row.paymentType,
            row.enroll_date,
            row.employerShare,
            row.employeeShare
        ].some((field) =>
            (typeof field === "number"
                ? field.toFixed(2)
                : (field ?? "").toString()
            )
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        )

    const resultsCount = filteredRecords.length;

    const handleOnRowClick = (row) => {
        navigator(
            `/admin/medical-records/hmo-masterlist/hmo-employees/${row.id}`,
            { state: row }
        );
    };

    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const paginatedRows = useMemo(() => {
        const startIndex = currentPage * rowsPerPage;
        return filteredRecords.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredRecords, currentPage, rowsPerPage]);

    return (
        <Layout title={"Pre-Employment Medical Exam Records"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}> HMO Masterlist </Typography>
                        <Grid container spacing={2} gap={2}>
                            <Button
                                onClick={() => setOpenAddCompanyModal(true)}
                                variant="contained"
                                style={{ color: "#e8f1e6" }}
                            >
                                Companies
                            </Button>
                            <Button
                                onClick={() => setOpenAddHMOModal(true)}
                                variant="contained"
                                style={{ color: "#e8f1e6" }}
                            >
                                Add Plan
                            </Button>
                        </Grid>
                    </Box>

                    <Box>
                        <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
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
                                                    {resultsCount}{" "}
                                                    {resultsCount === 1 || resultsCount === 0
                                                        ? "Match"
                                                        : "Matches"}
                                                </Typography>
                                            </InputAdornment>
                                        )}
                                    label="Search"
                                />
                            </FormControl>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "nowrap", justifyContent: "flex-start", alignItems: "flex-start" }}>
                        <Box sx={{ width: "25%", minWidth: 280, backgroundColor: "white", borderRadius: 2, padding: 2, flexShrink: 0 }}>
                            <HMOOverview records={rows} />
                        </Box>

                        <Box sx={{ width: "80%", minWidth: 300, backgroundColor: "white", borderRadius: 2, padding: 2, overflow: "hidden" }}>
                            <HMOCompanyTable
                                onRowClick={handleOnRowClick}
                                rows={paginatedRows}
                                search={search}
                                loading={loading}
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

                    {openAddHMOModal && (
                        <HMOAddPlanModal
                            open={openAddHMOModal}
                            close={() => setOpenAddHMOModal(false)}
                            listOfCompanies={listOfCompanies}
                            refreshPlans={refreshPlans}
                        />
                    )}

                    {openAddCompanyModal && (
                        <HMOAddCompanyModal
                            open={true}
                            close={() => setOpenAddCompanyModal(false)}
                            onAddCompany={companyName => {
                                refreshCompanies();
                            }}
                        />
                    )}

                </Box>
            </Box>
        </Layout>

    );
};

export default HMOMasterlist;
