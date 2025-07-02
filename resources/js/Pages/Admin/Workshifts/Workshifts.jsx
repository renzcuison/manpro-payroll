import React, { useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid } from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import ViewApplicationType from "../../../Modals/Applications/ViewApplicationType";
import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';

const WorkshiftList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [applicationTypes, setApplicationTypes] = useState([]);

    useEffect(() => {
        // fetchApplicationTypes();
    }, []);

    return (
        <Layout title={"ApplicationsList"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap", }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'left' }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}> Work Shifts </Typography>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Type Name</TableCell>
                                                <TableCell align="center">Percentage</TableCell>
                                                <TableCell align="center">Paid Leave</TableCell>
                                                <TableCell align="center">Require Files</TableCell>
                                                <TableCell align="center">Tenureship Required</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {applicationTypes.map((applicationType) => (
                                                <TableRow key={applicationType.id} sx={{ p: 1, "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer" }}}>
                                                    <TableCell align="left">{applicationType.name || '-'}</TableCell>
                                                    <TableCell align="center">{applicationType.percentage ? `${Math.floor(applicationType.percentage)}%` : '-'}</TableCell>
                                                    <TableCell align="center">{applicationType.is_paid_leave === 1 ? 'Yes' : 'No'}</TableCell>
                                                    <TableCell align="center">{applicationType.require_files === 1 ? 'Yes' : 'No'}</TableCell>
                                                    <TableCell align="center">{applicationType.tenureship_required} Month(s) </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>

                </Box>
            </Box>
        </Layout>
    );
};

export default WorkshiftList;
