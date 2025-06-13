import {
    Avatar,
    Box,
    Grid,
    Paper,
    Stack,
    Typography,
    Tooltip,
    Button,
    Divider,
} from "@mui/material";
import moment from "moment";
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";

function UserInformation({ user }) {

    const queryClient = useQueryClient();
    const fileInputRef = useRef();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // const profilePic = user.media[0]?.original_url;
    const profilePic = user?.media?.length ? user.media[0]?.original_url : user?.avatar || "../../../../../images/avatarpic.jpg";

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleUpload = (event) => {

        const file = event.target.files[0];
        if (file) {
            if (file.size > 5242880) {
                document.activeElement.blur();
                Swal.fire({
                    customClass: { container: "my-swal" },
                    title: "File Too Large!",
                    text: `The file size limit is 5 MB.`,
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: "#177604",
                });
            } else {
                //confirmation
                Swal.fire({
                    title: "Confirm Profile Update",
                    text: "Are you sure you want to update your profile with this file?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Confirm",
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#177604",
                    cancelButtonColor: "#d33",
                    customClass: { container: "my-swal" },
                }).then((result) => {
                    if (result.isConfirmed) {
                       //send file immediately, storing it in a useState might not save it when it is now sent
                       //to the backend
                        saveProfilePic(event, file);
                    }
                });
            }
        }
    };

    const saveProfilePic = (event, file) => {
        event.preventDefault();
        const formData = new FormData();

        formData.append('id', user.id);
        formData.append('profile_picture', file);

        axiosInstance.post('/employee/editMyProfilePicture', formData, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        text: "Profile Picture updated successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: "Proceed",
                        confirmButtonColor: "#177604",
                    }).then((res) => {
                        queryClient.invalidateQueries(["user"]);
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    const calculateAge = (birthDate) => {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const formattedBirthDate = (() => {
        if (!user.birth_date) return "";
        const date = new Date(user.birth_date);
        // return isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(date);
    })();

    return (
        <Paper sx={{ p: 4, borderRadius: 5 }}>
            {/*User Profile picture*/}
            <Grid container sx={{ pt: 1, pb: 4, justifyContent: "center", alignItems: "center" }} >
                <Box display="flex" sx={{ justifyContent: "center", "&:hover .profile-edit-icon": { opacity: 0.7 }, "&:hover .profile-image": {filter: "brightness(0.4 )"}, }} >
                    <Tooltip title="Update Profile, 5 MB Limit">
                        <span style={{ cursor: "pointer", position: "relative" }} >
                            <input hidden type="file" onChange={handleUpload} accept=".png, .jpg, .jpeg" ref={fileInputRef} />
                            <Avatar className="profile-image" onClick={triggerFileInput} src={profilePic} sx={{ height: "200px", width: "200px", boxShadow: 3, transition: "filter 0.3s", }} />
                            <EditIcon className="profile-edit-icon" opacity="0" sx={{ fontSize: "90px", opacity: 0, position: "absolute", top: "50%", left: "50%", color: "white", pointerEvents: "none", transform: "translate(-50%, -50%)", transition: "opacity 0.3s" }} />
                        </span>
                    </Tooltip>
                </Box>
            </Grid>
            <Stack spacing={2}>
                <Stack direction="row" spacing={2} sx={{ display: "flex", alignItems: "center" }} >
                    <i className="fa fa-id-card"></i>
                    <div>
                        {user.first_name} {user.middle_name || ""}{" "}{user.last_name} {user.suffix || ""}
                    </div>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ display: "flex", alignItems: "center" }} >
                    <i className="fa fa-envelope"></i>{" "}
                    <Typography> {user.email} </Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ display: "flex", alignItems: "center" }} >
                    <i className="fa fa-phone"></i>{" "}
                    <Typography>
                        {user.contact_number || "Not Indicated"}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ display: "flex", alignItems: "center" }} >
                    <i className="fa fa-globe"></i>
                    <Typography>{user.address || "Not Indicated"}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ display: "flex", alignItems: "center" }} >
                    <i className="fa fa-birthday-cake"></i>
                    <Typography>
                        {" "} {user.birth_date ? `${formattedBirthDate} (${calculateAge( user.birth_date )} Years Old)` : "Not Indicated"}{" "}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ display: "flex", alignItems: "center" }} >
                    <i className="fa fa-venus-mars"></i>
                    <Typography> {user.gender || "Not Indicated"} </Typography>
                </Stack>
            </Stack>
        </Paper>
    );
}

export default UserInformation;
