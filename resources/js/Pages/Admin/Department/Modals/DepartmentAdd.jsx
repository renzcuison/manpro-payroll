import React, { useEffect, useState } from "react";
import {Table,TableHead,TableBody,TableCell,TableContainer,TableRow,Box,Typography, Button,TextField,Grid, Checkbox,ListItemText,MenuItem,Avatar,
Dialog,DialogTitle,DialogContent,DialogActions,IconButton,FormGroup,FormControl} from "@mui/material";
import { Link } from "react-router-dom";
import { CgAdd, CgTrash } from "react-icons/cg"; 

const DepartmentAdd = ({open, close}) =>{

    const [nameError, setNameError] = useState(false);
    const [acronymError, setAcronymError] = useState(false);
    const [name, setName] = useState("");
    const [acronym, setAcronym] = useState("");
    const [description, setDescription] = useState("");
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
                text: "This department will be added",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Add",
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
            description: description
        };

        axiosInstance.post('/settings/saveDepartment', data, { headers })
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
                        setDepartments(prev => [...prev, response.data.department]);
                        setName("");
                        setAcronym("");
                        setDescription("");
                        setOpenModal(false);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };
    return(
        <>
        <Dialog open={open} fullWidth maxWidth="md" slotProps={{ paper: { sx: { p: '16px', backgroundColor: "#f8f9fa", boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: { xs: 0, md: "20px" }, minWidth: { xs: "100%", md: "800px" }, maxWidth: { xs: "100%", md: "1500PX" }, marginBottom: "5%" }} }} >
            <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Add Departments </Typography>
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
                            marginBottom: 3, width: '66%', '& label.Mui-focused': { color: '#97a5ba' },
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
                            marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
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
                    {/*Custom Position Fields*/}
                    <FormGroup row={true} className="d-flex justify-content-between" sx={{
                        '& label.Mui-focused': { color: '#97a5ba' },
                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                    }}>
                        <Box>
                            <Box display="flex" sx={{mb:2}}>
                                <Typography variant="h5" sx={{ marginLeft: { xs: 0, md: 1 }, marginRight:{xs:1, md:2}, fontWeight: 'bold' }}> Department Positions </Typography>
                                <Button variant="text" startIcon={<CgAdd/>}>Add Positions</Button>
                            </Box>
                            <Grid size={12}>

                            </Grid>
                        </Box>
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
export default DepartmentAdd;