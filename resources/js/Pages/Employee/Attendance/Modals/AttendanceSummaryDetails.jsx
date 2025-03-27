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
    Stack,
    Divider,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
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
                setTodaysAttendance(response.data.attendance);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching employee:", error);
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
                <DialogTitle sx={{ padding: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h5" sx={{ marginLeft: 1, fontWeight: "bold" }} >
                            {" "}Attendance Logs{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ py: 2, pb: 5 }}>
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
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="left" sx={{ width: "50%", pl: 0 }}>
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                Action
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="left" sx={{ width: "50%", pl: 0 }}>
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                Timestamp
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {todaysAttendance.map((log, index) => (
                                        <TableRow key={index}>
                                            <TableCell align="left" sx={{ pl: 0 }}>
                                                {log.action}
                                            </TableCell>
                                            <TableCell align="left" sx={{ pl: 0 }}>
                                                {dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AttendanceSummaryDetails;
