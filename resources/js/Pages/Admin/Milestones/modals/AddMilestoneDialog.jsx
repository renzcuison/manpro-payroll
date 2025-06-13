import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";

function AddMilestoneDialog({ open, close, employees, refetch }) {
    const methods = useForm({
        defaultValues: {
            user_id: null,
            title: "",
            description: "",
            type: "anniversary",
            date: moment(),
        },
    });
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        reset,
        formState: { errors, isLoading, isSubmitting },
    } = methods;

    const values = watch();

    // console.log(values);

    const onSubmit = async (data) => {
        console.log(data);

        try {
            const storedUser = localStorage.getItem("nasya_user");
            const headers = storedUser
                ? getJWTHeader(JSON.parse(storedUser))
                : {};
            await axiosInstance.post(`/admin/milestones`, data, {
                headers,
            });
            close();
            Swal.fire({
                title: "Successful!",
                text: "New milestone added successfully!",
                timer: 2000,
            });
            reset();
            refetch();
        } catch (error) {
            Swal.fire({});
        }
    };
    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="md"
            onClose={close}
            PaperProps={{
                style: {
                    backgroundColor: "#f8f9fa",
                    boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                    borderRadius: "20px",
                    minWidth: { xs: "100%", sm: "700px" },
                    maxWidth: "800px",
                    marginBottom: "5%",
                },
            }}
        >
            <DialogTitle sx={{ paddingBottom: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h5"> Create Milestone </Typography>
                    <IconButton onClick={() => close(false)}>
                        {" "}
                        <i className="si si-close"></i>{" "}
                    </IconButton>
                </Box>
            </DialogTitle>
            <Divider sx={{ borderStyle: "dashed" }} />
            <DialogContent>
                <FormProvider control={control} {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: "bold" }}
                            >
                                Milestone Details
                            </Typography>
                        </Box>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    {...register("title", { required: true })}
                                    error={!!errors.title}
                                    helperText={errors.title?.message}
                                />
                            </Grid>
                            <Grid item size={{ xs: 12 }}>
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
                            <Grid item size={{ xs: 12 }}>
                                <Controller
                                    name="type"
                                    control={control}
                                    rules={{ required: "Type is required" }}
                                    render={({ field }) => (
                                        <TextField
                                            select
                                            fullWidth
                                            label="Type"
                                            {...field}
                                            error={!!errors.type}
                                            helperText={errors.type?.message}
                                        >
                                            <MenuItem value="anniversary">
                                                Anniversary
                                            </MenuItem>
                                            <MenuItem value="monthsary">
                                                Monthsary
                                            </MenuItem>
                                            <MenuItem value="birthday">
                                                Birthday
                                            </MenuItem>
                                            <MenuItem value="promotion">
                                                Promotion
                                            </MenuItem>
                                            <MenuItem value="transfer">
                                                Transfer
                                            </MenuItem>
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid item size={{ xs: 12 }}>
                                <Controller
                                    name="user_id"
                                    control={control}
                                    rules={{ required: "User ID is required" }}
                                    render={({ field }) => (
                                        <TextField
                                            select
                                            fullWidth
                                            label="For User"
                                            {...field}
                                            error={!!errors.user_id}
                                            helperText={errors.user_id?.message}
                                        >
                                            {employees.map((emp) => (
                                                <MenuItem
                                                    value={emp.id}
                                                    key={emp.id}
                                                >
                                                    {emp.first_name}{" "}
                                                    {emp.last_name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid item size={{ xs: 12 }}>
                                <Controller
                                    name="date"
                                    control={control}
                                    rules={{ required: "Date is required" }}
                                    render={({ field }) => (
                                        <DatePicker
                                            label="Date"
                                            value={field.value}
                                            onChange={field.onChange}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!errors.date,
                                                    helperText:
                                                        errors.date?.message,
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item size={{ xs: 12 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-start",
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        color="success"
                                        disabled={
                                            !!errors.title ||
                                            !!errors.description
                                        }
                                        loading={isLoading || isSubmitting}
                                        startIcon={<InsertDriveFileIcon />}
                                    >
                                        Save
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}

export default AddMilestoneDialog;
