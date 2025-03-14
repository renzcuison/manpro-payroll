import React from "react";
import { Grid, Typography, Button } from "@mui/material";
import { AccessTime } from "@mui/icons-material";

const AttendanceButtons = ({
    label,
    onDuty,
    shiftType,
    onTimeInOut
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

                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: onDuty ? "#f44336" : "#177604",
                            "& .MuiButton-startIcon": {
                                display: { xs: "none", sm: "flex" },
                            },
                        }}
                        startIcon={<AccessTime />}
                        onClick={() => onTimeInOut(shiftType, !onDuty)}
                    >
                        {`Time ${onDuty ? "Out" : "In"}`}
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
                <Grid item xs={6}>
                    {label}
                </Grid>

                <Grid
                    item
                    xs={6}
                    sx={{ display: "flex", justifyContent: "flex-end" }}
                >
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: onDuty ? "#f44336" : "#177604",
                            "& .MuiButton-startIcon": {
                                display: { xs: "none", sm: "flex" },
                            },
                        }}
                        startIcon={<AccessTime />}
                        onClick={() => onTimeInOut(shiftType, !onDuty)}
                    >
                        {`Time ${onDuty ? "Out" : "In"}`}
                    </Button>
                </Grid>
            </Grid>
        </>
    );
};

export default AttendanceButtons;
