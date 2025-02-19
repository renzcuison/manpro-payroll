import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress, IconButton } from '@mui/material';
import { MoreVert } from "@mui/icons-material";
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead';
import PageToolbar from '../../../components/Table/PageToolbar';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getComparator, stableSort } from '../../../components/utils/tableUtils';
import Swal from "sweetalert2";

import dayjs from "dayjs";

import TraningsAdd from './Modals/TraningsAdd';

const TrainingsList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const [openAddTrainingModal, setOpenAddTrainingModal] = useState(false);

    const handleOpenAddTrainingModal = () => {
        setOpenAddTrainingModal(true);
    };
    const handleCloseAddTrainingModal = () => {
        setOpenAddTrainingModal(false);
    };

    return (
        <Layout title={"TrainingsList"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "90%" } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Trainings </Typography>
                        <Button variant="contained" color="primary" onClick={handleOpenAddTrainingModal}>
                            <p className="m-0">
                                <i className="fa fa-plus"></i> Add
                            </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: "auto" }} sx={{ minHeight: 400 }} >
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" sx={{ width: "22.5%" }}> Title </TableCell>
                                                <TableCell align="center" sx={{ width: "22.5%" }}> Date Created </TableCell>
                                                <TableCell align="center" sx={{ width: "22.5%" }}> Publish Date </TableCell>
                                                <TableCell align="center" sx={{ width: "22.5%" }}> Status </TableCell>
                                                <TableCell align="center" sx={{ width: "10%" }}> Action </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>

                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {openAddTrainingModal && (
                <TraningsAdd open={openAddTrainingModal} close={handleCloseAddTrainingModal} />
            )}

        </Layout>
    )
}

export default TrainingsList