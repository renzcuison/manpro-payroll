import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    Typography,
    CircularProgress,
    FormGroup,
    FormControl,
    InputLabel,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    Stack,
    Divider,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Tab
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";
import dayjs from "dayjs";
import { BarChart } from "@mui/x-charts";

const FormAnalytics = ({ open, close, formData }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [responseAnalytics, setResponseAnalytics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const formInfo = formData.content;

    console.log(formData);
    console.log(formInfo);

    useEffect(() => {
        axiosInstance
            .get(`trainings/getFormAnalytics/${formData.id}`, {
                headers
            })
            .then((response) => {
                setResponseAnalytics(response.data.analytics);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching form analytics:", error);
            });
    }, []);

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        backgroundColor: "#f8f9fa",
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        minWidth: { xs: "100%", sm: "750px" },
                        maxWidth: "850px",
                        marginBottom: "5%",
                    },
                }}
            >
                <DialogTitle sx={{ padding: 2, mt: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h5" sx={{ marginLeft: 1, fontWeight: "bold" }} >
                            {" "}Form Analytics{" "}
                        </Typography>
                        <IconButton onClick={close}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ py: 2, pb: 5 }}>
                    {isLoading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 100,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <BarChart
                                        series={[{
                                            data: [
                                                { value: 30, color: '#8884d8' },  // Purple for High Score
                                                { value: 20, color: '#82ca9d' },  // Green for Average Score
                                                { value: 10, color: '#ff7300' }   // Orange for Low Score
                                            ]
                                        }]}
                                        yAxis={[
                                            {
                                                scaleType: 'band',
                                                data: ['High Score', 'Average Score', 'Low Score'],
                                            },
                                        ]}
                                        xAxis={[
                                            {
                                                max: formData.total_points ?? 100,
                                            },
                                        ]}
                                        height={300}
                                        width={700}
                                        layout="horizontal"
                                        margin={{ left: 100 }}  // Added margin to prevent label clipping
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default FormAnalytics;
