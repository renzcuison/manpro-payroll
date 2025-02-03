import React from "react";
import { Grid, Typography, Button } from "@mui/material";
import { AccessTime } from "@mui/icons-material";

const AttendanceButtons = ({
    label,
    onTimeIn,
    onTimeOut,
    disableTimeIn,
    disableTimeOut,
    shiftType,
}) => {
    return (
        <>
            {/* Mobile Layout */}
            <Grid
                container
                direction="column"
                alignItems="flex-start"
                sx={{ display: { xs: "flex", sm: "none" }, pt: 1.5 }}
            >
                <Grid item xs={12}>
                    {label}
                </Grid>

                <Grid
                    container
                    item
                    xs={12}
                    direction="row"
                    justifyContent="space-between"
                    rowGap={1}
                >
                    <Button
                        fullWidth
                        variant="contained"
                        disabled={disableTimeIn}
                        sx={{
                            backgroundColor: "#177604",
                            "& .MuiButton-startIcon": {
                                display: { xs: "none", sm: "flex" },
                            },
                        }}
                        startIcon={<AccessTime />}
                        onClick={() => onTimeIn(shiftType, true)}
                    >
                        Time In
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        disabled={disableTimeOut}
                        sx={{
                            backgroundColor: "#f44336",
                            "& .MuiButton-startIcon": {
                                display: { xs: "none", sm: "flex" },
                            },
                        }}
                        startIcon={<AccessTime />}
                        onClick={() => onTimeOut(shiftType, false)}
                    >
                        Time Out
                    </Button>
                </Grid>
            </Grid>

            {/* Tablet and Larger Layout */}
            <Grid
                container
                direction="row"
                alignItems="flex-start"
                sx={{ display: { xs: "none", sm: "flex" }, pt: 1.5 }}
            >
                <Grid item xs={4}>
                    {label}
                </Grid>

                <Grid
                    item
                    xs={4}
                    sx={{ display: "flex", justifyContent: "flex-end" }}
                >
                    <Button
                        variant="contained"
                        disabled={disableTimeIn}
                        sx={{
                            backgroundColor: "#177604",
                            "& .MuiButton-startIcon": {
                                display: { xs: "none", sm: "flex" },
                            },
                        }}
                        startIcon={<AccessTime />}
                        onClick={() => onTimeIn(shiftType, true)}
                    >
                        Time In
                    </Button>
                </Grid>

                <Grid
                    item
                    xs={4}
                    sx={{ display: "flex", justifyContent: "flex-end" }}
                >
                    <Button
                        variant="contained"
                        disabled={disableTimeOut}
                        sx={{
                            backgroundColor: "#f44336",
                            "& .MuiButton-startIcon": {
                                display: { xs: "none", sm: "flex" },
                            },
                        }}
                        startIcon={<AccessTime />}
                        onClick={() => onTimeOut(shiftType, false)}
                    >
                        Time Out
                    </Button>
                </Grid>
            </Grid>
        </>
    );
};

export default AttendanceButtons;
