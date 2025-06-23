import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    CircularProgress,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Grid,
    Divider
} from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import InfoBox from "../../../../components/General/InfoBox";

const AttendanceDateLog = ({ open, close, viewInfo, medScreen }) => {
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
    }, []);

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
                            p: { xs: 0, md: 1 },
                            backgroundColor: "#f8f9fa",
                            boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                            borderRadius: { xs: 0, md: "20px" },
                            minWidth: { xs: "100%", md: "600px" },
                            maxWidth: "650px",
                            marginBottom: "5%",
                        }
                    }
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
                            {" "}Attendance Details{" "}
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
                        <Grid container spacing={2}>
                            <Grid size={12}>
                                <InfoBox
                                    title="Date"
                                    info={dayjs(viewInfo.date).format("MMM DD, YYYY")}
                                    compact={medScreen}
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
                                            compact={medScreen}
                                            clean
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <InfoBox
                                            title="Overtime Rendered"
                                            info={formatTime(viewInfo.total_overtime)}
                                            compact={medScreen}
                                            clean
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <InfoBox
                                            title="Late By"
                                            info={formatTime(viewInfo.total_late)}
                                            compact={medScreen}
                                            clean
                                            color={viewInfo.total_late ? "#f44336" : null}
                                        />
                                    </Grid>
                                </>
                            )}
                            <Grid size={12}>
                                <Divider />
                            </Grid>
                            <Grid size={12}>
                                <Typography sx={{ mr: 2 }}>
                                    Logs
                                </Typography>
                            </Grid>
                            <Grid size={12}>
                                <TableContainer sx={{ border: "solid 1px #e0e0e0", maxHeight: 400 }}>
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
                                                <TableRow key={index}>
                                                    <TableCell align="left">
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
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AttendanceDateLog;
