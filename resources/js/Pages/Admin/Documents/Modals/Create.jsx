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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FormProvider, useForm } from "react-hook-form";
import { BorderStyle } from "@mui/icons-material";
import { useDocuments } from "../hook/useDocuments";

const CreateDocumentDialog = ({ open, close }) => {
    const navigate = useNavigate();
    const { store } = useDocuments();
    const methods = useForm({
        defaultValues: {
            title: "",
            description: "",
            file: null,
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = methods;

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);

        // `data.file` might be a FileList or File[]
        if (data.file && data.file[0]) {
            formData.append("file", data.file[0]);
        }
        const res = await store(formData);
        console.log(res);

        // Swal.fire({
        //     title: "Success",
        //     text: "Document created successfully!",
        //     icon: "success",
        //     confirmButtonText: "Go to Document",
        // }).then((result) => {
        //     if (result.isConfirmed) {
        //         navigate(`/documents/${data._id}`);
        //     }
        // });
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
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {" "}
                        Create Document{" "}
                    </Typography>
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
                            <Typography variant="body1">
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
