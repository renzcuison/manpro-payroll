import { Box, Grid, Typography, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import "react-quill/dist/quill.snow.css";

import LoadingSpinner from "../../components/LoadingStates/LoadingSpinner";

import HomeLogo from "../../../images/ManPro.png";

const Payslip = ({ selectedPayroll }) => {
    const contentToPrint = useRef();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [isLoading, setIsLoading] = useState(true);

    const [payroll, setPayroll] = useState([]);
    const [employee, setEmployee] = useState([]);
    const [benefits, setBenefits] = useState([]);
    const [allowances, setAllowances] = useState([]);
    const [summaries, setSummaries] = useState([]);

    const [paidLeaves, setPaidLeaves] = useState([]);
    const [unpaidLeaves, setUnpaidLeaves] = useState([]);

    const [earnings, setEarnings] = useState([]);
    const [deductions, setDeductions] = useState([]);

    useEffect(() => {
        const data = { selectedPayroll: selectedPayroll };

        axiosInstance.get(`/payroll/getPayrollRecord`, { params: data, headers })
            .then((response) => {
                setPayroll(response.data.payslip);
                setBenefits(response.data.benefits);
                setAllowances(response.data.allowances);
                setSummaries(response.data.summaries);

                setPaidLeaves(response.data.paid_leaves);
                setUnpaidLeaves(response.data.unpaid_leaves);

                setEarnings(response.data.earnings);
                setDeductions(response.data.deductions);

                getEmployeeData(response.data.payslip.employee);
            })
            .catch((error) => {
                console.error("Error fetching payroll details:", error);
            });
    }, []);

    const getEmployeeData = (employee) => {
        const data = { username: employee };

        axiosInstance.get(`/employee/getEmployeeDetails`, { params: data, headers })
            .then((response) => {
                if (response.data.status === 200) {
                    setEmployee(response.data.employee);
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                console.error("Error fetching employee:", error);
            });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
    };

    return (
        <>
            <Box component="form" sx={{ mt: 3, py: 6, bgcolor: "#ffffff" }} noValidate autoComplete="off" encType="multipart/form-data" >
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 1 }} >
                            <Box component="div" sx={{ backgroundImage: `url(${HomeLogo})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", height: 105, width: 300 }} />
                            <Typography sx={{ marginTop: "5px" }}>
                                {" "}Online Payslip{" "}
                            </Typography>
                            <Typography sx={{ marginTop: "5px" }}>
                                {" "}Pay Period: {formatDate(payroll.period_start)} - {formatDate(payroll.period_end)}
                            </Typography>
                        </Box>

                        <Grid container spacing={4} sx={{ px: 8, mt: 4 }}>
                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12}}>
                                <div className="row">
                                    <div className="col-6">
                                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Employee Name </InputLabel>
                                            <input id="demo-simple-select" className="form-control" type="text" value={`${ employee.first_name } ${ employee.middle_name || "" } ${employee.last_name} ${ employee.suffix || "" }`.trim()} style={{ height: 40, backgroundColor: "#fff" }} readOnly />
                                        </FormControl>

                                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }}> Role </InputLabel>
                                            <input id="demo-simple-select" className="form-control" type="text" value={`${ employee.role || "-" }`.trim()} style={{ height: 40, backgroundColor: "#fff" }} readOnly />
                                        </FormControl>
                                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Department </InputLabel>
                                            <input id="demo-simple-select" className="form-control" type="text" value={`${ employee.department || "-" }`.trim()} style={{ height: 40, backgroundColor: "#fff" }} readOnly />
                                        </FormControl>
                                    </div>

                                    <div className="col-6">
                                        <div className="d-flex justify-content-end">
                                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }}> Employment Type </InputLabel>
                                                <input id="demo-simple-select" className="form-control" type="text" value={`${ employee.employment_type || "-" }`.trim()} style={{ height: 40, backgroundColor: "#fff" }} readOnly />
                                            </FormControl>
                                        </div>
                                        <div className="d-flex justify-content-end">
                                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Title </InputLabel>
                                                <input id="demo-simple-select" className="form-control" type="text" value={`${ employee.jobTitle || "-" }`.trim()} style={{ height: 40, backgroundColor: "#fff" }} readOnly />
                                            </FormControl>
                                        </div>
                                        <div className="d-flex justify-content-end">
                                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }}> Branch </InputLabel>
                                                <input id="demo-simple-select" className="form-control" type="text" value={`${ employee.branch || "-" }`.trim()} style={{ height: 40, backgroundColor: "#fff" }} readOnly />
                                            </FormControl>
                                        </div>
                                    </div>
                                </div>

                                <div className="row" style={{ marginTop: "10px" }} >
                                    <div className="col-4 d-flex justify-content-center">
                                    <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > {" "} Daily Rate{" "} </InputLabel>
                                            <input id="demo-simple-select" className="form-control" type="text" value={ payroll ? new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(payroll.rate_daily) : "0" } style={{ height: 40, backgroundColor: "#fff", textAlign: "right" }} readOnly />
                                        </FormControl>
                                    </div>
                                    <div className="col-4 d-flex justify-content-center">
                                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }}> {" "}Monthly Rate{" "} </InputLabel>
                                            <input id="demo-simple-select" className="form-control" type="text" value={ payroll ? new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(payroll.rate_monthly) : "0" } style={{ height: 40, backgroundColor: "#fff", textAlign: "right" }} readOnly />
                                        </FormControl>
                                    </div>
                                    <div className="col-4 d-flex justify-content-center">
                                        <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }}> {" "}Hourly Rate{" "} </InputLabel>
                                            <input id="demo-simple-select" className="form-control" type="text" value={ payroll ? new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 } ).format(payroll.rate_hourly) : "0" } style={{ height: 40, backgroundColor: "#fff", textAlign: "right" }} readOnly />
                                        </FormControl>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-4">
                                        <TableContainer sx={{ my: 2 }}>
                                            <Table className="table table-md table-vcenter table-bordered">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="text-center">{" "}Earnings{" "}</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {earnings.map((earning) => (
                                                        <TableRow key={earning.name} >
                                                            <TableCell className="text-center bg-light" sx={{ width: "50%" }}> {earning.name} </TableCell>
                                                            <TableCell className="text-center bg-light">
                                                                <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(earning.amount)} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}

                                                    {allowances.map((allowance) => (
                                                        <TableRow key={allowance.name} >
                                                            <TableCell className="text-center bg-light" sx={{ width: "50%" }}> {allowance.name} </TableCell>
                                                            <TableCell className="text-center bg-light">
                                                                <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(allowance.amount)} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}

                                                    {paidLeaves.map(
                                                        (paidLeave) => (
                                                            <TableRow key={paidLeave.name} >
                                                                <TableCell className="text-center bg-light" sx={{ width: "50%" }}> {paidLeave.name} </TableCell>
                                                                <TableCell className="text-center bg-light">
                                                                    <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(paidLeave.amount)} />
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}

                                                    {unpaidLeaves.map(
                                                        (unpaidLeave) => (
                                                            <TableRow key={unpaidLeave.name} >
                                                                <TableCell className="text-center bg-light" sx={{ width: "50%" }}> {unpaidLeave.name} </TableCell>
                                                                <TableCell className="text-center bg-light">
                                                                    <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(unpaidLeave.amount)} />
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}

                                                    {deductions.map(
                                                        (deduction) => (
                                                            <TableRow key={deduction.name} >
                                                                <TableCell className="text-center bg-light" sx={{ width: "50%" }}> {deduction.name} </TableCell>
                                                                <TableCell className="text-center bg-light">
                                                                    <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text"
                                                                        value={ deductions ? deduction.amount === 0 ?
                                                                            new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(deduction.amount) :
                                                                            `-${new Intl.NumberFormat( "en-US", {style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(Math.abs(deduction.amount))}` :
                                                                            "Loading..."
                                                                        }
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </div>

                                    <div className="col-4">
                                        <TableContainer sx={{ my: 2 }}>
                                            <Table className="table table-md table-vcenter table-bordered">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="text-center">{" "}Employer Share{" "}</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {benefits.map((benefit) => (
                                                        <TableRow key={`employer+${benefit.name}`} >
                                                            <TableCell className="text-center bg-light" sx={{ width: "50%" }}>{benefit.name}</TableCell>
                                                            <TableCell className="text-center bg-light">
                                                                <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text" value={new Intl.NumberFormat("en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 } ).format(benefit.employer_amount)} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        <TableContainer sx={{ my: 2 }}>
                                            <Table className="table table-md table-vcenter table-bordered">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="text-center">{" "}Loans{" "}</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell className="text-center bg-light" sx={{border: "1px solid #ccc"}}> Balance </TableCell>
                                                        <TableCell className="text-center bg-light">
                                                            <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 } ).format(0)} />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="text-center bg-light" sx={{ border: "1px solid #ccc" }}> Payment </TableCell>
                                                        <TableCell className="text-center bg-light">
                                                            <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 } ).format(0)} />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="text-center bg-light" sx={{ border: "1px solid #ccc" }}> Remaining </TableCell>
                                                        <TableCell className="text-center bg-light">
                                                            <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 } ).format(0)} />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </div>

                                    <div className="col-4">
                                        <TableContainer sx={{ my: 2 }}>
                                            <Table className="table table-md table-vcenter table-bordered">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="text-center">{" "}Employee Share{" "}</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {benefits.map((benefit) => (
                                                        <TableRow key={`employee+${benefit.name}`} >
                                                            <TableCell className="text-center bg-light" sx={{ width: "50%" }}> {benefit.name} </TableCell>
                                                            <TableCell className="text-center bg-light">
                                                                <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(benefit.employee_amount)} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        <TableContainer sx={{ my: 2 }}>
                                            <Table className="table table-md table-vcenter table-bordered">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="text-center">{" "}Tax{" "}</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell className="text-center bg-light" sx={{ width: "50%" }}> Tax </TableCell>
                                                        <TableCell className="text-center bg-light">
                                                            <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(0)} />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </div>
                                </div>

                                <div className="row" style={{ marginTop: "10px" }} >
                                    {summaries.map((summary) => (
                                        <div key={summary.name} className="col-4 d-flex justify-content-center" >
                                            <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }}>{" "}{summary.name}{" "}</InputLabel>
                                                <input id="demo-simple-select" className="form-control" type="text" value={new Intl.NumberFormat("en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(summary.amount)} style={{ height: 40, backgroundColor: "#fff", textAlign: "right" }} readOnly />
                                            </FormControl>
                                        </div>
                                    ))}
                                </div>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Box>
        </>
    );
};

export default Payslip;
