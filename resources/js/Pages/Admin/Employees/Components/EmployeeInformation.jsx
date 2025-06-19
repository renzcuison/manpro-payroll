import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, Avatar, Button, Menu, MenuItem } from '@mui/material'

const EmployeeInformation = ({employee}) => {

    useEffect(() => {
        console.log(employee);
    }, []);

    const profilePic = employee?.media?.length ? employee.media[0]?.original_url : employee?.avatar || "../../../../../images/avatarpic.jpg";

    const formattedBirthDate = employee.birth_date ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(employee.birth_date)) : '';
    const calculateAge = (birthDate) => {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };
    
    return (
        <>
            <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

                <Grid container sx={{ pt: 1, pb: 4, justifyContent: 'center', alignItems: 'center' }}>
                    <Avatar alt={`${employee.user_name} Profile Pic`} src={profilePic} sx={{ width: '50%', height: 'auto', aspectRatio: '1 / 1', objectFit: 'cover', boxShadow: 3 }} />
                </Grid>


                <Grid container spacing={4} sx={{ p: 1 }}>
                    <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}>
                        <Typography> <i className="fa fa-id-card"></i> </Typography>
                    </Grid>
                    <Grid item size={{ xs: 11, sm: 11, md: 11, lg: 11 }}>
                        {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''}
                    </Grid>
                </Grid>

                <Grid container spacing={4} sx={{ p: 1 }}>
                    <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}>
                        <Typography> <i className="fa fa-envelope"></i> </Typography>
                    </Grid>
                    <Grid item size={{ xs: 11, sm: 11, md: 11, lg: 11 }}>
                        <Typography> {employee.email} </Typography>
                    </Grid>
                </Grid>

                <Grid container spacing={4} sx={{ p: 1 }}>
                    <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}>
                        <Typography> <i className="fa fa-mobile"></i> </Typography>
                    </Grid>
                    <Grid item size={{ xs: 11, sm: 11, md: 11, lg: 11 }}>
                        <Typography> {employee.contact_number || ''} </Typography>
                    </Grid>
                </Grid>

                <Grid container spacing={4} sx={{ p: 1 }}>
                    <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}>
                        <Typography> <i className="fa fa-globe"></i> </Typography>
                    </Grid>
                    <Grid item size={{ xs: 11, sm: 11, md: 11, lg: 11 }}>
                        <Typography> {employee.address || ''} </Typography>
                    </Grid>
                </Grid>

                <Grid container spacing={4} sx={{ p: 1 }}>
                    <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}>
                        <Typography> <i className="fa fa-birthday-cake"></i> </Typography>
                    </Grid>
                    <Grid item size={{ xs: 11, sm: 11, md: 11, lg: 11 }}>
                        <Typography> {employee.birth_date ? `${formattedBirthDate} (${calculateAge(employee.birth_date)} Years Old)` : 'Not Indicated'} </Typography>
                    </Grid>
                </Grid>

                <Grid container spacing={4} sx={{ p: 1 }}>
                    <Grid item size={{ xs: 1, sm: 1, md: 1, lg: 1 }}>
                        <Typography> <i className="fa fa-venus-mars"></i> </Typography>
                    </Grid>
                    <Grid item size={{ xs: 11, sm: 11, md: 11, lg: 11 }}>
                        <Typography> {employee.gender || 'Not Indicated'} </Typography>
                    </Grid>
                </Grid>
            </Box>
        </>
    )

}
export default EmployeeInformation;
