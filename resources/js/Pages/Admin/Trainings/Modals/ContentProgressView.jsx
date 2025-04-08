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

const ContentProgressView = ({ open, close, contentId }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [contentViews, setContentViews] = useState([]);
    const [noViews, setNoViews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axiosInstance
            .get(`trainings/getTrainingViews/${contentId}`, {
                headers
            })
            .then((response) => {
                setContentViews(response.data.views);
                setNoViews(response.data.no_views);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching content progress:", error);
            });
    }, []);

    const [viewTab, setViewTab] = useState('1');
    const handleTabChange = (event, newValue) => {
        setViewTab(newValue);
    }

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
                            {" "}Employee Progress{" "}
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
                            <TabContext value={viewTab}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <TabList onChange={handleTabChange} aria-label="View Tabs">
                                        <Tab label="Viewed" value="1" />
                                        <Tab label="Not Yet Viewed" value="2" />
                                    </TabList>
                                </Box>
                                {/* Views */}
                                <TabPanel value="1" sx={{ p: 0, width: '100%' }}>
                                    <TableContainer sx={{ height: '400px', overflowY: 'auto' }}>
                                        <Table stickyHeader size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ width: '35%', fontWeight: 'bold' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Employee
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ width: '10%', fontWeight: 'bold' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Status
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Date Viewed
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Date Completed
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {contentViews.length > 0 ? (
                                                    contentViews.map((view, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell sx={{ width: '35%' }}>
                                                                <Box display="flex" sx={{ alignItems: 'center' }}>
                                                                    <Avatar
                                                                        alt={`${view.emp_first_name}_Avatar`}
                                                                        src={`${location.origin}/storage/${view.emp_profile_pic}` || '../../../../../images/avatarpic.jpg'}
                                                                        sx={{ mr: 1 }}
                                                                    />
                                                                    {`${view.emp_first_name} ${view.emp_middle_name || ''} ${view.emp_last_name} ${view.emp_suffix || ''}`}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell sx={{ width: '15%' }}>
                                                                <Typography sx={{ fontWeight: "bold", color: view.status == "Finished" ? "#177604" : view.status == "Viewed" ? "#f57c00" : "#000" }}>
                                                                    {view.status}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ width: '25%' }}>
                                                                {dayjs(view.viewed_at).format('MMM D, YYYY h:mm A')}
                                                            </TableCell>
                                                            <TableCell sx={{ width: '25%' }}>
                                                                {view.completed_at ? dayjs(view.completed_at).format('MMM D, YYYY h:mm A') : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center">
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                -- No Views --
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </TabPanel>
                                {/* Not Yet Viewed */}
                                <TabPanel value="2" sx={{ p: 0, width: '100%' }}>
                                    <TableContainer sx={{ height: '400px', overflowY: 'auto' }}>
                                        <Table stickyHeader size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ width: '100%', fontWeight: 'bold' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Employee
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {noViews.length > 0 ? (
                                                    noViews.map((view, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <Box display="flex" sx={{ alignItems: 'center' }}>
                                                                    <Avatar
                                                                        alt={`${view.emp_first_name}_Avatar`}
                                                                        src={`${location.origin}/storage/${view.emp_profile_pic}` || '../../../../../images/avatarpic.jpg'}
                                                                        sx={{ mr: 1 }}
                                                                    />
                                                                    {`${view.emp_first_name} ${view.emp_middle_name || ''} ${view.emp_last_name} ${view.emp_suffix || ''}`}
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell align="center">
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                All Employees have viewed this content
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </TabPanel>
                            </TabContext>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ContentProgressView;
