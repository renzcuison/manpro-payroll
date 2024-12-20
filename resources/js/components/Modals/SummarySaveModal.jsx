import React, { useRef } from "react";
import { Typography, IconButton, Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer, TableRow, Box, TableHead, Grid, } from "@mui/material";
import HomeLogo from "../../../images/ManPro.png";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import "../../../../resources/css/profile.css";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import { makeStyles } from "@mui/styles";
import Currency from "react-currency-formatter";

const useStyles = makeStyles({
    topScrollPaper: {alignItems: "flex-start"},
    topPaperScrollBody: {verticalAlign: "top"},
});

const SummarySaveModal = ({
    open,
    data,
    close,
    cutoff,
    from,
    to,
    year,
    totalMonthly,
    totalOT,
    totalIncentive,
    totalAllowance,
    totalAbsences,
    totalTardiness,
    totalUndertime,
    totalGross,
    totalSSSEmps,
    totalSSSEmpr,
    totalPhilEmps,
    totalPhilEmpr,
    totalPGIBIGEmps,
    totalPGIBIGEmpr,
    totalInsuranceEmps,
    totalInsuranceEmpr,
    totalTax,
    totalCashAdv,
    totalLoan,
    totalAdvDeduct,
    totalDeduction,
    totalNetpay,
    totalBonus,
    checked,
}) => {
    const classes = useStyles();
    const contentToPrint = useRef();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const handleToPrint = useReactToPrint({
        content: () => contentToPrint.current,
        onAfterPrint: () => {
            close();
        },
    });

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="xl"
            scroll="paper"
            classes={{
                scrollPaper: classes.topScrollPaper,
                paperScrollBody: classes.topPaperScrollBody,
            }}
        >
            <DialogContent>
                <DialogTitle className="d-flex justify-content-end">
                    <IconButton sx={{ color: "red" }} onClick={close}>
                        <i className="si si-close"></i>
                    </IconButton>
                </DialogTitle>
                <Box
                    component="div"
                    className="payroll_details px-2"
                    ref={contentToPrint}
                    sx={{
                        "@media print": {
                            "@page": { size: "12in 11in" },
                        },
                    }}
                >
                    <div>
                        <img
                            className="logoNasya d-flex justify-content-center"
                            src={HomeLogo}
                            style={{ height: 70, width: 200, margin: "0 auto", display: "block", marginTop: "30px" }}
                        />
                        <Typography className="text-center" sx={{ marginTop: "5px" }}></Typography>
                        <Typography className="text-center" sx={{ marginBottom: "10px" }}>
                            ({moment(from).format("MMMM DD") + " - " + moment(to).format("MMMM DD") + ", " + year})
                        </Typography>
                    </div>
                    <Box component="div" className="p-10">
                        <TableContainer>
                            <Table className="table table-sm  table-striped  table-bordered">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ verticalAlign: "top", textAlign: "left" }} rowSpan={3} >
                                            Employee Name
                                        </TableCell>
                                        {checked.hours_monthly_rate && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} colSpan={2}>
                                                    Monthly Base
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.ot_hours_ot_pay && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} colSpan={2}>
                                                    Overtime / Paid Leave
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.absences_tardiness_undertime && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} colSpan={3} >
                                                    Deduction
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.earnings && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={3} >
                                                    Gross Pay
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.benefits && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} colSpan={6} >
                                                    Statutory Benefits
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.other && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} colSpan={4} >
                                                    Other Benefits
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.taxable && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={3} >
                                                    Taxable Pay
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.exempt && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={3} >
                                                    Exempt Pay
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.tax && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} >
                                                    Tax
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.amountTotal && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} >
                                                    Advance
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.loan_advance && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} colSpan={2} >
                                                    Other Deduction
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.net_pay && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={3} >
                                                    Net Pay
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.bonus && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} >
                                                    Bonus
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>

                                    <TableRow sx={{ borderTop: 1, borderColor: "#e4e7ed" }}>
                                        {checked.hours_monthly_rate && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    Hours
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    Pay
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.ot_hours_ot_pay && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    Hours
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    Pay
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.absences_tardiness_undertime && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    Absences
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    Tardiness
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    Undertime
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.benefits && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} colSpan={2} >
                                                    SSS
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} colSpan={2} >
                                                    Philhealth
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} colSpan={2} >
                                                    Pagibig
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.other && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} colSpan={2} >
                                                    Insurance
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    13th Month Pay
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    Leave Credit
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.tax && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    BIR
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.amountTotal && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    Cash Advance
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.loan_advance && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    Loan
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    Advance
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.bonus && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} rowSpan={2} >
                                                    13th Month Pay
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>

                                    <TableRow sx={{ borderTop: 1, borderColor: "#e4e7ed" }} >
                                        {checked.benefits && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} >
                                                    Employer Share
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} >
                                                    Employee Share
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} >
                                                    Employer Share
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} >
                                                    Employee Share
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} >
                                                    Employer Share
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} >
                                                    Employee Share
                                                </TableCell>
                                            </>
                                        )}
                                        
                                        {checked.other && (
                                            <>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} >
                                                    Employer Share
                                                </TableCell>
                                                <TableCell style={{ verticalAlign: "top", textAlign: "center" }} >
                                                    Employee Share
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {data.map((payrollList, index) => {
                                        return (
                                            <TableRow key={index} hover tabIndex={-1} >
                                                <TableCell>
                                                    <Typography variant="subtitle2" sx={{ height: 35, padding: 0, margin: 0, paddingTop: 1 }} >
                                                        {payrollList.fname}{" "}{payrollList.lname}
                                                    </Typography>
                                                </TableCell>
                                                {checked.hours_monthly_rate && (
                                                    <>
                                                        <TableCell>
                                                            {payrollList?.hours?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.monthly_rate?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {checked.ot_hours_ot_pay && (
                                                    <>
                                                        <TableCell>
                                                            {payrollList?.ot_hours?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.ot_pay?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {checked.absences_tardiness_undertime && (
                                                    <>
                                                        <TableCell>
                                                            {payrollList?.absences?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.tardiness?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.undertime?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {checked.earnings && (
                                                    <>
                                                        <TableCell>
                                                            {"₱" + payrollList?.earnings?.toFixed(1).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "0"}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {checked.benefits && (
                                                    <>
                                                        <TableCell>
                                                            {payrollList?.sss_employers?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.sss_employee?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.phil_employers?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.phil_employee?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.pbg_employers?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.pbg_employee?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {checked.other && (
                                                    <>
                                                        <TableCell>
                                                            {payrollList?.insure_employers?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.insure_employee?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.incentives?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.allowance?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {checked.taxable && (
                                                    <>
                                                        <TableCell>
                                                            {payrollList?.taxable?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {checked.exempt && (
                                                    <>
                                                        <TableCell>
                                                            {payrollList?.exempt?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {checked.tax && (
                                                    <>
                                                        <TableCell>
                                                            {payrollList?.tax?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {checked.amountTotal && (
                                                    <>
                                                        <TableCell>
                                                            {payrollList?.amountTotal?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {checked.loan_advance && (
                                                    <>
                                                        <TableCell>
                                                            {payrollList?.loan?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.advance?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {checked.net_pay && (
                                                    <>
                                                        <TableCell>
                                                            <Box component="div" className="d-flex justify-content-between" sx={{ padding: 0, margin: 0 }} >
                                                                <Typography variant="subtitle2" sx={{ height: 35, padding: 0, margin: 0, paddingTop: 1 }} >
                                                                    {"₱" + payrollList?.net_pay?.toFixed(1).toLocaleString(undefined,{ maximumFractionDigits: 2 }) + "0"}
                                                                </Typography>
                                                                {payrollList.processtype === 4 ? (
                                                                    <IconButton sx={{ color: "red", fontSize: 14 }} onClick={() =>handleDeleteSummary(payrollList.payroll_id)} >
                                                                        <i className="fa fa-trash-o"></i>
                                                                    </IconButton>
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                    </>
                                                )}

                                                {checked.bonus && (
                                                    <>
                                                        <TableCell>
                                                            {payrollList?.bonus?.toLocaleString( undefined, { maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        );
                                    })}

                                    <TableRow hover tabIndex={-1}>
                                        <TableCell className="font-weight-bold" sx={{ width: "200px" }} >
                                            TOTAL
                                        </TableCell>

                                        {checked.hours_monthly_rate && (
                                            <>
                                                <TableCell></TableCell>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={totalMonthly} currency="Php" />
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.ot_hours_ot_pay && (
                                            <>
                                                <TableCell></TableCell>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={totalOT} currency="Php" />
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.absences_tardiness_undertime && (
                                            <>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={totalAbsences} currency="Php" />
                                                </TableCell>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={ totalTardiness } currency="Php" />
                                                </TableCell>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={ totalUndertime } currency="Php" />
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.earnings && (
                                            <>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={ totalGross.toFixed( 1 ) + "0" } currency="Php" />
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.benefits && (
                                            <>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={totalSSSEmpr} currency="Php" />
                                                </TableCell>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={totalSSSEmps} currency="Php" />
                                                </TableCell>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={totalPhilEmpr} currency="Php" />
                                                </TableCell>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={totalPhilEmps} currency="Php" />
                                                </TableCell>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={ totalPGIBIGEmpr } currency="Php" />
                                                </TableCell>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={ totalPGIBIGEmps } currency="Php" />
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.other && (
                                            <>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={ totalInsuranceEmpr } currency="Php" />
                                                </TableCell>

                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={ totalInsuranceEmps } currency="Php" />
                                                </TableCell>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={ totalIncentive } currency="Php" />
                                                </TableCell>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={ totalAllowance } currency="Php" />
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.taxable && (
                                            <>
                                                <TableCell></TableCell>
                                            </>
                                        )}

                                        {checked.exempt && (
                                            <>
                                                <TableCell></TableCell>
                                            </>
                                        )}

                                        {checked.tax && (
                                            <>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={totalTax} currency="Php" />
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.amountTotal && (
                                            <>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={totalCashAdv} currency="Php" />
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.loan_advance && (
                                            <>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={totalLoan} currency="Php" />
                                                </TableCell>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={ totalAdvDeduct } currency="Php" />
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.net_pay && (
                                            <>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={ totalNetpay.toFixed( 1 ) + "0" } currency="Php" />
                                                </TableCell>
                                            </>
                                        )}

                                        {checked.bonus && (
                                            <>
                                                <TableCell className="font-weight-bold">
                                                    <Currency quantity={totalBonus} currency="Php" />
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box component="div" sx={{ marginBottom: 5 }}>
                            <Typography sx={{ marginBottom: 2 }}>
                                <span className="font-italic"> BREAKDOWN SUMMARY: </span>
                            </Typography>
                            <Typography>
                                <span className="font-weight-bold"> PAYROLL: </span>{" "}
                                {"₱" + (checked.earnings ? totalGross.toFixed(1) : 0 ).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "0"}
                            </Typography>
                            <Typography>
                                <span className="font-weight-bold"> SSS EMPLOYER SHARE: </span>{" "}
                                {"₱" + (checked.benefits ? totalSSSEmpr : 0 ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </Typography>
                            <Typography>
                                <span className="font-weight-bold"> PHILHEALTH EMPLOYER SHARE: </span>{" "}
                                {"₱" + (checked.benefits ? totalPhilEmpr : 0 ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </Typography>
                            <Typography>
                                <span className="font-weight-bold"> PAGIBIG EMPLOYER SHARE: </span>{" "}
                                {"₱" + (checked.benefits ? totalPGIBIGEmpr : 0 ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </Typography>
                            <Typography>
                                <span className="font-weight-bold"> INSURANCE EMPLOYER SHARE: </span>{" "}
                                {"₱" + (checked.benefits ? totalInsuranceEmpr : 0 ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </Typography>
                            <Typography>
                                <span className="font-weight-bold"> ALLOWANCE: </span>{" "}
                                {"₱" + (checked.other ? totalAllowance : 0 ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </Typography>
                            <Typography>
                                <span className="font-weight-bold"> ADVANCE: </span>{" "}
                                {"₱" + (checked.amountTotal ? totalCashAdv : 0 ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </Typography>
                            <Typography>
                                <span className="font-weight-bold">TAX:</span>{" "}
                                {"₱" + (checked.tax ? totalTax : 0).toLocaleString( undefined, { maximumFractionDigits: 2 })}
                            </Typography>
                            <Typography>
                                <span className="font-weight-bold">LOAN:</span>{" "}
                                {"₱" + (checked.loan_advance ? totalLoan : 0 ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </Typography>
                            <Typography>
                                <span className="font-weight-bold"> BONUSES: </span>{" "}
                                {"₱" + (checked.bonus ? totalBonus : 0 ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </Typography>
                            <Typography>
                                <span className="font-weight-bold">TOTAL:</span>{" "}
                                {"₱" +
                                    (
                                        (checked.earnings ? totalGross : 0) +
                                        (checked.benefits ? totalSSSEmpr : 0) +
                                        (checked.benefits ? totalPhilEmpr : 0) +
                                        (checked.benefits ? totalPGIBIGEmpr : 0) +
                                        (checked.benefits ? totalInsuranceEmpr : 0) +
                                        (checked.other ? totalAllowance : 0) +
                                        (checked.amountTotal ? totalCashAdv : 0) +
                                        (checked.tax ? totalTax : 0) +
                                        (checked.loan_advance ? totalLoan : 0) +
                                        (checked.bonus ? totalBonus : 0)
                                    )
                                        .toFixed(1).toLocaleString(undefined, { maximumFractionDigits: 2 }) +"0"}
                            </Typography>
                        </Box>
                        <Grid container spacing={5} maxWidth={700}>
                            <Grid item xs={6}>
                                <Box component="div">
                                    <Typography sx={{ marginBottom: 3 }}>
                                        Prepared By:
                                    </Typography>
                                    <Typography>Arlene P. Allera</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box component="div">
                                    <Typography sx={{ marginBottom: 3 }}> Approved By: </Typography>
                                    <Grid container spacing={5}>
                                        <Grid item xs={5} sx={{ width: "100%" }} >
                                            <Typography> Gillmar Padua </Typography>
                                        </Grid>
                                        <Grid item xs={7} sx={{ width: "100%" }} >
                                            <Typography> Christopher G. Francisco </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                        
                        <Box component="div" className="d-flex justify-content-center" sx={{ marginTop: "50px" }} >
                            <button type="button" className="printBTN btn btn-warning btn-md mr-2" onClick={handleToPrint} >
                                {" "} Print
                            </button>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default SummarySaveModal;
