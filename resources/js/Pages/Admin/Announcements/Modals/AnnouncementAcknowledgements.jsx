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

const AnnouncementAcknowledgements = ({ open, close, uniCode }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [acknowledgements, setAcknowledgements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axiosInstance
            .get(`announcements/getAcknowledgements/${uniCode}`, {
                headers
            })
            .then((response) => {
                setAcknowledgements(response.data.acknowledgements);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching acknowledgements:", error);
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
                        minWidth: { xs: "100%", sm: "500px" },
                        maxWidth: "560px",
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
                            {" "}Acknowledgements{" "}
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
                                                Employee
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
                                    {acknowledgements.map((ack, index) => (
                                        <TableRow key={index}>
                                            <TableCell align="left" sx={{ pl: 0 }}>
                                                {" "}
                                                {ack.emp_first_name}{" "}
                                                {ack.emp_middle_name || ""}{" "}
                                                {ack.emp_last_name}{" "}
                                                {ack.emp_suffix || ""}{" "}
                                            </TableCell>
                                            <TableCell align="left" sx={{ pl: 0 }}>
                                                {dayjs(ack.timestamp).format("YYYY-DD-MM HH:mm:ss")}
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

export default AnnouncementAcknowledgements;
