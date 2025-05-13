import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Box,
    TablePagination,
    TableHead,
    Avatar,
    CircularProgress,
    Typography,
    Divider,
    FormControl,
    TextField,
    Grid,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import "react-quill/dist/quill.snow.css";

const boxStyle = {
  backgroundColor: '#ffffff',
  boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
  height: '165px',
  width: '32%',
  padding: '12px',
  borderRadius: '8px',
  mt: 2
};


const EmployeeInfromation = ({ payroll, employee }) => {

    return (
        <>
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }} >
                <Box sx={boxStyle}></Box>
                <Box sx={boxStyle}></Box>
                <Box sx={boxStyle}></Box>
            </div>
        </>
    );
};

export default EmployeeInfromation;
