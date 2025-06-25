import Layout from "../../../../components/Layout/Layout";
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
    CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
// import GroupLifeAddPlanModal from "./Modal/GroupLifeAddPlanModal";
// import GroupLifeAddCompanyModal from "./Modal/GroupLifeAddCompanyModal";
// import GroupLifeCompanyTable from "./GroupLifeCompanyTable";
// import GroupLifeOverview from "./GroupLifeOverview";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

const HMOMasterlist = () => {

return (
<Layout title={"Pre-Employment Medical Exam Records"}>
        <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
            <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}> HMO Masterlist </Typography>
                            <Grid container spacing={2} gap={2}>
                                <Button
                                    // onClick={() => setOpenAddCompanyModal(true)}
                                    variant="contained"
                                    style={{ color: "#e8f1e6" }}
                                    >
                                     Companies
                                </Button>
                                <Button
                                    // onClick={() => setOpenAddGroupLifeModal(true)}
                                    variant="contained"
                                    style={{ color: "#e8f1e6" }}
                                    >
                                    Add Plan
                                </Button>
                            </Grid>
                    </Box>

                    <Box>
                        <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px'}}>
                            <FormControl variant="outlined" sx={{ width: 300, mb: 1 }}>
                                {/* <InputLabel htmlFor="custom-search">
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
                                /> */}
                            </FormControl>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "nowrap", justifyContent: "flex-start", alignItems: "flex-start" }}>
                        <Box sx={{width: "25%", minWidth: 280, backgroundColor: "white", borderRadius: 2, padding: 2, flexShrink: 0 }}>
                            {/* <GroupLifeOverview records={rows} /> */}
                        </Box>

                        <Box sx={{ width: "80%", minWidth: 300, backgroundColor: "white", borderRadius: 2, padding: 2, overflow: "hidden" }}>
                            {/* <GroupLifeCompanyTable
                                onRowClick={handleOnRowClick}
                                rows={paginatedRows}
                                search={search}
                                loading={loading}
                            /> */}
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                                {/* <TablePagination
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
                                /> */}
                            </Box>
                        </Box>
                    </Box>

                    {/* {openAddGroupLifeModal && (
                        <GroupLifeAddPlanModal
                            open={openAddGroupLifeModal}
                            close={() => setOpenAddGroupLifeModal(false)}
                            listOfCompanies={listOfCompanies}
                            refreshPlans={refreshPlans}
                        />
                    )} */}
                    {/* 
                    {openAddCompanyModal && (
                    <GroupLifeAddCompanyModal
                        open={true}
                        close={() => setOpenAddCompanyModal(false)}
                        onAddCompany={companyName => {
                        refreshCompanies();
                        }}
                    />
                    )} 
                     */}

                </Box>
            </Box>
    </Layout>
    
  );
};


export default HMOMasterlist;