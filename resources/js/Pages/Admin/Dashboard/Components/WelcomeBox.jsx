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

const WelcomeBox = ({ payroll, employee }) => {

    return (
        <>
            <div className="row">
                <Box sx={{ backgroundColor: '#0a6c1b', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', height: '250px', width: '100%', paddingLeft: '12px', borderRadius: '8px' }} >
                    {/* You can add your content here */}
                </Box>
            </div>
        </>
    );
};

export default WelcomeBox;
