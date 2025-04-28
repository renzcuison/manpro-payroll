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

import EmployeeAddBenefit from "./EmployeeAddBenefit";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const EmployeeBenefits = ({ open, close, employee }) => {

    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [benefits, setBenefits] = useState([]);

    // ----------- Request Leave Credits
    useEffect(() => {
        getBenefits();
    }, []);


    const getBenefits = () => {
        axiosInstance.get(`/benefits/getEmployeeBenefits`, {
            headers, params: {
                username: employee.user_name
            }
        })
            .then((response) => {
                setBenefits(response.data.benefits);
            })
            .catch((error) => {
                console.error('Error fetching benefits:', error);
            });
    }

    // ----------- Add Benefits Modal
    const [openAddEmployeeBenefit, setOpenEmployeeBenefit] = useState(false);
    const handleOpenAddEmployeeBenefit = () => {
        setOpenEmployeeBenefit(true);
    }
    const handleCloseAddEmployeeBenefit = (reload) => {
        setOpenEmployeeBenefit(false);
        if (reload) {
            getBenefits();
        }
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
                            Employee Benefit
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
                                        <TableCell align="left" sx={{ width: "20%" }}>
                                            Benefit
                                        </TableCell>
                                        <TableCell align="center" sx={{ width: "40%" }}>
                                            Number
                                        </TableCell>
                                        <TableCell align="center" sx={{ width: "40%" }}>
                                            Date Added
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        benefits.length > 0 ? (
                                            benefits.map((benefit, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Typography>
                                                            {benefit.benefit}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography>
                                                            {benefit.number}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography>
                                                            {dayjs(benefit.created_at).format('MMM DD YYYY, HH:mm:ss A')}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))) :
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    align="center"
                                                    sx={{
                                                        color: "text.secondary",
                                                        p: 1,
                                                    }}
                                                >
                                                    No Benefits Found
                                                </TableCell>
                                            </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box display="flex" justifyContent="center" sx={{ mt: '20px', gap: 2 }}>
                            <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={() => handleOpenAddEmployeeBenefit()} >
                                <p className="m-0">
                                    <i className="fa fa-plus"></i>{" "}Add Benefit
                                </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
                {openAddEmployeeBenefit &&
                    <EmployeeAddBenefit
                        open={openAddEmployeeBenefit}
                        close={handleCloseAddEmployeeBenefit}
                        empId={employee.id}
                    />
                }
            </Dialog >
        </>
    );
};

export default EmployeeBenefits;
