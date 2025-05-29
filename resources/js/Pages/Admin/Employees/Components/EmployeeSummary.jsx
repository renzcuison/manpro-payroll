import React, { useState, useEffect } from "react";
import { Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography, Grid, Avatar, } from "@mui/material";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

const EmployeeSummary = ({employee}) => {
    
    return(
        <Box sx={{ mb: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }} > Summary </Typography>

            <Grid container spacing={4}>
                <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                    <Box sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                        <Grid container sx={{ pb: 2, justifyContent: 'center', alignItems: 'center' }}>
                            <Avatar sx={{ width: 114, height: 114, bgcolor: '#7eb73d' }}> {employee.total_payroll || "0"} </Avatar>
                        </Grid>
                        <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="h6"> Signed Payroll </Typography>
                        </Grid>
                    </Box>
                </Grid>

                <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                    <Box sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                        <Grid container sx={{ pb: 2, justifyContent: 'center', alignItems: 'center' }}>
                            <Avatar sx={{ width: 114, height: 114, bgcolor: '#eab000' }}> {employee.total_attendance || "0"} </Avatar>
                        </Grid>
                        <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="h6"> Attendance </Typography>
                        </Grid>
                    </Box>
                </Grid>

                <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                    <Box sx={{ bgcolor: '#ffffff', borderRadius: '8px' }}>
                        <Grid container sx={{ pb: 2, justifyContent: 'center', alignItems: 'center' }}>
                            <Avatar sx={{ width: 114, height: 114, bgcolor: '#de5146' }}> {employee.total_applications || "0"} </Avatar>
                        </Grid>
                        <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="h6"> Applications </Typography>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default EmployeeSummary;
