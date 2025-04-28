import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Typography, TableContainer, TableHead, TableBody, TableRow, TableCell, Table } from "@mui/material";
import { Edit } from "@mui/icons-material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

import LeaveCreditAdd from "../Modals/LeaveCreditAdd";
import LeaveCreditEdit from "../Modals/LeaveCreditEdit";

import dayjs from "dayjs";
import Swal from "sweetalert2";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const LeaveCreditView = ({ open, close, userName }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [employee, setEmployee] = useState([]);
    const [leaveCredits, setLeaveCredits] = useState([]);
    const [leaveCreditLogs, setLeaveCreditLogs] = useState([]);
    const [logsView, setLogsView] = useState(false);

    // ----------- Request Leave Credits
    useEffect(() => {
        getEmployeeDetails();
        getLeaveCredits();
        getLeaveCreditLogs();
    }, []);

    const getEmployeeDetails = () => {
        const data = { username: userName };

        axiosInstance.get(`/employee/getEmployeeDetails`, { params: data, headers })
            .then((response) => {
                setEmployee(response.data.employee);
            }).catch((error) => {
                console.error('Error fetching employee:', error);
            });
    };

    const getLeaveCredits = () => {
        axiosInstance.get(`/applications/getLeaveCredits/${userName}`, { headers })
            .then((response) => {
                setLeaveCredits(response.data.leave_credits);
            })
            .catch((error) => {
                console.error('Error fetching credits:', error);
            });
    };

    const getLeaveCreditLogs = () => {
        axiosInstance.get(`/applications/getLeaveCreditLogs/${userName}`, { headers })
            .then((response) => {
                setLeaveCreditLogs(response.data.logs);
            })
            .catch((error) => {
                console.error('Error fetching logs:', error);
            });
    };

    // ----------- Edit Leave Credits Modal
    const [openEditLeaveCredit, setOpenEditLeaveCredit] = useState(false);
    const [leaveData, setLeaveData] = useState(null);

    const handleOpenEditLeaveCredit = (leaveInfo) => {
        setLeaveData(leaveInfo);
        setOpenEditLeaveCredit(true);
    };

    const handleCloseEditLeaveCredit = () => {
        setOpenEditLeaveCredit(false);
        getLeaveCredits();
        getLeaveCreditLogs();
    };

    // ----------- Add Leave Credits Modal
    const [openAddLeaveCredit, setOpenAddLeaveCredit] = useState(false);

    const handleOpenAddLeaveCredit = () => {
        setOpenAddLeaveCredit(true);
    };

    const handleCloseAddLeaveCredit = () => {
        setOpenAddLeaveCredit(false);
        getLeaveCredits();
        getLeaveCreditLogs();
    };

    const handleDeleteLeaveCredit = (leaveInfo) => {
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Delete Leave Credit",
            text: "Are you sure you want to delete this?",
            icon: "warning",
            showConfirmButton: true,
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                deleteLeaveCredit(leaveInfo.id)
            }
        });
    };

    const deleteLeaveCredit = (leaveCredit) => {
        const data = { leaveCredit: leaveCredit };

        axiosInstance.post('/applications/deleteLeaveCredits', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    document.activeElement.blur();
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Leave Credits edited successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        getLeaveCredits();
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"
                PaperProps={{
                    style: { padding: "16px", backgroundColor: "#f8f9fa", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", borderRadius: "20px", maxHeight: "600px", minWidth: { xs: "100%", sm: "750px" }, maxWidth: "800px", marginBottom: "5%" },
                }}
            >
                <DialogTitle sx={{ padding: 2, paddingBottom: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: "bold" }}>
                            {`${logsView ? "Leave Credit Logs" : "Employee Leave Credit"}`}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 4 }}>

                    <Box sx={{ mb: 2, textAlign: 'left' }}>
                        <Typography variant="body1">
                            <strong>Employee Name:</strong> {employee.last_name}, {employee.first_name} {employee.middle_name || ''} {employee.suffix || ''}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Branch:</strong> {employee.branch || '-'}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Department:</strong> {employee.department || '-'}
                        </Typography>
                    </Box>

                    <Box>
                        {logsView ? (
                            <>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" sx={{ width: "25%" }}> Timestamp </TableCell>
                                                <TableCell align="center" sx={{ width: "75%" }}> Action </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {leaveCreditLogs.length > 0 ? (
                                                leaveCreditLogs.map((log, index) => (
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
                                                ))
                                            ) : (
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
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box display="flex" justifyContent="center" sx={{ mt: '20px', gap: 2 }}>
                                    <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={() => setLogsView(false)}>
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
                                                <TableCell align="left" sx={{ width: "40%" }}> Type </TableCell>
                                                <TableCell align="center" sx={{ width: "15%" }}> Credits </TableCell>
                                                <TableCell align="center" sx={{ width: "15%" }}> Used </TableCell>
                                                <TableCell align="center" sx={{ width: "15%" }}> Remaining </TableCell>
                                                <TableCell align="center" sx={{ width: "15%" }}> Actions </TableCell>
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
                                                                <Typography>{leave.app_type_name}</Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Typography>{leave.credit_number}</Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Typography>{leave.credit_used}</Typography>
                                                            </TableCell>
                                                            <TableCell align="center" sx={{ color: remainingEmpty ? "#f44336" : remainingWarning ? "#e9ae20" : null }}>
                                                                <Typography> {remainingCredits} </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <IconButton size="small" onClick={() => handleOpenEditLeaveCredit(leave)}> <Edit size="small" /> </IconButton>
                                                                <IconButton size="small" onClick={() => handleDeleteLeaveCredit(leave)}> <DeleteOutlineIcon size="small" /> </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1 }} >
                                                        No Leave Credits Found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Box display="flex" justifyContent="center" sx={{ mt: '20px', gap: 2 }}>
                                    <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={() => handleOpenAddLeaveCredit()}>
                                        <p className="m-0">
                                            <i className="fa fa-plus"></i>{" "}Add Leave Credit
                                        </p>
                                    </Button>
                                    <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={() => setLogsView(true)}>
                                        <p className="m-0">
                                            <i className="fa fa-list"></i>{" "}View Logs
                                        </p>
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </DialogContent>

                {openEditLeaveCredit && (
                    <LeaveCreditEdit open={openEditLeaveCredit} close={handleCloseEditLeaveCredit} leaveData={leaveData} />
                )}
                {openAddLeaveCredit && (
                    <LeaveCreditAdd open={openAddLeaveCredit} close={handleCloseAddLeaveCredit} empId={userName} />
                )}
            </Dialog>
        </>
    );
};

export default LeaveCreditView;