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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

import ApplicationForm from "./Modals/ApplicationForm";
import ApplicationDetails from "./Modals/ApplicationDetails";

const ApplicationList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    // ---------------- Dates
    const [fromDate, setFromDate] = useState(dayjs());
    const [toDate, setToDate] = useState(dayjs());

    // ---------------- Application Form
    const [openApplicationForm, setOpenApplicationForm] = useState(false);
    const handleOpenApplicationForm = () => {
        setOpenApplicationForm(true);
    };
    const handleCloseApplicationForm = () => {
        setOpenApplicationForm(false);
    };

    // ---------------- Application Details
    const [openApplicationDetails, setOpenApplicationDetails] = useState(null);
    const handleOpenApplicationDetails = (id) => {
        setOpenApplicationDetails(id);
    };
    const handleCloseApplicationDetails = () => {
        setOpenApplicationDetails(null);
    };

    // ---------------- Application List
    const [isLoading, setIsLoading] = useState(true);
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
    }, [openApplicationForm]);

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

    const getDuration = (fromDate, toDate) => {
        const fromDateTime = dayjs(fromDate);
        const toDateTime = dayjs(toDate);
        const duration = toDateTime.diff(fromDateTime);
        const totalMinutes = Math.floor(duration / 60000);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);

        const remainingMinutes = totalMinutes % 60;
        const remainingHours = totalHours % 24;

        let durationInfo = "";

        if (totalDays > 0) {
            durationInfo += `${totalDays} day${totalDays > 1 ? "s" : ""}`;
            if (remainingHours > 0 || remainingMinutes > 0)
                durationInfo += ", ";
        }
        if (remainingHours > 0) {
            durationInfo += `${remainingHours} hour${
                remainingHours > 1 ? "s" : ""
            }`;
            if (remainingMinutes > 0) durationInfo += ", ";
        }
        if (remainingMinutes > 0) {
            durationInfo += `${remainingMinutes} minute${
                remainingMinutes > 1 ? "s" : ""
            }`;
        }
        if (duration == 0) {
            durationInfo += `None`;
        }
        return durationInfo;
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

                                                        const createDate =
                                                            dayjs(
                                                                log.created_at
                                                            ).format(
                                                                "MMM D, YYYY    h:mm A"
                                                            );

                                                        const startDate = dayjs(
                                                            log.duration_start
                                                        ).format(
                                                            "MMM D, YYYY    h:mm A"
                                                        );

                                                        const duration =
                                                            getDuration(
                                                                log.duration_start,
                                                                log.duration_end
                                                            );

                                                        return (
                                                            <TableRow
                                                                key={index}
                                                                onClick={() =>
                                                                    handleOpenApplicationDetails(
                                                                        log.id
                                                                    )
                                                                }
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
                                                                    {createDate}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {startDate}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {duration}
                                                                </TableCell>
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
            {openApplicationDetails && (
                <ApplicationDetails
                    open={true}
                    close={handleCloseApplicationDetails}
                    id={openApplicationDetails}
                    // employee={employee} onUpdateEmployee={getEmployeeDetails}
                />
            )}
        </Layout>
    );
};

export default ApplicationList;
