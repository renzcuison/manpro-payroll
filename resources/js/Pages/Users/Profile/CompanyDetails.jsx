import { Box, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import React from "react";

function CompanyDetails({ company }) {
    return (
        <Box component={Paper} sx={{ p: 3, borderRadius: 5 }}>
            <Stack spacing={1}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Company Details
                </Typography>
                <Divider sx={{ borderStyle: "dashed" }} />
                <Grid container>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="subtitle1">
                            Company Name:{" "}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 9 }}>
                        <Typography variant="subtitle1">
                            {company.name}{" "}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="subtitle1">Email: </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 9 }}>
                        <Typography variant="subtitle1">
                            {company.email}{" "}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="subtitle1">
                            Description:{" "}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 9 }}>
                        <Typography variant="subtitle1">
                            {company.description}{" "}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="subtitle1">Website: </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 9 }}>
                        <Typography
                            variant="subtitle1"
                            component={"a"}
                            href={company.website}
                            target="_blank"
                        >
                            {company.website}{" "}
                        </Typography>
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    );
}

export default CompanyDetails;
