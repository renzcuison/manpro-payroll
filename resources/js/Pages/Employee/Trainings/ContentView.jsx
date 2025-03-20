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

    // ---------------- Training Data States
    const [isLoading, setIsLoading] = useState(false);
    const [training, setTraining] = useState([]);
    const [content, setContent] = useState([]);

    const [imageLoading, setImageLoading] = useState(true);
    const [imagePath, setImagePath] = useState("");

    useEffect(() => {
        //await new functions
    }, []);

    const functionName = () => {

    };

    return (
        <Layout title={"ContentView"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }} >
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between", px: 1, alignItems: "center" }} >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Training Content
                        </Typography>
                    </Box>

                    <Box display="flex" sx={{ bgcolor: "white", borderRadius: "8px" }} >
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ width: "20%", my: 2, mb: 5, p: 3, backgroundColor: "#abcdef" }}>
                                    <Typography sx={{ color: "white", fontWeight: "bold" }}>
                                        Content List Here
                                    </Typography>
                                </Box>
                                <Box sx={{ width: "80%", mt: 6, mb: 5, p: 3, backgroundColor: "#123456" }}>
                                    <Typography sx={{ color: "white", fontWeight: "bold" }}>
                                        Insert Content Here
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default ContentView;
