import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, CircularProgress, } from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import PageHead from "../../../components/Table/PageHead";
import PageToolbar from "../../../components/Table/PageToolbar";
import { getComparator, stableSort } from "../../../components/utils/tableUtils";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

import OvertimeManage from "./Modals/OvertimeManage";

const headCells = [
    { id: "time_in", label: "Date", sortable: true },
    { id: "emp_name", label: "Employee", sortable: true },
    { id: "time_in", label: "Time In", sortable: false },
    { id: "time_out", label: "Time Out", sortable: false },
    { id: "status", label: "Status", sortable: false },
];

const OvertimeAppsList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);
    const [overtimes, setOvertimes] = useState([]);

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("emp_name");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openOvertimeManage, setOpenOvertimeManage] = useState(false);
    const [loadOvertime, setLoadOvertime] = useState(null);

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

    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenOvertimeManage = (overtime) => {
        setLoadOvertime(overtime);
        setOpenOvertimeManage(true);
    };

    const handleCloseOvertimeManage = (reload) => {
        setOpenOvertimeManage(false);
        if (reload) {
            fetchOvertime();
        }
    };

    return (
        <Layout title={"ApplicationsList"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Overtime Applications
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px" }}>
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: "auto" }} sx={{ minHeight: 400 }}>
                                    <Table>
                                        <PageHead
                                            order={order}
                                            orderBy={orderBy}
                                            onRequestSort={handleRequestSort}
                                            headCells={headCells}
                                        />
                                        <TableBody>
                                            {overtimes.length > 0 ? (
                                                stableSort(overtimes, getComparator(order, orderBy))
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((overtime, index) => (
                                                        <TableRow
                                                            key={overtime.id}
                                                            onClick={() => handleOpenOvertimeManage(overtime)}
                                                            sx={{ p: 1, backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff", "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer" } }}
                                                        >
                                                            <TableCell>{dayjs(overtime.time_in).format("MMMM D, YYYY")}</TableCell>
                                                            <TableCell>{overtime.emp_name}</TableCell>
                                                            <TableCell>{dayjs(overtime.time_in).format("hh:mm:ss A")}</TableCell>
                                                            <TableCell>{dayjs(overtime.time_out).format("hh:mm:ss A")}</TableCell>
                                                            <TableCell>{overtime.status}</TableCell>
                                                        </TableRow>
                                                    ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ color: "text.secondary", p: 1 }}>
                                                        No Applications Found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={overtimes.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    sx={{
                                        ".MuiTablePagination-actions": { mb: 2 },
                                        ".MuiInputBase-root": { mb: 2 },
                                        bgcolor: "#ffffff",
                                        borderRadius: "8px",
                                    }}
                                />
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
