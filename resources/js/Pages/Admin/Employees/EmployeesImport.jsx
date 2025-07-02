import React, { useRef, useState } from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Button } from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import Papa from "papaparse";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";

import ImportVerification from './Modals/ImportVerification';

const EmployeesImport = () => {
    const fileInputRef = useRef(null);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [csvData, setCsvData] = useState([]);

    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [openVerificationModal, setOpenVerificationModal] = useState(false);

    const downloadTemplate = async () => {
        try {
            const response = await axiosInstance.get("/excel/downloadEmployeeTemplate", {
                headers: { ...headers, Accept: 'text/csv' },
                responseType: 'blob',
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

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        setLoading(true);
        setUploading(true);
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                setCsvData(results.data);
                setLoading(false);
                setUploading(false);
            },
            error: function (err) {
                console.error("CSV parsing error:", err);
                setLoading(false);
                setUploading(false);
            }
        });
    };

    const handleRowClick = (row) => {
        setSelectedEmployee(row);
        setOpenVerificationModal(true);
    };

    const handleCloseVerificationModal = () => {
        setOpenVerificationModal(close);
    };

    return (
        <Layout title={"EmployeesList"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
                <Box>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>Import Employees</Typography>
                        <Box>
                            <Button sx={{ mr: 1 }} onClick={downloadTemplate} variant="contained" color="primary" disabled={loading}>
                                <p className="m-0"><i className="fa fa-file-excel-o mr-2"></i>{loading ? 'Downloading...' : 'Template'}</p>
                            </Button>
                            <Button sx={{ ml: 1 }} variant="contained" color="primary" onClick={handleImportClick} disabled={uploading}>
                                <p className="m-0"><i className="fa fa-file-excel-o mr-2"></i>{uploading ? 'Importing...' : 'Import'}</p>
                            </Button>

                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleFileChange} />
                        </Box>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        <TableContainer sx={{ minHeight: 800 }}>
                            <Table aria-label="imported employees table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">First Name</TableCell>
                                        <TableCell align="center">Middle Name</TableCell>
                                        <TableCell align="center">Last Name</TableCell>
                                        <TableCell align="center">Suffix</TableCell>
                                        <TableCell align="center">Email</TableCell>
                                        <TableCell align="center">Birthdate</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {csvData.map((row, index) => (
                                        <TableRow key={index} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(row)}>
                                            <TableCell align="center">{row["First Name"]}</TableCell>
                                            <TableCell align="center">{row["Middle Name"]}</TableCell>
                                            <TableCell align="center">{row["Last Name"]}</TableCell>
                                            <TableCell align="center">{row["Suffix"]}</TableCell>
                                            <TableCell align="center">{row["Email"]}</TableCell>
                                            <TableCell align="center">{row["Birthdate"]}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
            </Box>

            {openVerificationModal && selectedEmployee &&
                <ImportVerification open={openVerificationModal} close={handleCloseVerificationModal} data={selectedEmployee} />
            }

        </Layout>
    );
};

export default EmployeesImport;
