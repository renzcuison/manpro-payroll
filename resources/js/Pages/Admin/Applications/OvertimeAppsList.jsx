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
} from "@mui/material";
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
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

import OvertimeManage from "./Modals/OvertimeManage";

const OvertimeAppsList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [overtimes, setOvertimes] = useState([]);

    // ---------------- Application List'
    useEffect(() => {
        fetchOvertime();
    }, []);

    const fetchOvertime = () => {
        setIsLoading(true);
        axiosInstance
            .get("/applications/getOvertimeApplications", { headers })
            .then((response) => {
                setOvertimes(response.data.applications);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching applications:", error);
                setIsLoading(false);
            });
    };

    // Overtime Details
    const [openOvertimeManage, setOpenOvertimeManage] = useState(false);
    const [loadOvertime, setLoadOvertime] = useState(null);
    const handleOpenOvertimeManage = (overtime) => {
        setLoadOvertime(overtime);
        setOpenOvertimeManage(true);
    }
    const handleCloseOvertimeManage = (reload) => {
        setOpenOvertimeManage(false);
        if (reload) {
            fetchOvertime();
        }
    }

    return (
        <Layout title={"ApplicationsList"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap", }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center", }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {" "}Overtime Applications{" "}
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px", }} >
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200, }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: "auto" }} sx={{ minHeight: 400 }} >
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" sx={{ width: "40%" }} >
                                                    Employee
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "20%" }} >
                                                    Date
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "20%" }} >
                                                    Time In
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "20%" }} >
                                                    Time Out
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>{
                                            overtimes.length > 0 ? (overtimes.map(
                                                (overtime, index) => (
                                                    <TableRow
                                                        key={overtime.id}
                                                        onClick={() => handleOpenOvertimeManage(overtime)}
                                                        sx={{
                                                            p: 1,
                                                            backgroundColor:
                                                                index % 2 === 0
                                                                    ? "#f8f8f8"
                                                                    : "#ffffff",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "rgba(0, 0, 0, 0.1)",
                                                                cursor: "pointer",
                                                            },
                                                        }}
                                                    >
                                                        <TableCell align="left">
                                                            {" "}
                                                            {overtime.emp_first_name}{" "}
                                                            {overtime.emp_middle_name || ""}{" "}
                                                            {overtime.emp_last_name}{" "}
                                                            {overtime.emp_suffix || ""}{" "}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {dayjs(overtime.time_in).format('MMMM D, YYYY')}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {dayjs(overtime.time_in).format('hh:mm:ss A')}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {dayjs(overtime.time_out).format('hh:mm:ss A')}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )) : <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    align="center"
                                                    sx={{
                                                        color: "text.secondary",
                                                        p: 1,
                                                    }}
                                                >
                                                    No Applications Found
                                                </TableCell>
                                            </TableRow>}

                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
            {openOvertimeManage && (
                <OvertimeManage
                    open={openOvertimeManage}
                    close={handleCloseOvertimeManage}
                    overtime={loadOvertime}
                />
            )}
        </Layout>
    );
};

export default OvertimeAppsList;
