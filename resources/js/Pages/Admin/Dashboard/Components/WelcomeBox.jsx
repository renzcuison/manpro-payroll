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
    Button,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import "react-quill/dist/quill.snow.css";
import Typewriter from "../../../../components/Typewriter";

import sirChris from "../../../../../images/SirChirs.png";

const WelcomeBox = ({ payroll, employee }) => {

    const [clientName, setClientName] = useState("Nasya!");

    return (
        <>
            <div className="row">
                <Box sx={{ background: 'linear-gradient(to right, #0a6c1b 50%, #f9db57 100%)', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', height: '250px', width: '100%', paddingLeft: '12px', borderRadius: '8px' }} >
                    <div className="row">
                        <div className="col-lg-9 col-sm-9">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h4" sx={{ mt: 4, ml: 4, color: '#ffffff' }}> Welcome, </Typography>
                                <Typography variant="h4" sx={{ mt: 4, ml: 1, fontWeight: 'bold', color: '#ffffff' }}> Nasya </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h5" sx={{ mt: 4, ml: 4, color: '#ffffff' }}> You have 5 pending requests today! Let’s work on them and get everything done! </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Button variant="contained" size="large" sx={{ mt: 4, ml: 4, backgroundColor: '#ffffff', color: '#0a6c1b', borderRadius: '12px', paddingX: 6, paddingY: 1.5, fontWeight: 'bold', textTransform: 'none', '&:hover': { backgroundColor: '#f1f1f1' } }}> Check Now </Button>
                            </Box>
                        </div>

                        <div className="col-lg-3 col-sm-3 d-flex justify-content-center" style={{ height: '250px', alignItems: 'flex-end' }} >
                            <img src={sirChris} style={{ maxHeight: '90%', objectFit: 'contain' }} />
                        </div>

                    </div>
                </Box>
            </div>
        </>
    );
};

export default WelcomeBox;
