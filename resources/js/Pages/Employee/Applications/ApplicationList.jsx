import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    TextField,
    Stack,
    Grid,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    breadcrumbsClasses,
} from "@mui/material";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import PageHead from "../../../components/Table/PageHead";
import PageToolbar from "../../../components/Table/PageToolbar";
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import {
    getComparator,
    stableSort,
} from "../../../components/utils/tableUtils";

import ApplicationForm from "./Modals/ApplicationForm";

const ApplicationList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    // ---------------- Dates
    const [fromDate, setFromDate] = useState(dayjs());
    const [toDate, setToDate] = useState(dayjs());

    // ---------------- Summary Details
    const [isLoading, setIsLoading] = useState(false);
    const [openApplicationForm, setOpenApplicationForm] = useState(false);

    const handleOpenApplicationForm = () => {
        setOpenApplicationForm(true);
    };

    const handleCloseApplicationForm = () => {
        setOpenApplicationForm(false);
    };

    return (
        <Layout title={"ApplicationList"}>
            <Box
                sx={{
                    overflowX: "auto",
                    width: "100%",
                    whiteSpace: "nowrap",
                }}
            >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "90%" } }}>
                    <Box
                        sx={{
                            mt: 5,
                            display: "flex",
                            justifyContent: "space-between",
                            px: 1,
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {" "}
                            Applications{" "}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenApplicationForm}
                        >
                            <p className="m-0">
                                <i className="fa fa-plus"></i> Create{" "}
                            </p>
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        {isLoading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    minHeight: 200,
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {" "}
                                <TableContainer
                                    style={{ overflowX: "auto" }}
                                    sx={{ minHeight: 400 }}
                                >
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell
                                                    align="center"
                                                    sx={{ width: "20%" }}
                                                >
                                                    Application Type
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{ width: "20%" }}
                                                >
                                                    Date of Application
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{ width: "20%" }}
                                                >
                                                    Date of Effectivity
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{ width: "20%" }}
                                                >
                                                    Duration
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{ width: "20%" }}
                                                >
                                                    Status
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center">
                                                    app_type_data
                                                </TableCell>
                                                <TableCell align="center">
                                                    app_date_data
                                                </TableCell>
                                                <TableCell align="center">
                                                    app_start_data
                                                </TableCell>
                                                <TableCell align="center">
                                                    app_duration_data
                                                </TableCell>
                                                <TableCell align="center">
                                                    app_status_data
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
            {openApplicationForm && (
                <ApplicationForm
                    open={openApplicationForm}
                    close={handleCloseApplicationForm}
                    // employee={employee} onUpdateEmployee={getEmployeeDetails}
                />
            )}
        </Layout>
    );
};

export default ApplicationList;
