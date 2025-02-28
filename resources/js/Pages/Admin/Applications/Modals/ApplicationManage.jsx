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
    Divider,
    Stack,
    Tooltip,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Table,
} from "@mui/material";
import { PictureAsPdf, Description, InsertPhoto, GridOn, FileDownload } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
import { icon } from "@fortawesome/fontawesome-svg-core";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const ApplicationManage = ({ open, close, appDetails }) => {

    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [files, setFiles] = useState([]);
    const [leaveCredits, setLeaveCredits] = useState([]);
    const [appResponse, setAppResponse] = useState("");
    const [appResponseError, setAppResponseError] = useState(false);

    // ----------- Request Attachments and Leave Credits
    useEffect(() => {
        axiosInstance.get(`/applications/getApplicationFiles/${appDetails.app_id}`, { headers })
            .then((response) => {
                setFiles(response.data.filenames);
            })
            .catch((error) => {
                console.error('Error fetching files:', error);
            });

        axiosInstance.get(`/applications/getLeaveCredits/${appDetails.emp_id}`, { headers })
            .then((response) => {
                setLeaveCredits(response.data.leave_credits);
            })
            .catch((error) => {
                console.error('Error fetching files:', error);
            });
    }, []);

    // ----------- Dynamic File Icon
    const getFileIcon = (filename) => {
        const fileType = filename.split(".").pop().toLowerCase();

        let icon = null;
        let color = null;

        switch (fileType) {
            case "png":
            case "jpg":
            case "jpeg":
                icon = InsertPhoto;
                color = "purple";
                break;
            case "doc":
            case "docx":
                icon = Description;
                color = "blue";
                break;
            case "pdf":
                icon = PictureAsPdf;
                color = "red";
                break;
            case "xls":
            case "xlsx":
                icon = GridOn;
                color = "green";
        }

        return { icon, color };
    }

    // ----------- Download Attachment
    const handleFileDownload = async (filename, id) => {
        try {
            const response = await axiosInstance.get(
                `/applications/downloadFile/${id}`,
                {
                    responseType: "blob",
                    headers,
                }
            );
            const blob = new Blob([response.data], {
                type: response.headers["content-type"],
            });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();

            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    // ----------- Application Response
    const handleApplicationResponse = () => {

        const data = {
            app_id: appDetails.app_id,
            app_type_id: appDetails.app_type_id,
            app_emp_id: appDetails.emp_id,
            app_response: appResponse,
            app_start_date: dayjs(appDetails.app_duration_start).format("YYYY-MM-DD"),
            app_end_date: dayjs(appDetails.app_duration_end).format("YYYY-MM-DD"),
        }

        if (!appResponse) {
            setAppResponseError(true);
        } else {
            setAppResponseError(false);
        }
        if (!appResponse) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "Select an Action!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: `${appResponse} application?`,
                text: "This action cannot be undone",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: appResponse,
                confirmButtonColor: `${appResponse == "Approve" ? "#177604" : "#f44336"}`,
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    axiosInstance.post(`applications/manageApplication`, data, { headers })
                        .then((response) => {
                            Swal.fire({
                                customClass: { container: "my-swal" },
                                title: "Success!",
                                text: `The application has been ${appResponse == "Approve" ? "Approved" : "Declined" }.`,
                                icon: "success",
                                showConfirmButton: true,
                                confirmButtonText: "Okay",
                                confirmButtonColor: "#177604",
                            }).then((res) => {
                                if (res.isConfirmed) {
                                    close();
                                }
                            });
                        })
                        .catch((error) => {
                            console.error("Error managing application:", error);
                        });
                }
            });
        }
    };

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: { xs: "100%", sm: "850px" },
                        maxWidth: '900px',
                        maxHeight: '750px',
                        marginBottom: '5%'
                    }
                }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, my: 1, fontWeight: "bold" }}> {" "}Manage Application{" "} </Typography>
                        <IconButton onClick={close}> <i className="si si-close"></i> </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mt: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex' }}>
                        {/* Application Details */}
                        <Box sx={{ width: "50%" }}>
                            <Grid container rowSpacing={2}>
                                <Grid item xs={12} align="left">
                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}> Application Details </Typography>
                                </Grid>

                                {/* Application Type */}
                                <Grid item xs={5} align="left">
                                    Type
                                </Grid>
                                <Grid item xs={7} align="left">
                                    <Typography sx={{ fontWeight: "bold" }}> {appDetails.app_type_name} </Typography>
                                </Grid>
                                <Grid item xs={12} sx={{ my: 0 }} >
                                    <Divider />
                                </Grid>

                                {/* Request Date*/}
                                <Grid item xs={5} align="left">
                                    Requested
                                </Grid>
                                <Grid item xs={7} align="left">
                                    <Stack direction="row">
                                        <Typography sx={{ fontWeight: "bold", width: "50%" }}> {dayjs(appDetails.app_date_requested).format("MMM D, YYYY")} </Typography>
                                        <Typography sx={{ fontWeight: "bold", width: "50%" }}> {dayjs(appDetails.app_date_requested).format("h:mm A")} </Typography>
                                    </Stack>
                                </Grid>

                                {/* Start Date */}
                                <Grid item xs={5} align="left">
                                    Starts
                                </Grid>
                                <Grid item xs={7} align="left">
                                    <Stack direction="row">
                                        <Typography sx={{ fontWeight: "bold", width: "50%" }}> {dayjs(appDetails.app_duration_start).format("MMM D, YYYY")} </Typography>
                                        <Typography sx={{ fontWeight: "bold", width: "50%" }}> {dayjs(appDetails.app_duration_start).format("h:mm A")} </Typography>
                                    </Stack>
                                </Grid>

                                {/* End Date */}
                                <Grid item xs={5} align="left">
                                    Ends
                                </Grid>
                                <Grid item xs={7} align="left">
                                    <Stack direction="row">
                                        <Typography sx={{ fontWeight: "bold", width: "50%" }}> {dayjs(appDetails.app_duration_end).format("MMM D, YYYY")} </Typography>
                                        <Typography sx={{ fontWeight: "bold", width: "50%" }}> {dayjs(appDetails.app_duration_end).format("h:mm A")} </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sx={{ my: 0 }} >
                                    <Divider />
                                </Grid>

                                {/* Description */}
                                <Grid container item xs={12}>
                                    <Grid item xs={12}>
                                        <div style={{ textDecoration: "underline" }} >
                                            Description
                                        </div>
                                    </Grid>
                                    <Grid item xs={12} sx={{ mt: 1 }}>
                                        {appDetails.app_description}
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sx={{ my: 0 }} >
                                    <Divider />
                                </Grid>
                                {/* Attachments */}
                                <Grid container item xs={12}>
                                    <Grid item xs={12}>
                                        Attached Files
                                    </Grid>
                                    <Grid item xs={12}>
                                        {files ? (
                                            <Stack direction="column" sx={{ width: '100%' }}>
                                                {files.map((file, index) => {
                                                    const fileIcon = getFileIcon(file.filename);
                                                    return (
                                                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '4px 8px', mt: 1 }} >
                                                            <Box sx={{ display: 'flex' }}>
                                                                {fileIcon.icon && <fileIcon.icon sx={{ mr: 1, color: fileIcon.color }} />}
                                                                <Typography noWrap>{file.filename}</Typography>
                                                            </Box>
                                                            <Tooltip title="Download File">
                                                                <IconButton onClick={() => handleFileDownload(file.filename, file.id)} size="small">
                                                                    <FileDownload />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    )
                                                })}
                                            </Stack>
                                        ) : (
                                            <Box sx={{ mt: 1, width: "100%", display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4px 8px' }} >
                                                <Typography noWrap variant="caption" sx={{ color: 'text.secondary' }}>-- No Attached Files --</Typography>
                                            </Box>
                                        )}
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sx={{ my: 0 }} >
                                    <Divider />
                                </Grid>
                                {/* Application Response */}
                                <Grid container item xs={12} sx={{ alignItems: "center" }} >
                                    <Grid item xs={5} align="left">
                                        Action
                                    </Grid>
                                    <Grid item xs={7} align="left">
                                        <FormControl fullWidth>
                                            <InputLabel id="app-response-label">
                                                Select Action
                                            </InputLabel>
                                            <Select labelId="app-response-label" id="app-response" value={appResponse} error={appResponseError} label="Select Action" onChange={(event) => setAppResponse(event.target.value) } >
                                                <MenuItem value="Approve"> Approve </MenuItem>
                                                <MenuItem value="Decline"> Decline </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                {/* Submit Action */}
                                <Grid item xs={12} align="center">
                                    <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={handleApplicationResponse} >
                                        <p className="m-0">
                                            <i className="fa fa-floppy-o mr-2 mt-1"></i>{" "}Confirm Response{" "}
                                        </p>
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                        {/* Employee Details */}
                        <Box sx={{ width: "50%" }}>
                            <Grid container rowSpacing={2}>
                                <Grid item xs={12} align="left">
                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                        Employee Information
                                    </Typography>
                                </Grid>

                                {/* Employee Name */}
                                <Grid item xs={5} align="left"> Name </Grid>
                                <Grid item xs={7} align="left">
                                    <Typography sx={{ fontWeight: "bold" }}> {" "} {appDetails.emp_first_name}{" "} {appDetails.emp_middle_name || ""}{" "} {appDetails.emp_last_name}{" "} {appDetails.emp_suffix || ""}{" "} </Typography>
                                </Grid>
                                <Grid item xs={12} sx={{ my: 0 }} >
                                    <Divider />
                                </Grid>

                                {/* Employee Position */}
                                <Grid item xs={5} align="left"> Position </Grid>

                                <Grid item xs={7} align="left">
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        {" "}{appDetails.emp_job_title}{" "}
                                    </Typography>
                                </Grid>

                                {/* Employee Branch */}
                                <Grid item xs={5} align="left"> Branch </Grid>
                                <Grid item xs={7} align="left">
                                    <Typography sx={{ fontWeight: "bold" }}> {" "}{appDetails.emp_branch}{" "} </Typography>
                                </Grid>

                                {/* Employee Department */}
                                <Grid item xs={5} align="left"> Department </Grid>
                                <Grid item xs={7} align="left">
                                    <Typography sx={{ fontWeight: "bold" }}> {" "}{appDetails.emp_department}{" "} </Typography>
                                </Grid>
                                <Grid item xs={12} sx={{ my: 0 }} >
                                    <Divider />
                                </Grid>

                                {/* Leave Credits */}
                                <Grid container item xs={12}>
                                    <Grid item xs={12}>
                                        <div style={{ textDecoration: "underline", }} > Leave Credits </div>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="left" sx={{ width: "40%" }}>
                                                            <Typography variant="caption" sx={{ color: "text.secondary" }}> Type </Typography>
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ width: "20%" }}>
                                                            <Typography variant="caption" sx={{ color: "text.secondary" }}> Credits </Typography>
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ width: "20%" }}>
                                                            <Typography variant="caption" sx={{ color: "text.secondary" }}> Used </Typography>
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ width: "20%" }}>
                                                            <Typography variant="caption" sx={{ color: "text.secondary" }}> Remaining </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {leaveCredits.length > 0 ? (
                                                        leaveCredits.map((leave, index) => {

                                                            const remainingCredits = leave.credit_number - leave.credit_used;
                                                            const remainingWarning = remainingCredits < ((leave.credit_number / 3) * 2);
                                                            const remainingEmpty = remainingCredits < (leave.credit_number / 3);

                                                            return (
                                                                <TableRow key={index}>
                                                                    <TableCell> {leave.app_type_name} </TableCell>
                                                                    <TableCell align="center"> {leave.credit_number} </TableCell>
                                                                    <TableCell align="center"> {leave.credit_used} </TableCell>
                                                                    <TableCell align="center" sx={{ color: remainingEmpty ? "#f44336" : remainingWarning ? "#e9ae20" : null }}> {remainingCredits} </TableCell>
                                                                </TableRow>
                                                            );

                                                        })) :
                                                        <TableRow>
                                                            <TableCell colSpan={4} align="center" sx={{ color: "text.secondary", p: 1 }} > No Leave Credits Found </TableCell>
                                                        </TableRow>
                                                    }
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    );
};

export default ApplicationManage;
