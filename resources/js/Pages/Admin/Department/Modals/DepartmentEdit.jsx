////////this should be it
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    Chip,
    ListItemText,
    Checkbox,
    Menu,
    MenuItem,
    IconButton,
    Grid,
    FormGroup,
    FormControl,
    InputLabel,
    Select,
} from "@mui/material";
import axiosInstance,{ getJWTHeader }  from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";

const DepartmentEdit = ({open, close, departmentId}) =>{
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [nameError, setNameError] = useState(false);
    const [acronymError, setAcronymError] = useState(false);
    

    const [name, setName] = useState("");
    const [acronym, setAcronym] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState('');

    console.log(status)
    useEffect(()=>{
        getDepartment();
    },[])

    const getDepartment = () => {
        axiosInstance.get(`/settings/getDepartment/${departmentId}`, { headers })
            .then((response) => {
                if(response.status === 200){
                    const existingDetails = response.data.department;
                    setName(existingDetails.name);
                    setAcronym(existingDetails.acronym);
                    setDescription(existingDetails.description);
                    setStatus(existingDetails.status);
            }
        });
    }
     
    // Update Department in the backend
    const checkInput = (event) => {
        event.preventDefault();

        setNameError(!name);
        setAcronymError(!acronym);

        if (!name || !acronym) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "This department will be updated",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Update",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            name: name,
            acronym: acronym,
            description: description,
            status: status,
        };

        axiosInstance.post(`/settings/saveDepartment/${departmentId}`, data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Department saved successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        close(true);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error saving department!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            });
    };

    return(
        <>
            <Dialog
                open={open}
                onClose={() => close(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: '800px',
                        maxWidth: '1000px',
                        marginBottom: '5%'
                    }
                }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Add New Department </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '40%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="name"
                                    label="Name"
                                    variant="outlined"
                                    value={name}
                                    error={nameError}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '30%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="acronym"
                                    label="Acronym"
                                    variant="outlined"
                                    value={acronym}
                                    error={acronymError}
                                    onChange={(e) => setAcronym(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '20%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <InputLabel id="department-status-label">
                                    Status
                                </InputLabel>
                                <Select
                                    required
                                    labelId="department-status-label"
                                    id="department-status"
                                    value={status}
                                    label="Status"
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <MenuItem value="Active">
                                        Active
                                    </MenuItem>
                                    <MenuItem value="Inactive">
                                        Inactive
                                    </MenuItem>
                                    <MenuItem value="Disabled">
                                        Disabled
                                    </MenuItem>
                                </Select>
                            </FormControl>

                          </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    id="description"
                                    label="Description"
                                    variant="outlined"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    multiline
                                    rows={4}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Department </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    )
    
}
export default DepartmentEdit;