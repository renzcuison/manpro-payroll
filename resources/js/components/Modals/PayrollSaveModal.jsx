import React, { useEffect, useState } from "react";
import { InputLabel, FormControl, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import Swal from "sweetalert2";
import "../../../../resources/css/customcss.css";
import PayrollSaveModalConfirmation from "./PayrollSaveModalConfirmation";

const PayrollSaveModal = ({ data, close, cutoff, processtype }) => {

    // console.log("data.absences: ", data.absences);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [openThirteenthMonth, setOpenThirteenthMonth] = useState(false);
    const [incentives, setIncentives] = useState(0);
    const [allowance, setAllowance] = useState(0);
    const [allEarningsData, setAllEarningsData] = useState([]);
    const [allBenefitsData, setAllBenefitsData] = useState([]);
    const [allLoansData, setAllLoansData] = useState([]);
    const [allContributionData, setAllContributionData] = useState([]);
    const [allTaxesData, setAllTaxesData] = useState([]);
    const [contributionAmount, setContributionAmount] = useState();
    const [loanAmount, setLoanAmount] = useState();
    const [taxAmount, setTaxAmount] = useState();
    const [remainingLoan, setRemainingLoan] = useState();
    const [absenceLeave, setAbsenceLeave] = useState();
    const [hoursLeave, setHoursLeave] = useState();
    const [grossPay, setGrossPay] = useState();
    const [totalAddionBenefit, setTotalAddionBenefit] = useState();
    const [totalDeduction, setTotalDeduction] = useState();
    const [totalNetPay, setTotalNetPay] = useState();

    const mrate = parseFloat((data.monthly_rate / 2).toFixed(2));
    const basic_rate = parseFloat((mrate / data.workdays).toFixed(2));
    const hourly_rate = parseFloat((basic_rate / 8).toFixed(2));
    const absences = data.absences * (basic_rate / 480);
    const late = data.tardiness;
    const tardiness = data.tardiness * (hourly_rate / 60);
    const undertime = data.undertime * (hourly_rate / 60);
    const [earnings, setEarnings] = useState({
        grosspay: data.monthly_rate / 2,
        leaveEarnings: 0,
        deductLeave: 0,
        total_earn: 0,
        deductions: absences + tardiness + undertime,
        leaveAbsence: 0,
        leaveHours: 0,
    });

    const [openConfirmation, setOpenConfirmation] = useState(false);
    useEffect(() => {
        axiosInstance.post("/payroll_benefits", { payrollData: data, cutoff: cutoff, basic_rate: basic_rate }, { headers })
            .then((response) => {
                setAllEarningsData(response.data.earningsData);
                setAllBenefitsData(response.data.benefitsAlldata);
                setAllLoansData(response.data.loanAlldata);
                setAllContributionData(response.data.contributeAlldata);
                setAllTaxesData(response.data.taxesAlldata);
                setRemainingLoan(response.data.remainingLoan);
            });
    }, []);

    // Earnings Computation
    let submitEarningsData = [];
    let totalAmountEarnings = [];
    let totalLeaveAbsence = [];
    let totalLeaveHours = [];
    let deductLeaveAmount = [];
    let submitBenefitData = [];
    let total_leaves = [];
    if (allEarningsData != undefined) {
        const earningState = (index) => (e) => {
            const earningArray = allEarningsData.map((list, i) => {
                if (index === i) {
                    return {
                        ...list,
                        ["totalAmount"]: parseFloat(e.target.value),
                    };
                } else {
                    return list;
                }
            });
            setAllEarningsData(earningArray);
        };
        total_leaves = allEarningsData.map((list, index) => {
            submitEarningsData.push({
                ["applist_id"]: list.applist_id,
                ["total_earnings"]: list.totalAmount,
                ["status"]: list.status,
                ["leaveAbsence"]: list.leaveAbsence,
                ["overtime_hours"]: list.total_hours,
            });

            totalAmountEarnings.push(list.status === "Approved" ? list.totalAmount : 0);
            totalLeaveAbsence.push(list.status === "Approved" ? list.leaveAbsence : 0);
            totalLeaveHours.push(list.status === "Approved" ? list.total_hours : 0);
            deductLeaveAmount.push(list.deductLeave ? list.deductLeave : 0);

            return (
                <TableRow key={index}>
                    <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                        {list.list_name}
                    </TableCell>
                    <TableCell className="text-center  bg-light">
                        <input id="demo-simple-select" style={{ height: 30, backgroundColor: "white" }} className="form-control" type="text" value={list.totalAmount && list.status === "Approved" ? parseFloat(list.totalAmount.toFixed(2)) : 0} onChange={earningState(index)} disabled />
                    </TableCell>
                </TableRow>
            );
        });
    }
    useEffect(() => {
        handleComputeLeave(totalAmountEarnings);
    }, [totalAmountEarnings]);

    useEffect(() => {
        handleLeaveAbsence(totalLeaveAbsence);
    }, [totalLeaveAbsence]);

    useEffect(() => {
        handleComputeDeductLeave(deductLeaveAmount);
    }, [deductLeaveAmount]);

    useEffect(() => {
        handleLeaveHours(totalLeaveHours);
    }, [totalLeaveHours]);

    const handleComputeDeductLeave = (deductLeaveAmount) => {
        earnings.deductLeave = Object.values(deductLeaveAmount).reduce((acc, curr) => (acc += Number(curr)), 0);
    };

    const handleComputeLeave = (totalAmountEarnings) => {
        earnings.leaveEarnings = Object.values(totalAmountEarnings).reduce((acc, curr) => (acc += Number(curr)), 0);
    };

    const handleLeaveAbsence = (totalLeaveAbsence) => {
        earnings.leaveAbsence = Object.values(totalLeaveAbsence).reduce((acc, curr) => (acc += Number(curr)), 0);
    };

    const handleLeaveHours = (totalLeaveHours) => {
        earnings.leaveHours = Object.values(totalLeaveHours).reduce((acc, curr) => (acc += Number(curr)), 0);
    };

    // const handleComputeIncentives = (e) => {
    //     const incentives = e.target.value;
    //     const partial_earn = (earnings.grosspay + earnings.leaveEarnings) - earnings.deductions - earnings.deductLeave;
    //     const resultAmount = {
    //         'partial': partial_earn,
    //         'incentives': incentives
    //     }
    //     setEarnings({
    //         ...earnings,
    //         total_earn: Object.values(resultAmount).reduce((acc, curr) => acc += Number(curr), 0)
    //     })
    // }
    // End Earnings Computation

    // Benefits and Loans Computation
    let total_benefit = [];
    let totalAddiotionalBenefit = [];
    let totalDeductionAmount = [];
    let total_loan = [];
    let totalLoanAmount = [];
    if (allBenefitsData != undefined) {
        const benefitState = (index) => (e) => {
            const benefitArray = allBenefitsData.map((list, i) => {
                if (index === i) {
                    return {
                        ...list,
                        ["totalAmount"]: parseFloat(e.target.value),
                    };
                } else {
                    return list;
                }
            });
            setAllBenefitsData(benefitArray);
        };
        total_benefit = allBenefitsData.map((list, index) => {
            totalAddiotionalBenefit.push(
                list.totalAmount ? Number(list.totalAmount) : 0
            );

            submitBenefitData.push({
                ["benefitlist_id"]: list.benefitlist_id,
                ["list_name"]: list.title,
                ["totalAmount"]: list.totalAmount,
                ["type"]: list.type,
                ["taxable"]: list.taxable,
                ["exempt"]: list.exempt,
                ["amountTotal"]: list.amountTotal,
                ["chooseCutoff"]: list.chooseCutoff,
            });

            return (
                <TableRow key={index}>
                    <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                        {list.title}
                    </TableCell>
                    <TableCell className="text-center  bg-light">
                        <input id="demo-simple-select" style={{ height: 30 }} className="form-control" type="text" name={list.title} value={list.totalAmount ? parseFloat(list.totalAmount.toFixed(2)) : 0} onChange={benefitState(index)} />
                    </TableCell>
                </TableRow>
            );
        });
    }

    if (allLoansData != undefined) {
        const loanState = (index) => (e) => {
            const loanArray = allLoansData.map((list, i) => {
                if (index === i) {
                    return {
                        ...list,
                        ["totalAmount"]: parseFloat(e.target.value),
                    };
                } else {
                    return list;
                }
            });
            setAllLoansData(loanArray);
        };
        total_loan = allLoansData.map((list, index) => {
            totalDeductionAmount.push(
                list.totalAmount ? Number(list.totalAmount) : 0
            );

            totalLoanAmount.push(
                list.totalAmount ? Number(list.totalAmount) : 0
            );

            submitBenefitData.push({
                ["benefitlist_id"]: list.benefitlist_id,
                ["list_name"]: list.title,
                ["totalAmount"]: list.totalAmount,
                ["type"]: list.type,
                ["taxable"]: list.taxable,
                ["exempt"]: list.exempt,
                ["amountTotal"]: list.amountTotal,
                ["chooseCutoff"]: list.chooseCutoff,
            });

            return (
                <TableRow key={index}>
                    <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                        {list.title}
                    </TableCell>
                    <TableCell className="text-center  bg-light">
                        <input id="demo-simple-select" style={{ height: 30 }} className="form-control" type="text" name={list.title} value={list.totalAmount ? parseFloat(list.totalAmount.toFixed(2)) : 0} onChange={loanState(index)} />
                    </TableCell>
                </TableRow>
            );

        });
    }
    useEffect(() => {
        handleTotalLoan(totalLoanAmount);
    }, [totalLoanAmount]);

    const handleTotalLoan = (totalLoanAmount) => {
        setLoanAmount(
            Object.values(totalLoanAmount).reduce((acc, curr) => (acc += Number(curr)), 0)
        );
    };

    // END Benefits and Loans Computation

    // Contribution Computation
    let total_contri = [];
    let totalContriAmount = [];
    if (allContributionData != undefined) {
        const contriState = (index) => (e) => {
            const contriArray = allContributionData.map((list, i) => {
                if (index === i) {
                    return {
                        ...list,
                        ["totalAmount"]: parseFloat(e.target.value),
                    };
                } else {
                    return list;
                }
            });

            setAllContributionData(contriArray);
        };
        total_contri = allContributionData.map((list, index) => {
            totalDeductionAmount.push(list.totalAmount ? Number(list.totalAmount) : 0);
            totalContriAmount.push(list.totalAmount ? Number(list.totalAmount) : 0);

            submitBenefitData.push({
                ["benefitlist_id"]: list.benefitlist_id,
                ["list_name"]: list.title,
                ["totalAmount"]: list.totalAmount,
                ["type"]: list.type,
                ["taxable"]: list.taxable,
                ["exempt"]: list.exempt,
                ["amountTotal"]: list.amountTotal,
                ["chooseCutoff"]: list.chooseCutoff,
            });

            return (
                <TableRow key={index}>
                    <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                        {list.title}
                    </TableCell>
                    <TableCell className="text-center  bg-light">
                        <input id="demo-simple-select" style={{ height: 30 }} className="form-control" type="text" name={list.title} value={list.totalAmount ? parseFloat(list.totalAmount.toFixed(2)) : 0} onChange={contriState(index)} />
                    </TableCell>
                </TableRow>
            );

        });
    }

    useEffect(() => {
        handleTotalContribution(totalContriAmount);
    }, [totalContriAmount]);

    const handleTotalContribution = (totalContriAmount) => {
        setContributionAmount(
            Object.values(totalContriAmount).reduce((acc, curr) => (acc += Number(curr)), 0)
        );
    };
    // END Contribution Computation

    // Taxes Computation
    let total_tax = [];
    let totalTaxAmount = [];
    if (allTaxesData != undefined) {
        const taxState = (index) => (e) => {
            const taxArray = allTaxesData.map((list, i) => {
                if (index === i) {
                    return {
                        ...list,
                        ["totalAmount"]: parseFloat(e.target.value),
                    };
                } else {
                    return list;
                }
            });

            setAllTaxesData(taxArray);
        };

        total_tax = allTaxesData.map((list, index) => {
            totalDeductionAmount.push(
                list.totalAmount ? Number(list.totalAmount) : 0
            );

            totalTaxAmount.push(
                list.totalAmount ? Number(list.totalAmount) : 0
            );

            submitBenefitData.push({
                ["benefitlist_id"]: list.benefitlist_id,
                ["list_name"]: list.title,
                ["totalAmount"]: list.totalAmount,
                ["type"]: list.type,
                ["taxable"]: list.taxable,
                ["exempt"]: list.exempt,
                ["amountTotal"]: list.amountTotal,
                ["chooseCutoff"]: list.chooseCutoff,
            });

            return (
                <TableRow key={index}>
                    <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                        {list.title}
                    </TableCell>

                    <TableCell className="text-center  bg-light">
                        <input id="demo-simple-select" style={{ height: 30 }} className="form-control" type="text" name={list.title} value={list.totalAmount ? parseFloat(list.totalAmount.toFixed(2)) : 0} onChange={taxState(index)} />
                    </TableCell>
                </TableRow>
            );
        });
    }

    useEffect(() => {
        handleTotalTax(totalTaxAmount);
    }, [totalTaxAmount]);

    const handleTotalTax = (totalTaxAmount) => {
        setTaxAmount(
            Object.values(totalTaxAmount).reduce((acc, curr) => (acc += Number(curr)), 0)
        );
    };
    // END Taxes Computation

    // NET PAY COMPUTATION
    useEffect(() => {
        handleNetPay(
            earnings.total_earn ? earnings.total_earn : earnings.grosspay +
                (earnings.leaveEarnings - earnings.deductions) +
                (incentives ? parseFloat(incentives.toFixed(2)) : 0) +
                (allowance ? parseFloat(allowance.toFixed(2)) : 0),
            totalDeduction ? parseFloat(totalDeduction.toFixed(2)) : 0,
            totalAddiotionalBenefit
        );
    }, [
        earnings.total_earn ? earnings.total_earn : earnings.grosspay +
            (earnings.leaveEarnings - earnings.deductions) +
            (incentives ? parseFloat(incentives.toFixed(2)) : 0) +
            (allowance ? parseFloat(allowance.toFixed(2)) : 0),
        totalDeduction ? parseFloat(totalDeduction.toFixed(2)) : 0,
        totalAddiotionalBenefit,
    ]);

    useEffect(() => {
        handleTotalAdiiotionalBenefit(totalAddiotionalBenefit);
    }, [totalAddiotionalBenefit]);

    const handleTotalAdiiotionalBenefit = (totalAddiotionalBenefit) => {
        setTotalAddionBenefit(
            Object.values(totalAddiotionalBenefit).reduce((acc, curr) => (acc += Number(curr)), 0)
        );
    };

    useEffect(() => {
        handleTotalDeduction(totalDeductionAmount);
    }, [totalDeductionAmount]);

    const handleTotalDeduction = (totalDeductionAmount) => {
        setTotalDeduction(
            Object.values(totalDeductionAmount).reduce((acc, curr) => (acc += Number(curr)), 0)
        );
    };

    const handleNetPay = (totalEarn, totalDeduction, totalAddiotionalBenefit) => {
        let totalEarnvals = totalEarn
        let additionalVal = cutoff != 1 ? Object.values(totalAddiotionalBenefit).reduce((acc, curr) => acc += Number(curr), 0) : 0

        // console.log("totalEarnvals  : " + totalEarnvals);
        // console.log("additionalVal  : " + additionalVal);
        // console.log("totalDeduction : " + totalDeduction);
        // console.log("================================================");

        setTotalNetPay((totalEarnvals - totalDeduction))
    }
    // END NET PAY

    useEffect(() => {
        // console.log("Absences: ", absences);
        // console.log("Earnings: ", earnings);
        setAbsenceLeave(
            (absences ? parseFloat(absences.toFixed(2)) : 0) - (earnings.leaveAbsence ? parseFloat(earnings.leaveAbsence.toFixed(2)) : 0)
        );

        setGrossPay(
            (data.monthly_rate / 2 ? parseFloat((data.monthly_rate / 2).toFixed(2)) : 0) - (earnings.leaveAbsence ? parseFloat(earnings.leaveAbsence.toFixed(2)) : 0)
        );

        setHoursLeave(
            earnings.leaveHours ? parseFloat(earnings.leaveHours.toFixed(2)) : 0
        );
    }, [
        absences ? parseFloat(absences.toFixed(2)) : 0,
        earnings.leaveAbsence ? parseFloat(earnings.leaveAbsence.toFixed(2)) : 0,
        data.monthly_rate / 2 ? parseFloat((data.monthly_rate / 2).toFixed(2)) : 0,
        earnings.leaveHours ? parseFloat(earnings.leaveHours.toFixed(2)) : 0,
    ]);

    const handleSavePayroll = (e) => {
        e.preventDefault();
        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to save this Payroll Details?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then((res) => {
            if (res.isConfirmed) {
                setOpenConfirmation(true);
            }
        });
    };

    const handleCloseConfirmation = () => {
        setOpenConfirmation(false);
    };

    const handleUpdatePayroll = (e) => {
        e.preventDefault();
        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to update benefits?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance.post("/update_payrollBenefits", { emp_id: data.user_id, isupdated: 1, benefitsList: submitBenefitData }, { headers })
                    .then((response) => {
                        if (response.data.updatedBenefits === "Success") {
                            close();
                            Swal.fire({
                                customClass: { container: "my-swal" },
                                title: "Success!",
                                text: "Payroll Details has been Updated successfully",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: false,
                            });
                        } else {
                            alert("Something went wrong");
                            //console.log(response);
                        }
                    })
                    .catch((error) => {
                        //console.log("error", error.response);
                    });
            }
        });
    };

    const handleDeleteBenefits = (e) => {
        e.preventDefault();
        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to delete benefits?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance.post("/delete_payrollBenefits", { emp_id: data.user_id, }, { headers })
                    .then((response) => {
                        if (response.data.deleteBenefits === "Success") {
                            close();
                            Swal.fire({
                                customClass: { container: "my-swal" },
                                title: "Success!",
                                text: "Payroll Details has been Updated successfully",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: false,
                            });
                        } else {
                            alert("Something went wrong");
                        }
                    })
                    .catch((error) => {
                        //console.log("error", error.response);
                    });
            }
        });
    };

    return (
        <>
            <div className="row" style={{ marginTop: "10px" }}>
                <div className="col-4 d-flex justify-content-center">
                    <FormControl sx={{
                        marginBottom: 2, width: "100%",
                        "& label.Mui-focused": { color: "#97a5ba" },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "#97a5ba" },
                        },
                    }}
                    >
                        <InputLabel sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} id="demo-simple-select-label" shrink={true} >
                            Daily Rate
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" defaultValue={basic_rate ? parseFloat(basic_rate.toFixed(2)) : 0} style={{ height: 40 }} />
                    </FormControl>
                </div>

                <div className="col-4 d-flex justify-content-center">
                    <FormControl sx={{
                        marginBottom: 2, width: "100%",
                        "& label.Mui-focused": { color: "#97a5ba" },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "#97a5ba" },
                        },
                    }}
                    >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Monthly Rate
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" defaultValue={data.monthly_rate ? parseFloat(data.monthly_rate.toFixed(2)) : 0} style={{ height: 40 }} />
                    </FormControl>
                </div>

                <div className="col-4 d-flex justify-content-center">
                    <FormControl sx={{
                        marginBottom: 2, width: "100%",
                        "& label.Mui-focused": { color: "#97a5ba" },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "#97a5ba" },
                        },
                    }}
                    >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Hourly Rate
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" defaultValue={hourly_rate ? parseFloat(hourly_rate.toFixed(2)) : 0} style={{ height: 40 }} />
                    </FormControl>
                </div>
            </div>

            <div className="row">
                <div className="col-4">
                    <TableContainer>
                        <Table className="table table-md table-vcenter table-bordered">
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center bg-light" >
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
                                        <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30 }} disabled className="form-control" type="text" defaultValue={grossPay} />
                                    </TableCell>
                                </TableRow>
                                {total_leaves}
                                <TableRow>
                                    <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                                        13th Month Pay
                                    </TableCell>
                                    <TableCell className="text-center  bg-light">
                                        <input id="demo-simple-select" style={{ height: 30 }} className="form-control" type="text" value={incentives ? parseFloat(incentives.toFixed(2)) : 0} onChange={(e) => setIncentives(parseFloat(e.target.value))} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                                        Leave Credit
                                    </TableCell>
                                    <TableCell className="text-center  bg-light">
                                        <input id="demo-simple-select" style={{ height: 30 }} className="form-control" type="text" value={allowance ? parseFloat(allowance.toFixed(2)) : 0} onChange={(e) => setAllowance(parseFloat(e.target.value))} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                                        Absences
                                    </TableCell>
                                    <TableCell className="text-center  bg-light">
                                        <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30 }} disabled className="form-control" type="text" defaultValue={absenceLeave <= 0 ? 0 : absenceLeave} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                                        Tardiness ({late} Min)
                                    </TableCell>
                                    <TableCell className="text-center  bg-light">
                                        <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30 }} disabled className="form-control" type="text" defaultValue={tardiness ? parseFloat(tardiness.toFixed(2)) : 0} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-center  bg-light" sx={{ width: "50%" }} >
                                        Undertime
                                    </TableCell>
                                    <TableCell className="text-center  bg-light">
                                        <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30 }} disabled className="form-control" type="text" defaultValue={undertime ? parseFloat(undertime.toFixed(2)) : 0} />
                                    </TableCell>
                                </TableRow>
                            </TableBody>

                        </Table>
                    </TableContainer>
                </div>

                <div className="col-4">
                    <TableContainer>
                        <Table className="table table-md table-vcenter table-bordered">
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center bg-light" >
                                        {" "} Additional Benefits
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {total_benefit ? total_benefit : []}
                                {/* <TableRow>
                                    <TableCell className='text-center  bg-light' sx={{ width: '50%' }}>SSS</TableCell>
                                    <TableCell className='text-center  bg-light'>
                                        <input id="demo-simple-select" style={{ height: 30 }} className='form-control' type="text" value={benefitsData.sss ? benefitsData.sss : 0} onChange={(e) => setBenefitsData({ ...benefitsData, sss: e.target.value })} />
                                    </TableCell>
                                </TableRow> */}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <FormControl sx={{
                        marginBottom: 2, width: "100%", marginTop: "10px",
                        "& label.Mui-focused": { color: "#97a5ba" },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "#97a5ba" },
                        },
                    }}
                    >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Total Additional Benefits
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" readOnly defaultValue={totalAddionBenefit} style={{ height: 40, backgroundColor: "white" }} />
                    </FormControl>

                    <FormControl sx={{
                        marginBottom: 2, width: "100%", marginTop: "145px",
                        "& label.Mui-focused": { color: "#97a5ba" },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "#97a5ba" },
                        },
                    }}
                    >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Total Remaining Loan
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" readOnly defaultValue={remainingLoan} style={{ height: 40, backgroundColor: "white" }} />
                    </FormControl>

                    <TableContainer sx={{ marginTop: "10px" }}>
                        <Table className="table table-md table-vcenter table-bordered">
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center bg-light" >
                                        {" "} LOANS
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {total_loan ? total_loan : []}
                                {/* <TableRow>
                                    <TableCell className='text-center  bg-light' sx={{ width: '50%' }}>SSS LOAN</TableCell>
                                    <TableCell className='text-center  bg-light'>
                                        <input id="demo-simple-select" style={{ height: 30 }} className='form-control' type="text" value={loansData.sss ? loansData.sss : 0} onChange={(e) => setLoanData({ ...loansData, sss: e.target.value })} />
                                    </TableCell>
                                </TableRow> */}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <FormControl sx={{
                        marginBottom: 2, width: "100%", marginTop: "10px",
                        "& label.Mui-focused": { color: "#97a5ba" },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "#97a5ba" },
                        },
                    }}
                    >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Total Loan Deduction
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" readOnly defaultValue={loanAmount} style={{ height: 40, backgroundColor: "white" }} />
                    </FormControl>
                </div>

                <div className="col-4">
                    <TableContainer>
                        <Table className="table table-md table-vcenter table-bordered">
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center bg-light" >
                                        {" "} EMPLOYEE CONTRIBUTION
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {total_contri ? total_contri : []}
                                {/* <TableRow>
                                    <TableCell className='text-center  bg-light' sx={{ width: '50%' }}>SSS</TableCell>
                                    <TableCell className='text-center  bg-light'>
                                        <input id="demo-simple-select" style={{ height: 30 }} className='form-control' type="text" name="sss" value={contributionData.sss ? contributionData.sss : 0} onChange={handleContribution} />
                                    </TableCell>
                                </TableRow> */}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <FormControl sx={{
                        marginBottom: 2, width: "100%", marginTop: "10px",
                        "& label.Mui-focused": { color: "#97a5ba" },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "#97a5ba" },
                        },
                    }}
                    >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Total Contribution
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" readOnly defaultValue={contributionAmount} style={{ height: 40, backgroundColor: "white" }} />
                    </FormControl>

                    <TableContainer sx={{ marginTop: "145px" }}>
                        <Table className="table table-md table-vcenter table-bordered">
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center bg-light" >
                                        {" "} EMPLOYEE TAXES
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {total_tax ? total_tax : []}
                                {/* <TableRow>
                                <TableCell className='text-center  bg-light' sx={{ width: '50%' }}>SSS</TableCell>
                                <TableCell className='text-center  bg-light'>
                                    <input id="demo-simple-select" style={{ height: 30 }} className='form-control' type="text" name="sss" value={contributionData.sss ? contributionData.sss : 0} onChange={handleContribution} />
                                </TableCell>
                            </TableRow> */}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <FormControl sx={{
                        marginBottom: 2, width: "100%", marginTop: "10px",
                        "& label.Mui-focused": { color: "#97a5ba" },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "#97a5ba" },
                        },
                    }}
                    >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Total Taxes
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" readOnly value={taxAmount} style={{ height: 40, backgroundColor: "white" }} />
                    </FormControl>

                </div>
            </div>

            <div className="row" style={{ marginTop: 50 }}>
                <div className="col-4">
                    <FormControl sx={{
                        marginBottom: 2, width: "100%", marginTop: "10px",
                        "& label.Mui-focused": { color: "#97a5ba" },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "#97a5ba" },
                        },
                    }}
                    >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Total Earnings
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" style={{ height: 40, backgroundColor: "white" }} readOnly
                            value={
                                parseFloat(
                                    (earnings.grosspay +
                                        (earnings.leaveEarnings - earnings.deductions) +
                                        (incentives ? parseFloat(incentives.toFixed(2)) : 0) +
                                        (allowance ? parseFloat(allowance.toFixed(2)) : 0)
                                    ).toFixed(2)
                                ) + (absenceLeave < 0 ? absenceLeave : 0)
                            }
                        />
                    </FormControl>
                </div>

                <div className="col-4">
                    <FormControl sx={{
                        marginBottom: 2, width: "100%", marginTop: "10px",
                        "& label.Mui-focused": { color: "#97a5ba" },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "#97a5ba" },
                        },
                    }}
                    >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Total Deductions
                        </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" value={totalDeduction ? parseFloat(totalDeduction.toFixed(2)) : 0} style={{ height: 40, backgroundColor: "white" }} readOnly />
                    </FormControl>
                </div>

                <div className="col-4">
                    <FormControl sx={{
                        marginBottom: 2, width: "100%", marginTop: "10px",
                        "& label.Mui-focused": { color: "#97a5ba" },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "#97a5ba" },
                        },
                    }}
                    >
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} >
                            Net Pay
                        </InputLabel>

                        <input id="demo-simple-select" className="form-control" type="text" onChange={(e) => setTotalNetPay(parseFloat(e.target.value))} style={{ height: 40, backgroundColor: "white" }} readOnly
                            value={parseFloat(
                                (
                                    earnings.grosspay +
                                    (earnings.leaveEarnings - earnings.deductions) +
                                    (incentives ? parseFloat(incentives.toFixed(2)) : 0) +
                                    (allowance ? parseFloat(allowance.toFixed(2)) : 0) +
                                    (absenceLeave < 0 ? absenceLeave : 0) -
                                    (totalDeduction ? parseFloat(totalDeduction.toFixed(2)) : 0)
                                ).toFixed(2)
                            )}
                        />
                    </FormControl>
                </div>

            </div>

            <div className='d-flex justify-content-end' style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-success btn-md mr-2" onClick={handleSavePayroll}> Save </button>
                <button type="button" className="btn btn-primary btn-md mr-2" onClick={handleUpdatePayroll} > Update Benefits </button>
                {/* <button type="button" className="btn btn-danger btn-md mr-2" onClick={handleDeleteBenefits} >Clear Benefits
                </button> */}
            </div>

            {openConfirmation && (
                <PayrollSaveModalConfirmation data={{
                    emp_id: data.user_id,
                    payroll_fromdate: data.fromDate,
                    payroll_todate: data.toDate,
                    payroll_cutoff: cutoff,
                    basic_pay: grossPay,
                    monthly_rate: data.monthly_rate ? parseFloat(data.monthly_rate.toFixed(2)) : 0,
                    daily_rate: basic_rate ? parseFloat(basic_rate.toFixed(2)) : 0,
                    hourly_rate: hourly_rate ? parseFloat(hourly_rate.toFixed(2)) : 0,
                    workdays: data.workdays,
                    overtime_hours: hoursLeave,
                    overtime: earnings.leaveEarnings ? parseFloat(earnings.leaveEarnings.toFixed(2)) : 0,
                    total_earnings: parseFloat((earnings.grosspay + (earnings.leaveEarnings - earnings.deductions) + (incentives ? parseFloat(incentives.toFixed(2)) : 0) + (allowance ? parseFloat(allowance.toFixed(2)) : 0)).toFixed(2) + (absenceLeave < 0 ? absenceLeave : 0)),
                    total_gross: grossPay + (earnings.leaveEarnings ? earnings.leaveEarnings : 0),
                    total_deduction: totalDeduction ? parseFloat(totalDeduction.toFixed(2)) : 0,
                    total_contribution: contributionAmount ? parseFloat(contributionAmount.toFixed(2)) : 0,
                    remaining_loan: remainingLoan ? remainingLoan : 0,
                    total_loan_deduct: loanAmount ? loanAmount : 0,
                    total_taxes: taxAmount ? taxAmount : 0,
                    net_pay: (grossPay + (earnings.leaveEarnings ? parseFloat(earnings.leaveEarnings.toFixed(2)) : 0)) - (totalDeduction ? parseFloat(totalDeduction.toFixed(2)) : 0),
                    incentives: incentives ? parseFloat(incentives.toFixed(2)) : 0,
                    allowance: allowance ? parseFloat(allowance.toFixed(2)) : 0,
                    absences: absenceLeave <= 0 ? 0 : absenceLeave,
                    tardiness: tardiness ? parseFloat(tardiness.toFixed(2)) : 0,
                    undertime: undertime ? parseFloat(undertime.toFixed(2)) : 0,
                    earningsData: submitEarningsData,
                    benefitsData: submitBenefitData,
                    processtype: processtype
                }} open={openConfirmation} close={handleCloseConfirmation} closeOrigModal={close} />
            )}
        </>
    );
};

export default PayrollSaveModal;
