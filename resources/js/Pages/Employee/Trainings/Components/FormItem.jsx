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
        <Grid item xs={12}>
            <Box
                display="flex"
                sx={{
                    mb: 2,
                    p: { xs: 1.5, sm: 2 },
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    justifyContent: 'flex-start',
                    alignItems: 'start',
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
            >
                {/* Question No. */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        backgroundColor: '#f5f5f5',
                        borderRadius: '5px',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        fontWeight: 'bold',
                        mr: 2,
                    }}
                >
                    {itemData.order}
                </Box>

                {/* Main Content */}
                <Box
                    sx={{
                        width: "100%",
                        overflow: 'hidden',
                    }}
                >
                    {/* Description */}
                    <Typography
                        variant="body1"
                        component="div"
                        sx={{
                            mb: 3,
                            color: 'text.primary',
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                        }}
                        id={`description-${itemData.id}`}
                        aria-label={`Question ${itemData.order}: ${itemData.description.replace(/<[^>]+>/g, '')}`}
                    >
                        <div
                            style={{
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal',
                                '& *': {
                                    whiteSpace: 'normal !important',
                                    wordBreak: 'break-word !important',
                                    overflowWrap: 'break-word !important',
                                },
                            }}
                            dangerouslySetInnerHTML={{ __html: itemData.description }}
                        />
                    </Typography>

                    {/* Answer Field */}
                    {itemData.type == "FillInTheBlank" ? (
                        <>
                        </>
                    ) : (
                        <>
                        </>
                    )}
                </Box>
            </Box>
        </Grid>
    );
};

export default FormItem;
