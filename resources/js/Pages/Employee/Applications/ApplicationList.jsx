import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Box,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";

import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

import ApplicationForm from "./Modals/ApplicationForm";
import ApplicationDetails from "./Modals/ApplicationDetails";
import ApplicationEdit from "./Modals/ApplicationEdit";

const ApplicationList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

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
    const handleOpenApplicationDetails = (appDetails) => {
        setOpenApplicationDetails(appDetails);
    };
    const handleCloseApplicationDetails = () => {
        setOpenApplicationDetails(null);
    };

    // ---------------- Application Edit
    const [openApplicationEdit, setOpenApplicationEdit] = useState(null);
    const handleEditApplication = (appDetails) => {
        setOpenApplicationEdit(appDetails);
    };
    const handleCloseApplicationEdit = () => {
        setOpenApplicationEdit(null);
    };

    // ---------------- Application List
    const [isLoading, setIsLoading] = useState(true);
    const [applicationList, setApplicationList] = useState([]);
    const [applicationTypes, setApplicationTypes] = useState([]);

    // ---------------- Menu Item
    const [menuStates, setMenuStates] = useState({});
    const handleMenuOpen = (event, id) => {
        setMenuStates((prevStates) => ({
            ...prevStates,
            [id]: {
                ...prevStates[id],
                open: true,
                anchorEl: event.currentTarget,
            },
        }));
    };

    const handleMenuClose = (id) => {
        setMenuStates((prevStates) => ({
            ...prevStates,
            [id]: {
                ...prevStates[id],
                open: false,
                anchorEl: null,
            },
        }));
    };

    // ---------------- Application Cancelling
    const handleCancelApplication = (id) => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Cancel Application?",
            text: "This action cannot be undone",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Cancel",
            confirmButtonColor: "#E9AE20",
            showCancelButton: true,
            cancelButtonText: "No",
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance
                    .get(`applications/cancelApplication/${id}`, {
                        headers,
                    })
                    .then((response) => {
                        document.activeElement.blur();
                        Swal.fire({
                            customClass: { container: "my-swal" },
                            title: "Success!",
                            text: `Your application has been cancelled`,
                            icon: "success",
                            showConfirmButton: true,
                            confirmButtonText: "Okay",
                            confirmButtonColor: "#177604",
                        }).then((res) => {
                            if (res.isConfirmed) {
                                fetchApplicationList();
                            }
                        });
                    })
                    .catch((error) => {
                        console.error("Error cancelling application:", error);
                    });
            }
        });
    };

    // ---------------- Application List
    useEffect(() => {
        fetchApplicationList();
    }, [openApplicationForm, openApplicationEdit]);

    const fetchApplicationList = () => {
        axiosInstance
            .get(`applications/getMyApplications`, { headers })
            .then((response) => {
                setApplicationList(response.data.applications);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching application list:", error);
            });
    };

    // ---------------- Application Types
    useEffect(() => {
        axiosInstance
            .get(`applications/getApplicationTypes`, { headers })
            .then((response) => {
                setApplicationTypes(response.data.types);
            })
            .catch((error) => {
                console.error("Error fetching application types:", error);
            });
    }, []);

    const getDuration = (fromDate, toDate) => {
        const fromDateTime = dayjs(fromDate);
        const toDateTime = dayjs(toDate);
        const duration = dayjs.duration(toDateTime.diff(fromDateTime));

        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();

        let parts = [];
        if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
        if (minutes > 0)
            parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);

        const durationInfo = parts.length > 0 ? parts.join(", ") : "None";

        return durationInfo;
    };

    return (
        <Layout title={"ApplicationList"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap", }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center", }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {" "}Applications{" "}
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

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px", }} >
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
                                                <TableCell align="center" sx={{ width: "19%" }}>
                                                    Application Type
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "19%" }}>
                                                    Date of Application
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "19%" }}>
                                                    Date of Effectivity
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "19%" }}>
                                                    Duration
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "19%" }}>
                                                    Status
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "5%" }}>
                                                    Action
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {applicationList.length > 0 ? (
                                                applicationList.map(
                                                    (application, index) => {
                                                        const typeName =
                                                            applicationTypes.find(
                                                                (type) =>
                                                                    type.id ===
                                                                    application.type_id
                                                            )?.name ||
                                                            "Unknown Type";

                                                        application.type_name = typeName;

                                                        const createDate = dayjs(application.created_at).format("MMM D, YYYY    h:mm A");

                                                        const startDate = dayjs(application.duration_start).format("MMM D, YYYY    h:mm A");

                                                        if (!menuStates[application.id]) {
                                                            menuStates[application.id] = { open: false, anchorEl: null, };
                                                        }

                                                        const duration = getDuration(application.duration_start, application.duration_end);

                                                        return (
                                                            <TableRow
                                                                key={application.id}
                                                                onClick={() => handleOpenApplicationDetails(application)}
                                                                sx={{
                                                                    p: 1,
                                                                    backgroundColor:
                                                                        index % 2 === 0
                                                                            ? "#f8f8f8"
                                                                            : "#ffffff",
                                                                    "&:hover": {
                                                                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                                                                        cursor: "pointer",
                                                                    },
                                                                }}>
                                                                <TableCell align="center">
                                                                    {typeName || "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {createDate || "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {startDate || "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {duration || "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Typography
                                                                        sx={{
                                                                            fontWeight:
                                                                                "bold",
                                                                            color:
                                                                                application.status ===
                                                                                    "Approved"
                                                                                    ? "#177604"
                                                                                    : application.status ===
                                                                                        "Declined"
                                                                                        ? "#f44336"
                                                                                        : application.status ===
                                                                                            "Pending"
                                                                                            ? "#e9ae20"
                                                                                            : application.status ===
                                                                                                "Cancelled"
                                                                                                ? "#f57c00"
                                                                                                : "#000000",
                                                                        }}
                                                                    >
                                                                        {application.status ||
                                                                            "-"}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {application.status ===
                                                                        "Pending" ? (
                                                                        <>
                                                                            <IconButton
                                                                                aria-label="more"
                                                                                aria-controls={menuStates[application.id]?.open
                                                                                    ? `application-menu-${application.id}`
                                                                                    : undefined
                                                                                }
                                                                                aria-haspopup="true"
                                                                                onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    handleMenuOpen(event, application.id);
                                                                                }}>
                                                                                <MoreVert />
                                                                            </IconButton>
                                                                            <Menu id={`application-menu-${application.id}`}
                                                                                anchorEl={menuStates[application.id]?.anchorEl}
                                                                                open={menuStates[application.id]?.open || false}
                                                                                onClose={(event) => {
                                                                                    event.stopPropagation();
                                                                                    handleMenuClose(
                                                                                        application.id
                                                                                    );
                                                                                }}
                                                                                MenuListProps={{
                                                                                    "aria-labelledby": `application-menu-${application.id}`,
                                                                                }}>
                                                                                <MenuItem
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        handleEditApplication(application);
                                                                                        handleMenuClose(application.id);
                                                                                    }}>
                                                                                    Edit
                                                                                </MenuItem>
                                                                                <MenuItem
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        handleCancelApplication(application.id);
                                                                                        handleMenuClose(application.id);
                                                                                    }}>
                                                                                    Cancel
                                                                                </MenuItem>
                                                                            </Menu>
                                                                        </>
                                                                    ) : null}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    }
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={6}
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
                />
            )}
            {openApplicationDetails && (
                <ApplicationDetails
                    open={true}
                    close={handleCloseApplicationDetails}
                    appDetails={openApplicationDetails}
                />
            )}
            {openApplicationEdit && (
                <ApplicationEdit
                    open={true}
                    close={handleCloseApplicationEdit}
                    appDetails={openApplicationEdit}
                />
            )}
        </Layout>
    );
};

export default ApplicationList;
