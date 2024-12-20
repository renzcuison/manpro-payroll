import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField } from '@mui/material';
import React, { useState } from 'react';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const HrCategoryEditModal = ({ open, close, category, data }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [categoryData, setCategoryData] = useState({
        title: data.title,
        description: data.description,
        attached_file: null
    });

    const handleChange = (event) => {
        if (event.target.name === 'attached_file') {
            setCategoryData({
                ...categoryData,
                attached_file: event.target.files[0],
            });
        } else {
            setCategoryData({
                ...categoryData,
                [event.target.name]: event.target.value,
            });
        }
    };

    const handleQuillChange = (value) => {
        setCategoryData({
            ...categoryData,
            description: value
        });
    };

    const handleEditCategory = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('category_id', data.category_id);
        formData.append('category', category);
        formData.append('title', categoryData.title || data.title);
        formData.append('description', categoryData.description || data.description);
        formData.append('attached_file', categoryData.attached_file);

        Swal.fire({
            title: "Are you sure?",
            text: `You want to update this ${category}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, update it!",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosInstance.post('/edit_category', formData, { headers })
                    .then((response) => {
                        console.log(response);
                        Swal.fire("Updated!", `${category} has been updated.`, "success").then(() => {
                            location.reload();
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        Swal.fire("Error!", "There was an error updating the category.", "error");
                    });
            }
        });
    };

    const handleDeleteCategory = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this announcement?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosInstance.post('/delete_category', { category_id: data.category_id }, { headers })
                    .then((response) => {
                        if (response.data.message === 'Success') {
                            Swal.fire("Deleted!", "Announcement has been deleted.", "success").then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire("Error!", "There was an error deleting the announcement.", "error");
                        }
                    });
            }
        });
    };

    return (
        <Dialog
            sx={{
                "& .MuiDialog-container": {
                    justifyContent: "center",
                    alignItems: "flex-start"
                }
            }}
            open={open}
            fullWidth
            maxWidth="md"
        >
            <Box className="d-flex justify-content-between">
                <DialogTitle>Edit {category}</DialogTitle>
                <IconButton sx={{ float: 'right', marginRight: 2, marginTop: 2, color: 'red' }} onClick={close}>
                    <i className="si si-close"></i>
                </IconButton>
            </Box>
            <DialogContent>
                <div>
                    <TextField
                        id='title'
                        name='title'
                        label="Title"
                        variant="outlined"
                        fullWidth
                        onChange={handleChange}
                        sx={{ marginTop: 2, marginBottom: 2 }}
                        defaultValue={data.title}
                    />

                    <ReactQuill
                        id='description'
                        name='description'
                        value={data.description}
                        onChange={handleQuillChange}
                        modules={{
                            toolbar: [
                                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
                                ['link', 'image', 'video'],
                                ['clean']
                            ],
                        }}
                        formats={[
                            'header', 'font', 'size',
                            'bold', 'italic', 'underline', 'strike', 'blockquote',
                            'list', 'bullet', 'indent',
                            'align',
                            'link', 'image', 'video'
                        ]}
                        theme="snow"
                        style={{ marginBottom: '3rem', height: '300px', width: '100%' }}
                    />

                    <Grid container justifyContent="center" alignItems="center" spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Attached File"
                                variant="outlined"
                                fullWidth
                                sx={{ marginTop: 2 }}
                                defaultValue={data.attached_file}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id='attached_file'
                                name='attached_file'
                                variant="outlined"
                                fullWidth
                                type="file"
                                InputLabelProps={{ shrink: true }}
                                onChange={handleChange}
                                sx={{ marginTop: 2 }}
                            />
                        </Grid>
                    </Grid>

                    <Grid container justifyContent="center" alignItems="center" spacing={2}>
                        <Grid item xs={6}>
                            <Button variant="contained" color="primary" onClick={handleEditCategory} sx={{ marginTop: 2 }} fullWidth>
                                Edit
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button variant="contained" color="error" onClick={handleDeleteCategory} sx={{ marginTop: 2 }} fullWidth>
                                Delete
                            </Button>
                        </Grid>
                    </Grid>

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default HrCategoryEditModal;
