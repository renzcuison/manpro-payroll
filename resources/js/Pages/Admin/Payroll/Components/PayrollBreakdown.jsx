import { Box, Grid, Typography, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List, ListItem, } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import "react-quill/dist/quill.snow.css";

const PayrollBreakdown = ({ payroll, paidLeaves, unpaidLeaves, earnings, deductions, benefits, allowances }) => {

    return (
        <>
            <div className="row">
                <div className="col-4">
                    <TableContainer sx={{ my: 2 }}>
                        <Table className="table table-md table-vcenter table-bordered">
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center"> {" "}Earnings{" "} </TableCell>
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

                                {allowances.map(
                                    (allowance) => (
                                        <TableRow key={allowance.name} >
                                            <TableCell className="text-center bg-light" sx={{ width: "50%" }}> {allowance.name} </TableCell>
                                            <TableCell className="text-center bg-light">
                                                <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right", }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2, } ).format(allowance.amount)} />
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}

                                {paidLeaves.map(
                                    (paidLeave) => (
                                        <TableRow key={paidLeave.name} >
                                            <TableCell className="text-center bg-light" sx={{ width: "50%" }}> {paidLeave.name} </TableCell>
                                            <TableCell className="text-center bg-light">
                                                <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right", }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2, } ).format(paidLeave.amount)} />
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}

                                {unpaidLeaves.map(
                                    (unpaidLeave) => (
                                        <TableRow key={ unpaidLeave.name } >
                                            <TableCell className="text-center bg-light" sx={{ width: "50%" }}> {unpaidLeave.name} </TableCell>
                                            <TableCell className="text-center bg-light">
                                                <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right", }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(unpaidLeave.amount)} />
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}

                                {deductions.map(
                                    (deduction) => (
                                        <TableRow key={deduction.name} >
                                            <TableCell className="text-center bg-light" sx={{ width: "50%" }} > {deduction.name} </TableCell>
                                            <TableCell className="text-center bg-light">
                                                <input id="demo-simple-select" style={{backgroundColor: "white", height: 30, textAlign: 'right'}} readOnly className="form-control" type="text" value={deductions ? deduction.amount === 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(deduction.amount) : `-${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Math.abs(deduction.amount))}` : "Loading..." } />
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
                                    <TableCell colSpan={2} className="text-center"> {" "}Employer Share{" "} </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {benefits.map((benefit) => (
                                    <TableRow
                                        key={benefit.name}
                                    >
                                        <TableCell
                                            className="text-center bg-light"
                                            sx={{
                                                width: "50%",
                                            }}
                                        >
                                            {benefit.name}
                                        </TableCell>
                                        <TableCell className="text-center bg-light">
                                            <input
                                                id="demo-simple-select"
                                                style={{
                                                    backgroundColor:
                                                        "white",
                                                    height: 30,
                                                    textAlign:
                                                        "right",
                                                }}
                                                readOnly
                                                className="form-control"
                                                type="text"
                                                value={new Intl.NumberFormat(
                                                    "en-US",
                                                    {
                                                        style: "currency",
                                                        currency:
                                                            "PHP",
                                                        minimumFractionDigits: 2,
                                                    }
                                                ).format(
                                                    benefit.employerAmount
                                                )}
                                            />
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
                                    <TableCell colSpan={2} className="text-center"> {" "} Loans{" "} </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="text-center bg-light" sx={{ border: "1px solid #ccc" }}> Balance </TableCell>
                                    <TableCell className="text-center bg-light">
                                        <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(0)} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-center bg-light" sx={{ border: "1px solid #ccc" }}> Payment </TableCell>
                                    <TableCell className="text-center bg-light">
                                        <input id="demo-simple-select" style={{ backgroundColor: "white", height: 30, textAlign: "right" }} readOnly className="form-control" type="text" value={new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(0)} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-center bg-light" sx={{ border: "1px solid #ccc" }}> Remaining </TableCell>
                                    <TableCell className="text-center bg-light">
                                        <input
                                            id="demo-simple-select"
                                            style={{ backgroundColor: "white", height: 30, textAlign: "right" }}
                                            readOnly
                                            className="form-control"
                                            type="text"
                                            value={new Intl.NumberFormat(
                                                "en-US",
                                                {
                                                    style: "currency",
                                                    currency:
                                                        "PHP",
                                                    minimumFractionDigits: 2,
                                                }
                                            ).format(0)}
                                        />
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
                                    <TableCell
                                        colSpan={2}
                                        className="text-center"
                                    >
                                        {" "}
                                        Employer Share{" "}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {benefits.map((benefit) => (
                                    <TableRow
                                        key={benefit.name}
                                    >
                                        <TableCell
                                            className="text-center bg-light"
                                            sx={{
                                                width: "50%",
                                            }}
                                        >
                                            {benefit.name}
                                        </TableCell>
                                        <TableCell className="text-center bg-light">
                                            <input
                                                id="demo-simple-select"
                                                style={{
                                                    backgroundColor:
                                                        "white",
                                                    height: 30,
                                                    textAlign:
                                                        "right",
                                                }}
                                                readOnly
                                                className="form-control"
                                                type="text"
                                                value={new Intl.NumberFormat(
                                                    "en-US",
                                                    {
                                                        style: "currency",
                                                        currency:
                                                            "PHP",
                                                        minimumFractionDigits: 2,
                                                    }
                                                ).format(
                                                    benefit.employeeAmount
                                                )}
                                            />
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
                                    <TableCell
                                        colSpan={2}
                                        className="text-center"
                                    >
                                        {" "}
                                        Tax{" "}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="text-center bg-light" sx={{ width: "50%" }} >
                                        Tax
                                    </TableCell>
                                    <TableCell className="text-center bg-light">
                                        <input
                                            id="demo-simple-select"
                                            style={{
                                                backgroundColor:
                                                    "white",
                                                height: 30,
                                                textAlign:
                                                    "right",
                                            }}
                                            readOnly
                                            className="form-control"
                                            type="text"
                                            value={new Intl.NumberFormat(
                                                "en-US",
                                                {
                                                    style: "currency",
                                                    currency:
                                                        "PHP",
                                                    minimumFractionDigits: 2,
                                                }
                                            ).format(payroll.tax)}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </>
    );
};

export default PayrollBreakdown;
