import React, { useState } from "react";
import AccountingLayout from "../../Layouts/AccountingLayouts/AccountingLayout";
import { useDashboard } from "./hooks/useDashboard";
import {
    Backdrop,
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TablePagination,
    TableHead,
    TableRow,
    TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import { Button, Card, Col, Row } from "reactstrap";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptIcon from "@mui/icons-material/Receipt";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { useTransactions } from "./hooks/useTransactions";
import Paper from "@mui/material/Paper";
import Moment from "react-moment";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import CustomModal from "./components/CustomModal";
import TransactionModal from "./components/TransactionModal";

function createData(
    settleId,
    contact,
    date,
    remittance,
    service,
    phase,
    paymentName,
    initialAmount,
    rate,
    client_rate,
    status,
    accountType
) {
    const contactName =
        contact.contact_fname +
        " " +
        contact.contact_mname +
        " " +
        contact.contact_lname;
    const convertedAmount = initialAmount * rate;
    const clientAmount = initialAmount * client_rate;
    const serviceName = service.space_name;
    const tranStatus =
        accountType == 1 ? "Liability" : accountType == 2 ? "Gross" : "Paid";
    return {
        settleId,
        contactName,
        date,
        remittance,
        serviceName,
        phase,
        paymentName,
        initialAmount,
        rate,
        convertedAmount,
        clientAmount,
        tranStatus,
    };
}
function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === "rtl" ? (
                    <LastPageIcon />
                ) : (
                    <FirstPageIcon />
                )}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === "rtl" ? (
                    <KeyboardArrowRight />
                ) : (
                    <KeyboardArrowLeft />
                )}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === "rtl" ? (
                    <KeyboardArrowLeft />
                ) : (
                    <KeyboardArrowRight />
                )}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === "rtl" ? (
                    <FirstPageIcon />
                ) : (
                    <LastPageIcon />
                )}
            </IconButton>
        </Box>
    );
}
TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

