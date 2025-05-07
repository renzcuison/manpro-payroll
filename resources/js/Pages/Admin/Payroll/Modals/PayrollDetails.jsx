import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, Typography, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";
import "react-quill/dist/quill.snow.css";

import HomeLogo from "../../../../../images/ManPro.png";

import PayrollBreakdown from "../Components/PayrollBreakdown";
import PayrollInformation from "../Components/PayrollInformation";

const PayrollDetails = ({ open, close, selectedPayroll, currentStartDate, currentEndDate, cutOff}) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [payroll, setPayroll] = useState([]);
    const [employee, setEmployee] = useState([]);
    const [benefits, setBenefits] = useState([]);
    const [summaries, setSummaries] = useState([]);
    const [allowances, setAllowances] = useState([]);

    const [paidLeaves, setPaidLeaves] = useState([]);
    const [unpaidLeaves, setUnpaidLeaves] = useState([]);

    const [earnings, setEarnings] = useState([]);
    const [deductions, setDeductions] = useState([]);

    useEffect(() => {
        // console.log("================================");
        // console.log("selectedPayroll    : " + selectedPayroll);
        // console.log("currentStartDate   : " + currentStartDate);
        // console.log("currentEndDate     : " + currentEndDate);

        const data = {
            selectedPayroll: selectedPayroll,
            currentStartDate: currentStartDate,
            currentEndDate: currentEndDate,
            cutOff: cutOff,
        };

        axiosInstance.get(`/payroll/payrollDetails`, { params: data, headers })
            .then((response) => {
                setPayroll(response.data.payroll);
                setBenefits(response.data.benefits);
                setSummaries(response.data.summaries);
                setAllowances(response.data.allowances);
                
                setPaidLeaves(response.data.paid_leaves);
                setUnpaidLeaves(response.data.unpaid_leaves);

                setEarnings(response.data.earnings);
                setDeductions(response.data.deductions);

                getEmployeeData(response.data.payroll.employeeId);
            })
            .catch((error) => {
                console.error("Error fetching payroll details:", error);
            });
    }, []);

    const getEmployeeData = (employeeId) => {
        const data = { username: employeeId };

        axiosInstance.get(`/employee/getEmployeeDetails`, { params: data, headers })
            .then((response) => {
                if (response.data.status === 200) {
                    setEmployee(response.data.employee);
                }
            })
            .catch((error) => {
                console.error("Error fetching employee:", error);
            });
    };

    const checkInput = (event) => {
        event.preventDefault();

        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to save this payslip?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Save",
            confirmButtonColor: "#177604",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                saveInput(event);
            }
        });
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            selectedPayroll: selectedPayroll,
            currentStartDate: currentStartDate,
            currentEndDate: currentEndDate,
            cutOff: cutOff,
        };

        axiosInstance.post("/payroll/savePayroll", data, { headers })
            .then((response) => {
                Swal.fire({
                    customClass: { container: "my-swal" },
                    text: "Payroll saved successfully!",
                    icon: "success",
                    timer: 1000,
                    showConfirmButton: true,
                    confirmButtonText: "Proceed",
                    confirmButtonColor: "#177604",
                });
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="lg" PaperProps={{ style: { padding: "16px", backgroundColor: "#f8f9fa", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", borderRadius: "20px", minWidth: "1200px", maxWidth: "1500px", marginBottom: "5%", }, }} >
                <DialogTitle sx={{ padding: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: "bold" }} > {" "}Employee Payslip{" "} </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ px: 5, pb: 5 }}>
                    <Box component="form" sx={{ mt: 3, py: 6, bgcolor: "#ffffff" }} noValidate autoComplete="off" encType="multipart/form-data" >
                        <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 1 }} >
                            <Box component="div" sx={{ backgroundImage: `url(${HomeLogo})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", height: 105, width: 300 }} />
                            <Typography sx={{ marginTop: "5px" }}> {" "} Online Payslip {" "} </Typography>
                            <Typography sx={{ marginTop: "5px" }}> {" "} Pay Period: {formatDate( payroll.startDate )} - {formatDate(payroll.endDate)} </Typography>
                        </Box>

                        <Grid container spacing={4} sx={{ px: 8, mt: 4 }}>
                            <Grid item size={12}>

                                <PayrollInformation payroll={payroll} employee={employee} />

                                <PayrollBreakdown payroll={payroll} employee={employee} paidLeaves={paidLeaves} unpaidLeaves={unpaidLeaves} earnings={earnings} deductions={deductions} benefits={benefits} allowances={allowances} />

                                <div className="row" style={{ marginTop: "10px" }}>
                                    {summaries.map((summary) => (
                                        <div key={summary.name} className="col-4 d-flex justify-content-center">
                                            <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }}> {summary.name} </InputLabel>
                                                <input id="demo-simple-select" className='form-control' type="text" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(summary.amount)} style={{ height: 40, backgroundColor: '#fff', textAlign: 'right' }} readOnly />
                                            </FormControl>
                                        </div>
                                    ))}
                                </div>
                                
                            </Grid>
                        </Grid>
                    </Box>

                    <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} className="m-1" onClick={checkInput} >
                            <p className="m-0">
                                <i className="fa fa-floppy-o mr-2 mt-1"></i>{" "}Save{" "}
                            </p>
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PayrollDetails;
// 1284