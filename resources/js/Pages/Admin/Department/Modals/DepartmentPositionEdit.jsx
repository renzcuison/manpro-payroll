import React, { useEffect, useState } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import {Table,TableHead,TableBody,TableCell,TableContainer,TableRow,Box,Typography, Button,TextField,Grid, Checkbox,ListItemText,MenuItem,Avatar,
Dialog,DialogTitle,DialogContent,DialogActions,IconButton,FormGroup,FormControl, Divider, FormControlLabel} from "@mui/material";
import { Link } from "react-router-dom";
import { CgAdd, CgTrash } from "react-icons/cg";  
import { isEmpty } from "lodash";
import Swal from 'sweetalert2';

const DepartmentPositionEdit = ({open, close}) =>{
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [position, setPosition] = useState([]);
    const [isFieldsChanged, setIsFieldsChanged] = useState(false);
    const [updatedIds, setUpdateIds] = useState([]);
    const [deleteIds, setDeleteIds] = useState([]);
    const positionFields = {position_name: "", can_review_request: 0, can_approve_request: 0, can_note_request: 0, can_accept_request: 0}
    
    const handleAdd = () => {
        setPosition([...position, positionFields]);
    }
    const handleChange = (index, field, value) =>{
        const updatedPosition = [...position]
        updatedPosition[index][field] = value;
        setPosition(updatedPosition);
        if("id" in updatedPosition[index]){
            setUpdateIds(prevIds => [...prevIds, updatedPosition[index].id]);
        }
        setIsFieldsChanged(true);
    }
    const handleRemove = (indxToRemove) => {
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "Do you want to delete this field?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Confirm",
            confirmButtonColor: "#177604",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                const updatedPositions = position.filter((_, index) => index != indxToRemove);
                setPosition(updatedPositions);
                if("id" in position[indxToRemove]){
                    setDeleteIds(prevIds => [...prevIds, position[indxToRemove].id]);
                }
                setUpdateIds(prev => prev.filter((id) => !deleteIds.includes(id)));
                setIsFieldsChanged(true);        
            }
        });
    }
    useEffect(() => {
        axiosInstance.get('/settings/getDepartmentPositions', { headers })
            .then((response) => {
                if(response.status === 200){
                    const position = response.data.positions;
                    setPosition(position);
                }
                else{
                    setPosition(positionFields);
                }
            }).catch((error) => {
                console.error('Error fetching department positions:', error);
                setPosition(positionFields);
            });
    }, []);

    const checkInput = (event) => {
        event.preventDefault();
        const isNameEmpty = position.some(item => 
            item['position_name'] === "" || item['position_name'] === null || item['position_name'] === undefined
        );
        if (isNameEmpty) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Position names must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "This position will be added",
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
        const addPosition = position.filter(e => !e.id);
        const updatePosition = position.filter(e => updatedIds.includes(e.id));

        const formData = new FormData();

        if(addPosition.length > 0){
            formData.append('add_positions', JSON.stringify(addPosition));
        }
        if(updatedIds.length > 0){
            formData.append('update_positions', JSON.stringify(updatePosition));
        }
        if(deleteIds.length > 0){
            formData.append('delete_positions_id', JSON.stringify(deleteIds));
        } 
        axiosInstance.post('/settings/saveDepartmentPositions', formData, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Department Positions Saved Successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then((res) => {
                        close(true);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return(
        <>
        <Dialog open={open}
            onClose={() => close(false)}
            fullWidth
            maxWidth="lg"
            slotProps={{
                style: {
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                    borderRadius: { xs: 0, md: "40px" },
                    minWidth: '800px',
                    maxWidth: '1000px',
                    marginBottom: '5%'
                }
            }}
        >
            <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Department Positions </Typography>
                    <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                    <Box display="flex" sx={{mb:2}}>
                        <Typography variant="h5" sx={{ marginLeft: { xs: 0, md: 1 }, marginRight:{xs:1, md:2}, fontWeight: 'bold' }}>Existing Positions</Typography>
                        <Button onClick={handleAdd} variant="text" startIcon={<CgAdd/>}>Add Position</Button>
                    </Box>
                    <Box display="flex" justifyContent="stretch">
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{width:"27%"}}>Position Name</TableCell>
                                        <TableCell align="center">Can Review Request?</TableCell>
                                        <TableCell align="center">Can Approve Request?</TableCell>
                                        <TableCell align="center">Can Note Request?</TableCell>
                                        <TableCell align="center">Can Accept Request?</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {position.length > 0 ? (
                                        position.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell sx={{width:"20%"}}>
                                                    <FormControl fullWidth>
                                                        <TextField label="Position Name" value={item.position_name}
                                                        onChange={(e)=>handleChange(index, "position_name", e.target.value)}
                                                        ></TextField>
                                                    </FormControl>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Checkbox checked={Boolean(item.can_review_request)}
                                                    onChange={(e) =>handleChange(index, "can_review_request", e.target.checked ? 1 : 0)}
                                                    ></Checkbox>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Checkbox checked={Boolean(item.can_approve_request)}
                                                        onChange={(e) =>handleChange(index, "can_approve_request", e.target.checked ? 1 : 0)}
                                                    ></Checkbox>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Checkbox checked={Boolean(item.can_note_request)}
                                                        onChange={(e) =>handleChange(index, "can_note_request", e.target.checked ? 1 : 0)}
                                                    ></Checkbox>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Checkbox checked={Boolean(item.can_accept_request)}
                                                        onChange={(e) =>handleChange(index, "can_accept_request", e.target.checked ? 1 : 0)}
                                                    ></Checkbox>
                                                </TableCell>
                                                <TableCell align="center">
                                                <Button onClick={() => handleRemove(index)} variant="text" startIcon={<CgTrash style={{ color: 'red' }} />}/> 
                                                
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ): (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                <Typography>No Department Positions</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}    
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                        <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                            <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Settings</p>
                        </Button>
                    </Box>
                    
                </Box>
                
            </DialogContent>
        </Dialog>
    </>
    )
}
export default DepartmentPositionEdit;