function Sales() {
    const { data, isFetching, isFetched } = useDashboard();
    const { data: transactions, isFetching: isTransactionsFetching } =
        useTransactions();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const toggleModal = () => setOpen(!open);

    console.log(transactions);
    const transctionRows = transactions
        ?.map((tran, index) =>
            createData(
                tran.settle_id,
                tran.task.client,
                tran.date_created,
                "remittance",
                tran.finance_phase.space,
                tran.finance_phase.phase_name,
                tran.finance_field.finance_name,
                tran.settle_amount,
                tran.rate,
                tran.client_rate,
                tran.status,
                tran.account_type
            )
        )
        .sort((a, b) => (a.contactName < b.contactName ? -1 : 1));

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0
            ? Math.max(0, (1 + page) * rowsPerPage - transctionRows?.length)
            : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // transaction table search
    const filteredRows = transctionRows?.filter(
        (row) =>
            row.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.phase.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.paymentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // handle view button click
    const handleViewButton = (transactionData) => {
        setSelectedRowData(transactionData);
        toggleModal();
    };

    return (
        <AccountingLayout>
            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={isFetching || isTransactionsFetching}
            >
                <CircularProgress color="success" />
            </Backdrop>

            <Row>
                <Col sm={6} xl={3}>
                    <Card
                        body
                        style={{
                            backgroundColor: "white",
                            padding: 20,
                        }}
                    >
                        <div className="float-right mt-15 d-none d-sm-block">
                            <AccountBalanceWalletIcon fontSize="large" />
                        </div>
                        <div className="font-size-h4 font-w600 text-primary">
                            {data?.transaction_count}
                        </div>
                        <div className="font-size-xs font-w600 text-uppercase text-muted">
                            Total Transactions
                        </div>
                    </Card>
                </Col>
                <Col sm={6} xl={3}>
                    <Card
                        body
                        style={{
                            backgroundColor: "white",
                            padding: 20,
                        }}
                    >
                        <div className="float-right mt-15 d-none d-sm-block">
                            <AccountBalanceWalletIcon fontSize="large" />
                        </div>
                        <div className="font-size-h4 font-w600 text-primary">
                            {data?.totals[0].value.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                            })}
                        </div>
                        <div className="font-size-xs font-w600 text-uppercase text-muted">
                            Total Income
                        </div>
                    </Card>
                </Col>
                <Col sm={6} xl={3}>
                    <Card
                        body
                        style={{
                            backgroundColor: "white",
                            padding: 20,
                        }}
                    >
                        <div className="float-right mt-15 d-none d-sm-block">
                            <AccountBalanceWalletIcon fontSize="large" />
                        </div>
                        <div className="font-size-h4 font-w600 text-primary">
                            {data?.totals[2].value.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                            })}
                        </div>
                        <div className="font-size-xs font-w600 text-uppercase text-muted">
                            Liabilities
                        </div>
                    </Card>
                </Col>
                <Col sm={6} xl={3}>
                    <Card
                        body
                        style={{
                            backgroundColor: "white",
                            padding: 20,
                        }}
                    >
                        <div className="float-right mt-15 d-none d-sm-block">
                            <AccountBalanceWalletIcon fontSize="large" />
                        </div>
                        <div className="font-size-h4 font-w600 text-primary">
                            {data?.gross.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                            })}
                        </div>
                        <div className="font-size-xs font-w600 text-uppercase text-muted">
                            Gross Income
                        </div>
                    </Card>
                </Col>
            </Row>
            <Box>
                <TextField
                    label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    margin="normal"
                    size="small"
                    variant="outlined"
                    sx={{ float: "right" }}
                />
                <TableContainer component={Paper}>
                    <Table
                        sx={{ minWidth: 650 }}
                        size="small"
                        aria-label="transactions table"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>Contact</TableCell>
                                <TableCell align="right">Date</TableCell>
                                <TableCell align="center">Remittance</TableCell>
                                <TableCell align="center">Service</TableCell>
                                <TableCell align="center">Phase</TableCell>
                                <TableCell align="center">
                                    Payment name
                                </TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell align="right">Rate</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell align="right">
                                    Client Amount
                                </TableCell>
                                <TableCell align="right">Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!isTransactionsFetching &&
                                (rowsPerPage > 0
                                    ? filteredRows.slice(
                                          page * rowsPerPage,
                                          page * rowsPerPage + rowsPerPage
                                      )
                                    : filteredRows
                                ).map((row, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            "&:last-child td, &:last-child th":
                                                {
                                                    border: 0,
                                                },
                                        }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.contactName}
                                        </TableCell>
                                        <TableCell align="left">
                                            <Moment format="YYYY/MM/DD">
                                                {row.date}
                                            </Moment>
                                        </TableCell>
                                        <TableCell align="center">
                                            {row.remittance}
                                        </TableCell>
                                        <TableCell align="center">
                                            {row.serviceName}
                                        </TableCell>
                                        <TableCell align="center">
                                            {row.phase}
                                        </TableCell>
                                        <TableCell align="center">
                                            {row.paymentName}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.initialAmount}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.rate}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.convertedAmount}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.clientAmount}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.tranStatus}
                                        </TableCell>
                                        <TableCell align="left">
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleViewButton(row)
                                                }
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={12} />
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                {!isTransactionsFetching && (
                                    <TablePagination
                                        rowsPerPageOptions={[
                                            10,
                                            15,
                                            30,
                                            { label: "All", value: -1 },
                                        ]}
                                        colSpan={12}
                                        count={filteredRows?.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        SelectProps={{
                                            inputProps: {
                                                "aria-label": "rows per page",
                                            },
                                            native: true,
                                        }}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={
                                            handleChangeRowsPerPage
                                        }
                                        ActionsComponent={
                                            TablePaginationActions
                                        }
                                    />
                                )}
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </Box>
            <TransactionModal
                open={open}
                toggleModal={toggleModal}
                data={selectedRowData}
            />
        </AccountingLayout>
    );
}

export default Sales;
