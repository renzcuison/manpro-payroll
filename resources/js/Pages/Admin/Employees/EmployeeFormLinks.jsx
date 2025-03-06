import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { ContentCopy, Delete } from "@mui/icons-material";
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead';
import PageToolbar from '../../../components/Table/PageToolbar';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getComparator, stableSort } from '../../../components/utils/tableUtils';
import Swal from "sweetalert2";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

import GenerateFormLink from "./Modals/GenerateFormLink";

const EmployeeFormLinks = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [formLinks, setFormLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ----- Fetch Form Links
    useEffect(() => {
        fetchFormLinks();
    }, []);

    const fetchFormLinks = () => {
        axiosInstance.get('/employee/getFormLinks', { headers })
            .then((response) => {
                setFormLinks(response.data.form_links);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching form links:', error);
                setIsLoading(false);
            });
    }

    // ----- Generate Form Link
    const [openGenerateFormLink, setOpenGenerateFormLink] = useState(false);
    const handleOpenGenerateFormLink = () => {
        setOpenGenerateFormLink(true);
    }
    const handleCloseGenerateFormLink = () => {
        setOpenGenerateFormLink(false);
        fetchFormLinks();
    }

    // ----- Menu Functions
    const handleLinkCopy = (code) => {

        const domain = window.location.origin;
        const link = `${domain}/register/${code}`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link).then(() => {
                document.activeElement.blur();
                Swal.fire({
                    customClass: { container: "my-swal" },
                    text: "Link Copied to Clipboard",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                })
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        } else {
            console.error('Clipboard API not available');
        }
    }
    const handleLinkDelete = (id) => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: 'Delete Form Link?',
            text: `This action cannot be undone`,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#E9AE20",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                const data = { id: id };
                axiosInstance
                    .post(`employee/deleteFormLink`, data, {
                        headers
                    })
                    .then((response) => {
                        if (response.data.status === 200) {
                            Swal.fire({
                                customClass: { container: "my-swal" },
                                title: "Success!",
                                text: `Form Link Deleted`,
                                icon: "success",
                                showConfirmButton: true,
                                confirmButtonText: "Okay",
                                confirmButtonColor: "#177604",
                            }).then((res) => {
                                if (res.isConfirmed) {
                                    fetchFormLinks();
                                }
                            });
                        }
                    })
                    .catch((error) => {
                        console.error("Error toggling Hidden Status:", error);
                    });
            }
        });
    }

    return (
        <Layout title={"EmployeesList"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Employee Form Links </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenGenerateFormLink}>
                            <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" sx={{ width: "20%" }}>Code</TableCell>
                                                <TableCell align="center" sx={{ width: "10%" }}>Limit</TableCell>
                                                <TableCell align="center" sx={{ width: "10%" }}>Used</TableCell>
                                                <TableCell align="center" sx={{ width: "15%" }}>Expiration</TableCell>
                                                <TableCell align="center" sx={{ width: "15%" }}>Status</TableCell>
                                                <TableCell align="center" sx={{ width: "10%" }}>Branch</TableCell>
                                                <TableCell align="center" sx={{ width: "10%" }}>Department</TableCell>
                                                <TableCell align="center" sx={{ width: "10%" }}></TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {
                                                formLinks.length > 0 ? (
                                                    formLinks.map((formlink) => (
                                                        <TableRow
                                                            key={formlink.id}
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 }, textDecoration: 'none', color: 'inherit' }}
                                                        >
                                                            <TableCell align="left">{formlink.unique_code}</TableCell>
                                                            <TableCell align="center">{formlink.limit}</TableCell>
                                                            <TableCell align="center">{formlink.used}</TableCell>
                                                            <TableCell align="center">{dayjs(formlink.expiration).format("MMM D, YYYY h:mm A")}</TableCell>
                                                            <TableCell align="center">{formlink.status}</TableCell>
                                                            <TableCell align="center">{formlink.branch_id || "-"}</TableCell>
                                                            <TableCell align="center">{formlink.department_id || "-"}</TableCell>
                                                            <TableCell align="center">
                                                                <Box display="flex">
                                                                    <Tooltip title="Copy Link">
                                                                        <IconButton onClick={() => handleLinkCopy(formlink.unique_code)}>
                                                                            <ContentCopy />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete">
                                                                        <IconButton onClick={() => handleLinkDelete(formlink.id)}>
                                                                            <Delete />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) :
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={8}
                                                            align="center"
                                                            sx={{
                                                                color: "text.secondary",
                                                                p: 1,
                                                            }}
                                                        >
                                                            No Form Links Found
                                                        </TableCell>
                                                    </TableRow>
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>

                </Box>
            </Box>
            {openGenerateFormLink && (
                <GenerateFormLink
                    open={openGenerateFormLink}
                    close={handleCloseGenerateFormLink}
                />
            )}
        </Layout>
    )
}

export default EmployeeFormLinks