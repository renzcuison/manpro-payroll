import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    Typography,
    FormControl,
    InputLabel,
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
    Avatar,
} from "@mui/material";
import { PictureAsPdf, Description, InsertPhoto, GridOn, FileDownload } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import InfoBox from "../../../../components/General/InfoBox";
import LoadingSpinner from "../../../../components/LoadingStates/LoadingSpinner";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const ApplicationManage = ({ open, close, appId }) => {

    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [imagePath, setImagePath] = useState('');
    const [application, setApplication] = useState(null);
    const [files, setFiles] = useState([]);
    const [leaveCredits, setLeaveCredits] = useState([]);

    const [appResponse, setAppResponse] = useState("");
    const [appResponseError, setAppResponseError] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getApplicationDetails();
    }, [])

    const getApplicationDetails = () => {
        axiosInstance.get(`/applications/getApplicationDetails/${appId}`, { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    const applicationData = response.data.application;
                    setApplication(applicationData);
                    setFiles(response.data.files);

                    // Avatar Decoder
                    if (applicationData.avatar && applicationData.avatar_mime) {
                        const byteCharacters = window.atob(applicationData.avatar);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: applicationData.avatar_mime });

                        const newBlob = URL.createObjectURL(blob);
                        setImagePath(newBlob);
                    } else {
                        setImagePath(null);
                    }

                    const uname = response.data.application.emp_user_name;
                    getLeaveCredits(uname);
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                console.error('Error fetching application details:', error);
            });
    }

    useEffect(() => {
        return () => {
            if (imagePath && imagePath.startsWith('blob:')) {
                URL.revokeObjectURL(imagePath);
            }
        };
    }, [imagePath]);

    const getLeaveCredits = (uname) => {
        axiosInstance.get(`/applications/getLeaveCredits/${uname}`, { headers })
            .then((response) => {
                setLeaveCredits(response.data.leave_credits);
            })
            .catch((error) => {
                console.error('Error fetching leave credits:', error);
            });
    }

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

    // Response Verification
    const checkInput = (event) => {
        event.preventDefault();

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
                    saveInput(event);
                }
            });
        }
    }

    // Save Response
    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            app_id: application.id,
            app_type_id: application.type_id,
            app_emp_username: application.user_name,
            app_response: appResponse,
            app_leave_used: application.leave_used,
            app_start_date: dayjs(application.duration_start).format("YYYY-MM-DD"),
            app_end_date: dayjs(application.duration_end).format("YYYY-MM-DD"),
        }

        axiosInstance.post(`applications/manageApplication`, data, { headers })
            .then((response) => {
                if (response.data.status == 200) {
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: "Success!",
                        text: `The application has been ${appResponse == "Approve" ? "Approved" : "Declined"}.`,
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    }).then((res) => {
                        if (res.isConfirmed) {
                            close();
                        }
                    });
                }
            })
            .catch((error) => {
                console.error("Error managing application:", error);
            });
    }

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
                        minWidth: { xs: "100%", sm: "900px" },
                        maxWidth: '1000px',
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
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <Box sx={{ display: 'flex' }}>
                            {/* Application Details */}
                            <Box sx={{ width: "50%" }}>
                                <Grid container rowSpacing={2}>
                                    <Grid size={12} align="left">
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                            Application Details
                                        </Typography>
                                    </Grid>
                                    {/* Application Type */}
                                    <Grid size={{ xs: 12 }}>
                                        <InfoBox
                                            title="Type"
                                            info={application.type_name}
                                            compact
                                            clean
                                        />
                                    </Grid>
                                    <Grid size={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Request Date*/}
                                    <Grid size={{ xs: 12 }}>
                                        <InfoBox
                                            title="Requested"
                                            info={dayjs(application.created_at).format(`MMM D, YYYY   hh:mm A`)}
                                            compact
                                            clean
                                        />
                                    </Grid>
                                    {/* Start Date */}
                                    <Grid size={{ xs: 12 }}>
                                        <InfoBox
                                            title="Starts"
                                            info={dayjs(application.duration_start).format(`MMM D, YYYY   hh:mm A`)}
                                            compact
                                            clean
                                        />
                                    </Grid>
                                    {/* End Date */}
                                    <Grid size={{ xs: 12 }}>
                                        <InfoBox
                                            title="Ends"
                                            info={dayjs(application.duration_end).format(`MMM D, YYYY   hh:mm A`)}
                                            compact
                                            clean
                                        />
                                    </Grid>
                                    {/* Credits Used */}
                                    <Grid size={{ xs: 12 }}>
                                        <InfoBox
                                            title="Credits Required"
                                            info={application.leave_used}
                                            compact
                                            clean
                                        />
                                    </Grid>
                                    <Grid size={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Description */}
                                    <Grid container size={{ xs: 12 }}>
                                        <Grid size={12}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                Description
                                            </Typography>
                                        </Grid>
                                        <Grid size={12}>
                                            {application.description}
                                        </Grid>
                                    </Grid>
                                    <Grid size={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Attachments */}
                                    <Grid container size={{ xs: 12 }}>
                                        <Grid size={12}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                Attached Files
                                            </Typography>
                                        </Grid>
                                        <Grid size={12}>
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
                                    <Grid size={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Application Response */}
                                    <Grid container size={{ xs: 12 }} sx={{ alignItems: "center" }} >
                                        <Grid size={{ xs: 5 }} align="left">
                                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                Action
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 7 }} align="left">
                                            <FormControl fullWidth>
                                                <InputLabel id="app-response-label">
                                                    Select Action
                                                </InputLabel>
                                                <Select labelId="app-response-label" id="app-response" value={appResponse} error={appResponseError} label="Select Action" onChange={(event) => setAppResponse(event.target.value)} >
                                                    <MenuItem value="Approve"> Approve </MenuItem>
                                                    <MenuItem value="Decline"> Decline </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                    {/* Submit Action */}
                                    <Grid size={12} align="center">
                                        <Button variant="contained" sx={{ backgroundColor: "#177604", color: "white" }} onClick={checkInput} >
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
                                    <Grid size={12} align="left">
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                            Employee Information
                                        </Typography>
                                    </Grid>
                                    {/* Employee Name */}
                                    <Grid size={{ xs: 12 }}>
                                        <Box display="flex" sx={{ width: "100%" }}>
                                            <Box sx={{ width: "40%", placeContent: "center", placeItems: "center" }}>
                                                <Avatar src={imagePath} sx={{ height: "58px", width: "58px", mr: 4 }} />
                                            </Box>
                                            <Box display="flex" sx={{ width: "60%", alignItems: "center" }}>
                                                <Typography
                                                    sx={{
                                                        color: 'text.primary',
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {`${application.emp_first_name} ${application.emp_middle_name || ""} ${application.emp_last_name || ""} ${application.emp_suffix || ""}`}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid size={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Employee Position */}
                                    <Grid size={{ xs: 12 }}>
                                        <InfoBox
                                            title="Position"
                                            info={application.emp_job_title}
                                            compact
                                            clean
                                        />
                                    </Grid>
                                    {/* Employee Branch */}
                                    <Grid size={{ xs: 12 }}>
                                        <InfoBox
                                            title="Branch"
                                            info={application.emp_branch}
                                            compact
                                            clean
                                        />
                                    </Grid>
                                    {/* Employee Department */}
                                    <Grid size={{ xs: 12 }}>
                                        <InfoBox
                                            title="Department"
                                            info={application.emp_department}
                                            compact
                                            clean
                                        />
                                    </Grid>
                                    <Grid size={12} sx={{ my: 0 }} >
                                        <Divider />
                                    </Grid>
                                    {/* Leave Credits */}
                                    <Grid size={12}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                                            Leave Credits
                                        </Typography>
                                        <TableContainer sx={{ border: "solid 1px #e0e0e0" }}>
                                            <Table size="small" stickyHeader>
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
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog >
        </>
    );
};

export default ApplicationManage;
