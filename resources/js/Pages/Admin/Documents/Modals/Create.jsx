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
    DialogActions,
    Divider,
    Icon,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import moment from "moment";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import "react-quill/dist/quill.snow.css";
import { FormProvider, useForm } from "react-hook-form";
import { useDocuments } from "../hook/useDocuments";
import { useQueryClient } from "@tanstack/react-query";

const CreateDocumentDialog = ({ open, close }) => {
    const { store } = useDocuments();
    const methods = useForm({
        defaultValues: {
            title: "",
            description: "",
            file: null,
        },
    });
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = methods;

    const onSubmit = async (data) => {
        close();

        // Show loading Swal
        Swal.fire({
            title: "Please wait...",
            text: "Uploading your document...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);

        if (data.file && data.file[0]) {
            formData.append("file", data.file[0]);
        }

        try {
            const res = await store(formData);
            if (res.success) {
                Swal.fire({
                    title: "Success",
                    text: "Document created successfully!",
                    icon: "success",
                }).then(() => {
                    close(false);
                    queryClient.invalidateQueries("documents");
                });
            } else {
                // Handle non-successful response
                Swal.fire({
                    title: "Error",
                    text: "Something went wrong. Please try again.",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: "Error",
                text: "Failed to create document. Please try again.",
                icon: "error",
            });
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
                    <Typography variant="h5"> Create Document </Typography>
                    <IconButton onClick={() => close(false)}>
                        {" "}
                        <i className="si si-close"></i>{" "}
                    </IconButton>
                </Box>
            </DialogTitle>
            <Divider sx={{ borderStyle: "dashed" }} />
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
                                Document Details{" "}
                            </Typography>
                        </Box>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    {...register("title", { required: true })}
                                    error={!!errors.title}
                                    helperText={errors.title?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
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
                            <Grid item xs={12} sm={6}>
                                {/* Upload files */}
                                <input
                                    accept=".pdf,.docx,.xlsx"
                                    id="document"
                                    type="file"
                                    {...register("file")}
                                    error={!!errors.document}
                                    helperText={errors.document?.message}
                                    multiple
                                />
                            </Grid>
                            <Grid item xs={12}>
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
};

export default CreateDocumentDialog;
