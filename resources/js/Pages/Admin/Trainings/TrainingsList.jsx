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

import TrainingsAdd from './Modals/TrainingsAdd';

const TrainingsList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [trainings, setTrainings] = useState([]);

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = () => {
        axiosInstance.get('/trainings/getTrainings', { headers })
            .then((response) => {
                setTrainings(response.data.trainings);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching trainings:', error);
                setIsLoading(false);
            });
    }

    const [openAddTrainingModal, setOpenAddTrainingModal] = useState(false);

    const handleOpenAddTrainingModal = () => {
        setOpenAddTrainingModal(true);
    };
    const handleCloseAddTrainingModal = () => {
        setOpenAddTrainingModal(false);
        fetchTrainings();
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
                                                <TableCell align="center"> Title </TableCell>
                                                <TableCell align="center"> Created On </TableCell>
                                                <TableCell align="center"> Start Date </TableCell>
                                                <TableCell align="center"> End Date </TableCell>
                                                <TableCell align="center"> Duration </TableCell>
                                                <TableCell align="center"> Status </TableCell>
                                                <TableCell align="center"></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {trainings.length > 0 ? (
                                                trainings.map((training, index) => {
                                                    return (
                                                        <TableRow
                                                            key={training.id}
                                                            sx={{
                                                                p: 1,
                                                                backgroundColor:
                                                                    index % 2 === 0
                                                                        ? "#f8f8f8"
                                                                        : "#ffffff",
                                                            }}
                                                        >
                                                            <TableCell align="center">{training.title}</TableCell>
                                                            <TableCell align="center">{training.created_at}</TableCell>
                                                            <TableCell align="center">{training.start_date}</TableCell>
                                                            <TableCell align="center">{training.end_date}</TableCell>
                                                            <TableCell align="center"> - </TableCell>
                                                            <TableCell align="center">{training.status}</TableCell>
                                                            <TableCell align="center"> ... </TableCell>
                                                        </TableRow>
                                                    );
                                                }
                                                )
                                            ) : <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1, }}>
                                                    No Trainings Found
                                                </TableCell>
                                            </TableRow>}

                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {openAddTrainingModal && (
                <TrainingsAdd open={openAddTrainingModal} close={handleCloseAddTrainingModal} />
            )}
        </Layout>
    )
}

export default TrainingsList