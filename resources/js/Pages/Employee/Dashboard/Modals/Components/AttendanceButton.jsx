import React from "react";
import { Grid, Button } from "@mui/material";
import { AccessTime } from "@mui/icons-material";

const AttendanceButtons = ({
    label,
    onDuty,
    shiftType,
    onTimeInOut
}) => {
    return (
        <>
            <Grid
                container
                direction="row"
                sx={{ justifyContent: "flex-start", alignItems: "center", pt: 1.5 }}
                size={{ xs: 12 }}
            >
                <Grid size={{ xs: 8 }}>
                    {label}
                </Grid>

                <Grid size={{ xs: 4 }} sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AccessTime />}
                        onClick={() => onTimeInOut(shiftType, !onDuty)}
                        sx={{
                            backgroundColor: onDuty ? "#f44336" : "#177604",
                            "& .MuiButton-startIcon": {
                                display: { xs: "none", sm: "flex" },
                            },
                            alignItems: "center"
                        }}
                    >
                        {`Time ${onDuty ? "Out" : "In"}`}
                    </Button>
                </Grid>
            </Grid>
        </>
    );
};

export default AttendanceButtons;
