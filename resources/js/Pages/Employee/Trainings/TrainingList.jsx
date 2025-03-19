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


const TrainingList = () => {
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
        axiosInstance.get('/trainings/getEmployeeTrainings', { headers })
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

    return (
        <Layout title={"TrainingsList"}>
            <Box sx={{ width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "90%" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Trainings
                        </Typography>
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
                                                    <CardActionArea component={Link} to={`/employee/training/${training.unique_code}`}>
                                                        <Card sx={{
                                                            borderRadius: 2,
                                                            boxShadow: 3,
                                                            height: "300px",
                                                            display: "flex",
                                                            flexDirection: "column"
                                                        }}>
                                                            {/* Training Cover */}
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
                                                            {/* Training Info */}
                                                            <CardContent sx={{ pb: "5px", flexGrow: 1 }}>
                                                                <Typography
                                                                    variant="h6"
                                                                    component="div"
                                                                    noWrap
                                                                    sx={{ textOverflow: 'ellipsis' }}
                                                                >
                                                                    {training.title}
                                                                </Typography>
                                                                {/* Details */}
                                                                <Grid container item key={index} sx={{ my: 1 }}>
                                                                    <Grid item xs={3}>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                                                                            Closes
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={9}>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                            {dayjs(training.end_date).format('MMM DD YYYY, hh:mm A')}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={3}>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                                                                            Duration
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={9}>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                            {formatTime(training.duration)}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </CardContent>
                                                            {/* Training Content Indicators */}
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
                                                                                    training.powerpoint && 'PowerPoint',
                                                                                    training.form && 'Form',
                                                                                ].filter(Boolean);
                                                                                return available.length > 0
                                                                                    ? `Includes ${available.join(', ').replace(/, ([^,]+)$/, ' and $1')}`
                                                                                    : 'No Content';
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
                                        <>
                                            <Box sx={{ mt: 5, p: 3, bgcolor: "#ffffff", borderRadius: 3, width: '100%', maxWidth: 350, textAlign: 'center' }}>
                                                No Trainings Available
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
        </Layout>
    );
};

export default TrainingList;
