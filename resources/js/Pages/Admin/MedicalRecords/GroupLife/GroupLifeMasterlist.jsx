import React, { useState, useEffect } from "react";
import {
    Grid,
    Box,
    Button,
    Typography,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
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

const GroupLifeMasterlist = () => {
    const navigator = useNavigate();
    const [openAddGroupLifeModal, setOpenAddGroupLifeModal] = useState(false);
    const [openAddCompanyModal, setOpenAddCompanyModal] = useState(false);
    const [search, setSearch] = useState("");

    const [listOfCompanies, setListOfCompanies] = useState([]);

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    useEffect(() => {
        if (!user) return;
        axiosInstance
            .get("/group-life-companies", { headers: { Authorization: `Bearer ${user.token}` } })
            .then(res => {
                setListOfCompanies(
                    res.data.map(company => ({
                        companyMenuItem: company.name,
                        id: company.id
                    }))
                );
            })
            .catch(console.error);
    }, [user]);

    const refreshCompanies = () => {
        if (!user) return;
        axiosInstance.get('/group-life-companies', { headers: { Authorization: `Bearer ${user.token}` } })
            .then(res => {
                setListOfCompanies(
                    res.data.map(company => ({
                        companyMenuItem: company.name,
                        id: company.id
                    }))
                );
            })
            .catch(console.error);
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

    const [rows, setRows] = useState([]);    

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

    const handleOnRowClick = () => {
        navigator(
            `/admin/medical-records/group-life-masterlist/group-life-employees/`
        );
    };

        

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
                                <i className="fa fa-plus pr-2"></i> Add Company
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
                        <GroupLifeOverview records={companies} />
                    </Box>

                    <Box sx={{ width: "80%", minWidth: 300, backgroundColor: "white", borderRadius: 2, padding: 2, overflow: "hidden" }}>
                        <GroupLifeCompanyTable
                            onRowClick={handleOnRowClick}
                            rows={filteredRecords}
                            search={search}/>
                    </Box>
                </Box>

                    {openAddGroupLifeModal && (
                        <GroupLifeAddModal
                            open={true}
                            close={() => setOpenAddGroupLifeModal(false)}
                            onAddRow={(newRow) => {
                                setRows(prevRows => [...prevRows, newRow]);
                                setOpenAddGroupLifeModal(false);                                            
                            }}
                            listOfCompanies={listOfCompanies}
                        />
                    )}

                    {openAddCompanyModal && (
                    <GroupLifeAddCompanyModal
                        open={true}
                        close={() => setOpenAddCompanyModal(false)}
                        onAddCompany={companyName => {
                        refreshCompanies();
                        setListOfCompanies(prev => [
                            ...prev,
                            { companyMenuItem: companyName }
                        ]);
                        // setOpenAddCompanyModal(false);
                        }}
                    />
                    )}
                </Box>
            </Box>
    </Layout>
    
  );
};

export default GroupLifeMasterlist;
