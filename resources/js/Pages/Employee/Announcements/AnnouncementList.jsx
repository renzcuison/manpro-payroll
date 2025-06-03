import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Chip,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    CardActionArea,
    Pagination,
} from "@mui/material";
import dayjs from "dayjs";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import { Apartment, CheckCircleOutline, Groups } from "@mui/icons-material";

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
        axiosInstance.get('/announcements/getEmployeeAnnouncements', { headers })
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

    useEffect(() => {
        if (!announcementReload) {
            setAnnouncementReload(true);
        }
        fetchPageThumbnails();
    }, [announcementReload, firstAnnouncement, lastAnnouncement]);

    const fetchPageThumbnails = () => {
        if (announcements.length > 0) {
            const pagedAnnouncements = announcements.slice(firstAnnouncement, lastAnnouncement);
            const announcementIds = pagedAnnouncements.map(announcement => announcement.id);

            axiosInstance.get('/announcements/getPageThumbnails', {
                headers, params: {
                    announcement_ids: announcementIds
                }
            })
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
            announcements.forEach(announcement => {
                if (announcement.thumbnail && announcement.thumbnail.startsWith('blob:')) {
                    URL.revokeObjectURL(announcement.thumbnail);
                }
            });
        };
    }, []);


    return (
        <Layout title={"AnnouncementList"}>
            <Box sx={{ width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "95%" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Announcements
                        </Typography>
                    </Box>

                    <Box sx={{ my: 3, justifyContent: 'center', alignItems: 'center' }} >
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
                                                <Grid item key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
                                                    <CardActionArea component={Link} to={`/employee/announcement/${announcement.unique_code}`}>
                                                        <Card sx={{
                                                            position: "relative",
                                                            borderRadius: 2,
                                                            boxShadow: 2,
                                                            display: "flex",
                                                            flexDirection: "column"
                                                        }}>
                                                            {/* Card Thumbnail */}
                                                            {imageLoading ? (
                                                                <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                        height: '210px'
                                                                    }}
                                                                >
                                                                    <CircularProgress />
                                                                </Box>
                                                            ) : (
                                                                <CardMedia
                                                                    sx={{ height: '210px' }}
                                                                    image={announcement.thumbnail ? announcement.thumbnail : "../../../images/defaultThumbnail.jpg"}
                                                                    title={`${announcement.title}_Thumbnail`}
                                                                />
                                                            )}
                                                            {/* Card Content */}
                                                            <CardContent>
                                                                {/* Announcement Title */}
                                                                <Box sx={{ height: "32px" }}>
                                                                    <Typography
                                                                        variant="h6"
                                                                        component="div"
                                                                        sx={{
                                                                            display: '-webkit-box',
                                                                            WebkitBoxOrient: 'vertical',
                                                                            WebkitLineClamp: 1,
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'normal',
                                                                        }}
                                                                    >
                                                                        {announcement.title}
                                                                    </Typography>
                                                                </Box>
                                                                {/* Announcement Details */}
                                                                {/* Details */}
                                                                <Grid container item key={index} sx={{ my: 1 }}>
                                                                    <Grid size={{ xs: 3 }}>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                                                                            Posted
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid size={{ xs: 9 }}>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                            {dayjs(announcement.updated_at).format("MMM D, YYYY    h:mm A")}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </CardContent>
                                                            {/* Announcement Branch/Department Indicators */}
                                                            <CardActions sx={{ ml: "8px" }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    {/* Media Icons */}
                                                                    {announcement.branch_matched && <Apartment sx={{ color: 'text.secondary', mr: announcement.department_matched ? 0.5 : 0 }} />}
                                                                    {announcement.department_matched && <Groups sx={{ color: 'text.secondary' }} />}
                                                                    {/* Media Text */}
                                                                    <Box sx={{ ml: (announcement.branch_matched || announcement.department_matched) ? 1 : 0, mt: { xs: 1.5, md: 0 } }}>
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{
                                                                                color: "text.secondary",
                                                                                whiteSpace: "normal",
                                                                                wordBreak: "break-word",
                                                                                overflowWrap: "break-word",
                                                                                lineHeight: 1.5,
                                                                            }}
                                                                        >
                                                                            {(() => {
                                                                                const available = [
                                                                                    announcement.branch_matched && 'Branch',
                                                                                    announcement.department_matched && 'Department',
                                                                                ].filter(Boolean);
                                                                                return available.length > 0
                                                                                    ? `Posted for your ${available.join(', ').replace(/, ([^,]+)$/, ' and $1')}`
                                                                                    : '';
                                                                            })()}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </CardActions>
                                                            {announcement.acknowledged_on && (
                                                                <Chip
                                                                    icon={<CheckCircleOutline sx={{ color: 'white !important', fontSize: '18px' }} />}
                                                                    label="ACKNOWLEDGED"
                                                                    sx={{
                                                                        position: "absolute",
                                                                        top: 8,
                                                                        left: 8,
                                                                        backgroundColor: "#177604",
                                                                        color: "white",
                                                                        fontWeight: "bold",
                                                                        boxShadow: 3,
                                                                    }}
                                                                />
                                                            )}
                                                        </Card>
                                                    </CardActionArea>
                                                </Grid>
                                            )
                                        )
                                    ) : (
                                        <>
                                            <Box sx={{ mt: 5, p: 3, bgcolor: "#ffffff", borderRadius: 3, width: '100%', maxWidth: 350, textAlign: 'center' }}>
                                                No Announcements
                                            </Box>
                                        </>
                                    )}
                                </Grid>
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
        </Layout>
    );
};

export default AnnouncementList;
