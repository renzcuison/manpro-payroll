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
import GroupLifeAddModal from "./Modal/GroupLifeAddModal";
import GroupLifeAddCompanyModal from "./Modal/GroupLifeAddCompanyModal";
import GroupLifeCompanyTable from "./GroupLifeCompanyTable";
import GroupLifeOverview from "./GroupLifeOverview";
import GroupLifeEmployees from "./GroupLifeEmployees";
import axios from "axios";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import Swal from 'sweetalert2';

const GroupLifeMasterlist = () => {
    const navigator = useNavigate();
    const [openAddGroupLifeModal, setOpenAddGroupLifeModal] = useState(false);
    const [openAddCompanyModal, setOpenAddCompanyModal] = useState(false);
    const [search, setSearch] = useState("");

    const [listOfCompanies, setListOfCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    const storedUser = useMemo(() => {
        const item = localStorage.getItem("nasya_user");
        return item ? JSON.parse(item) : null;
        }, []);
        const user = storedUser;

    // const storedUser = localStorage.getItem("nasya_user");
    // const user = storedUser ? JSON.parse(storedUser) : null;

    const [rows, setRows] = useState([]);    

    useEffect(() => {
        if (!user) return;

        setLoading(true);

        axiosInstance
            .get("/medicalRecords/getGroupLifeCompanies", { headers: { Authorization: `Bearer ${user.token}` } })
            .then(res => {
                console.log("API response:", res.data); 
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
            .get("/medicalRecords/getGroupLifePlans", { headers: { Authorization: `Bearer ${user.token}` } })
            .then(res => {const plans = res.data.plans || [];
                setRows(
                plans.map(row => ({
                groupLifeName: row.group_life_company_name,
                planType: row.plan_name,
                paymentType: row.type,
                employerShare: row.employer_share,
                employeeShare: row.employee_share,
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
                console.log("Rows updated", rows);
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
            .get("/medicalRecords/getGroupLifePlans", {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(res => {
                const plans = res.data.plans || [];
                console.log("Processed plans:", plans);
                setRows(
                    plans.map(row => ({
                        groupLifeName: row.group_life_company_name,
                        planType: row.plan_name,
                        paymentType: row.type,
                        employerShare: row.employer_share,
                        employeeShare: row.employee_share,
                    }))
                );
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

        const companies = [
                {
                    id: 1,
                    companyname: "St. Peter Life Plan",
                    planType: "Traditional",
                    paymentType: "Amount",
                    employerShare: 300.00,
                    employeeShare: 400.00,
                },
                {
                    id: 2,
                    companyname: "Evergreen Life Plan",
                    planType: "Cremation",
                    paymentType: "Amount",
                    employerShare: 300.00,
                    employeeShare: 400.00,
                }
            ];

    const filteredRecords = rows
    .filter((row) => [
        row.groupLifeName,
        row.planType,
        row.paymentType,
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
            `/admin/medical-records/group-life-masterlist/group-life-employees/`,
            { state: row }
        );
    };

    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);


    const paginatedRows = useMemo(() => {
        const startIndex = currentPage * rowsPerPage; // remove -1
        return filteredRecords.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredRecords, currentPage, rowsPerPage]);

    console.log("Rows sent to chart:", rows);

    return (
    <Layout title={"Pre-Employment Medical Exam Records"}>
        <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
            <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}> Group Life Masterlist </Typography>
                            <Grid container spacing={2} gap={2}>
                                <Button
                                    onClick={() => setOpenAddCompanyModal(true)}
                                    variant="contained"
                                    style={{ color: "#e8f1e6" }}
                                    >
                                     Companies
                                </Button>
                                <Button
                                    onClick={() => setOpenAddGroupLifeModal(true)}
                                    variant="contained"
                                    style={{ color: "#e8f1e6" }}
                                    >
                                    <i className="fa fa-plus pr-2"></i> Add
                                </Button>
                            </Grid>
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
                                            {resultsCount}{" "}
                                            {resultsCount === 1 || resultsCount === 0
                                            ? "Match"
                                            : "Matches"}
                                        </Typography>
                                        </InputAdornment>
                                    )
                                    }
                                    label="Search"
                                />
                            </FormControl>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "nowrap", justifyContent: "flex-start", alignItems: "flex-start" }}>
                    
                        <Box sx={{width: "25%", minWidth: 280, backgroundColor: "white", borderRadius: 2, padding: 2, flexShrink: 0 }}>
                            <GroupLifeOverview records={rows} />
                        </Box>

                        <Box sx={{ width: "80%", minWidth: 300, backgroundColor: "white", borderRadius: 2, padding: 2, overflow: "hidden" }}>
                            <GroupLifeCompanyTable
                                onRowClick={handleOnRowClick}
                                // rows={filteredRecords}
                                rows={paginatedRows}
                                search={search}
                                refreshPlans={refreshPlans}
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

                    {openAddGroupLifeModal && (
                        <GroupLifeAddModal
                            open={openAddGroupLifeModal}
                            close={() => setOpenAddGroupLifeModal(false)}
                            listOfCompanies={listOfCompanies}
                            refreshPlans={refreshPlans}
                        />
                    )}
                    {openAddCompanyModal && (
                    <GroupLifeAddCompanyModal
                        open={true}
                        close={() => setOpenAddCompanyModal(false)}
                        onAddCompany={companyName => {
                        // setOpenAddCompanyModal(false);
                        refreshCompanies();
                        setListOfCompanies(prev => [
                            ...prev,
                            { companyMenuItem: companyName }
                        ]);
                        }}
                    />
                    )}


                </Box>
            </Box>
    </Layout>
    
  );
};

export default GroupLifeMasterlist;
