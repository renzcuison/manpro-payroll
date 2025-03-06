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
import { MoreVert } from "@mui/icons-material";
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
import AnnouncementAdd from './Modals/AnnouncementAdd';
import AnnouncementPublish from './Modals/AnnouncementPublish';
import AnnouncementEdit from './Modals/AnnouncementEdit';
import AnnouncementManage from './Modals/AnnouncementManage';
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const AnnouncementList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    // ---------------- Announcement Data States
    const [isLoading, setIsLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [announcementReload, setAnnouncementReload] = useState(true);

    // ---------------- Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [announcementsPerPage, setAnnouncementsPerPage] = useState(9);
    const [totalAnnouncements, setTotalAnnouncements] = useState(0);

    const lastAnnouncement = currentPage * announcementsPerPage;
    const firstAnnouncement = lastAnnouncement - announcementsPerPage;
    const pageAnnouncements = announcements.slice(firstAnnouncement, lastAnnouncement);

    // ---------------- Announcement List API
    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = () => {
        axiosInstance.get('/announcements/getAnnouncements', { headers })
            .then((response) => {
                setAnnouncements(response.data.announcements);
                setTotalAnnouncements(response.data.announcements.length);
                setAnnouncementReload(false);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching announcements:', error);
                setIsLoading(false);
            });

    }

    // ---------------- Announcement Image API
    useEffect(() => {
        if (!announcementReload) {
            setAnnouncementReload(true);
        }
        fetchPageThumbnails();
    }, [announcementReload, firstAnnouncement, lastAnnouncement]);

    // ---------------- Announcement Thumbnail Loader
    const fetchPageThumbnails = () => {
        if (announcements.length > 0) {
            const pagedAnnouncements = announcements.slice(firstAnnouncement, lastAnnouncement);
            const announcementIds = pagedAnnouncements.map(announcement => announcement.id);

            axiosInstance.post('/announcements/getPageThumbnails', { announcementIds }, { headers })
                .then((response) => {
                    const thumbnails = response.data.thumbnails;

                    setAnnouncements(prevAnnouncements => {
                        const updatedAnnouncements = [...prevAnnouncements];

                        pagedAnnouncements.forEach((announcement, paginatedIndex) => {
                            const globalIndex = prevAnnouncements.indexOf(announcement);

                            if (paginatedIndex < thumbnails.length && thumbnails[paginatedIndex] !== null) {
                                const byteCharacters = window.atob(thumbnails[paginatedIndex]);
                                const byteNumbers = new Array(byteCharacters.length);
                                for (let i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                const byteArray = new Uint8Array(byteNumbers);
                                const blob = new Blob([byteArray], { type: 'image/png' });
                                updatedAnnouncements[globalIndex] = { ...announcement, thumbnail: URL.createObjectURL(blob) };
                            } else {
                                updatedAnnouncements[globalIndex] = { ...announcement };
                            }
                        });
                        return updatedAnnouncements;
                    });

                    setImageLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching thumbnails:', error);
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
        fetchPageThumbnails();
    };

    // ---------------- Image Cleanup
    useEffect(() => {
        return () => {
            //console.log("closed");
            announcements.forEach(announcement => {
                if (announcement.thumbnail && announcement.thumbnail.startsWith('blob:')) {
                    URL.revokeObjectURL(announcement.thumbnail);
                }
            });
        };
    }, []);

    // ---------------- Announcement Modal
    const [openAddAnnouncementModal, setOpenAddAnnouncementModal] = useState(false);
    const handleOpenAnnouncementModal = () => {
        setOpenAddAnnouncementModal(true);
    };
    const handleCloseAnnouncementModal = (reload) => {
        setOpenAddAnnouncementModal(false);
        if (reload) {
            fetchAnnouncements();
        }
    };


    // ---------------- Announcement Manager
    const [openAnnouncementManage, setOpenAnnouncementManage] = useState(null);
    const handleOpenAnnouncementManage = (announcement) => {
        setOpenAnnouncementManage(announcement)
    }
    const handleCloseAnnouncementManage = (reload) => {
        setOpenAnnouncementManage(null);
        if (reload) {
            fetchAnnouncements();
        }
    }


    return (
        <Layout title={"AnnouncementList"}>
            <Box sx={{ width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "90%" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Announcements
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenAnnouncementModal}
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
                                        ...(pageAnnouncements.length === 0 ? { justifyContent: "center" } : {}),
                                    }}
                                >
                                    {pageAnnouncements.length > 0 ? (
                                        pageAnnouncements.map(
                                            (announcement, index) => (
                                                <Grid item key={index} xs={12} sm={6} lg={4}>
                                                    <CardActionArea onClick={() => handleOpenAnnouncementManage(announcement)}>
                                                        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                                            {/* Card Thumbnail */}
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
                                                                    image={announcement.thumbnail ? announcement.thumbnail : "../../../images/ManProTab.png"}
                                                                    title={`${announcement.title}_Thumbnail`}
                                                                />
                                                            )}
                                                            {/* Card Content */}
                                                            <CardContent>
                                                                {/* Announcement Title */}
                                                                <Typography variant="h6" component="div" noWrap sx={{ textOverflow: "ellipsis" }}>
                                                                    {announcement.title}
                                                                </Typography>
                                                                {/* Announcement Status */}
                                                                <Typography sx={{
                                                                    fontWeight: "bold",
                                                                    color:
                                                                        announcement.status == "Pending"
                                                                            ? "#e9ae20"
                                                                            : announcement.status == "Published"
                                                                                ? "#177604"
                                                                                : "#f57c00"
                                                                }}>
                                                                    {announcement.status}
                                                                </Typography>
                                                            </CardContent>
                                                            {/* Acknowledgement and Options */}
                                                            <CardActions sx={{ width: "100%", paddingX: "16px", justifyContent: "space-between", alignItems: "center" }}>
                                                                <Box display="flex" sx={{
                                                                    mt: 2,
                                                                    alignItems: 'center',
                                                                }}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {announcement.status == "Pending"
                                                                            ? "Not Yet Published"
                                                                            : `${announcement.acknowledged}/${announcement.recipients} Acknowledged`}
                                                                    </Typography>
                                                                </Box>
                                                            </CardActions>
                                                        </Card>
                                                    </CardActionArea>
                                                </Grid>
                                            )
                                        )
                                    ) : (
                                        // No Announcements
                                        <>
                                            <Box sx={{ mt: 5, p: 3, bgcolor: "#ffffff", borderRadius: 3, width: '100%', maxWidth: 350, textAlign: 'center' }}>
                                                No Announcements
                                            </Box>
                                        </>
                                    )}
                                </Grid>
                                {/* Pagination Controls */}
                                {totalAnnouncements > announcementsPerPage && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <Pagination
                                            shape="rounded"
                                            count={Math.ceil(totalAnnouncements / announcementsPerPage)}
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
            {openAddAnnouncementModal && (
                <AnnouncementAdd
                    open={openAddAnnouncementModal}
                    close={handleCloseAnnouncementModal}
                />
            )}
            {openAnnouncementManage && (
                <AnnouncementManage
                    open={true}
                    close={handleCloseAnnouncementManage}
                    announceInfo={openAnnouncementManage}
                />
            )}
        </Layout>
    );
};

export default AnnouncementList;
