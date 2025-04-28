import {
    Box,
    Button,
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
    OutlinedInput,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useClient, useClients } from "../hooks/useClients";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";

const createSchema = yup
    .object()
    .shape({
        firstname: yup.string().required("First name is required"),
        middlename: yup.string().required("Middle name is required"),
        lastname: yup.string().required("Last name is required"),
        username: yup.string().required("Username is required"),
        email: yup
            .string()
            .email("Invalid email")
            .required("Email is required"),
        contact_number: yup.string().required("Phone number is required"),
        address: yup.string().required("Address is required"),
        password: yup.string().min(6).required("Password is required"),
        confirm_password: yup
            .string()
            .oneOf([yup.ref("password"), null], "Passwords must match"),
    })
    .required();
const updateSchema = yup
    .object()
    .shape({
        firstname: yup.string().required("First name is required"),
        middlename: yup.string().required("Middle name is required"),
        lastname: yup.string().required("Last name is required"),
        username: yup.string().required("Username is required"),
        email: yup
            .string()
            .email("Invalid email")
            .required("Email is required"),
        contact_number: yup.string().required("Phone number is required"),
        address: yup.string().required("Address is required"),
    })
    .required();

function CreateUser({ clientData, setClientData }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfPassword, setShowConfPassword] = useState(false);
    const queryClient = useQueryClient();

    // console.log("Client data: ", clientData);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfPassword = () =>
        setShowConfPassword((show) => !show);
    const { storeClient, updateClient } = useClients();

    const methods = useForm({
        resolver: yupResolver(clientData ? updateSchema : createSchema),
        defaultValues: {
            firstname: clientData ? clientData.first_name : "",
            middlename: clientData ? clientData.middle_name : "",
            lastname: clientData ? clientData.last_name : "",
            username: clientData ? clientData.user_name : "",
            email: clientData ? clientData.email : "",
            contact_number: clientData ? clientData.contact_number : "",
            address: clientData ? clientData.address : "",
            password: "",
            confirm_password: "",
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isLoading, isSubmitting },
    } = methods;

    const values = watch();

    useEffect(() => {
        if (clientData) {
            console.log("das", clientData);
            // If client data is provided, update the form values with the client data
            Object.keys(clientData).forEach((key) => {
                register(key, { value: clientData[key] });
            });
        }
    }, []);

    const onSubmit = () => {
        if (!clientData) {
            storeClient(values)
                .then((res) => {
                    console.log(res);
                    queryClient.setQueryData(["new_client"], res.client);
                    queryClient.invalidateQueries(["new_client"]);
                    setClientData(res.client);
                })
                .catch((error) => {
                    console.log(error.response.data.errors);
                    if (error.response.data.errors) {
                        const apiErrors = error.response.data.errors;
                        Object.keys(apiErrors).forEach((field) => {
                            setError(field, {
                                type: "server",
                                message: apiErrors[field][0],
                            });
                        });
                    } else {
                        // Laravel returned a different error status (e.g., 500, 403)
                        console.error(
                            "Server Error:",
                            error.response.data.message
                        );
                        alert("Something went wrong. Please try again.");
                    }
                });
        } else {
            updateClient(values, clientData.id)
                .then((res) => {
                    console.log(res);
                    setClientData(res.client);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };
    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="First name"
                            {...register("firstname", {
                                required: true,
                            })}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Middle name"
                            {...register("middlename", {
                                required: true,
                            })}
                            error={!!errors.middlename}
                            helperText={errors.middlename?.message}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Last name"
                            {...register("lastname", {
                                required: true,
                            })}
                            error={!!errors.lastname}
                            helperText={errors.lastname?.message}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Username"
                            {...register("username", {
                                required: true,
                            })}
                            error={!!errors.username}
                            helperText={errors.username?.message}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            {...register("email", {
                                required: true,
                            })}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Phone"
                            {...register("contact_number", {
                                required: true,
                            })}
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            fullWidth
                            label="Address"
                            {...register("address", {
                                required: true,
                            })}
                            error={!!errors.address}
                            helperText={errors.address?.message}
                        />
                    </Grid>
                    {!clientData && (
                        <React.Fragment>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <OutlinedInput
                                    fullWidth
                                    type={showPassword ? "text" : "password"}
                                    label="Password"
                                    {...register("password", {
                                        required: true,
                                    })}
                                    // Add show password functionality

                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={
                                                    handleClickShowPassword
                                                }
                                            >
                                                {showPassword ? (
                                                    <Visibility />
                                                ) : (
                                                    <VisibilityOff />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <OutlinedInput
                                    fullWidth
                                    type={
                                        showConfPassword ? "text" : "password"
                                    }
                                    label="Confirm Password"
                                    {...register("confirm_password", {
                                        required: true,
                                        validate: (value) =>
                                            value === getValues().password ||
                                            "Passwords do not match",
                                    })}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={
                                                    handleClickShowConfPassword
                                                }
                                            >
                                                {showConfPassword ? (
                                                    <Visibility />
                                                ) : (
                                                    <VisibilityOff />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    error={!!errors.confirm_password}
                                    helperText={
                                        errors.confirm_password?.message
                                    }
                                />
                            </Grid>
                        </React.Fragment>
                    )}
                    <Grid size={12}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Button
                                variant="contained"
                                type="submit"
                                color="success"
                                // disabled={clientData}
                                startIcon={
                                    isLoading || isSubmitting ? (
                                        <CircularProgress
                                            color="inherit"
                                            size={20}
                                        />
                                    ) : (
                                        <InsertDriveFileIcon />
                                    )
                                }
                            >
                                {clientData ? "Update" : "Create"}
                            </Button>
                            {errors && (
                                <Box>
                                    <Typography variant="body2" color="error">
                                        {errors.message}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </FormProvider>
    );
}

export default CreateUser;
