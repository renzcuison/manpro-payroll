import React, { useEffect, useState, useRef } from "react";
import { InputLabel, FormControl, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Divider, Typography, Grid, Input, Button, TextField } from "@mui/material";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import Swal from "sweetalert2";
import "../../../../resources/css/customcss.css";
import { useUser } from "../../hooks/useUser";

const loading1 = function () {
    Swal.fire({
        customClass: { container: "my-swal" },
        title: "Please Wait...",
        allowOutsideClick: false,
        showConfirmButton: false,
    }),
    Swal.showLoading();
};

const MemberPayrollModal = ({ data, handleToPrint, close, cutoff }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [allRecords, setAllRecords] = useState({
        total_earnings_val: 0,
        total_deductions_val: 0,
        total_netpay_val: 0,
        total_contribution_val: 0,
        total_loans_val: 0,
    });
    const [remainingLoan, setRemainingLoan] = useState(0);
    const [computeUpdateContribution, setComputeUpdateContribution] = useState(0);
    const [computeUpdateLoan, setComputeUpdateLoan] = useState(0);
    const [computeUpdateTaxes, setComputeUpdateTaxes] = useState(0);
    const [computeUpdateEarnings, setComputeUpdateEarnings] = useState(0);
    const [computeUpdateDeduction, setComputeUpdateDeduction] = useState(0);
    const [earningsData, setEarningsData] = useState([]);
    const [benefitsData, setBenefitsData] = useState([]);
    const [loanData, setLoanData] = useState([]);
    const [contributionData, setContributionData] = useState();
    const [taxesData, setTaxesData] = useState();
    const [totalAddionBenefit, setTotalAddionBenefit] = useState();
    const [memberPayrollRecord, setMemberPayrollRecord] = useState([]);
    const [userRate, setUserRate] = useState({
        mrate: data.monthly_rate / 2,
        basic_rate: data.daily_rate,
        hourly_rate: data.hourly,
    });
    const [signatureRecord, setSignatureRecord] = useState([]);
    useEffect(() => {
        handleGetRecords();
    }, []);

    useEffect(() => {
        axiosInstance
            .post( "/payroll_remainingLoan", { payrollData: data, }, { headers } )
            .then((response) => {
                setRemainingLoan(response.data.remainingLoan);
            });
    }, []);

    const handleGetRecords = () => {
        axiosInstance
            .get(`/payrollRecordBenefits/${data.payroll_id}`, { headers })
            .then((response) => {
                setEarningsData(response.data.earnings_data);
                setBenefitsData(response.data.benefitsRecords);
                setLoanData(response.data.loan_data);
                setContributionData(response.data.contribution_data);
                setTaxesData(response.data.taxes_data);
            });
    };

    useEffect(() => {
        axiosInstance
            .get("/member_payroll_record", { headers })
            .then((response) => {
                setMemberPayrollRecord(response.data.recordData);
            });
    }, []);

    // earnings Data
    let submitEarningsData = [];
    let earnings_showData = [];
    let incentives_data = 0;
    let allowance_data = 0;
    let totalAddiotionalBenefit = [];
    const totalEarnings = [];
    const totalDeductAmount = [];
    if (earningsData != undefined) {
        const earnState = (index) => (e) => {
            const earningArray = earningsData.map((list, i) => {
                if (index === i) {
                    return {
                        ...list,
                        ["totalAmount"]: parseFloat(e.target.value),
                    };
                } else {
                    return list;
                }
            });
            setEarningsData(earningArray);
        };
        earnings_showData = earningsData.map((list, index) => {
            let count = 0;

            if ( list.list_name == "Absences" || list.list_name == "Tardiness" || list.list_name == "Undertime" ) {
                totalDeductAmount.push( list.totalAmount ? Number(list.totalAmount) : 0 );
            } else {
                totalEarnings.push( list.status === "Approved" || list.list_name == "Incentives" || list.list_name == "Allowance" ? list.totalAmount ? Number(list.totalAmount) : 0 : 0 );
                if (list.list_name == "Incentives") {
                    incentives_data = list.totalAmount;
                }
                if (list.list_name == "Allowance") {
                    allowance_data = list.totalAmount;
                } else {
                    submitEarningsData.push({ ["applist_id"]: list.applist_id, ["total_earnings"]: list.totalAmount });
                }
            }
            return (
                <>
                    <TableRow key={count++}>
                        <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                            {list.list_name === "Incentives" ? "13th Month Pay" :  list.list_name === "Allowance" ? "Leave Credit" :  list.list_name}
                        </TableCell>
                        <TableCell className="text-center  bg-light">
                            <input id="demo-simple-select" style={{ height: 30, backgroundColor: "white" }} className="form-control" type="text" name={list.list_name} readOnly value={ list.status === "Approved" || list.list_name == "Absences" || list.list_name == "Tardiness" || list.list_name == "Undertime" || list.list_name == "Incentives" || list.list_name == "Allowance" ? list.totalAmount : 0 } onChange={earnState(index)} />
                        </TableCell>
                    </TableRow>
                </>
            );
        });
        useEffect(() => {
            handleTotalEarn(totalEarnings, totalDeductAmount);
        }, [totalEarnings, totalDeductAmount]);

        const handleTotalEarn = (totalEarnings, totalDeductAmount) => {
            const earnings = Object.values(totalEarnings).reduce((acc, curr) => (acc += Number(curr)), 0 );
            const deduction = Object.values(totalDeductAmount).reduce((acc, curr) => (acc += Number(curr)), 0 );
            const total = earnings - deduction;
            setComputeUpdateEarnings(data.basic_pay + total);
        };
    }
    // END earnings Data

    // benefit Data
    let benefit_showData = [];
    const totalBenefitAmount = [];
    let loan_showData = [];
    const loan_showAmount = [];
    const totalLoanAmount = [];
    let benefitDataSubmit = [];
    if (benefitsData != undefined) {
        const benefitState = (index) => (e) => {
            const benefitArray = benefitsData.map((list, i) => {
                if (index === i) {
                    return {
                        ...list,
                        ["totalAmount"]: parseFloat(e.target.value),
                    };
                } else {
                    return list;
                }
            });

            setBenefitsData(benefitArray);
        };
        benefit_showData = benefitsData.map((list, index) => {
            let count = 0;
            benefitDataSubmit.push(list);
            totalAddiotionalBenefit.push( list.totalAmount ? Number(list.totalAmount) : 0 );

            return (
                <>
                    <TableRow key={count++}>
                        <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                            {list.list_name}
                        </TableCell>
                        <TableCell className="text-center  bg-light">
                            <input id="demo-simple-select" style={{ height: 30, backgroundColor: "white" }} className="form-control" type="text" name={list.list_name} value={ list.totalAmount != 0 ? list.totalAmount : 0 } onChange={benefitState(index)} readOnly />
                        </TableCell>
                    </TableRow>
                </>
            );
        });
    }

    if (loanData != undefined) {
        const loanState = (index) => (e) => {
            const loanArray = loanData.map((list, i) => {
                if (index === i) {
                    return {
                        ...list,
                        ["totalAmount"]: parseFloat(e.target.value),
                    };
                } else {
                    return list;
                }
            });

            setLoanData(loanArray);
        };
        loan_showData = loanData.map((list, index) => {
            let count = 0;
            benefitDataSubmit.push(list);
            loan_showAmount.push(
                list.totalAmount ? Number(list.totalAmount) : 0
            );
            totalLoanAmount.push(
                list.totalAmount ? Number(list.totalAmount) : 0
            );

            return (
                <>
                    <TableRow key={count++}>
                        <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                            {list.list_name}
                        </TableCell>
                        <TableCell className="text-center  bg-light">
                            <input id="demo-simple-select" style={{ height: 30, backgroundColor: "white" }} className="form-control" type="text" name={list.list_name} value={ list.totalAmount != 0 ? list.totalAmount : 0 } onChange={loanState(index)} readOnly />
                        </TableCell>
                    </TableRow>
                </>
            );
        });
    }
    if (loan_showAmount != []) {
        useEffect(() => {
            handleTotalLoan(loan_showAmount);
        }, [loan_showAmount]);

        const handleTotalLoan = (loan_showAmount) => {
            const totalUpdateEarnings = Object.values(loan_showAmount).reduce((acc, curr) => (acc += Number(curr)), 0 );
            setComputeUpdateLoan(totalUpdateEarnings);
        };
    }

    // END benefit Data

    // Contribution Data
    let contri_showData = [];
    const contri_showAmount = [];
    const totalContriAmount = [];
    if (contributionData != undefined) {
        const contriState = (index) => (e) => {
            const contriArray = contributionData.map((list, i) => {
                if (index === i) {
                    return {
                        ...list,
                        ["totalAmount"]: parseFloat(e.target.value),
                    };
                } else {
                    return list;
                }
            });

            setContributionData(contriArray);
        };
        contri_showData = contributionData.map((list, index) => {
            let count = 0;
            benefitDataSubmit.push(list);
            contri_showAmount.push(list.totalAmount ? Number(list.totalAmount) : 0 );
            if (cutoff != 2) {
                totalContriAmount.push( list.totalAmount ? Number(list.totalAmount) : 0 );
            } else {
                totalContriAmount.push(0);
            }

            return (
                <>
                    <TableRow key={count++}>
                        <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                            {list.list_name}
                        </TableCell>
                        <TableCell className="text-center  bg-light">
                            <input id="demo-simple-select" style={{ height: 30, backgroundColor: "white" }} className="form-control" type="text" name={list.list_name} value={ list.totalAmount != 0 ? list.totalAmount : 0 } onChange={contriState(index)} readOnly />
                        </TableCell>
                    </TableRow>
                </>
            );
        });
    }
    if (contri_showAmount != []) {
        useEffect(() => {
            handleTotalContri(contri_showAmount);
        }, [contri_showAmount]);

        const handleTotalContri = (contri_showAmount) => {
            const totalUpdateEarnings = Object.values(contri_showAmount).reduce((acc, curr) => (acc += Number(curr)), 0 );
            setComputeUpdateContribution(totalUpdateEarnings);
        };
    }
    // END Contribution Data

    // Taxes Data
    let taxes_showData = [];
    const taxes_showAmount = [];
    if (taxesData != undefined) {
        const taxesState = (index) => (e) => {
            const taxesArray = taxesData.map((list, i) => {
                if (index === i) {
                    return {
                        ...list,
                        ["totalAmount"]: parseFloat(e.target.value),
                    };
                } else {
                    return list;
                }
            });

            setTaxesData(taxesArray);
        };

        taxes_showData = taxesData.map((list, index) => {
            let count = 0;
            benefitDataSubmit.push(list);
            taxes_showAmount.push( list.totalAmount ? Number(list.totalAmount) : 0 );
            if (cutoff != 2) {
                totalContriAmount.push( list.totalAmount ? Number(list.totalAmount) : 0 );
            } else {
                totalContriAmount.push(0);
            }

            return (
                <>
                    <TableRow key={count++}>
                        <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                            {list.list_name}
                        </TableCell>
                        <TableCell className="text-center  bg-light">
                            <input id="demo-simple-select" style={{ height: 30, backgroundColor: "white" }} className="form-control" type="text" name={list.list_name} value={ list.totalAmount != 0 ? list.totalAmount : 0 } onChange={taxesState(index)} readOnly />
                        </TableCell>
                    </TableRow>
                </>
            );
        });
    }
    if (taxes_showAmount != []) {
        useEffect(() => {
            handleTotaltaxes(taxes_showAmount);
        }, [taxes_showAmount]);

        const handleTotaltaxes = (taxes_showAmount) => {
            const totalUpdateEarnings = Object.values(taxes_showAmount).reduce((acc, curr) => (acc += Number(curr)), 0 );
            setComputeUpdateTaxes(totalUpdateEarnings);
        };
    }
    // END Taxes Data

    useEffect(() => {
        handleTotalAdiiotionalBenefit(totalAddiotionalBenefit);
    }, [totalAddiotionalBenefit]);

    const handleTotalAdiiotionalBenefit = (totalAddiotionalBenefit) => {
        setTotalAddionBenefit(
            Object.values(totalAddiotionalBenefit).reduce((acc, curr) => (acc += Number(curr)), 0 )
        );
    };

    useEffect(() => {
        handleTotalBenefit( cutoff != 2 ? totalContriAmount : [], totalLoanAmount );
    }, [cutoff != 2 ? totalContriAmount : [], totalLoanAmount]);

    const handleTotalBenefit = (totalContriAmount, totalLoanAmount) => {
        const computedBenefit = totalContriAmount.concat(totalLoanAmount);
        if (computedBenefit != []) {
            const totalUpdateEarnings = Object.values(computedBenefit).reduce((acc, curr) => (acc += Number(curr)), 0 );
            setComputeUpdateDeduction(totalUpdateEarnings);
        } else {
            setComputeUpdateDeduction(benefitsData.total_deductions_val);
        }
    };

    const additionalVal = cutoff != 1 ? Object.values(totalAddiotionalBenefit).reduce((acc, curr) => (acc += Number(curr)), 0 ) : 0;

    const handleUpdatePayroll = (e) => {
        e.preventDefault();
        close();
        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to Update this Payroll Details?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then((res) => {
            console.log(res);
            if (res.isConfirmed) {
                axiosInstance.put(`/update_payroll/${data.payroll_id}`,
                    {
                        earningsData: submitEarningsData,
                        incentives: incentives_data,
                        benefitsData: benefitDataSubmit,
                        total_earnings: computeUpdateEarnings,
                        total_deduction: computeUpdateDeduction,
                        total_contribution: computeUpdateContribution,
                        total_taxes: computeUpdateTaxes,
                        net_pay: computeUpdateEarnings - computeUpdateDeduction,
                    },
                    { headers }
                )
                .then((response) => {
                    if (response.data.updatePayroll === "Success") {
                        Swal.fire({
                            customClass: { container: "my-swal" },
                            title: "Success!",
                            text: "Payroll Details has been Saved successfully",
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: false,
                        }).then(function () {
                            location.reload();
                        });
                    } else {
                        alert("Something went wrong");
                    }
                })
                .catch((error) => {
                    console.log("error", error.response);
                });
            }
        });
    };

    const handleSendPayroll = (e) => {
        e.preventDefault();
        close();
        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to Send this Payroll to this Employee?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then((res) => {
            if (res.isConfirmed) {
                loading1();
                axiosInstance.put(`/update_payrollVisibility/${data.payroll_id}`,{payroll_status: 1},{ headers})
                    .then((response) => {
                        if (response.data.payrollStatus === "Success") {
                            axiosInstance
                                .get(`/sendPayrollMail/${data.payroll_id}`, { headers })
                                .then((response) => {
                                    if (response.data.userData === "Success") {
                                        close();
                                        Swal.fire({
                                            customClass: { container: "my-swal" },
                                            title: "Success!",
                                            text: "Payroll Details has been Sent!",
                                            icon: "success",
                                            timer: 1000,
                                            showConfirmButton: false,
                                        }).then(function () {
                                            // location.reload()
                                        });
                                    } else {
                                        console.log(response);
                                    }
                                })
                                .catch((error) => {
                                    console.log("error", error.response);
                                });
                        } else {
                            alert("Something went wrong");
                            console.log(response);
                        }
                    })
                    .catch((error) => {
                        console.log("error", error.response);
                    });
            }
        });
    };
    const handleHidePayroll = (e) => {
        e.preventDefault();
        close();
        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to Unsend this Payroll to this Employee?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance.put(`/update_payrollHide/${data.payroll_id}`,{ payroll_status: 0 }, { headers })
                    .then((response) => {
                        if (response.data.payrollStatus === "Success") {
                            close();
                            Swal.fire({
                                customClass: { container: "my-swal" },
                                title: "Success!",
                                text: "Payroll Details has been Unsend!",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: false,
                            }).then(function () {
                                location.reload();
                            });
                        } else {
                            alert("Something went wrong");
                        }
                    })
                    .catch((error) => {
                        console.log("error", error.response);
                    });
            }
        });
    };
    const handleDeletePayroll = (e) => {
        e.preventDefault();
        close();
        new Swal({
            title: "Are you sure?",
            text: "You want to Delete this Payroll to this Employee?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance.put(`/update_payrollDelete/${data.payroll_id}`, {payroll_status: 0}, { headers })
                    .then((response) => {
                        if (response.data.payrollStatus === "Success") {
                            close();
                            Swal.fire({
                                customClass: { container: "my-swal" },
                                title: "Success!",
                                text: "Payroll Details has been Deleted!",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: false,
                            }).then(function () {
                                location.reload();
                            });
                        } else {
                            alert("Something went wrong");
                        }
                    })
                    .catch((error) => {
                        console.log("error", error.response);
                    });
            }
        });
    };

    const handleChange = (event) => {
        // Handle file input separately
        setSignatureRecord({
            ...signatureRecord,
            signature: event.target.files[0],
        });
    };

    const handleSignature = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("signature", signatureRecord.signature);

        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to submit signature?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance
                    .post("/signature", formData, { headers })
                    .then(function (response) {
                        console.log(response);
                        location.reload();
                    })
                    .catch((error) => {
                        console.log(error);
                        location.reload();
                    });
            } else {
                location.reload();
            }
        });
    };

    return (
        <>
            <div className="row" style={{ marginTop: "10px" }}>
                <div className="col-4 d-flex justify-content-center">
                    <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Daily Rate </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" defaultValue={data.daily_rate} style={{ height: 40 }} readOnly />
                    </FormControl>
                </div>
                <div className="col-4 d-flex justify-content-center">
                    <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Monthly Rate </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" defaultValue={data.monthly_rate} style={{ height: 40 }} readOnly />
                    </FormControl>
                </div>
                <div className="col-4 d-flex justify-content-center">
                    <FormControl sx={{ marginBottom: 2, width: "100%", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }}> Hourly Rate </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" defaultValue={data.hourly_rate} style={{ height: 40 }} readOnly />
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
                                        <TableCell colSpan={2} className="text-center" > {" "} Earnings </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="text-center  bg-light" sx={{ width: "50%" }} > Basic Pay </TableCell>
                                        <TableCell className="text-center  bg-light">
                                            <input id="demo-simple-select" style={{backgroundColor: "white",height: 30}} readOnly className="form-control" type="text" defaultValue={data.basic_pay} />
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
                                        <TableCell colSpan={2} className="text-center" > {" "} Additional Benefits </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{benefit_showData}</TableBody>
                            </Table>
                        </TableContainer>
                        <FormControl sx={{ marginBottom: 2, width: "100%", marginTop: "10px", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Total Additional Benefits </InputLabel>
                            <input id="demo-simple-select" className="form-control" type="text" defaultValue={totalAddionBenefit} style={{ height: 40 }} readOnly />
                        </FormControl>
                        <FormControl sx={{ marginBottom: 2, width: "100%", marginTop: "145px", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }, }, }} >
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Total Remaining Loan </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" disabled type="text" value={data.remaining_loan} readOnly style={{ height: 40 }} />
                        </FormControl>
                        <TableContainer sx={{ marginTop: "10px" }}>
                            <Table className="table table-md table-vcenter table-bordered">
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center"> {" "} LOANS </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{loan_showData}</TableBody>
                            </Table>
                        </TableContainer>

                        <FormControl sx={{ marginBottom: 2, width: "100%", marginTop: "10px", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Total Loan Deduction </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" disabled type="text" value={computeUpdateLoan} readOnly style={{ height: 40 }} />
                        </FormControl>
                    </div>
                    <div className="col-4">
                        <TableContainer>
                            <Table className="table table-md table-vcenter table-bordered">
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center"> {" "} EMPLOYEE CONTRIBUTION </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{contri_showData}</TableBody>
                            </Table>
                        </TableContainer>

                        <FormControl sx={{ marginBottom: 2, width: "100%", marginTop: "10px", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Total Contribution </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" disabled type="text" value={computeUpdateContribution} readOnly style={{ height: 40 }} />
                        </FormControl>

                        <TableContainer sx={{ marginTop: "145px" }}>
                            <Table className="table table-md table-vcenter table-bordered">
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center " > {" "} EMPLOYEE TAXES </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{taxes_showData}</TableBody>
                            </Table>
                        </TableContainer>

                        <FormControl sx={{ marginBottom: 2, width: "100%", marginTop: "10px", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Total Taxes </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" disabled type="text" value={computeUpdateTaxes} readOnly style={{ height: 40 }} />
                        </FormControl>
                    </div>
                </div>
                <div className="row" style={{ marginTop: 50 }}>
                    <div className="col-4">
                        <FormControl sx={{ marginBottom: 2, width: "100%", marginTop: "10px", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >  Total Earnings  </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" type="text" readOnly value={computeUpdateEarnings.toFixed(2)} onChange={(e) => setAllRecords({ ...allRecords, total_earnings_val: e.target.value }) } style={{ height: 40 }} />
                        </FormControl>
                    </div>
                    <div className="col-4">
                        <FormControl sx={{ marginBottom: 2, width: "100%", marginTop: "10px", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Total Deductions </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" type="text" readOnly value={computeUpdateDeduction} onChange={(e) => setAllRecords({ ...allRecords, total_deductions_val: e.target.value })} style={{ height: 40 }} />
                        </FormControl>
                    </div>
                    <div className="col-4">
                        <FormControl sx={{ marginBottom: 2, width: "100%", marginTop: "10px", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Net Pay </InputLabel>
                            <input id="demo-simple-select" className="form-control bg-white" type="text" value={( computeUpdateEarnings - computeUpdateDeduction ).toFixed(2)} readOnly />
                        </FormControl>
                    </div>
                </div>

                <div className="row" style={{ marginTop: 10 }}>
                    <div className="col-4">
                        <FormControl sx={{ marginBottom: 2, width: "100%", marginTop: "10px", "& label.Mui-focused": { color: "#97a5ba" }, "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#97a5ba" }}}}>
                            {data.signature ? (
                                <img className="d-flex justify-content-center" src={ location.origin + "/storage/" + data.signature } style={{ height: 70, width: 100, margin: "0 auto", display: "block", }} />
                            ) : (
                                <>
                                    <Grid item xs={12} sx={{ marginTop: 2 }}>
                                        <FormControl fullWidth variant="outlined" >
                                            <TextField type="file" accept="image/*" name="signature" id="signature" required onChange={handleChange} />
                                        </FormControl>
                                    </Grid>
                                </>
                            )}

                            <Divider sx={{ marginTop: 2, border: "0.5px solid" }} />
                            <Typography sx={{ fontStyle: "italic", textAlign: "center" }}> Employee Signature </Typography>
                        </FormControl>
                    </div>
                </div>
            </div>

            {data.signature ? (
                <></>
            ) : (
                <>
                    <div className="d-flex justify-content-center" style={{ marginTop: 20 }} >
                        <Grid className="col-md-4" sx={{ marginTop: 2 }}>
                            <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleSignature}> Submit Signature </Button>
                        </Grid>
                    </div>
                </>
            )}
        </>
    );
};

export default MemberPayrollModal;
