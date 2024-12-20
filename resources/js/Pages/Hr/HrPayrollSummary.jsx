import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Select,
    MenuItem,
    InputLabel,
    Box,
    FormControl,
    Typography,
    IconButton,
    TablePagination,
    TableHead,
    Checkbox,
} from "@mui/material";
import { getComparator, stableSort } from "../../components/utils/tableUtils";
import PageToolbar from "../../components/Table/PageToolbar";
import SummaryUpdateModal from "../../components/Modals/SummaryUpdateModal";
import SummarySaveModal from "../../components/Modals/SummarySaveModal";
import Swal from "sweetalert2";
import moment from "moment";

const years = () => {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 20))
        .fill("")
        .map((v, idx) => now - idx);
};

const HrPayrollSummary = () => {
    const queryParameters = new URLSearchParams(window.location.search);
    const [searchParams, setSearchParams] = useSearchParams();
    const [payrollRecord, setPayrollRecord] = useState([]);
    const [filterPayroll, setFilterPayroll] = useState([]);
    const [payrollFrom, setPayrollFrom] = useState();
    const [payrollTo, setPayrollTo] = useState();
    const [payrollSummary, setPayrollSummary] = useState(false);
    const [payrollSave, setPayrollSave] = useState(false);
    const [totalMonthly, setTotalMonthly] = useState();
    const [totalOT, setTotalOT] = useState();
    const [totalIncentive, setTotalIncentive] = useState();
    const [totalAllowance, setTotalAllowance] = useState();
    const [totalAbsences, setTotalAbsences] = useState();
    const [totalTardiness, setTotalTardiness] = useState();
    const [totalUndertime, setTotalUndertime] = useState();
    const [totalGross, setTotalGross] = useState();
    const [totalSSSEmps, setTotalSSSEmps] = useState();
    const [totalSSSEmpr, setTotalSSSEmpr] = useState();
    const [totalPhilEmps, setTotalPhilEmps] = useState();
    const [totalPhilEmpr, setTotalPhilEmpr] = useState();
    const [totalPGIBIGEmps, setTotalPGIBIGEmps] = useState();
    const [totalPGIBIGEmpr, setTotalPGIBIGEmpr] = useState();
    const [totalInsuranceEmps, setTotalInsuranceEmps] = useState();
    const [totalInsuranceEmpr, setTotalInsuranceEmpr] = useState();
    const [totalTax, setTotalTax] = useState();
    const [totalCashAdv, setTotalCashAdv] = useState();
    const [totalLoan, setTotalLoan] = useState();
    const [totalAdvDeduct, setTotalAdvDeduct] = useState();
    const [totalDeduction, setTotalDeduction] = useState();
    const [totalNetpay, setTotalNetpay] = useState();
    const [totalBonus, setTotalBonus] = useState();
    const [selectMonth, setSelectMonth] = useState(searchParams.get("month"));
    const [selectYear, setSelectYear] = useState(searchParams.get("year"));
    const [selectEmpID, setSelectEmpID] = useState(
        searchParams.get("employeeID")
    );
    const [selectCutoff, setSelectCutoff] = useState(
        searchParams.get("cutoff")
    );
    const allYears = years();
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("calories");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [tableElement, setTableElement] = useState(null);
    const tableRef = useRef();

    useEffect(() => {
        getPayrolls(selectCutoff, selectMonth, selectYear);
    }, [selectCutoff, selectMonth, selectYear]);

    useEffect(() => {
        const handleResize = () => {
            if (tableRef.current) {
                setTableElement(tableRef.current);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const getPayrolls = async (selectCutoff, month_val, year_val) => {
        let dates = [];
        dates = [selectCutoff, month_val, year_val];
        await axiosInstance
            .get(`/getPayrollSummary/${dates.join(",")}`, { headers })
            .then((response) => {
                
                console.log("Response Payroll Records");
                console.log(response.data.payrollRecords);

                setPayrollRecord(response.data.payrollRecords);
                setFilterPayroll(response.data.payrollRecords);
                setPayrollFrom(response.data.payroll_from);
                setPayrollTo(response.data.payroll_to);
                setTotalMonthly(response.data.total_monthly);
                setTotalOT(response.data.total_ot);
                setTotalGross(response.data.total_gross);
                setTotalIncentive(response.data.total_incentive);
                setTotalAllowance(response.data.total_allowance);
                setTotalAbsences(response.data.total_absences);
                setTotalTardiness(response.data.total_tardiness);
                setTotalUndertime(response.data.total_undertime);
                setTotalSSSEmps(response.data.total_sss_emps);
                setTotalSSSEmpr(response.data.total_sss_empr);
                setTotalPhilEmps(response.data.total_phil_emps);
                setTotalPhilEmpr(response.data.total_phil_empr);
                setTotalPGIBIGEmps(response.data.total_pgbig_emps);
                setTotalPGIBIGEmpr(response.data.total_pgbig_empr);
                setTotalInsuranceEmps(response.data.total_insurance_emps);
                setTotalInsuranceEmpr(response.data.total_insurance_empr);
                setTotalTax(response.data.total_tax);
                setTotalCashAdv(response.data.total_cash_advance);
                setTotalLoan(response.data.total_loan);
                setTotalAdvDeduct(response.data.total_advance_deduct);
                setTotalDeduction(response.data.total_all_deduct);
                setTotalNetpay(response.data.total_all_pay);
                setTotalBonus(response.data.total_bonus);
            });
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
    const handleFilter = (event) => {
        const filtered = payrollRecord.filter((application) =>
            `${application?.fname} ${application?.lname}`
                .toLocaleLowerCase()
                .includes(event.target.value.toLocaleLowerCase())
        );
        if (event.target.value != "") {
            setPayrollRecord(filtered);
        } else {
            setPayrollRecord(filterPayroll);
        }
    };
    const emptyRows =
        page > 0
            ? Math.max(0, (1 + page) * rowsPerPage - payrollRecord.length)
            : 0;
    // END

    const handleOpenSummary = () => {
        setPayrollSummary(true);
    };

    const handleCloseSummary = () => {
        setPayrollSummary(false);
    };

    const handleOpenSave = () => {
        if (tableElement) {
            const hasHorizontalScroll =
                tableElement.scrollWidth > tableElement.offsetWidth
                    ? true
                    : false;
            if (payrollRecord.length != 0) {
                if (hasHorizontalScroll) {
                    Swal.fire({
                        customClass: {
                            container: "my-swal",
                        },
                        title: "Data overflow",
                        text: "Please deselect column.",
                        icon: "error",
                        showConfirmButton: true,
                    });
                } else {
                    setPayrollSave(true);
                }
            } else {
                Swal.fire({
                    customClass: {
                        container: "my-swal",
                    },
                    title: "No data found!",
                    text: "Please select payroll date.",
                    icon: "error",
                    showConfirmButton: true,
                });
            }
        }
    };

    const handleCloseSave = () => {
        setPayrollSave(false);
    };

    const handleChangeMonth = (e) => {
        const newMonth = e.target.value;
        setSelectMonth(newMonth);
        setSearchParams({
            ["month"]: newMonth,
            ["cutoff"]: selectCutoff,
            ["year"]: queryParameters.get("year"),
        });
    };

    const handleChangeCutoff = (e) => {
        const newCutoff = e.target.value;
        setSelectCutoff(newCutoff);
        setSearchParams({
            ["month"]: selectMonth,
            ["cutoff"]: newCutoff,
            ["year"]: queryParameters.get("year"),
        });
    };

    const handleChangeYear = (e) => {
        const newYear = e.target.value;
        setSelectYear(newYear);
        setSearchParams({
            ["month"]: selectMonth,
            ["cutoff"]: selectCutoff,
            ["year"]: newYear,
        });
    };

    const handleDeleteSummary = (payroll_id) => {
        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "Delete this Employee?",
            icon: "question",
            dangerMode: true,
            showCancelButton: true,
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance
                    .post(
                        "/delete_payroll_summary_employee",
                        {
                            payroll_id: payroll_id,
                        },
                        { headers }
                    )
                    .then((response) => {
                        if (response.data.delete === "Success") {
                            close();
                            Swal.fire({
                                customClass: {
                                    container: "my-swal",
                                },
                                title: "Success!",
                                text: "Employee has been Removed",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: false,
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            alert("Something went wrong");
                        }
                    });
            }
        });
    };

    const [checked, setChecked] = useState({
        hours_monthly_rate: true,
        ot_hours_ot_pay: false,
        absences_tardiness_undertime: false,
        earnings: true,
        benefits: true,
        other: false,
        taxable: false,
        exempt: false,
        tax: false,
        amountTotal: false,
        loan_advance: false,
        net_pay: true,
        bonus: false,
    });

    const handleChange = (event) => {
        const { value } = event.target;
        setChecked((prevChecked) => ({
            ...prevChecked,
            [value]: !prevChecked[value],
        }));
    };

    const options = [
        { id: 1, value: "hours_monthly_rate", label: "MONTHLY BASE" },
        { id: 2, value: "ot_hours_ot_pay", label: "OVERTIME / PAID LEAVE" },
        { id: 3, value: "absences_tardiness_undertime", label: "DEDUCTION" },
        { id: 4, value: "earnings", label: "GROSS PAY" },
        { id: 5, value: "benefits", label: "STATUTORY BENEFITS" },
        { id: 6, value: "other", label: "OTHER BENEFITS" },
        { id: 7, value: "taxable", label: "TAXABLE PAY" },
        { id: 8, value: "exempt", label: "EXEMPT PAY" },
        { id: 9, value: "tax", label: "TAX" },
        { id: 10, value: "amountTotal", label: "ADVANCE" },
        { id: 11, value: "loan_advance", label: "OTHER DEDUCTION" },
        { id: 12, value: "net_pay", label: "NET PAY" },
        { id: 13, value: "bonus", label: "BONUS" },
    ];

    return (
        <Layout>
            <Box sx={{ mx: 12 }}>
                <div className="content-heading d-flex justify-content-between px-4">
                    <h5 className="pt-3">Summary of Payrolls</h5>

                    <div className="btn-group" role="group">
                        <FormControl size="small">
                            <InputLabel id="demo-simple-select-label">
                                {" "}
                                Month{" "}
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="month_attendance"
                                value={selectMonth}
                                label="Month"
                                onChange={handleChangeMonth}
                                sx={{ width: "120px", marginRight: "10px" }}
                            >
                                <MenuItem value={1}>January</MenuItem>
                                <MenuItem value={2}>February</MenuItem>
                                <MenuItem value={3}>March</MenuItem>
                                <MenuItem value={4}>April</MenuItem>
                                <MenuItem value={5}>May</MenuItem>
                                <MenuItem value={6}>June</MenuItem>
                                <MenuItem value={7}>July</MenuItem>
                                <MenuItem value={8}>August</MenuItem>
                                <MenuItem value={9}>September</MenuItem>
                                <MenuItem value={10}>October</MenuItem>
                                <MenuItem value={11}>November</MenuItem>
                                <MenuItem value={12}>December</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small">
                            <InputLabel id="demo-simple-select-label">
                                {" "}
                                CutOff{" "}
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="cutoff"
                                value={selectCutoff}
                                label="Cutoff"
                                onChange={handleChangeCutoff}
                                sx={{ width: "120px", marginRight: "10px" }}
                            >
                                <MenuItem value={1}>First</MenuItem>
                                <MenuItem value={2}>Second</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small">
                            <InputLabel id="demo-simple-select-label">
                                {" "}
                                Year{" "}
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="month_attendance"
                                value={selectYear}
                                label="Year"
                                onChange={handleChangeYear}
                                sx={{ width: "120px", marginRight: "10px" }}
                            >
                                {allYears.map((year, index) => (
                                    <MenuItem key={index} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </div>

                <div className="block">
                    <div className=" block-content col-sm-12 ">
                        <div className="d-flex justify-content-lg-end p-3">
                            <PageToolbar handleSearch={handleFilter} />
                            <FormControl
                                size="small"
                                sx={{ width: "15%", marginTop: 1 }}
                            >
                                <InputLabel id="multi-select-dropdown-label">
                                    Select Columns
                                </InputLabel>
                                <Select
                                    labelId="multi-select-dropdown-label"
                                    id="multi-select-dropdown"
                                    multiple
                                    value={options.filter(
                                        (option) => checked[option.value]
                                    )}
                                    onChange={handleChange}
                                    label="Select Columns"
                                    renderValue={(selected) =>
                                        `${selected.length} selected`
                                    }
                                >
                                    {options.map((option) => (
                                        <MenuItem
                                            key={option.id}
                                            value={option.value}
                                        >
                                            <Checkbox
                                                checked={checked[option.value]}
                                                onChange={handleChange}
                                                value={option.value}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            />
                                            <Typography
                                                variant="body1"
                                                onClick={() =>
                                                    handleChange({
                                                        target: {
                                                            value: option.value,
                                                        },
                                                    })
                                                }
                                                style={{
                                                    marginLeft: "8px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {" "}
                                                {option.label}{" "}
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        <TableContainer ref={tableRef}>
                            <Table className="table table-md  table-striped  table-vcenter table-bordered">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ verticalAlign: 'top', textAlign: 'left' }} rowSpan={3}> Employee Name </TableCell>
                                        {checked.hours_monthly_rate && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={2}> Monthly Base </TableCell></>}
                                        {checked.ot_hours_ot_pay && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={2}> Overtime / Paid Leave </TableCell></>}
                                        {checked.absences_tardiness_undertime && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={3}> Deduction </TableCell></>}
                                        {checked.earnings && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={3}> Gross Pay </TableCell></>}
                                        {checked.benefits && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={6}> Statutory Benefits </TableCell></>}
                                        {checked.other && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={4}> Other Benefits </TableCell></>}
                                        {checked.taxable && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={3}> Taxable Pay </TableCell></>}
                                        {checked.exempt && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={3}> Exempt Pay </TableCell></>}
                                        {checked.tax && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Tax </TableCell></>}
                                        {checked.amountTotal && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Advance </TableCell></>}
                                        {checked.loan_advance && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={2}> Other Deduction </TableCell></>}
                                        {checked.net_pay && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={3}> Net Pay </TableCell></>}
                                        {checked.bonus && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Bonus </TableCell></>}
                                    </TableRow>
                                    <TableRow sx={{ borderTop: 1, borderColor: "#e4e7ed", }}>
                                        {checked.hours_monthly_rate && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> Hours </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> Pay </TableCell></>}
                                        {checked.ot_hours_ot_pay && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> Hours </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> Pay </TableCell></>}
                                        {checked.absences_tardiness_undertime && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> Absences </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> Tardiness </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> Undertime </TableCell></>}
                                        {checked.benefits && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={2}> SSS </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={2}> Philhealth </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={2}> Pagibig </TableCell></>}
                                        {checked.other && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} colSpan={2}> Insurance </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> 13th Month Pay </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> Leave Credit </TableCell></>}
                                        {checked.tax && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> BIR </TableCell></>}
                                        {checked.amountTotal && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> Cash Advance </TableCell></>}
                                        {checked.loan_advance && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> Loan </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> Advance </TableCell></>}
                                        {checked.bonus && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }} rowSpan={2}> 13th Month Pay </TableCell></>}
                                    </TableRow>
                                    <TableRow sx={{ borderTop: 1, borderColor: "#e4e7ed", }} >
                                        {checked.benefits && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employer Share </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employee Share </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employer Share </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employee Share </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employer Share </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employee Share </TableCell></>}
                                        {checked.other && <>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employer Share </TableCell>
                                            <TableCell style={{ verticalAlign: 'top', textAlign: 'center' }}> Employee Share </TableCell></>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stableSort( payrollRecord, getComparator(order, orderBy) )
                                        .slice( page * rowsPerPage, page * rowsPerPage + rowsPerPage )
                                        .map((payrollList, index) => {
                                            return (
                                                <TableRow key={index} hover tabIndex={-1} >
                                                    <TableCell>
                                                        <Typography variant="subtitle2" sx={{ height: 35, padding: 0, margin: 0, paddingTop: 1 }} >
                                                            {payrollList.lname}{", "}
                                                            {payrollList.fname}{" "}
                                                            {payrollList.mname ? payrollList.mname[0] + "." : ""}
                                                        </Typography>
                                                    </TableCell>
                                                    {checked.hours_monthly_rate && <>
                                                        <TableCell> {payrollList?.hours?.toLocaleString( undefined, { maximumFractionDigits: 2 } )} </TableCell>
                                                        <TableCell> {payrollList?.monthly_rate?.toLocaleString( undefined, { maximumFractionDigits: 2 } )} </TableCell></>}
                                                    {checked.ot_hours_ot_pay && <>
                                                        <TableCell> {payrollList?.ot_hours?.toLocaleString( undefined, { maximumFractionDigits: 2 } )} </TableCell>
                                                        <TableCell> {payrollList?.ot_pay?.toLocaleString( undefined, { maximumFractionDigits: 2 } )} </TableCell></>}
                                                    {checked.absences_tardiness_undertime && <>
                                                        <TableCell> {payrollList?.absences?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}</TableCell>
                                                        <TableCell> {payrollList?.tardiness?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}</TableCell>
                                                        <TableCell> {payrollList?.undertime?.toLocaleString( undefined, { maximumFractionDigits: 2 } )}</TableCell>
                                                    </>}
                                                    {checked.earnings && <>
                                                        <TableCell> {"₱" + payrollList?.earnings?.toFixed(2).toLocaleString( undefined, { maximumFractionDigits: 2 } )}</TableCell></>}
                                                    {checked.benefits && <>
                                                        <TableCell> {payrollList?.sss_employers?.toLocaleString( undefined, { maximumFractionDigits: 2 } )} </TableCell>
                                                        <TableCell> {payrollList?.sss_employee?.toLocaleString( undefined, { maximumFractionDigits: 2 } )} </TableCell>
                                                        <TableCell> {payrollList?.phil_employers?.toLocaleString( undefined, { maximumFractionDigits: 2 } )} </TableCell>
                                                        <TableCell> {payrollList?.phil_employee?.toLocaleString( undefined, { maximumFractionDigits: 2 } )} </TableCell>
                                                        <TableCell> {payrollList?.pbg_employers?.toLocaleString( undefined, { maximumFractionDigits: 2 } )} </TableCell>
                                                        <TableCell> {payrollList?.pbg_employee?.toLocaleString( undefined, { maximumFractionDigits: 2 } )} </TableCell>
                                                    </>}
                                                    {checked.other && <>
                                                        <TableCell>
                                                            {payrollList?.insure_employers?.toLocaleString(
                                                                undefined, { maximumFractionDigits: 2, }
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.insure_employee?.toLocaleString(
                                                                undefined, { maximumFractionDigits: 2, }
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.incentives?.toLocaleString(
                                                                undefined, { maximumFractionDigits: 2, }
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.allowance?.toLocaleString(
                                                                undefined, { maximumFractionDigits: 2, }
                                                            )}
                                                        </TableCell></>}
                                                    {checked.taxable && <>
                                                        <TableCell>
                                                            {payrollList?.taxable?.toLocaleString(
                                                                undefined, { maximumFractionDigits: 2, }
                                                            )}</TableCell></>}
                                                    {checked.exempt && <>
                                                        <TableCell>
                                                            {payrollList?.exempt?.toLocaleString(
                                                                undefined,
                                                                { maximumFractionDigits: 2, }
                                                            )}
                                                        </TableCell></>}
                                                    {checked.tax && <>
                                                        <TableCell>
                                                            {payrollList?.tax?.toLocaleString(
                                                                undefined, { maximumFractionDigits: 2, }
                                                            )}
                                                        </TableCell></>}
                                                    {checked.amountTotal && <>
                                                        <TableCell>
                                                            {payrollList?.amountTotal?.toLocaleString(
                                                                undefined, { maximumFractionDigits: 2, }
                                                            )}
                                                        </TableCell></>}
                                                    {checked.loan_advance && <>
                                                        <TableCell>
                                                            {payrollList?.loan?.toLocaleString(
                                                                undefined, { maximumFractionDigits: 2, }
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {payrollList?.advance?.toLocaleString(
                                                                undefined, { maximumFractionDigits: 2, }
                                                            )}
                                                        </TableCell></>}
                                                    {checked.net_pay && <>
                                                        <TableCell>
                                                            <Box component="div" className="d-flex justify-content-between" sx={{ padding: 0, margin: 0, }} >
                                                                <Typography variant="subtitle2" sx={{ height: 35, padding: 0, margin: 0, paddingTop: 1, }} >
                                                                    {"₱" + payrollList?.net_pay?.toFixed(2).toLocaleString( undefined, { maximumFractionDigits: 2 } )}
                                                                </Typography>
                                                                {payrollList.processtype === 4 ? (
                                                                    <IconButton sx={{ color: "red", fontSize: 14, }} onClick={() => handleDeleteSummary( payrollList.payroll_id ) } >
                                                                        <i className="fa fa-trash-o"></i>
                                                                    </IconButton>
                                                                ) : ( "" )}
                                                            </Box>
                                                        </TableCell></>}
                                                    {checked.bonus && <>
                                                        <TableCell>
                                                            {payrollList?.bonus?.toLocaleString(
                                                                undefined, { maximumFractionDigits: 2, }
                                                            )}
                                                        </TableCell></>
                                                    }
                                                </TableRow>
                                            );
                                        })}
                                    {emptyRows > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={10} />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <div className="d-flex justify-content-lg-between p-3">
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={payrollRecord.length}
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
                            <div className="mt-10">
                                <button type="button" className="updateBtn btn btn-warning btn-md mr-2" onClick={handleOpenSummary}> Update </button>
                                <button type="button" className="hideBtn btn btn-success btn-md mr-2" onClick={handleOpenSave}> {" "} Save </button>
                            </div>
                        </div>
                    </div>
                </div>

                {payrollSummary && (
                    <SummaryUpdateModal
                        open={payrollSummary}
                        close={handleCloseSummary}
                        data={payrollRecord}
                        cutoff={selectCutoff}
                        from={payrollFrom || moment().format("YYYY-MM-DD")}
                        to={payrollTo || moment().format("YYYY-MM-DD")}
                        year={selectYear}
                    />
                )}

                {payrollSave && (
                    <SummarySaveModal
                        open={payrollSave}
                        close={handleCloseSave}
                        data={payrollRecord}
                        cutoff={selectCutoff}
                        from={payrollFrom}
                        to={payrollTo}
                        year={selectYear}
                        totalMonthly={totalMonthly}
                        totalOT={totalOT}
                        totalIncentive={totalIncentive}
                        totalAllowance={totalAllowance}
                        totalAbsences={totalAbsences}
                        totalTardiness={totalTardiness}
                        totalUndertime={totalUndertime}
                        totalGross={totalGross}
                        totalSSSEmps={totalSSSEmps}
                        totalSSSEmpr={totalSSSEmpr}
                        totalPhilEmps={totalPhilEmps}
                        totalPhilEmpr={totalPhilEmpr}
                        totalPGIBIGEmps={totalPGIBIGEmps}
                        totalPGIBIGEmpr={totalPGIBIGEmpr}
                        totalInsuranceEmps={totalInsuranceEmps}
                        totalInsuranceEmpr={totalInsuranceEmpr}
                        totalTax={totalTax}
                        totalCashAdv={totalCashAdv}
                        totalLoan={totalLoan}
                        totalAdvDeduct={totalAdvDeduct}
                        totalDeduction={totalDeduction}
                        totalNetpay={totalNetpay}
                        totalBonus={totalBonus}
                        checked={checked}
                    />
                )}
            </Box>
        </Layout>
    );
};

export default HrPayrollSummary;
