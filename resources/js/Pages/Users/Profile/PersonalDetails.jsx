import { Avatar, Box, Grid, Paper, Stack, Typography } from "@mui/material";
import moment from "moment";
import React from "react";

function PersonalDetails({ user }) {
    console.log(user);

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
    return (
        <Box
            component={Paper}
            sx={{
                p: 4,
                borderRadius: 5,
            }}
        >
            <Grid
                container
                sx={{
                    pt: 1,
                    pb: 4,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Avatar
                    alt={`${user.user_name} Profile Pic`}
                    src={
                        user?.media[0]
                            ? user?.media[0]?.original_url
                            : user.avatar
                    }
                    sx={{
                        width: "50%",
                        height: "auto",
                        aspectRatio: "1 / 1",
                        objectFit: "cover",
                        boxShadow: 3,
                    }}
                />
            </Grid>
            <Stack spacing={2}>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <i className="fa fa-id-card"></i>{" "}
                    <div>
                        {user.first_name} {user.middle_name || ""}{" "}
                        {user.last_name} {user.suffix || ""}
                    </div>
                </Stack>

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <i className="fa fa-envelope"></i>{" "}
                    <Typography> {user.email} </Typography>
                </Stack>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <i className="fa fa-phone"></i>{" "}
                    <Typography>{user.contact_number || ""}</Typography>
                </Stack>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <i className="fa fa-globe"></i>

                    <Typography>{user.address || ""}</Typography>
                </Stack>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <i className="fa fa-birthday-cake"></i>

                    <Typography>
                        {" "}
                        {user.birth_date
                            ? `${moment(user.birth_date).format(
                                  "MM. DD, YYYY"
                              )} (${calculateAge(user.birth_date)} Years Old)`
                            : "Not Indicated"}{" "}
                    </Typography>
                </Stack>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <i className="fa fa-venus-mars"></i>

                    <Typography> {user.gender || "Not Indicated"} </Typography>
                </Stack>
            </Stack>
        </Box>
    );
}

export default PersonalDetails;
