import React from "react";
import { Box, Typography, Grid} from "@mui/material";

const EmploymentDetails = ({employee}) => {
    const formattedStartDate = employee.date_start ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(employee.date_start)) : '';
    const formattedEndDate = employee.date_end ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(employee.date_end)) : '';
return (
    <Box sx={{ mt: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} > Employment Details </Typography>

        <Grid container spacing={4} sx={{ py: 1 }}>
            <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}> Role </Typography>
            </Grid>
            <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                <Typography> {employee.role || '-'} </Typography>
            </Grid>

            <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}> Job Title </Typography>
            </Grid> 
            <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                <Typography> {employee.jobTitle || '-'} </Typography>
            </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ py: 1 }}>
            <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}> Department </Typography>
            </Grid>
            <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                <Typography> {employee.department || '-'} </Typography>
            </Grid>

            <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}> Branch </Typography>
            </Grid>
            <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                <Typography> {employee.branch || '-'} </Typography>
            </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ py: 1 }}>
            <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}> Type </Typography>
            </Grid>
            <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                <Typography> {employee.employment_type || '-'} </Typography>
            </Grid>

            <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}> Status </Typography>
            </Grid>
            <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                <Typography> {employee.employment_status || '-'} </Typography>
            </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ py: 1 }}>
            <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}> Team </Typography>
            </Grid>
            <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                <Typography> {employee.work_group || '-'} </Typography>
            </Grid>

            <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}> Date Hired </Typography>
            </Grid>
            <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                <Typography> {employee.date_start ? `${formattedStartDate}` : '-'} {employee.date_end ? `- ${formattedEndDate}` : ''} </Typography>
            </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ py: 1 }}>
            <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}> Bank Name </Typography>
            </Grid>
            <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                {/* <Typography> {employee.role || '-'} </Typography> */}
            </Grid>

            {/* <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}> */}
                {/* <Typography sx={{ fontWeight: 'bold' }}> Bank Account </Typography> */}
            {/* </Grid> */}
            {/* <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}> */}
                {/* <Typography> {employee.jobTitle || '-'} </Typography> */}
            {/* </Grid> */}
        </Grid>

        <Grid container spacing={4} sx={{ py: 1 }}>
            <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}> Bank Account </Typography>
            </Grid>
            <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
                {/* <Typography> {employee.role || '-'} </Typography> */}
            </Grid>

            {/* <Grid item size={{ xs: 2, sm: 2, md: 2, lg: 2 }}> */}
                {/* <Typography sx={{ fontWeight: 'bold' }}> Bank Account </Typography> */}
            {/* </Grid> */}
            {/* <Grid item size={{ xs: 4, sm: 4, md: 4, lg: 4 }}> */}
                {/* <Typography> {employee.jobTitle || '-'} </Typography> */}
            {/* </Grid> */}
        </Grid>
    </Box>
    )
}
export default EmploymentDetails;