import { Box, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import React from "react";

function PackageDetails({ packageData }) {
    return (
        <Box component={Paper} sx={{ p: 3, borderRadius: 5 }}>
            <Stack spacing={1}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Package Details
                </Typography>
                <Divider sx={{ borderStyle: "dashed" }} />
                <Grid container>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="subtitle1">Package: </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 9 }}>
                        <Typography variant="subtitle1">
                            {packageData.name}{" "}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="subtitle1">
                            Description:{" "}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 9 }}>
                        <Typography variant="subtitle1">
                            {packageData.description}{" "}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="subtitle1">Status: </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 9 }}>
                        <Typography variant="subtitle1">Active</Typography>
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    );
}

export default PackageDetails;
