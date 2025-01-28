import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    Typography,
    CircularProgress,
    FormGroup,
    FormControl,
    InputLabel,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";
import dayjs from "dayjs";

const AttendanceSummaryDetails = ({ open, close, date }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [todaysAttendance, setTodaysAttendance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axiosInstance
            .get(`attendance/getEmployeeWorkDayAttendance`, {
                headers,
                params: {
                    work_date: date,
                },
            })
            .then((response) => {
                //console.log(response.data);
                setTodaysAttendance(response.data.attendance);
                setIsLoading(false);
            })
            .catch((error) => {
                // console.error("Error fetching employee:", error);
            });
    }, []);

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        backgroundColor: "#f8f9fa",
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        minWidth: { xs: "100%", sm: "400px" },
                        maxWidth: "450px",
                        marginBottom: "5%",
                    },
                }}
            >
                <DialogTitle sx={{ padding: 2, paddingBottom: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ marginLeft: 2, fontWeight: "bold" }}
                        >
                            {" "}
                            Attendance Logs for {date}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ py: 4, paddingBottom: 5 }}>
                    {isLoading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 100,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {" "}
                            <Grid
                                container
                                direction="row"
                                alignItems="center"
                                sx={{
                                    p: 1,
                                }}
                            >
                                <Grid item xs={6}>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontWeight: "medium" }}
                                    >
                                        Action
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontWeight: "medium" }}
                                    >
                                        Timestamp
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid
                                container
                                direction="column"
                                sx={{
                                    justifyContent: "flex-start",
                                    alignItems: "flex-start",
                                    borderTop: "1px solid #e0e0e0",
                                    maxHeight: {
                                        xs: "150px",
                                        lg: "200px",
                                    },
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                    flexWrap: "nowrap",
                                }}
                            >
                                {todaysAttendance.map((log, index) => (
                                    <Grid
                                        key={index}
                                        container
                                        direction="row"
                                        alignItems="center"
                                        sx={{
                                            p: 1,
                                            backgroundColor:
                                                index % 2 === 0
                                                    ? "#f8f8f8"
                                                    : "#efefef",
                                        }}
                                    >
                                        <Grid item xs={6}>
                                            <Typography>
                                                {log.action}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography>
                                                {log.timestamp}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                    {/*Attendance Logs------------------------------*/}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AttendanceSummaryDetails;
