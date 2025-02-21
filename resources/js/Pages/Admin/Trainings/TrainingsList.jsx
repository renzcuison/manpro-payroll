import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { Edit } from "@mui/icons-material";
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead';
import PageToolbar from '../../../components/Table/PageToolbar';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getComparator, stableSort } from '../../../components/utils/tableUtils';
import Swal from "sweetalert2";

import dayjs from "dayjs";

import TrainingsAdd from './Modals/TrainingsAdd';
import TrainingsEdit from './Modals/TrainingsEdit';

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

    const getDuration = (duration) => {
        const trainingDuration = duration || 0;

        const days = Math.floor(trainingDuration / 1440);
        const remainingMinutes = trainingDuration % 1440;
        const hours = Math.floor(remainingMinutes / 60) % 24;
        const minutes = remainingMinutes % 60;

        let actualDuration = [];
        if (days > 0) {
            actualDuration.push(`${days} Day${days > 1 ? 's' : ''}${hours > 0 || minutes > 0 ? ',' : ''}`);
        }
        if (hours > 0) {
            actualDuration.push(`${hours} Hour${hours > 1 ? 's' : ''}${minutes > 0 ? ',' : ''}`);
        }
        if (minutes > 0 || (days === 0 && hours === 0)) {
            actualDuration.push(`${minutes} Minute${minutes > 1 ? 's' : ''}`);
        }
        actualDuration = actualDuration.join(' ') || '0 Minutes';

        return actualDuration;
    }

    // Add Training Modal
    const [openAddTrainingModal, setOpenAddTrainingModal] = useState(false);
    const handleOpenAddTrainingModal = () => {
        setOpenAddTrainingModal(true);
    };
    const handleCloseAddTrainingModal = () => {
        setOpenAddTrainingModal(false);
        fetchTrainings();
    };

    // Edit Training Modal
    const [openEditTrainingModal, setOpenEditTrainingModal] = useState(false);
    const handleOpenEditTrainingModal = (training) => {
        setOpenEditTrainingModal(training);
    };
    const handleCloseEditTrainingModal = () => {
        setOpenEditTrainingModal(false);
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
                                                <TableCell align="center" sx={{ width: "18%" }}>
                                                    Title
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "18%" }}>
                                                    Created On
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "18%" }}>
                                                    Start Date
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "18%" }}>
                                                    End Date
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "18%" }}>
                                                    Duration
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "10%" }} />
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {trainings.length > 0 ? (
                                                trainings.map((training, index) => (
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
                                                        <TableCell align="center">
                                                            {training.title.length > 40
                                                                ? (`${training.title.slice(0, 37)}...`)
                                                                : training.title}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {dayjs(training.created_at).format('MMM DD, YYYY h:mm A')}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {dayjs(training.start_date).format('MMM DD, YYYY h:mm A')}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {dayjs(training.end_date).format('MMM DD, YYYY h:mm A')}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {getDuration(training.duration)}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Tooltip title="Edit Training">
                                                                <IconButton
                                                                    size='small'
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        handleOpenEditTrainingModal(training);
                                                                    }}>
                                                                    <Edit />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                                )
                                            ) : <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ color: "text.secondary", p: 1, }}>
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
            {openEditTrainingModal && (
                <TrainingsEdit
                    open={true}
                    close={handleCloseEditTrainingModal}
                    trainingInfo={openEditTrainingModal}
                />
            )}
        </Layout>
    )
}

export default TrainingsList