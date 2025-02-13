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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
import { icon } from "@fortawesome/fontawesome-svg-core";
import LeaveCreditEdit from "./LeaveCreditEdit";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const EmployeeLeaveCredits = ({ open, close, employee }) => {

    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [leaveCredits, setLeaveCredits] = useState([]);

    // ----------- Request Leave Credits
    useEffect(() => {
        axiosInstance.get(`/applications/getLeaveCredits/${employee.id}`, { headers })
            .then((response) => {
                setLeaveCredits(response.data.leave_credits);
            })
            .catch((error) => {
                console.error('Error fetching files:', error);
            });

    }, []);

    // ----------- Edit Leave Credits Modal
    const [openLeaveCreditEdit, setOpenLeaveCreditEdit] = useState(false);
    const [leaveDetails, setLeaveDetails] = useState([]);
    const [editLeave, setEditLeave] = useState(false);

    const handleOpenLeaveCreditEdit = (leaveInfo, action) => {
        setEditLeave(action);
        setLeaveDetails(leaveInfo);
        setOpenLeaveCreditEdit(true);
    }

    const handleCloseLeaveCreditEdit = () => {
        setEditLeave(false);
        setOpenLeaveCreditEdit(null);
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
                            {" "}Leave Credit Information{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ py: 4, mb: 2 }}>
                    <Box>
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
                                                        <IconButton size="small" onClick={() => handleOpenLeaveCreditEdit(leave, true)}>
                                                            <Edit size="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );

                                        })) :
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
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
                        <Box display="flex" justifyContent="center" sx={{ mt: '20px' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleOpenLeaveCreditEdit(null, false)}
                            >
                                <p className="m-0">
                                    <i className="fa fa-plus"></i> Add Leave Credit{" "}
                                </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
                {openLeaveCreditEdit &&
                    <LeaveCreditEdit
                        open={openLeaveCreditEdit}
                        close={handleCloseLeaveCreditEdit}
                        leaveDetails={leaveDetails}
                        editLeave={editLeave}
                    />
                }
            </Dialog >
        </>
    );
};

export default EmployeeLeaveCredits;
