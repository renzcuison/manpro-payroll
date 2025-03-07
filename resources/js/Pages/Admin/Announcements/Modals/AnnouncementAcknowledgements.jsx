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

const AnnouncementAcknowledgements = ({ open, close, uniCode }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [acknowledgements, setAcknowledgements] = useState([]);
    const [unAcknowledged, setUnAcknowledged] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axiosInstance
            .get(`announcements/getAcknowledgements/${uniCode}`, {
                headers
            })
            .then((response) => {
                setAcknowledgements(response.data.acknowledgements);
                setUnAcknowledged(response.data.unacknowledged);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching acknowledgements:", error);
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
                        minWidth: { xs: "100%", sm: "400px" },
                        maxWidth: "450px",
                        marginBottom: "5%",
                    },
                }}
            >
                <DialogTitle sx={{ padding: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h5" sx={{ marginLeft: 1, fontWeight: "bold" }} >
                            {" "}Recipients{" "}
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
                        <Box >
                            <TabContext value={viewTab}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <TabList onChange={handleTabChange} aria-label="Acknowledgement Tabs">
                                        <Tab label="Acknowledged" value="1" />
                                        <Tab label="Not Acknowledged" value="2" />
                                    </TabList>
                                </Box>
                                {/* Acknowledged */}
                                <TabPanel value="1" sx={{ p: 0, maxHeight: "400px", overflowY: "auto", width: "100%" }}>
                                    <List sx={{ width: "100%" }}>
                                        {acknowledgements.length > 0 ? (
                                            acknowledgements.map((ack, index) => (
                                                <ListItem key={index} align="flex-start">
                                                    <ListItemAvatar>
                                                        <Avatar alt={`${ack.emp_first_name}_Avatar`} src={`../../../../../../storage/${ack.emp_profile_pic}` || "../../../../../images/avatarpic.jpg"} />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={`${ack.emp_first_name} ${ack.emp_middle_name || ''} ${ack.emp_last_name} ${ack.emp_suffix || ''}`}
                                                        secondary={`Acknowledged ${dayjs(ack.timestamp).format("MMM D, YYYY    h:mm A")}`}
                                                    />
                                                </ListItem>
                                            ))
                                        )
                                            :
                                            <ListItem sx={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
                                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                    -- No Acknowledgements --
                                                </Typography>
                                            </ListItem>}

                                    </List>
                                </TabPanel>
                                {/* Unacknowledged */}
                                <TabPanel value="2" sx={{ p: 0, maxHeight: "400px", overflowY: "auto", width: "100%" }}>
                                    <List sx={{ width: "100%" }}>
                                        {unAcknowledged.length > 0 ? (
                                            unAcknowledged.map((unAck, index) => (
                                                <ListItem key={index} align="flex-start">
                                                    <ListItemAvatar>
                                                        <Avatar alt={`${unAck.emp_first_name}_Avatar`} src={`../../../../../../storage/${unAck.emp_profile_pic}` || "../../../../../images/avatarpic.jpg"} />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={`${unAck.emp_first_name} ${unAck.emp_middle_name || ''} ${unAck.emp_last_name} ${unAck.emp_suffix || ''}`}
                                                        secondary="Not Yet Acknowledged"
                                                    />
                                                </ListItem>
                                            ))
                                        )
                                            :
                                            <ListItem sx={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
                                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                    -- Announcement acknowledged by all recipients --
                                                </Typography>
                                            </ListItem>}

                                    </List>
                                </TabPanel>
                            </TabContext>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AnnouncementAcknowledgements;
