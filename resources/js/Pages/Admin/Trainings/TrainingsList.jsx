import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    TextField,
    Stack,
    Grid,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    breadcrumbsClasses,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Pagination,
    IconButton,
    CardActionArea
} from "@mui/material";
import { OndemandVideo, Image, Description, Quiz } from "@mui/icons-material";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import PageHead from "../../../components/Table/PageHead";
import PageToolbar from "../../../components/Table/PageToolbar";
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import {
    getComparator,
    stableSort,
} from "../../../components/utils/tableUtils";
import { first } from "lodash";
import Swal from "sweetalert2";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

import TrainingsAdd from './Modals/TrainingsAdd';
import TrainingsEdit from './Modals/TrainingsEdit';

const TrainingsList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    // ---------------- Training Data States
    const [isLoading, setIsLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(true);
    const [trainings, setTrainings] = useState([]);
    const [trainingReload, setTrainingReload] = useState(true);

    // ---------------- Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [trainingsPerPage, setTrainingsPerPage] = useState(9);
    const [totalTrainings, setTotalTrainings] = useState(0);

    const lastTraining = currentPage * trainingsPerPage;
    const firstTraining = lastTraining - trainingsPerPage;
    const pageTrainings = trainings.slice(firstTraining, lastTraining);

    // ---------------- Training List API
    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = () => {
        axiosInstance.get('/trainings/getTrainings', { headers })
            .then((response) => {
                setTrainings(response.data.trainings);
                setTotalTrainings(response.data.trainings.length);
                setTrainingReload(false);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching trainings:', error);
                setIsLoading(false);
            });
    }

    // ---------------- Training Image API
    useEffect(() => {
        if (!trainingReload) {
            setTrainingReload(true);
        }
        fetchPageCovers();
    }, [trainingReload, firstTraining, lastTraining]);

    // ---------------- Training Cover Loader
    const fetchPageCovers = () => {
        if (trainings.length > 0) {
            const pagedTrainings = trainings.slice(firstTraining, lastTraining);
            const trainingIds = pagedTrainings.map(training => training.id);

            axiosInstance.get('/trainings/getPageCovers', {
                headers, params: {
                    training_ids: trainingIds
                }
            })
                .then((response) => {
                    const covers = response.data.covers;

                    setTrainings(prevTrainings => {
                        const updatedTrainings = [...prevTrainings];

                        pagedTrainings.forEach((training, paginatedIndex) => {
                            const globalIndex = prevTrainings.indexOf(training);

                            if (paginatedIndex < covers.length && covers[paginatedIndex] !== null) {
                                const byteCharacters = window.atob(covers[paginatedIndex]);
                                const byteNumbers = new Array(byteCharacters.length);
                                for (let i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                const byteArray = new Uint8Array(byteNumbers);
                                const blob = new Blob([byteArray], { type: 'image/png' });
                                updatedTrainings[globalIndex] = { ...training, cover: URL.createObjectURL(blob) };
                            } else {
                                updatedTrainings[globalIndex] = { ...training };
                            }
                        });
                        return updatedTrainings;
                    });

                    setImageLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching covers:', error);
                    setImageLoading(false);
                });
        } else {
            //console.log("No Request Needed");
        }
    };

    // ---------------- Pagination Controls
    const handleChangePage = (event, value) => {
        setCurrentPage(value);
        setImageLoading(true);
        fetchPageCovers();
    };

    // ---------------- Image Cleanup
    useEffect(() => {
        return () => {
            //console.log("closed");
            trainings.forEach(training => {
                if (training.cover && training.cover.startsWith('blob:')) {
                    URL.revokeObjectURL(training.cover);
                }
            });
        };
    }, []);

    // ---------------- Time Formatter
    const formatTime = (time) => {
        if (!time) return '-';

        const absTime = Math.abs(time);

        const hours = Math.floor(absTime / 60);
        const minutes = absTime % 60;

        if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
        } else {
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
    }

    // ---------------- Status-Based Card Content
    const getTrainingStatus = (startDate, endDate, duration) => {
        const now = dayjs();
        const start = dayjs(startDate);
        const end = dayjs(endDate);

        if (now.isBefore(start)) {
            return {
                label: 'NOT YET OPENED',
                color: '#e9ae20',
                fields: [
                    { label: 'Opens', value: start.format('MMM DD YYYY, hh:mm A') },
                    { label: 'Duration', value: formatTime(duration) },
                ],
            };
        } else if (now.isBefore(end)) {
            return {
                label: 'OPEN',
                color: '#177604',
                fields: [
                    { label: 'Closes', value: end.format('MMM DD YYYY, hh:mm A') },
                    { label: 'Duration', value: formatTime(duration) },
                ],
            };
        } else {
            return {
                label: 'CLOSED',
                color: '#f57c00',
                fields: [
                    { label: 'Opened', value: start.format('MMM DD YYYY, hh:mm A') },
                    { label: 'Closed', value: end.format('MMM DD YYYY, hh:mm A') },
                ],
            };
        }
    };

    // Add Training Modal
    const [openAddTrainingModal, setOpenAddTrainingModal] = useState(false);
    const handleOpenAddTrainingModal = () => {
        setOpenAddTrainingModal(true);
    };
    const handleCloseAddTrainingModal = (reload) => {
        setOpenAddTrainingModal(false);
        if (reload) {
            fetchTrainings();
        }
    };

    // Edit Training Modal
    // const [openEditTrainingModal, setOpenEditTrainingModal] = useState(false);
    // const handleOpenEditTrainingModal = (training) => {
    //     setOpenEditTrainingModal(training);
    // };
    // const handleCloseEditTrainingModal = () => {
    //     setOpenEditTrainingModal(false);
    //     fetchTrainings();
    // };


    return (
        <Layout title={"TrainingsList"}>
            <Box sx={{ width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "90%" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Trainings
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenAddTrainingModal}
                        >
                            <p className="m-0">
                                <i className="fa fa-plus"></i> Add {" "}
                            </p>
                        </Button>
                    </Box>

                    <Box sx={{ p: 3, justifyContent: 'center', alignItems: 'center' }} >
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Grid
                                    container
                                    rowSpacing={3}
                                    columnSpacing={{ xs: 2, sm: 3 }}
                                    sx={{
                                        ...(pageTrainings.length === 0 ? { justifyContent: "center" } : {}),
                                    }}
                                >
                                    {pageTrainings.length > 0 ? (
                                        pageTrainings.map(
                                            (training, index) => (
                                                <Grid item key={index} xs={12} sm={6} lg={4}>
                                                    <CardActionArea component={Link} to={`/admin/training/${training.unique_code}`}>
                                                        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                                            {/* Card Cover */}
                                                            {imageLoading ? (
                                                                <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                        height: '180px'
                                                                    }}
                                                                >
                                                                    <CircularProgress />
                                                                </Box>
                                                            ) : (
                                                                <CardMedia
                                                                    sx={{ height: '180px' }}
                                                                    image={training.cover ? training.cover : "../../../images/ManProTab.png"}
                                                                    title={`${training.title}_Cover`}
                                                                />
                                                            )}
                                                            {/* Card Content */}
                                                            <CardContent sx={{ pb: "5px" }}>
                                                                <Typography
                                                                    variant="h6"
                                                                    component="div"
                                                                    noWrap
                                                                    sx={{ textOverflow: 'ellipsis' }}
                                                                >
                                                                    {training.title}
                                                                </Typography>
                                                                {/* Status and Details */}
                                                                {(() => {
                                                                    const { label, color, fields } = getTrainingStatus(training.start_date, training.end_date, training.duration);
                                                                    return (
                                                                        <>
                                                                            <Typography variant="body1" sx={{ color, fontWeight: 'bold' }}>
                                                                                {label}
                                                                            </Typography>
                                                                            <Grid container sx={{ my: 1 }}>
                                                                                {fields.map((field, index) => (
                                                                                    <Grid container item key={index}>
                                                                                        <Grid item xs={3}>
                                                                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                                                                                                {field.label}
                                                                                            </Typography>
                                                                                        </Grid>
                                                                                        <Grid item xs={9}>
                                                                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                                                {field.value}
                                                                                            </Typography>
                                                                                        </Grid>
                                                                                    </Grid>
                                                                                ))}
                                                                            </Grid>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </CardContent>
                                                            <CardActions sx={{ ml: "8px" }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    {/* Media Icons */}
                                                                    {training.video && <OndemandVideo sx={{ color: 'text.secondary' }} />}
                                                                    {training.image && <Image sx={{ color: 'text.secondary' }} />}
                                                                    {training.attachment && <Description sx={{ color: 'text.secondary' }} />}
                                                                    {/* Media Text */}
                                                                    <Box sx={{ ml: (training.video || training.image || training.attachment) ? 1 : 0 }}>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                            {(() => {
                                                                                const available = [
                                                                                    training.video && 'Video',
                                                                                    training.image && 'Image',
                                                                                    training.attachment && 'Document',
                                                                                ].filter(Boolean);
                                                                                return available.length > 0
                                                                                    ? `Includes ${available.join(', ').replace(/, ([^,]+)$/, ' and $1')}`
                                                                                    : 'No Media';
                                                                            })()}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </CardActions>
                                                        </Card>
                                                    </CardActionArea>
                                                </Grid>
                                            )
                                        )
                                    ) : (
                                        // No Trainings
                                        <>
                                            <Box sx={{ mt: 5, p: 3, bgcolor: "#ffffff", borderRadius: 3, width: '100%', maxWidth: 350, textAlign: 'center' }}>
                                                No Trainings
                                            </Box>
                                        </>
                                    )}
                                </Grid>
                                {/* Pagination Controls */}
                                {totalTrainings > trainingsPerPage && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <Pagination
                                            shape="rounded"
                                            count={Math.ceil(totalTrainings / trainingsPerPage)}
                                            page={currentPage}
                                            onChange={handleChangePage}
                                            color="primary"
                                            size="large"
                                            showFirstButton
                                            showLastButton
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
            {openAddTrainingModal && (
                <TrainingsAdd open={openAddTrainingModal} close={handleCloseAddTrainingModal} />
            )}
            {/*
            {openEditTrainingModal && (
                <TrainingsEdit
                    open={true}
                    close={handleCloseEditTrainingModal}
                    trainingInfo={openEditTrainingModal}
                />
            )}
            */}

        </Layout>
    );
};

export default TrainingsList;
