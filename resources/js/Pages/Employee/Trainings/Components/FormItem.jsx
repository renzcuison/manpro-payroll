import React from "react";
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
import { TaskAlt, MoreVert, Download, WarningAmber, OndemandVideo, Image, Description, Quiz, SwapHoriz, CheckCircle, Visibility, Pending, CheckBox } from "@mui/icons-material";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";


const FormItem = ({ itemData }) => {
    return (
        <>
            <Grid item xs={12}>
                <Box
                    sx={{
                        mb: 1,
                        p: "8px 12px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        backgroundColor: "white",
                        transition: "background-color 0.3s ease",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>{itemData.order}</Typography>
                    <div
                        id="description"
                        style={{
                            wordWrap: 'break-word',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                        }}
                        dangerouslySetInnerHTML={{ __html: itemData.description }}
                    />
                </Box>
            </Grid>
        </>
    );
};

export default FormItem;
