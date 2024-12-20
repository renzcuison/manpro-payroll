import { Box, Button, FormControl, IconButton, InputLabel, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, Grid, Select, MenuItem, TextField, Input, } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { transform } from 'lodash';

const MemberApplicationSubmit = ({ open, close }) => {
    const [applicationsList, setApplicationsList] = useState([]);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [applicationData, setApplicationData] = useState({
        leave_type_val: '',
        date_from_val: '',
        date_to_val: '',
        hours: '',
        comments: '',
        proof_docs: null, // To store the selected file
    });
    const [fileName, setFileName] = useState(''); // State to store the file name
    const fileInputRef = useRef(null); // Ref to the file input

    useEffect(() => {
        axiosInstance.get('/member_applications_list', { headers }).then((response) => {
            setApplicationsList(response.data.listData);
        });
    }, [])

    const handleChange = (event) => {
        if (event.target.name === 'proof_docs') {
            // Handle file input separately
            const file = event.target.files[0];
            setApplicationData({
                ...applicationData,
                proof_docs: file,
            });
            setFileName(file.name); // Update file name
        } else {
            // Handle other input fields
            setApplicationData({
                ...applicationData,
                [event.target.name]: event.target.value,
            });
        }
    };

    const handleAddApplication = (event) => {
        event.preventDefault();

        const formData = new FormData();

        // Append form data
        formData.append('leave_type_val', applicationData.leave_type_val);
        formData.append('date_from_val', applicationData.date_from_val);
        formData.append('date_to_val', applicationData.date_to_val);
        formData.append('hours', applicationData.hours);
        formData.append('comments', applicationData.comments);
        formData.append('proof_docs', applicationData.proof_docs);
        if (applicationData.leave_type_val && applicationData.date_from_val && applicationData.date_to_val &&
            applicationData.hours && applicationData.comments && applicationData.proof_docs) {
            new Swal({
                customClass: {
                    container: "my-swal",
                },
                title: "Are you sure?",
                text: "You want to save add this application?",
                icon: "warning",
                dangerMode: true,
                showCancelButton: true,
            }).then(res => {
                if (res.isConfirmed) {
                    axiosInstance.post('/submit_application', formData, { headers }).then(function (response) {
                        console.log(response);
                        location.reload();
                    })
                        .catch((error) => {
                            console.log(error)
                            location.reload();
                        })
                } else {
                    location.reload();
                }
            });
        } else {
            Swal.fire({
                customClass: {
                    container: 'my-swal'
                },
                title: "Error!",
                text: "Please fill in all fields.",
                icon: "error"
            });
        }
    };

    const handleFileClick = () => {
        fileInputRef.current.click();
    };

    return (
        <>
            <Dialog sx={{ "& .MuiDialog-container": {justifyContent: "flex-center", alignItems: "flex-start", borderRadius: '8px'}}} open={open} fullWidth maxWidth="sm">
                <Box className="d-flex justify-content-between" >
                    <DialogTitle> <Typography className="text-center" sx={{ fontSize: 20, marginTop: 2 }}>Submit An Application</Typography> </DialogTitle>
                    <IconButton sx={{ float: 'right', marginRight: 2, marginTop: 1, color: 'red' }} data-dismiss="modal" aria-label="Close" onClick={close}><i className="si si-close"></i></IconButton>
                </Box>
                <DialogContent>
                    <form id="add_applications" onSubmit={handleAddApplication} encType="multipart/form-data">
                        <Grid container spacing={2}>
                            
                            <Grid item xs={12}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel htmlFor="leave_type">Type of Application</InputLabel>
                                    <Select label="Type of Application" name="leave_type_val" id="leave_type_val" value={applicationData.leave_type_val} onChange={handleChange}>
                                        <MenuItem disabled value=""> <em>None</em> </MenuItem>
                                        {applicationsList.map((item, index) => (
                                            <MenuItem key={index} value={item.list}> {item.list} </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4} sx={{ marginTop: 2 }}>
                                <TextField id="date_from_val" label="From Date" type="date" fullWidth variant="outlined" name="date_from_val" InputLabelProps={{ shrink: true }} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={4} sx={{ marginTop: 2 }}>
                                <TextField id="date_to_val" label="To Date" type="date" fullWidth variant="outlined" name="date_to_val" InputLabelProps={{ shrink: true }} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={4} sx={{ marginTop: 2 }}>
                                <TextField id="hours" name="hours" fullWidth label="Hour/s" type="number" variant="outlined" inputProps={{ min: 1, max: 8 }} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sx={{ marginTop: 2 }}>
                                <FormControl fullWidth variant="outlined">
                                    <TextField 
                                        fullWidth 
                                        label="Proof Document/Picture"
                                        variant="outlined" 
                                        value={fileName} 
                                        onClick={handleFileClick} 
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        placeholder="Select a file"
                                    />
                                    <Input 
                                        type="file" 
                                        inputProps={{ accept: 'image/*, .docx, .pdf' }} 
                                        name="proof_docs" 
                                        id="proof_docs" 
                                        onChange={handleChange} 
                                        inputRef={fileInputRef} 
                                        style={{ display: 'none' }} 
                                    />
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sx={{ marginTop: 2 }}>
                                <FormControl fullWidth variant="outlined">
                                    <TextField fullWidth id="comments" placeholder="Write Something here" name="comments" inputProps={{ style: { height: "150px", }, }} onChange={handleChange} />
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sx={{ marginTop: 2 }}>
                                <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleAddApplication}> Add Application </Button>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default MemberApplicationSubmit
