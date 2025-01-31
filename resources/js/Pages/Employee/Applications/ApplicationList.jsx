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

    // ---------------- Details
    const [isLoading, setIsLoading] = useState(true);
    const [openApplicationForm, setOpenApplicationForm] = useState(false);

    const handleOpenApplicationForm = () => {
        setOpenApplicationForm(true);
    };

    const handleCloseApplicationForm = () => {
        setOpenApplicationForm(false);
    };

    const [applicationList, setApplicationList] = useState([]);
    const [applicationTypes, setApplicationTypes] = useState([]);

    useEffect(() => {
        axiosInstance
            .get(`applications/getMyApplications`, { headers })
            .then((response) => {
                setApplicationList(response.data.applications);
                console.log(response.data.applications);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching application list:", error);
            });
    }, []);

    useEffect(() => {
        axiosInstance
            .get(`applications/getApplicationTypes`, { headers })
            .then((response) => {
                console.log(response.data);
                setApplicationTypes(response.data.types);
                console.log(response.data.types);
            })
            .catch((error) => {
                console.error("Error fetching application types:", error);
            });
    }, []);

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
                                            {applicationList.length > 0 ? (
                                                applicationList.map(
                                                    (log, index) => {
                                                        const typeName =
                                                            applicationTypes.find(
                                                                (type) =>
                                                                    type.id ===
                                                                    log.type_id
                                                            )?.name ||
                                                            "Unknown Type";

                                                        return (
                                                            <TableRow
                                                                key={index}
                                                                sx={{
                                                                    p: 1,
                                                                    backgroundColor:
                                                                        index %
                                                                            2 ===
                                                                        0
                                                                            ? "#f8f8f8"
                                                                            : "#ffffff",
                                                                }}
                                                            >
                                                                <TableCell align="center">
                                                                    {typeName}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {
                                                                        log.created_at
                                                                    }
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {
                                                                        log.duration_start
                                                                    }
                                                                </TableCell>
                                                                <TableCell align="center"></TableCell>
                                                                <TableCell align="center">
                                                                    {log.status}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    }
                                                )
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
                                                        No Applications Found
                                                    </TableCell>
                                                </TableRow>
                                            )}
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
