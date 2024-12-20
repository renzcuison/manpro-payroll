import React, { useEffect, useState } from "react";
import {
    InputLabel,
    FormControl,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Divider,
    Typography,
} from "@mui/material";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";

const PayrollHistoryModal = ({ data, handleToPrint }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [earningsData, setEarningsData] = useState([]);
    const [benefitsData, setBenefitsData] = useState([]);
    const [loanData, setLoanData] = useState([]);
    const [contributionData, setContributionData] = useState([]);
    const [taxData, setTaxData] = useState([]);
    const [totalAddionBenefit, setTotalAddionBenefit] = useState([]);
    const mrate = data.monthly_rate / 2;
    const basic_rate = data.daily_rate;
    const hourly_rate = data.hourly_rate;
    const [leaveAbsence, setLeaveAbsence] = useState();
    const [grossPay, setGrossPay] = useState();

    useEffect(() => {
        handleGetRecords();
    }, []);

    const handleGetRecords = () => {
        axiosInstance
            .get(`/payrollRecordBenefits/${data.payroll_id}`, { headers })
            .then((response) => {
                setEarningsData(response.data.earnings_data);
                setBenefitsData(response.data.benefitsRecords);
                setLoanData(response.data.loan_data);
                setContributionData(response.data.contribution_data);
                setTaxData(response.data.taxes_data);
                setLeaveAbsence(response.data.leaveAbsence);
            });
    };
    let earnings_showData = [];
    if (earningsData != undefined) {
        earnings_showData = earningsData.map((list, index) => {
            let count = 0;
            return (
                <>
                    <TableRow key={count++}>
                        <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                            {list.list_name}
                        </TableCell>
                        <TableCell className="text-center  bg-light">
                            <input
                                id="demo-simple-select"
                                style={{ height: 20, backgroundColor: "white" }}
                                className="form-control"
                                type="text"
                                name={list.list_name}
                                disabled={true}
                                value={
                                    list.totalAmount != 0 ?
                                    list.status === "Approved" ||
                                    list.list_name == "Absences" ||
                                    list.list_name == "Tardiness" ||
                                    list.list_name == "Undertime" ||
                                    list.list_name == "Incentives" ||
                                    list.list_name == "Allowance" ?
                                    parseFloat(list.totalAmount.toFixed(2)) : "" : ""
                                }
                            />
                        </TableCell>
                    </TableRow>
                </>
            );
        });
    }

    useEffect(() => {
        setGrossPay( (data.monthly_rate / 2 ? parseFloat((data.monthly_rate / 2).toFixed(2)) : 0) - (leaveAbsence ? leaveAbsence : 0) );
    }, [leaveAbsence ? leaveAbsence : 0]);

    let benefit_showData = [];
    let totalAddiotionalBenefit = [];
    if (benefitsData != undefined) {
        benefit_showData = benefitsData.map((list, index) => {
            let count = 0;
            totalAddiotionalBenefit.push( list.totalAmount ? Number(list.totalAmount) : 0 );

            return (
                <>
                    <TableRow key={count++}>
                        <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                            {list.list_name}
                        </TableCell>
                        <TableCell className="text-center  bg-light">
                            <input id="demo-simple-select" style={{ height: 20, backgroundColor: "white" }} className="form-control" type="text" name={list.list_name} value={ list.totalAmount != 0 ? parseFloat( list.totalAmount.toFixed(2)) : "" } disabled={true} />
                        </TableCell>
                    </TableRow>
                </>
            );
        });
    }

    let loan_showData = [];
    if (loanData != undefined) {
        loan_showData = loanData.map((list, index) => {
            let count = 0;
            return (
                <>
                    <TableRow key={count++}>
                        <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                            {list.list_name}
                        </TableCell>
                        <TableCell className="text-center  bg-light">
                            <input id="demo-simple-select" style={{ height: 20, backgroundColor: "white" }} className="form-control" type="text" name={list.list_name} value={ list.totalAmount != 0 ? parseFloat( list.totalAmount.toFixed(2) ) : "" } disabled={true} />
                        </TableCell>
                    </TableRow>
                </>
            );
        });
    }

    let contri_showData = [];
    if (contributionData != undefined) {
        contri_showData = contributionData.map((list, index) => {
            let count = 0;
            return (
                <>
                    <TableRow key={count++}>
                        <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                            {list.list_name}
                        </TableCell>
                        <TableCell className="text-center  bg-light">
                            <input id="demo-simple-select" style={{ height: 20, backgroundColor: "white" }} className="form-control" type="text" name={list.list_name} value={ list.totalAmount != 0 ? parseFloat( list.totalAmount.toFixed(2)) : "" } disabled />
                        </TableCell>
                    </TableRow>
                </>
            );
        });
    }

    let tax_showData = [];
    if (taxData != undefined) {
        tax_showData = taxData.map((list, index) => {
            let count = 0;
            return (
                <>
                    <TableRow key={count++}>
                        <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                            {list.list_name}
                        </TableCell>
                        <TableCell className="text-center  bg-light">
                            <input id="demo-simple-select" style={{ height: 20, backgroundColor: "white" }} className="form-control" type="text" name={list.list_name} value={ list.totalAmount != 0 ? parseFloat( list.totalAmount.toFixed(2)) : "" } disabled />
                        </TableCell>
                    </TableRow>
                </>
            );
        });
    }

    useEffect(() => {
        handleTotalAdiiotionalBenefit(totalAddiotionalBenefit);
    }, [totalAddiotionalBenefit]);

    const handleTotalAdiiotionalBenefit = (totalAddiotionalBenefit) => {
        setTotalAddionBenefit(
            Object.values(totalAddiotionalBenefit).reduce((acc, curr) => (acc += Number(curr)), 0 )
        );
    };

    return (
        <>
            <div className="row" style={{ marginTop: "10px" }}>
                <div className="col-4 d-flex justify-content-center">
                    <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}} >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Daily Rate
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control bg-white" type="text" defaultValue={basic_rate} readOnly style={{ height: 30 }} />
                    </FormControl>
                </div>
                <div className="col-4 d-flex justify-content-center">
                    <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}} >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Monthly Rate
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control bg-white" type="text" defaultValue={data.monthly_rate} readOnly style={{ height: 30 }} />
                    </FormControl>
                </div>
                <div className="col-4 d-flex justify-content-center">
                    <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}} >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Hourly Rate
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control bg-white" type="text" readOnly style={{ height: 30 }} defaultValue={hourly_rate} />
                    </FormControl>
                </div>
            </div>

            <div>
                <div className="row">
                    <div className="col-4">
                        <TableContainer>
                            <Table className="table table-md table-vcenter table-bordered">
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center">
                                            {" "} Earnings
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                                            Basic Pay
                                        </TableCell>
                                        <TableCell className="text-center  bg-light">
                                            <input id="demo-simple-select" style={{ backgroundColor: "white", height: 20 }} disabled className="form-control" defaultValue={data.basic_pay.toFixed(2)} type="text" />
                                        </TableCell>
                                    </TableRow>
                                    {earnings_showData}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <div className="col-4">
                        <TableContainer>
                            <Table className="table table-md table-vcenter table-bordered">
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center">
                                            {" "} Additional Benefits
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{benefit_showData}</TableBody>
                            </Table>
                        </TableContainer>
                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                                Total Additional Benefits
                            </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" type="text" defaultValue={totalAddionBenefit} readOnly style={{ height: 30 }} />
                        </FormControl>
                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                                Total Remaining Loan
                            </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" type="text" defaultValue={ data.remaining_loan ? data.remaining_loan : 0 } readOnly style={{ height: 30 }} />
                        </FormControl>
                        <TableContainer sx={{ marginTop: "10px" }}>
                            <Table className="table table-md table-vcenter table-bordered">
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center " >
                                            {" "} LOANS
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{loan_showData}</TableBody>
                            </Table>
                        </TableContainer>

                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                                Total Loan Deduction
                            </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" type="text" defaultValue={ data.total_loan_deduct ? data.total_loan_deduct : 0 } readOnly style={{ height: 30 }} />
                        </FormControl>
                    </div>
                    <div className="col-4">
                        <TableContainer>
                            <Table className="table table-md table-vcenter table-bordered">
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center " >
                                            {" "} EMPLOYEE CONTRIBUTION
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{contri_showData}</TableBody>
                            </Table>
                        </TableContainer>

                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                                Total Contribution
                            </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" disabled type="text" defaultValue={data.total_contribution} readOnly style={{ height: 30 }} />
                        </FormControl>

                        <TableContainer sx={{ marginTop: "145px" }}>
                            <Table className="table table-md table-vcenter table-bordered">
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center">
                                            {" "} EMPLOYEE TAXES
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{tax_showData}</TableBody>
                            </Table>
                        </TableContainer>

                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                                Total Taxes
                            </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" disabled type="text" defaultValue={ data.total_taxes ? data.total_taxes : 0 } readOnly style={{ height: 30 }} />
                        </FormControl>
                    </div>
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                    <div className="col-4">
                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                                Total Earnings
                            </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" type="text" readOnly defaultValue={parseFloat( data.total_earnings.toFixed(2) )} style={{ height: 30 }} />
                        </FormControl>
                    </div>
                    <div className="col-4">
                        <FormControl sx={{ marginBottom: 2, width: "100%", marginTop: "10px", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}} >
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                                Total Deductions
                            </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" type="text" defaultValue={parseFloat(data.total_deduction.toFixed(2))} readOnly style={{ height: 30 }} />
                        </FormControl>
                    </div>
                    <div className="col-4">
                        <FormControl sx={{ marginBottom: 2, width: "100%", marginTop: "10px", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}} >
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                                Net Pay
                            </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" type="text" defaultValue={parseFloat( data.net_pay.toFixed(2) )} readOnly style={{ height: 30 }} />
                        </FormControl>
                    </div>
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                    <div className="col-4">
                        <FormControl sx={{ marginBottom: 2, width: "100%", marginTop: "10px", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}} >
                            {data.signature ? (
                                <img className="d-flex justify-content-center" src={ location.origin + "/storage/" + data.signature } style={{ height: 70, width: 100, margin: "0 auto", display: "block" }} />
                            ) : (
                                <></>
                            )}

                            {/* https://nasyaportal.ph/assets/media/upload/
                            http://localhost/Nasya/assets/media/upload/ */}

                            <Divider sx={{ marginTop: 2, border: "0.5px solid" }} />
                            <Typography sx={{ fontStyle: "italic", textAlign: "center" }} >
                                Employee Signature
                            </Typography>
                        </FormControl>
                    </div>
                </div>
                <div className="d-flex justify-content-end">
                    <button type="button" className="printBtn btn btn-warning btn-md mr-2" onClick={handleToPrint} > Print </button>
                </div>
            </div>
        </>
    );
};

export default PayrollHistoryModal;
