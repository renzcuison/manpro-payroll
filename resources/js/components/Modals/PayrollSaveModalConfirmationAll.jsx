import React, { useState, useEffect } from "react";
import {
    InputLabel,
    FormControl,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
} from "@mui/material";
import { Box } from "@mui/system";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import Swal from "sweetalert2";
import "../../../../resources/css/customcss.css";

const PayrollSaveModalConfirmationAll = ({
    selectedUsers,
    totalPayroll,
    selectCutoff,
    processtype,
    open,
    close,
    closeOrigModal,
}) => {
    const [verifyValue, setVerifyValue] = useState(false);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const handleConfirmation = (e) => {
        if (e.target.value == "saved" || e.target.value == "Saved") {
            setVerifyValue(true);
        } else {
            setVerifyValue(false);
        }
    };

    const savePromises = [];

    const postDataArray = selectedUsers.map((selectedId) => {
        const selectedUserData = totalPayroll.find(
            (data) => data.user_id === selectedId
        );

        if (selectedUserData) {
            const [incentives, setIncentives] = useState(0);
            const [allowance, setAllowance] = useState(0);
            const [allEarningsData, setAllEarningsData] = useState([]);
            const [allBenefitsData, setAllBenefitsData] = useState([]);
            const [allLoansData, setAllLoansData] = useState([]);
            const [allContributionData, setAllContributionData] = useState([]);
            const [allTaxesData, setAllTaxesData] = useState([]);
            const [contributionAmount, setContributionAmount] = useState();
            const [taxAmount, setTaxAmount] = useState();
            const [remainingLoan, setRemainingLoan] = useState();
            const [loanAmount, setLoanAmount] = useState();
            const [totalAddionBenefit, setTotalAddionBenefit] = useState();
            const [totalDeduction, setTotalDeduction] = useState();
            const [totalNetPay, setTotalNetPay] = useState();
            const mrate = parseFloat(
                (selectedUserData.monthly_rate / 2).toFixed(2)
            );
            const basic_rate = parseFloat(
                (mrate / selectedUserData.workdays).toFixed(2)
            );
            const hourly_rate = parseFloat((basic_rate / 8).toFixed(2));
            const absences = selectedUserData.absences * (basic_rate / 480);
            const tardiness = selectedUserData.tardiness * (hourly_rate / 60);
            const undertime = selectedUserData.undertime * (hourly_rate / 60);
            const [earnings, setEarnings] = useState({
                grosspay: selectedUserData.monthly_rate / 2,
                leaveEarnings: 0,
                deductLeave: 0,
                total_earn: 0,
                deductions: absences + tardiness + undertime,
                leaveAbsence: 0,
                leaveHours: 0,
            });
            const [grossPay, setGrossPay] = useState();
            const [hoursLeave, setHoursLeave] = useState();
            const [absenceLeave, setAbsenceLeave] = useState();

            useEffect(() => {
                axiosInstance
                    .post(
                        "/payroll_benefits",
                        {
                            payrollData: selectedUserData,
                            cutoff: selectCutoff,
                            basic_rate: basic_rate,
                        },
                        { headers }
                    )
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
                            return { ...list, ["totalAmount"]: e.target.value };
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
                    totalAmountEarnings.push(
                        list.status === "Approved" ? list.totalAmount : 0
                    );
                    totalLeaveAbsence.push(
                        list.status === "Approved" ? list.leaveAbsence : 0
                    );
                    totalLeaveHours.push(
                        list.status === "Approved" ? list.total_hours : 0
                    );
                    deductLeaveAmount.push(
                        list.deductLeave ? list.deductLeave : 0
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
                earnings.deductLeave = Object.values(deductLeaveAmount).reduce(
                    (acc, curr) => (acc += Number(curr)),
                    0
                );
            };
            const handleComputeLeave = (totalAmountEarnings) => {
                earnings.leaveEarnings = Object.values(
                    totalAmountEarnings
                ).reduce((acc, curr) => (acc += Number(curr)), 0);
            };
            const handleLeaveAbsence = (totalLeaveAbsence) => {
                earnings.leaveAbsence = Object.values(totalLeaveAbsence).reduce(
                    (acc, curr) => (acc += Number(curr)),
                    0
                );
            };
            const handleLeaveHours = (totalLeaveHours) => {
                earnings.leaveHours = Object.values(totalLeaveHours).reduce(
                    (acc, curr) => (acc += Number(curr)),
                    0
                );
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
                            return { ...list, ["totalAmount"]: e.target.value };
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
                });
            }

            if (allLoansData != undefined) {
                const loanState = (index) => (e) => {
                    const loanArray = allLoansData.map((list, i) => {
                        if (index === i) {
                            return { ...list, ["totalAmount"]: e.target.value };
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
                });
            }
            useEffect(() => {
                handleTotalLoan(totalLoanAmount);
            }, [totalLoanAmount]);

            const handleTotalLoan = (totalLoanAmount) => {
                setLoanAmount(
                    Object.values(totalLoanAmount).reduce(
                        (acc, curr) => (acc += Number(curr)),
                        0
                    )
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
                            return { ...list, ["totalAmount"]: e.target.value };
                        } else {
                            return list;
                        }
                    });

                    setAllContributionData(contriArray);
                };
                total_contri = allContributionData.map((list, index) => {
                    totalDeductionAmount.push(
                        list.totalAmount ? Number(list.totalAmount) : 0
                    );
                    totalContriAmount.push(
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
                });
            }
            useEffect(() => {
                handleTotalContribution(totalContriAmount);
            }, [totalContriAmount]);

            const handleTotalContribution = (totalContriAmount) => {
                setContributionAmount(
                    Object.values(totalContriAmount).reduce(
                        (acc, curr) => (acc += Number(curr)),
                        0
                    )
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
                            return { ...list, ["totalAmount"]: e.target.value };
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
                });
            }
            useEffect(() => {
                handleTotalTax(totalTaxAmount);
            }, [totalTaxAmount]);

            const handleTotalTax = (totalTaxAmount) => {
                setTaxAmount(
                    Object.values(totalTaxAmount).reduce(
                        (acc, curr) => (acc += Number(curr)),
                        0
                    )
                );
            };
            // END Taxes Computation

            // NET PAY COMPUTATION
            useEffect(() => {
                handleNetPay(
                    earnings.total_earn
                        ? earnings.total_earn
                        : earnings.grosspay +
                              (earnings.leaveEarnings - earnings.deductions) +
                              (incentives
                                  ? parseFloat(incentives.toFixed(2))
                                  : 0) +
                              (allowance
                                  ? parseFloat(allowance.toFixed(2))
                                  : 0),
                    totalDeduction ? parseFloat(totalDeduction.toFixed(2)) : 0,
                    totalAddiotionalBenefit
                );
            }, [
                earnings.total_earn
                    ? earnings.total_earn
                    : earnings.grosspay +
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
                    Object.values(totalAddiotionalBenefit).reduce(
                        (acc, curr) => (acc += Number(curr)),
                        0
                    )
                );
            };

            useEffect(() => {
                handleTotalDeduction(totalDeductionAmount);
            }, [totalDeductionAmount]);

            const handleTotalDeduction = (totalDeductionAmount) => {
                setTotalDeduction(
                    Object.values(totalDeductionAmount).reduce(
                        (acc, curr) => (acc += Number(curr)),
                        0
                    )
                );
            };

            const handleNetPay = (
                totalEarn,
                totalDeduction,
                totalAddiotionalBenefit
            ) => {
                let totalEarnvals = totalEarn;
                let additionalVal =
                    selectCutoff != 1
                        ? Object.values(totalAddiotionalBenefit).reduce(
                              (acc, curr) => (acc += Number(curr)),
                              0
                          )
                        : 0;
                setTotalNetPay(totalEarnvals - totalDeduction);
            };
            // END NET PAY

            useEffect(() => {
                setAbsenceLeave(
                    (absences ? parseFloat(absences.toFixed(2)) : 0) -
                        (earnings.leaveAbsence
                            ? parseFloat(earnings.leaveAbsence.toFixed(2))
                            : 0)
                );
                setGrossPay(
                    (selectedUserData.monthly_rate / 2
                        ? parseFloat(
                              (selectedUserData.monthly_rate / 2).toFixed(2)
                          )
                        : 0) -
                        (earnings.leaveAbsence
                            ? parseFloat(earnings.leaveAbsence.toFixed(2))
                            : 0)
                );
                setHoursLeave(
                    earnings.leaveHours
                        ? parseFloat(earnings.leaveHours.toFixed(2))
                        : 0
                );
            }, [
                absences ? parseFloat(absences.toFixed(2)) : 0,
                earnings.leaveAbsence
                    ? parseFloat(earnings.leaveAbsence.toFixed(2))
                    : 0,
                selectedUserData.monthly_rate / 2
                    ? parseFloat((selectedUserData.monthly_rate / 2).toFixed(2))
                    : 0,
                earnings.leaveHours
                    ? parseFloat(earnings.leaveHours.toFixed(2))
                    : 0,
            ]);

            const postData = {
                emp_id: selectedUserData.user_id,
                payroll_fromdate: selectedUserData.fromDate,
                payroll_todate: selectedUserData.toDate,
                payroll_cutoff: selectCutoff,
                basic_pay: grossPay,
                monthly_rate: selectedUserData.monthly_rate
                    ? parseFloat(selectedUserData.monthly_rate.toFixed(2))
                    : 0,
                daily_rate: basic_rate ? parseFloat(basic_rate.toFixed(2)) : 0,
                hourly_rate: hourly_rate
                    ? parseFloat(hourly_rate.toFixed(2))
                    : 0,
                workdays: selectedUserData.workdays,
                overtime_hours: hoursLeave,
                overtime: earnings.leaveEarnings
                    ? parseFloat(earnings.leaveEarnings.toFixed(2))
                    : 0,
                total_earnings: earnings.total_earn
                    ? earnings.total_earn
                    : parseFloat(
                          (
                              earnings.grosspay +
                              (earnings.leaveEarnings - earnings.deductions)
                          ).toFixed(2) + (absenceLeave < 0 ? absenceLeave : 0)
                      ) - earnings.deductLeave,
                total_gross: parseFloat(
                    (
                        earnings.grosspay +
                        (earnings.leaveEarnings - earnings.deductions)
                    ).toFixed(2) + (absenceLeave < 0 ? absenceLeave : 0)
                ),
                total_deduction: totalDeduction
                    ? parseFloat(totalDeduction.toFixed(2))
                    : 0,
                total_contribution: contributionAmount
                    ? parseFloat(contributionAmount.toFixed(2))
                    : 0,
                remaining_loan: remainingLoan ? remainingLoan : 0,
                total_loan_deduct: loanAmount ? loanAmount : 0,
                total_taxes: taxAmount ? taxAmount : 0,
                net_pay: totalNetPay ? totalNetPay : 0,
                incentives: incentives ? parseFloat(incentives.toFixed(2)) : 0,
                allowance: allowance ? parseFloat(allowance.toFixed(2)) : 0,
                absences: absenceLeave <= 0 ? 0 : absenceLeave,
                tardiness: tardiness ? parseFloat(tardiness.toFixed(2)) : 0,
                undertime: undertime ? parseFloat(undertime.toFixed(2)) : 0,
                earningsData: submitEarningsData,
                benefitsData: submitBenefitData,
                processtype: processtype,
            };

            return postData;
        }
        return null;
    });

    const handleSavePayroll = () => {
        const validPostDataArray = postDataArray.filter(
            (postData) => postData !== null
        );

        Promise.all(
            validPostDataArray.map((postData) => {
                return axiosInstance
                    .post("/save_payroll", postData, { headers })
                    .then((response) => response.data)
                    .catch((error) => {
                        console.log(
                            "Error saving payroll for user",
                            postData.emp_id,
                            error
                        );
                        return { data: "Error" };
                    });
            })
        )
            .then((responses) => {
                const isSuccess = responses.every(
                    (response) => response.data === "Success"
                );
                if (isSuccess) {
                    close();
                    Swal.fire({
                        customClass: {
                            container: "my-swal",
                        },
                        title: "Success!",
                        text: "Payroll Details have been saved successfully",
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
                console.log("Error saving payroll:", error);
            });
    };

    return (
        <Dialog open={open} fullWidth maxWidth="xs">
            <DialogTitle className="d-flex justify-content-between">
                <Typography align="center" sx={{ marginY: 1 }}>
                    Please input "
                    <Box component="span" sx={{ color: "red" }}>
                        Saved
                    </Box>
                    " to Continue
                </Typography>
            </DialogTitle>
            <DialogContent>
                <TextField
                    sx={{ width: "100%" }}
                    id="standard-basic"
                    label="Type here.."
                    variant="standard"
                    onChange={handleConfirmation}
                />
                <Box
                    component="div"
                    sx={{ display: "flex", justifyContent: "center", gap: 2 }}
                >
                    <Button
                        sx={{ marginTop: 3, marginBottom: 1 }}
                        variant="contained"
                        disabled={verifyValue ? false : true}
                        onClick={handleSavePayroll}
                    >
                        Submit
                    </Button>
                    <Button
                        sx={{ marginTop: 3, marginBottom: 1 }}
                        variant="contained"
                        color="error"
                        onClick={close}
                    >
                        Cancel
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PayrollSaveModalConfirmationAll;
