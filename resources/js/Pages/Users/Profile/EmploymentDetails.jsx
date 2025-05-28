import { Box, Grid, Paper, Typography } from "@mui/material";
import React from "react";

function EmploymentDetails({ user }) {
    return (
        <Box component={Paper} sx={{ p: 4, borderRadius: 5 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                {" "}
                Employment Details{" "}
            </Typography>
            <Grid container columnSpacing={4} sx={{ py: 1 }}>
                <Grid size={{ xs: 5, md: 2 }}>
                    <Typography> Role </Typography>
                </Grid>
                <Grid size={{ xs: 7, md: 2 }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {" "}
                        {user.role || "-"}{" "}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 5, md: 2 }}>
                    <Typography> Job Title </Typography>
                </Grid>
                <Grid size={{ xs: 7, md: 2 }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {" "}
                        {user.jobTitle || "-"}{" "}
                    </Typography>
                </Grid>
            </Grid>

            <Grid container columnSpacing={4} sx={{ py: 1 }}>
                <Grid size={{ xs: 5, md: 2 }}>
                    <Typography> Department </Typography>
                </Grid>
                <Grid size={{ xs: 7, md: 2 }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {" "}
                        {user.department || "-"}{" "}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 5, md: 2 }}>
                    <Typography> Branch </Typography>
                </Grid>
                <Grid size={{ xs: 7, md: 2 }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {" "}
                        {user.branch || "-"}{" "}
                    </Typography>
                </Grid>
            </Grid>

            <Grid container columnSpacing={4} sx={{ py: 1 }}>
                <Grid size={{ xs: 5, md: 2 }}>
                    <Typography> Type </Typography>
                </Grid>
                <Grid size={{ xs: 7, md: 2 }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {" "}
                        {user.employment_type || "-"}{" "}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 5, md: 2 }}>
                    <Typography> Status </Typography>
                </Grid>
                <Grid size={{ xs: 7, md: 2 }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {" "}
                        {user.employment_status || "-"}{" "}
                    </Typography>
                </Grid>
            </Grid>

            <Grid container columnSpacing={4} sx={{ py: 1 }}>
                <Grid size={{ xs: 5, md: 2 }}>
                    <Typography> Work Group </Typography>
                </Grid>
                <Grid size={{ xs: 7, md: 2 }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {" "}
                        {user.work_group || "-"}{" "}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 5, md: 2 }}>
                    <Typography> Employment Date </Typography>
                </Grid>
                <Grid size={{ xs: 7, md: 2 }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {" "}
                        {/* {user.date_start ? `${formattedStartDate}` : "-"}{" "}
                        {user.date_end ? `- ${formattedEndDate}` : ""}{" "} */}
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
}

export default EmploymentDetails;
