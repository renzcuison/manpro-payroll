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

const AttendanceLogs = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [attendanceLogs, setAttendanceLogs] = useState([]);

    useEffect(() => {
        axiosInstance
            .get(`/attendance/getEmployeeAttendanceLogs`, { headers })
            .then((response) => {
                console.log(response.data);
                console.log(response.data.attendances[0]);
                setAttendanceLogs(response.data.attendances);
                setIsLoading(false);
            })
            .catch((error) => {
                // console.error("Error fetching employee:", error);
            });
    }, []);

    return (
        <Layout title={"EmployeesList"}>
            <Box
                sx={{
                    overflowX: "scroll",
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
                            Attendance Logs{" "}
                        </Typography>

                        <Link to="/admin/employees-add">
                            <Button variant="contained" color="primary">
                                <p className="m-0">
                                    <i className="fa fa-plus"></i> Add{" "}
                                </p>
                            </Button>
                        </Link>
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
                                <TableContainer
                                    style={{ overflowX: "auto" }}
                                    sx={{ minHeight: 400 }}
                                >
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">
                                                    Action
                                                </TableCell>
                                                <TableCell align="center">
                                                    Timestamp
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {attendanceLogs.length > 0 ? (
                                                attendanceLogs.map(
                                                    (log, index) => (
                                                        <TableRow
                                                            key={index}
                                                            sx={{
                                                                p: 1,
                                                                backgroundColor:
                                                                    index %
                                                                        2 ===
                                                                    0
                                                                        ? "#f5f5f5"
                                                                        : "#e0e0e0",
                                                            }}
                                                        >
                                                            <TableCell align="left">
                                                                {log.action}
                                                            </TableCell>
                                                            <TableCell align="left">
                                                                {log.timestamp}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={2}
                                                        align="center"
                                                        sx={{
                                                            color: "text.secondary",
                                                            p: 1,
                                                        }}
                                                    >
                                                        No Attendance Data Found
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
        </Layout>
    );
};

export default AttendanceLogs;
