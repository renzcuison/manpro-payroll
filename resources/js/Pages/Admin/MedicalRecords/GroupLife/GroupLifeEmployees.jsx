import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

// Axios config
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

// Components
import Layout from "../../../../components/Layout/Layout";

// MUI components
import {
    Box,
    Button,
    Typography,
    Grid,
    InputLabel,
    FormControl,
    OutlinedInput,
    InputAdornment,
    Divider
} from "@mui/material";

// MUI X Date Picker
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import GroupLifeEmployeeTable from "./GroupLifeEmployeeTable";
import GroupLifeAssignEmployee from "./Modal/GroupLifeAssignEmployee";

const GroupLifeEmployees = () => {
    const navigator = useNavigate();
    const [search, setSearch] = React.useState("");
    const [openAssignEmployeeModal, setOpenAssignEmployeeModal] = useState(false);
    const employees = [
        {
            employee: "Samuel Christian D. Nacar",
            dependents: "2",
            enrollDate: "May 25, 2025",
            branch: "Davao",
            department: "Accounting Department",
            role: "Accounting Operations",
        },
        {
            employee: "Samuel Christian D. Nacar",
            dependents: "2",
            enrollDate: "May 25, 2025",
            branch: "Davao",
            department: "Finance Department",
            role: "Finance Operations",
        }
    ];

    const handleOnBackClick = () => {
        navigator(
            "/admin/medical-records/group-life-masterlist-records"
        );
    };

    return (
        <Layout title="GroupLife Masterlist">
            <Box
                sx={{ mx: 'auto', width: '100%', px: { xs: 1, md: 3 } }}>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>

                            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                                InsuranceCompanyName
                            </Typography>
                            <Grid container spacing={2} gap={2}>                             
                                <Button
                                style = {{backgroundColor: "#727F91"}}
                                onClick={handleOnBackClick}
                                variant="contained">
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
                        <Grid item xs={12} md={4} sx={{width: '100%', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'}}>
                            <Box    sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px', height: '100%' }}> 
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold'}}>Group Life Details</Typography>
                                <Grid container spacing={2} sx={{display: 'flex', justifyContent: 'space-around'}}>
                                        <Box sx={{display:'flex', alignItems:'center', gap:'10px'}} >
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="subtitle1" fontWeight="bold">Payment Type:</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={8}>
                                                <Typography variant="body1">{'N/A'}</Typography>
                                            </Grid>
                                        </Box>

                                        <Box sx={{display:'flex', alignItems:'center', gap:'10px'}} >
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="subtitle1" fontWeight="bold">Employer Share:</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={8}>
                                                <Typography variant="body1">{'Unassigned'}</Typography>
                                            </Grid>
                                        </Box>

                                        <Box sx={{display:'flex', alignItems:'center', gap:'10px'}} >
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="subtitle1" fontWeight="bold">Employee Share:</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={8}>
                                                <Typography variant="body1">{'N/A'}</Typography>
                                            </Grid>
                                        </Box>
                                    </Grid>
                            </Box>
                        </Grid>
                    </Grid>

                    <Grid item
                        md = {4}
                        xs ={12}
                        sx={{
                            mt: 3,
                            p: 3,
                            bgcolor: "#fff",
                            borderRadius: "8px",
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                        >

                        <Grid >
                             <Box    sx={{ pl: 1, pr: 1, bgcolor: '#ffffff', borderRadius: '8px', height: '100%' }}> 
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', }}>Assigned Employees</Typography>
                                        
                            <GroupLifeEmployeeTable
                                employees={employees}/>
                            </Box>
                        </Grid>
                    </Grid>
                
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