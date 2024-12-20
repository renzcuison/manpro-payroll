import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    Box,
} from "@mui/material";
import PageHead from "../../components/Table/PageHead";
import { getComparator, stableSort } from "../../components/utils/tableUtils";
import Swal from "sweetalert2";
import moment from "moment";
import MemberPayroll from "../../components/Modals/MemberPayroll";

const headCells = [
    { id: "", sortable: true, label: "" },
    { id: "", sortable: true, label: "Date of Payroll" },
    { id: "", sortable: true, label: "Employee Contribution" },
    { id: "", sortable: true, label: "Total Deduction" },
    { id: "", sortable: false, label: "Net Pay" },
    { id: "", sortable: false, label: "Action" },
];

function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "2-digit" };
    const date = new Date(dateString);

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
    ];
    const monthIndex = date.getMonth();
    const monthName = months[monthIndex];

    return (
        monthName + ". " + date.toLocaleDateString("en-US", options).slice(4)
    ); // Use slice(4) to remove the day of the week
}

const MemberPayrollDetails = () => {
    const [count, setCount] = useState(0);
    const [memberPayrollRecord, setMemberPayrollRecord] = useState([]);
    const [openRecord, setOpenRecord] = useState(false);
    const [recordData, setRecordData] = useState([]);
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("calories");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [openPayroll, setOpenPayroll] = useState(false);

    useEffect(() => {
        axiosInstance
            .get("/member_payroll_record", { headers })
            .then((response) => {
                setMemberPayrollRecord(response.data.recordData);
            });
    }, []);

    const handleOpenPayroll = (data) => {
        setOpenRecord(true);
        setRecordData(data);
    };
    const handleClosePayroll = () => {
        setOpenRecord(false);
    };

    // FOR TABLE SORTING DATA ETC..
    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };
    const emptyRows =
        page > 0
            ? Math.max(0, (1 + page) * rowsPerPage - memberPayrollRecord.length)
            : 0;
    // END

    return (
        <Layout>
            <Box sx={{ mx: 12, mt: 4 }}>
                <div className="content-heading d-flex justify-content-between p-0">
                    <h5 className="pt-3">Payroll Details</h5>
                </div>
                <div className="block">
                    <div className=" block-content col-sm-12">
                        <TableContainer sx={{ p: 4 }}>
                            <Table className="table table-md  table-striped  table-vcenter table-bordered">
                                <PageHead
                                    order={order}
                                    orderBy={orderBy}
                                    onRequestSort={handleRequestSort}
                                    headCells={headCells}
                                />
                                <TableBody>
                                    {stableSort(
                                        memberPayrollRecord,
                                        getComparator(order, orderBy)
                                    )
                                        .slice(
                                            page * rowsPerPage,
                                            page * rowsPerPage + rowsPerPage
                                        )
                                        .map((payrollRecord, index) => {
                                            const incrementedCount =
                                                count + index + 1;

                                            return (
                                                <TableRow
                                                    key={index}
                                                    hover
                                                    role="checkbox"
                                                    tabIndex={-1}
                                                >
                                                    <TableCell>
                                                        {incrementedCount}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(
                                                            payrollRecord.payroll_fromdate
                                                        )}{" "}
                                                        -{" "}
                                                        {formatDate(
                                                            payrollRecord.payroll_todate
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            payrollRecord.total_contribution
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            payrollRecord.total_deduction
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {payrollRecord.net_pay}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="border-0 d-flex justify-content-center">
                                                            <button
                                                                className="text-red btn btn-warning btn-sm mr-2"
                                                                data-toggle="modal"
                                                                data-target="#view_attendance"
                                                                onClick={() =>
                                                                    handleOpenPayroll(
                                                                        payrollRecord
                                                                    )
                                                                }
                                                            >
                                                                <i className="fa fa-search"></i>
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    {emptyRows > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <div className="d-flex justify-content-lg-between p-3">
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={memberPayrollRecord.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{
                                    ".MuiTablePagination-actions": {
                                        marginBottom: "20px",
                                    },
                                    ".MuiInputBase-root": {
                                        marginBottom: "20px",
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
                <MemberPayroll
                    open={openRecord}
                    close={handleClosePayroll}
                    data={recordData}
                    type={2}
                />
            </Box>
        </Layout>
    );
};

export default MemberPayrollDetails;
