import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress } from '@mui/material';
import React, { useState } from 'react';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles

const HrCategoryAddModal = ({ open, close, category }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [loading, setLoading] = useState(false); // State variable for loading state
    const [categoryData, setCategoryData] = useState({
        title: '',
        description: '',
        attached_file: null, // To store the selected file
    });

    const handleChange = (event) => {
        if (event.target.name === 'attached_file') {
            // Handle file input separately
            setCategoryData({
                ...categoryData,
                attached_file: event.target.files[0],
            });
        } else {
            // Handle other input fields
            setCategoryData({
                ...categoryData,
                [event.target.name]: event.target.value,
            });
        }
    };

    const handleAddCategory = (event) => {
        event.preventDefault();

        const formData = new FormData();

        // Append form data
        formData.append('title', categoryData.title);
        formData.append('description', categoryData.description);
        formData.append('attached_file', categoryData.attached_file);
        formData.append('category', category);

        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to add this " + category + "?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                setLoading(true);
                axiosInstance.post('/add_category', formData, { headers }).then((response) => {
                    if (response.data.msg === 'Success') {
                        axiosInstance.get(`/sendAnnouncementMail/${response.data.user_id}`, { headers })
                            .then((response) => {
                                if (response.data.userData === 'Success') {
                                    close()
                                    Swal.fire({
                                        customClass: {
                                            container: 'my-swal'
                                        },
                                        title: "Success!",
                                        text: "Email has been Sent!",
                                        icon: "success",
                                        timer: 1000,
                                        showConfirmButton: false
                                    }).then(function () {
                                        location.reload()
                                    });
                                } else {
                                    // alert("Something went wrong")
                                    console.log(response)
                                }
                            })
                            .catch((error) => {
                                console.log('error', error.response)
                            })
                    } else {
                        alert("Something went wrong")
                        console.log(response)
                        setLoading(false);
                    }
                })
                    .catch((error) => {
                        console.log(error)
                        location.reload();
                    })

            } else {
                console.log(error)
                location.reload();
            }
        });
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md">

                {/* <DialogTitle sx={{ backgroundColor: '#1E5799', color: 'white' }}> */}
                <DialogTitle sx={{ margin: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Add {category}</Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>
            
                <DialogContent sx={{ margin: 2 }}>
                    <div>
                        <TextField id='title' name='title' label="Title" variant="outlined" fullWidth onChange={handleChange} sx={{ marginBottom: 2 }} />

                        <ReactQuill
                            id='description'
                            name='description'
                            value={categoryData.description}
                            onChange={(value) => setCategoryData({ ...categoryData, description: value })}
                            placeholder="Enter announcement description here..."
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

                        <Grid item xs={6}>
                            <TextField id='attached_file' name='attached_file' variant="outlined" fullWidth type="file" onChange={handleChange} sx={{ marginTop: 2 }} />
                        </Grid>
                        
                        <Grid container justifyContent="center" alignItems="center">
                            <Grid item xs={4} sx={{ marginTop: 2 }}>
                                {/* <Button variant="contained" onClick={handleAddCategory} sx={{ marginTop: 4 }} fullWidth style={{ backgroundColor: '#022e57', color: '#fff' }} > */}
                                    {/* {loading ? <CircularProgress size={24} /> : <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i> Submit</p>} */}
                                {/* </Button> */}


                                <Button variant="contained" onClick={handleAddCategory} sx={{ backgroundColor: '#022e57', color: 'white' }} className="m-1">
                                    {loading ? <CircularProgress size={24} /> : <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i> Submit</p>}
                                </Button>

                                <Button onClick={close} variant="contained" sx={{ backgroundColor: '#d4291e', color: 'white' }} className="m-1">
                                    <p className='m-0'><i className="fa fa-times mr-2 mt-1"></i> Cancel</p>
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default HrCategoryAddModal;
