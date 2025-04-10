import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

function CreateSubscriptionModal({ open, onClose }) {
    const methods = useForm({
        defaultValues: {
            id: null,
            name: "",
            description: "",
            price: null,
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isLoading, isDirty },
        reset,
    } = methods;

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", data.price);

        // try {
        //     const action = selectedPackage ? update : store;
        //     const res = await action(formData, data.id);
        //     if (res.id) {
        //         console.log(res);
        //         queryClient.invalidateQueries(["packages"]);
        //         setPackageData(res);
        //         setIsSuccess(true);
        //         setIsOpenSnackBar(true);
        //         setSnackBarMsg(
        //             selectedPackage
        //                 ? "Successfully updated package details."
        //                 : "Successfully stored new package."
        //         );
        //     } else {
        //     }
        // } catch (error) {
        //     console.error(error);
        //     Swal.fire({
        //         title: "Error",
        //         text: "Failed to create document. Please try again.",
        //         icon: "error",
        //     });
        // }
    };

    return (
        <Dialog onClose={onClose} open={open} fullWidth maxWidth="sm">
            <DialogTitle>Create Package</DialogTitle>
            <DialogContent>
                <FormProvider {...methods}>
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
                                {" "}
                                Package Details{" "}
                            </Typography>
                        </Box>
                        <Stack spacing={2} mt={2}>
                            <TextField
                                fullWidth
                                label="Name"
                                {...register("name", {
                                    required: true,
                                })}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
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

                            <TextField
                                fullWidth
                                type="number"
                                label="Price"
                                {...register("price", {
                                    required: true,
                                    pattern: /^\d+(\.\d{1,2})?$/,
                                })}
                                error={!!errors.price}
                                helperText={errors.price?.message}
                            />

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
                                    disabled={
                                        !!errors.title ||
                                        !!errors.description ||
                                        !!errors.price ||
                                        isLoading
                                    }
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
                                        <Typography
                                            variant="body2"
                                            color="error"
                                        >
                                            {errors.message}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Stack>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}

export default CreateSubscriptionModal;
