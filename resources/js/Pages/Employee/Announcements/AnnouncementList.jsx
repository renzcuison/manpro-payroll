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
    CardContent
} from "@mui/material";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
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

const AnnouncementList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(false);
    const [announcements, setAnnouncements] = useState([]);

    // ---------------- Announcement List API
    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = () => {
        axiosInstance.get('/announcements/getMyAnnouncements', { headers })
            .then((response) => {
                setAnnouncements(response.data.announcements);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching announcements:', error);
                setIsLoading(false);
            });
    }

    // ---------------- Announcement Image API
    useEffect(() => {
        if (announcements.length > 0) {
            console.log("Requesting Thumbnails");
        } else {
            console.log("No Request Needed");
        }
    }, [announcements]);


    return (
        <Layout title={"AnnouncementList"}>
            <Box sx={{ overflowY: "auto", width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "90%" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Announcements
                        </Typography>
                    </Box>

                    <Box sx={{ p: 3 }} >
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Grid container rowSpacing={{ xs: 1, sm: 2 }} columnSpacing={{ xs: 2, sm: 3 }}>
                                    {announcements.length > 0 ? (
                                        announcements.map(
                                            (announcement, index) => (
                                                <Grid item key={index} xs={12} sm={6} lg={4}>
                                                    <Card sx={{ maxWidth: 350 }}>
                                                        {imageLoading ? (
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    height: 150
                                                                }}
                                                            >
                                                                <CircularProgress />
                                                            </Box>
                                                        ) : (
                                                            <CardMedia
                                                                sx={{ height: 150 }}
                                                                image={"../../../images/ManProTab.png"}
                                                                title="AnnouncementCard"
                                                            />
                                                        )}

                                                        <CardContent>
                                                            <Typography gutterBottom variant="h6" component="div">
                                                                {announcement.title}
                                                            </Typography>
                                                            <div
                                                                id="description"
                                                                style={{ height: '100px', overflow: 'hidden' }}
                                                                dangerouslySetInnerHTML={{ __html: announcement.description }} // Render HTML directly
                                                            />
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            )
                                        )
                                    ) : (
                                        <>
                                            <Box sx={{ bgcolor: "#ffffff", p: 4, alignSelf: "center" }}>No Announcements</Box>
                                        </>
                                    )}
                                </Grid>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default AnnouncementList;
