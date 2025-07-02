import React, { useState } from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Button, Menu, MenuItem, TextField, Grid, Avatar } from "@mui/material";
import axios from 'axios'; // Make sure to import axios
import Layout from "../../../components/Layout/Layout";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";

import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const EmployeesImport = () => {
    const [loading, setLoading] = useState(false);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const downloadTemplate = async () => {
        try {
            const response = await axiosInstance.get("/excel/downloadEmployeeTemplate", {
                headers: {
                    ...headers,
                    Accept: 'text/csv',
                },
                responseType: 'blob', // important for binary data like CSV
            });

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'ManPro - Import Employee Template.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading template:', error);
        }
    };

    return (
        <Layout title={"EmployeesList"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
                <Box>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Import Employees</Typography>
                        <Box>
                            <Button 
                                sx={{ mr: 1 }} 
                                onClick={downloadTemplate} 
                                variant="contained" 
                                color="primary"
                                disabled={loading}
                            >
                                <p className="m-0">
                                    <i className="fa fa-file-excel-o mr-2"></i> 
                                    {loading ? 'Downloading...' : 'Template'}
                                </p>
                            </Button>

                            <Button sx={{ ml: 1 }} onClick={() => exportEmployees(employees)} variant="contained" color="primary">
                                <p className="m-0"><i className="fa fa-file-excel-o mr-2"></i> Import </p>
                            </Button>
                        </Box>
                    </Box>

                </Box>
            </Box>
        </Layout>
    );
};

export default EmployeesImport;