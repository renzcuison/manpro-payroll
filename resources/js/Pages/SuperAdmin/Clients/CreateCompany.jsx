import { Box, Button, Grid, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useClient, useClients } from "../hooks/useClients";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup
    .object()
    .shape({
        name: yup.string().required(),
        email: yup.string().required(),
        phone: yup.string().required(),
        address: yup.string(),
        website: yup.string(),
        description: yup.string(),
    })
    .required();
function CreateCompany({ clientData, setCompanyData, companyData }) {
    const { client, storeCompany } = useClient(clientData.id);

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            user_id: clientData.id,
            name: companyData ? companyData.name : "",
            email: companyData ? companyData.email : "",
            phone: companyData ? companyData.phone : "",
            address: companyData ? companyData.address : "",
            website: companyData ? companyData.website : "",
            description: companyData ? companyData.description : "",
        },
    });
    console.log("Company: ", companyData);

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isLoading },
    } = methods;
    const values = watch();
    // console.log(values);

    const onSubmit = () => {
        if (!companyData) {
            storeCompany(values)
                .then((res) => {
                    console.log(res);
                    alert("Company created successfully");
                    setCompanyData(res.company);
                })
                .catch((error) => {
                    console.log(error.response.data);
                    if (error.response.data.errors) {
                        const apiErrors = error.response.data.errors;
                        Object.keys(apiErrors).forEach((field) => {
                            setError(field, { message: apiErrors[field][0] });
                        });
                    }
                });
        }
    };
    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            {...register("name", {
                                required: true,
                            })}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
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
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Phone"
                            {...register("phone", {
                                required: true,
                            })}
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            fullWidth
                            label="Company Address"
                            {...register("address", {
                                required: true,
                            })}
                            error={!!errors.companyAddress}
                            helperText={errors.companyAddress?.message}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Website"
                            {...register("website", {
                                required: true,
                            })}
                            error={!!errors.website}
                            helperText={errors.website?.message}
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            {...register("description", {
                                required: true,
                            })}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            multiline
                            rows={4}
                            variant="outlined"
                        />
                    </Grid>
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
                                startIcon={
                                    isLoading ? (
                                        <CircularProgress
                                            color="inherit"
                                            size={20}
                                        />
                                    ) : (
                                        <InsertDriveFileIcon />
                                    )
                                }
                            >
                                Save
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

export default CreateCompany;
