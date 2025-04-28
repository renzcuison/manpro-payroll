import {
    Box,
    Grid,
    Typography,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    List,
    ListItem,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import "react-quill/dist/quill.snow.css";

const PayrollInformation = ({ payroll, employee }) => {

    return (
        <>
            <div className="row">
                <div className="col-6">
                    <FormControl sx={{ marginBottom: 2, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                    }}>
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba", }} > Employee Name </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" value={`${ employee.first_name } ${ employee.middle_name || "" } ${employee.last_name} ${ employee.suffix || "" }`.trim()} style={{ height: 40, backgroundColor: "#fff" }} readOnly />
                    </FormControl>

                    <FormControl sx={{ marginBottom: 2, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                    }}>
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba", }} > Role </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" value={`${employee.role || "-"}`.trim()} style={{ height: 40, backgroundColor: "#fff" }} readOnly />
                    </FormControl>
                    <FormControl sx={{ marginBottom: 2, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                    }}>
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > Department </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" value={`${ employee.department || "-" }`.trim()} style={{ height: 40, backgroundColor: "#fff" }} readOnly />
                    </FormControl>
                </div>

                <div className="col-6">
                    <div className="d-flex justify-content-end">
                        <FormControl sx={{ marginBottom: 2, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                        }}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }}> Employment Type </InputLabel>
                            <input id="demo-simple-select" className="form-control" type="text" value={`${ employee.employment_type || "-" }`.trim()} style={{ height: 40, backgroundColor: "#fff" }} readOnly />
                        </FormControl>
                    </div>
                    <div className="d-flex justify-content-end">
                        <FormControl sx={{ marginBottom: 2, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                        }}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{backgroundColor: "white",paddingLeft: 1,paddingRight: 1,borderColor: "#97a5ba",}} > Title </InputLabel>
                            <input id="demo-simple-select" className="form-control" type="text" value={`${ employee.jobTitle || "-" }`.trim()} style={{ height: 40, backgroundColor: "#fff" }} readOnly />
                        </FormControl>
                    </div>
                    <div className="d-flex justify-content-end">
                        <FormControl sx={{ marginBottom: 2, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                        }}>
                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba", }} > Branch </InputLabel>
                            <input id="demo-simple-select" className="form-control" type="text" value={`${ employee.branch || "-" }`.trim()} style={{ height: 40, backgroundColor: "#fff" }} readOnly />
                        </FormControl>
                    </div>
                </div>
            </div>

            <div className="row" style={{ marginTop: "10px" }} >
                <div className="col-4 d-flex justify-content-center">
                    <FormControl sx={{ marginBottom: 2, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                    }}>
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > {" "}Daily Rate{" "} </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" value={ payroll ? new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2, }).format(payroll.perDay) : "0" } style={{ height: 40, backgroundColor: "#fff", textAlign: "right" }} readOnly />
                    </FormControl>
                </div>
                <div className="col-4 d-flex justify-content-center">
                    <FormControl sx={{ marginBottom: 2, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                    }}>
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > {" "} Monthly Rate {" "} </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" value={ payroll ? new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 } ).format(payroll.perMonth) : "0" } style={{ height: 40, backgroundColor: "#fff", textAlign: "right", }} readOnly />
                    </FormControl>
                </div>
                <div className="col-4 d-flex justify-content-center">
                    <FormControl sx={{ marginBottom: 2, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                    }}>
                        <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: "white", paddingLeft: 1, paddingRight: 1, borderColor: "#97a5ba" }} > {" "}Hourly Rate{" "} </InputLabel>
                        <input id="demo-simple-select" className="form-control" type="text" value={ payroll ? new Intl.NumberFormat( "en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 } ).format(payroll.perHour) : "0" } style={{ height: 40, backgroundColor: "#fff", textAlign: "right", }} readOnly />
                    </FormControl>
                </div>
            </div>
        </>
    );
};

export default PayrollInformation;
