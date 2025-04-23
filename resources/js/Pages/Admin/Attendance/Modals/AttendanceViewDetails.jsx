import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    Typography,
    CircularProgress,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Divider,
    Tooltip,
    Button
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { Edit, InfoOutlined } from "@mui/icons-material";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";
import dayjs from "dayjs";

import InfoBox from "../../../../components/General/InfoBox";
import AddAttendanceModal from "./AddAttendanceModal";
import EditAttendanceModal from "./EditAttendanceModal";

const AttendanceViewDetails = ({ open, close, viewInfo, employee }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [todaysAttendance, setTodaysAttendance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [exitReload, setExitReload] = useState(false);

    useEffect(() => {
        getAttendance();
    }, []);

    const getAttendance = () => {
        axiosInstance
            .get(`attendance/getEmployeeWorkDayAttendance`, {
                headers,
                params: {
                    employee: employee,
                    work_date: viewInfo.date,
                },
            })
            .then((response) => {
                setTodaysAttendance(response.data.attendance);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching employee:", error);
            });
    }

    const [openAddAttendance, setOpenAddAttendance] = useState(false);
    const handleOpenAddAttendance = () => {
        setOpenAddAttendance(true);
    };
    const handleCloseAddAttendance = (reload) => {
        setOpenAddAttendance(false);
        if (reload) {
            getAttendance();
            setExitReload(true);
        }
    }

    const [openEditAttendance, setOpenEditAttendance] = useState(false);
    const [loadAttendance, setLoadAttendance] = useState(null);
    const handleOpenEditAttendance = (log) => {
        setLoadAttendance(log);
        setOpenEditAttendance(true);
    };
    const handleCloseEditAttendance = (reload) => {
        setOpenEditAttendance(false);
        setLoadAttendance(null);
        if (reload) {
            getAttendance();
            setExitReload(true);
        }
    }

    const formatTime = (time) => {
        if (!time) return '-';

        const absTime = Math.abs(time);

        const hours = Math.floor(absTime / 60);
        const minutes = absTime % 60;

        if (hours > 0) {
            return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
        } else {
            return `${minutes}m`;
        }
    }

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                slotProps={{
                    paper: {
                        sx: {
                            p: 1,
                            backgroundColor: "#f8f9fa",
                            boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                            borderRadius: "20px",
                            minWidth: { xs: "100%", sm: "600px" },
                            maxWidth: "650px",
                            marginBottom: "5%",
                        }
                    }
                }}
            >
                <DialogTitle sx={{ p: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h5" sx={{ marginLeft: 1, fontWeight: "bold" }}>
                            {" "}Attendance Details{" "}
                        </Typography>
                        <IconButton onClick={() => close(exitReload)}>
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
                        <Grid container spacing={2}>
                            <Grid size={12}>
                                <InfoBox
                                    title="Date"
                                    info={dayjs(viewInfo.date).format("MMM DD, YYYY")}
                                    compact
                                    clean
                                />
                            </Grid>
                            {viewInfo.ongoing ? (
                                <Grid size={12}>
                                    <Typography
                                        sx={{
                                            color: '#177604',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        Day Ongoing
                                    </Typography>
                                </Grid>
                            ) : (
                                <>
                                    <Grid size={12}>
                                        <InfoBox
                                            title="Time Rendered"
                                            info={formatTime(viewInfo.total_rendered)}
                                            compact
                                            clean
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <InfoBox
                                            title="Overtime Rendered"
                                            info={formatTime(viewInfo.total_overtime)}
                                            compact
                                            clean
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <InfoBox
                                            title="Late By"
                                            info={formatTime(viewInfo.total_late)}
                                            compact
                                            clean
                                            color={viewInfo.total_late ? "#f44336" : null}
                                        />
                                    </Grid>
                                </>
                            )}
                            {exitReload && (
                                <Grid size={12}>
                                    <Box display="flex" sx={{ alignItems: "center" }}>
                                        <InfoOutlined fontSize="10px" sx={{ color: "text.secondary", mr: 1 }} />
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                            Changes Detected, Reopen panel to view new rendered time summaries.
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                            <Grid size={12}>
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Box display="flex" sx={{ alignItems: "center" }}>
                                    <Typography sx={{ mr: 2 }}>
                                        Logs
                                    </Typography>
                                    <Button variant="contained" color="primary" onClick={handleOpenAddAttendance} >
                                        <p className="m-0">
                                            <i className="fa fa-plus"></i> Add {" "}
                                        </p>
                                    </Button>
                                </Box>
                            </Grid>
                            <Grid size={12}>
                                <TableContainer sx={{ border: "solid 1px #e0e0e0" }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" sx={{ width: "50%" }}>
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
                                                <TableRow
                                                    key={index}
                                                    onClick={() => handleOpenEditAttendance(log)}
                                                    sx={{
                                                        py: 1,
                                                        transition: "background-color 0.3s ease",
                                                        "&:hover": {
                                                            bgcolor: "#f1f1f1",
                                                        }
                                                    }}

                                                >
                                                    <TableCell align="left" >
                                                        <Typography>
                                                            {log.action}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="left" sx={{ pl: 0 }}>
                                                        <Typography>
                                                            {log.timestamp}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                {openAddAttendance && (<AddAttendanceModal open={openAddAttendance} close={handleCloseAddAttendance} employee={employee} fixedDate={viewInfo.date} />)}
                {openEditAttendance && (<EditAttendanceModal open={openEditAttendance} close={handleCloseEditAttendance} date={dayjs(viewInfo.date)} attendanceInfo={loadAttendance} />)}
            </Dialog>
        </>
    );
};

export default AttendanceViewDetails;
