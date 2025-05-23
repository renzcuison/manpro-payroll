import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";
import React from "react";

function UserSummary({ user }) {
    return (
        <Box component={Paper} sx={{ p: 4, borderRadius: 5 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                Summary
            </Typography>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                        sx={{
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        <Grid
                            container
                            sx={{
                                pb: 2,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 114,
                                    height: 114,
                                    bgcolor: "#7eb73d",
                                }}
                            >
                                {user.total_payroll || "-"}
                            </Avatar>
                        </Grid>
                        <Grid
                            container
                            sx={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Typography variant="h6">
                                {" "}
                                Signed Payroll{" "}
                            </Typography>
                        </Grid>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                        sx={{
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        <Grid
                            container
                            sx={{
                                pb: 2,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 114,
                                    height: 114,
                                    bgcolor: "#eab000",
                                }}
                            >
                                {user.total_attendance || "-"}
                            </Avatar>
                        </Grid>
                        <Grid
                            container
                            sx={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Typography variant="h6"> Attendance </Typography>
                        </Grid>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                        sx={{
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        <Grid
                            container
                            sx={{
                                pb: 2,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 114,
                                    height: 114,
                                    bgcolor: "#de5146",
                                }}
                            >
                                {user.total_applications || "-"}
                            </Avatar>
                        </Grid>
                        <Grid
                            container
                            sx={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Typography variant="h6"> Applications </Typography>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

export default UserSummary;
