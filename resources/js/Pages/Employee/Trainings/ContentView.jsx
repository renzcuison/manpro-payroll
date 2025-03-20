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
    Chip,
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
    Divider,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Tooltip,
    CardActionArea
} from "@mui/material";
import { TaskAlt, MoreVert, Download, WarningAmber, OndemandVideo, Image, Description, Quiz, SwapHoriz } from "@mui/icons-material";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import PageHead from "../../../components/Table/PageHead";
import PageToolbar from "../../../components/Table/PageToolbar";
import Swal from "sweetalert2";
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


const ContentView = () => {
    const { code } = useParams();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();


    // Content Information
    const [isLoading, setIsLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState(null);
    const [contentId, setContentId] = useState(null);
    const [contentList, setContentList] = useState([]);

    useEffect(() => {
        const storedContentId = sessionStorage.getItem('contentId');
        if (storedContentId) {
            setContentId(storedContentId);
        }
        const storedTrainingTitle = sessionStorage.getItem('trainingTitle');
        if (storedTrainingTitle) {
            setTitle(storedTrainingTitle);
        }
        getContentDetails(storedContentId);
        getTrainingContent();
    }, []);

    // Content Details
    const getContentDetails = (id) => {
        setIsLoading(true);
        axiosInstance.get(`/trainings/getContentDetails/${id}`, { headers })
            .then((response) => {
                console.log(response.data.content);
                setContent(response.data.content);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching content details', error);
                setIsLoading(false);
            });
    }

    // Content List
    const getTrainingContent = () => {
        axiosInstance.get(`/trainings/getEmployeeTrainingContent/${code}`, { headers })
            .then((response) => {
                setContentList(response.data.content || []);
            })
            .catch((error) => {
                console.error('Error fetching training content:', error);
            });
    }

    // Content Selection
    const handleContentChange = (id) => {
        setContentId(id);
        getContentDetails(id);
        sessionStorage.setItem('contentId', id);
    }

    return (
        <Layout title={"ContentView"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Training Content
                        </Typography>
                    </Box>

                    <Box display="flex" sx={{ mt: 6, mb: 5, bgcolor: "white", borderRadius: "8px", maxHeight: "1000px" }} >
                        <>
                            <Box sx={{ width: "20%", my: 2, mb: 2, p: 3, borderRight: "solid 1px #e0e0e0", }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", }} >
                                    {title}
                                </Typography>
                                <Box sx={{ height: "95%" }}>
                                    {contentList.length > 0 && (
                                        contentList.map((cont) => (
                                            <Box
                                                key={cont.id}
                                                display="flex"
                                                sx={{
                                                    py: 1.5,
                                                    ...(cont.id == contentId && {
                                                        backgroundColor: "#e9ae20",
                                                        borderRadius: "8px",
                                                        pl: 1,
                                                    }),
                                                }}
                                                onClick={() => handleContentChange(cont.id)}
                                            >
                                                <Typography sx={{ color: "text.secondary", ...(cont.id == contentId && { color: "white", fontWeight: "bold" }), }}>
                                                    {cont.title}
                                                </Typography>
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ width: "80%", mt: 6, mb: 2, p: 3 }}>
                                {isLoading ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                                {content.title || "-"}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                )}
                            </Box>
                        </>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default ContentView;
