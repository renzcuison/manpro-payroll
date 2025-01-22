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

const Attendance = ({ open, close }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // (workShift.)
    const [workShift, setWorkShift] = useState([]);
    const [workHour, setWorkHour] = useState([]);
    useEffect(() => {
        axiosInstance
            .get(`/workshedule/getWorkShift`, { headers })
            .then((response) => {
                console.log(response.data);
                setWorkShift(response.data.shift);
                setWorkHour(response.data.hour);
            })
            .catch((error) => {
                console.error("Error fetching employee:", error);
            });
    }, []);

    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const formattedDateTime = currentDateTime.toLocaleTimeString();
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const [regularTimeIn, setRegularTimeIn] = useState(null);
    const [regularTimeOut, setRegularTimeOut] = useState(null);

    const [splitFirstTimeIn, setSplitFirstTimeIn] = useState(null);
    const [splitFirstTimeOut, setSplitFirstTimeOut] = useState(null);
    const [splitSecondTimeIn, setSplitSecondTimeIn] = useState(null);
    const [splitSecondTimeOut, setSplitSecondTimeOut] = useState(null);

    const [overTimeIn, setOverTimeIn] = useState(null);
    const [overTimeOut, setOverTimeOut] = useState(null);

    const handleTimeOutError = () => {
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Invalid Action",
            text: "You have to Time In first!",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Save",
            confirmButtonColor: "#177604",
        });
    };

    const handleRegularTimeInChange = () => {
        console.log("Regular Time In: " + formattedDateTime);
        setRegularTimeIn(true);
    };
    const handleRegularTimeOutChange = () => {
        if (regularTimeIn) {
            console.log("Regular Time Out: " + formattedDateTime);
            setRegularTimeOut(true);
        } else {
            handleTimeOutError();
        }
    };
    const handleSplitFirstTimeInChange = () => {
        console.log("First Time In: " + formattedDateTime);
        setSplitFirstTimeIn(true);
    };
    const handleSplitFirstTimeOutChange = () => {
        if (splitFirstTimeIn) {
            console.log("First Time Out: " + formattedDateTime);
            setSplitFirstTimeOut(true);
        } else {
            handleTimeOutError();
        }
    };
    const handleSplitSecondTimeInChange = () => {
        console.log("Second Time In: " + formattedDateTime);
        setSplitSecondTimeIn(true);
    };
    const handleSplitSecondTimeOutChange = () => {
        if (splitSecondTimeIn) {
            console.log("Second Time Out: " + formattedDateTime);
            setSplitSecondTimeOut(true);
        } else {
            handleTimeOutError();
        }
    };
    const handleOverTimeInChange = () => {
        console.log("OverTime In: " + formattedDateTime);
        setOverTimeIn(true);
    };
    const handleOverTimeOutChange = () => {
        if (overTimeIn) {
            console.log("First Time Out: " + formattedDateTime);
            setOverTimeOut(true);
        } else {
            handleTimeOutError();
        }
    };

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        padding: "4px",
                        backgroundColor: "#f8f9fa",
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        minWidth: "400px",
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
                            variant="h4"
                            sx={{ marginLeft: 2, fontWeight: "bold" }}
                        >
                            {" "}
                            Attendance{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 4, paddingBottom: 1 }}>
                    <Grid
                        container
                        direction="column"
                        sx={{
                            justifyContent: "flex-start",
                            alignItems: "flex-start",
                        }}
                    >
                        {/*Regular Shift-------------------------------*/}
                        <Grid
                            container
                            direction="row"
                            alignItems="flex-start"
                            sx={{ my: 1 }}
                        >
                            <Grid item xs={4}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "medium" }}
                                >
                                    Attendance
                                </Typography>
                            </Grid>
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleRegularTimeInChange}
                                >
                                    Time In
                                </Button>
                            </Grid>
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleRegularTimeOutChange}
                                >
                                    Time Out
                                </Button>
                            </Grid>
                        </Grid>
                        {/*Split-First Shift---------------------------*/}
                        <Grid
                            container
                            direction="row"
                            alignItems="flex-start"
                            sx={{ my: 1 }}
                        >
                            <Grid item xs={4}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "medium" }}
                                >
                                    {workShift.first_label}
                                </Typography>
                            </Grid>
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSplitFirstTimeInChange}
                                >
                                    Time In
                                </Button>
                            </Grid>
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleSplitFirstTimeOutChange}
                                >
                                    Time Out
                                </Button>
                            </Grid>
                        </Grid>
                        {/*Split Second Shift--------------------------*/}
                        <Grid
                            container
                            direction="row"
                            alignItems="flex-start"
                            sx={{ my: 1 }}
                        >
                            <Grid item xs={4}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "medium" }}
                                >
                                    {workShift.second_label}
                                </Typography>
                            </Grid>
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSplitSecondTimeInChange}
                                >
                                    Time In
                                </Button>
                            </Grid>
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleSplitSecondTimeOutChange}
                                >
                                    Time Out
                                </Button>
                            </Grid>
                        </Grid>
                        {/*Overtime Shift------------------------------*/}
                        <Grid
                            container
                            direction="row"
                            alignItems="flex-start"
                            sx={{ my: 1 }}
                        >
                            <Grid item xs={4}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "medium" }}
                                >
                                    Overtime
                                </Typography>
                            </Grid>
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleOverTimeInChange}
                                >
                                    Time In
                                </Button>
                            </Grid>
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleOverTimeOutChange}
                                >
                                    Time Out
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Attendance;
