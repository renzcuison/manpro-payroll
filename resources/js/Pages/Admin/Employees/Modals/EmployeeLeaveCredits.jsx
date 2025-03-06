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
    Divider,
    Stack,
    Tooltip,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Table,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import LeaveCreditAdd from "./LeaveCreditAdd";
import LeaveCreditEdit from "./LeaveCreditEdit";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const EmployeeLeaveCredits = ({ open, close, employee }) => {

    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [leaveCredits, setLeaveCredits] = useState([]);
    const [leaveCreditLogs, setLeaveCreditLogs] = useState([]);
    const [logsView, setLogsView] = useState(false);

    // ----------- Request Leave Credits
    useEffect(() => {
        getLeaveCredits();
        getLeaveCreditLogs();
    }, []);

    const getLeaveCredits = () => {
        axiosInstance.get(`/applications/getLeaveCredits/${employee.id}`, { headers })
            .then((response) => {
                setLeaveCredits(response.data.leave_credits);
            })
            .catch((error) => {
                console.error('Error fetching credits:', error);
            });
    }

    const getLeaveCreditLogs = () => {
        axiosInstance.get(`/applications/getLeaveCreditLogs/${employee.id}`, { headers })
            .then((response) => {
                setLeaveCreditLogs(response.data.logs);
            })
            .catch((error) => {
                console.error('Error fetching logs:', error);
            });
    }

    // ----------- Edit Leave Credits Modal
    const [openEditLeaveCredit, setOpenEditLeaveCredit] = useState(false);
    const [leaveData, setLeaveData] = useState(null);

    const handleOpenEditLeaveCredit = (leaveInfo) => {
        setLeaveData(leaveInfo);
        setOpenEditLeaveCredit(true);
    }

    const handleCloseEditLeaveCredit = () => {
        setOpenEditLeaveCredit(false);
        getLeaveCredits();
        getLeaveCreditLogs();
    }

    // ----------- Edit Leave Credits Modal
    const [openAddLeaveCredit, setOpenAddLeaveCredit] = useState(false);

    const handleOpenAddLeaveCredit = () => {
        setOpenAddLeaveCredit(true);
    }

    const handleCloseAddLeaveCredit = () => {
        setOpenAddLeaveCredit(false);
        getLeaveCredits();
        getLeaveCreditLogs();
    }

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        padding: "16px",
                        backgroundColor: "#f8f9fa",
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        maxHeight: "600px",
                        minWidth: { xs: "100%", sm: "750px" },
                        maxWidth: "800px",
                        marginBottom: "5%",
                    },
                }}
            >
                <DialogTitle sx={{ padding: 2, paddingBottom: 3 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: "bold" }}>
                            {`Leave Credit ${logsView ? "Logs" : "Details"}`}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ py: 4, mb: 2 }}>
                    <Box>
                        {logsView ? (
                            <>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" sx={{ width: "25%" }}>
                                                    Timestamp
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "75%" }}>
                                                    Action
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {leaveCreditLogs.length > 0 ? (
                                                leaveCreditLogs.map((log, index) => {
                                                    return (
                                                        <TableRow key={index}>
                                                            <TableCell align="left">
                                                                <Typography>
                                                                    {dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss')}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="left">
                                                                <Typography>
                                                                    {`${log.username} ${log.action}`}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    );

                                                })) :
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        align="center"
                                                        sx={{
                                                            color: "text.secondary",
                                                            p: 1,
                                                        }}
                                                    >
                                                        No Leave Credits Found
                                                    </TableCell>
                                                </TableRow>
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box display="flex" justifyContent="center" sx={{ mt: '20px', gap: 2 }}>
                                    <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={() => setLogsView(false)} >
                                        <p className="m-0">
                                            <i className="fa fa-list"></i>{" "}View Credits
                                        </p>
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" sx={{ width: "40%" }}>
                                                    Type
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "15%" }}>
                                                    Credits
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "15%" }}>
                                                    Used
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "15%" }}>
                                                    Remaining
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "15%" }}>
                                                    Edit
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {leaveCredits.length > 0 ? (
                                                leaveCredits.map((leave, index) => {

                                                    const remainingCredits = leave.credit_number - leave.credit_used;
                                                    const remainingWarning = remainingCredits < ((leave.credit_number / 3) * 2);
                                                    const remainingEmpty = remainingCredits < (leave.credit_number / 3);

                                                    return (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <Typography>
                                                                    {leave.app_type_name}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Typography>
                                                                    {leave.credit_number}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Typography>
                                                                    {leave.credit_used}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center" sx={{
                                                                color: remainingEmpty ? "#f44336" : remainingWarning ? "#e9ae20" : null
                                                            }}>
                                                                <Typography>
                                                                    {remainingCredits}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <IconButton size="small" onClick={() => handleOpenEditLeaveCredit(leave)}>
                                                                    <Edit size="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    );

                                                })) :
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        align="center"
                                                        sx={{
                                                            color: "text.secondary",
                                                            p: 1,
                                                        }}
                                                    >
                                                        No Leave Credits Found
                                                    </TableCell>
                                                </TableRow>
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box display="flex" justifyContent="center" sx={{ mt: '20px', gap: 2 }}>
                                    <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={() => handleOpenAddLeaveCredit()} >
                                        <p className="m-0">
                                            <i className="fa fa-plus"></i>{" "}Add Leave Credit
                                        </p>
                                    </Button>
                                    <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={() => setLogsView(true)} >
                                        <p className="m-0">
                                            <i className="fa fa-list"></i>{" "}View Logs
                                        </p>
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </DialogContent>
                {openEditLeaveCredit &&
                    <LeaveCreditEdit
                        open={openEditLeaveCredit}
                        close={handleCloseEditLeaveCredit}
                        leaveData={leaveData}
                    />
                }
                {openAddLeaveCredit &&
                    <LeaveCreditAdd
                        open={openAddLeaveCredit}
                        close={handleCloseAddLeaveCredit}
                        empId={employee.id}
                    />
                }
            </Dialog >
        </>
    );
};

export default EmployeeLeaveCredits;
