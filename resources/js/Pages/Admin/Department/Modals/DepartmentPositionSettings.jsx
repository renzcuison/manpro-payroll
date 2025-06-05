import React, { useEffect, useState } from "react";
import {Table,TableHead,TableBody,TableCell,TableContainer,TableRow,Box,Typography,Button,TextField,Grid,Checkbox,Dialog,DialogTitle,DialogContent,IconButton,} from "@mui/material";
import axiosInstance, { getJWTHeader }  from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";
import PositionAddMiniModal from "./PositionAddMiniModal";

const DepartmentPositionSettings = ({open, close}) => {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [positions, setPositions] = useState([]);

    const [newPosition, setNewPosition] = useState({
        name: "",
        can_review_request: false,
        can_approve_request: false,
        can_note_request: false,
        can_accept_request: false
    });

    useEffect(() => {
        axiosInstance.get('settings/getDepartmentPositions', { headers })
        .then((response) =>{
            if(response.status === 200){
                const position = response.data.positions;
                setPositions(position);
            }
        })
        .catch((error) => {
            console.error('Error fetching department positions:', error);
            setPositions(null);
        })

    }, []);

    const addNewPosition = () => {
        if (!newPosition.name) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Position name is required!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
            return;
        }

        axiosInstance.post('/settings/saveDepartmentPositions', newPosition, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    setPositions(prev => [...prev, response.data.positions]);
                    setNewPosition({
                        name: "",
                        can_review_request: false,
                        can_approve_request: false,
                        can_note_request: false,
                        can_accept_request: false
                    });
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Position added successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#177604',
                    });
                }
            })
            .catch(error => {
                console.error('Error adding position:', error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error adding position!",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            });
    }

    // Branch Positions Settings Functions
    const handlePositionChange = (index, field, value) => {
        const updatedPositions = [...positions];
        updatedPositions[index][field] = value;
        setPositions(updatedPositions);
    };

    const savePositionChanges = (index) => {
        const position = positions[index];
        axiosInstance.post('/settings/saveDepartmentPositions', position, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    // Update the local state with the returned position data
                    const updatedPositions = [...positions];
                    updatedPositions[index] = response.data.positions;
                    setPositions(updatedPositions);
                    
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Position updated successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#177604',
                    });
                }
            })
            .catch(error => {
                console.error('Error updating position:', error);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error updating position!",
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
                maxWidth="lg"
                PaperProps={{
                    style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: '800px',
                        maxWidth: '1200px',
                        marginBottom: '5%'
                    }
                }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Department Positions Settings </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box sx={{ mt: 3, my: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Existing Positions</Typography>
                        
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Position Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Can Review Request</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Can Approve Request</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Can Note Request</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Can Accept Request</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {positions.length > 0 ? 
                                    (positions.map((position, index) => (
                                        <TableRow key={position.id} >
                                            <TableCell>
                                                <TextField
                                                    fullWidth
                                                    value={position.name}
                                                    onChange={(e) => handlePositionChange(index, 'name', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Checkbox
                                                    checked={Boolean(position.can_review_request)}
                                                    onChange={(e) => handlePositionChange(index, 'can_review_request', e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Checkbox
                                                    checked={Boolean(position.can_approve_request)}
                                                    onChange={(e) => handlePositionChange(index, 'can_approve_request', e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Checkbox
                                                    checked={Boolean(position.can_note_request)}
                                                    onChange={(e) => handlePositionChange(index, 'can_note_request', e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Checkbox
                                                    checked={Boolean(position.can_accept_request)}
                                                    onChange={(e) => handlePositionChange(index, 'can_accept_request', e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="contained" 
                                                    onClick={() => savePositionChanges(index)}
                                                    sx={{ backgroundColor: '#177604', color: 'white' }}
                                                >
                                                    Save
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))):(
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">No Positions Found</TableCell>
                                    </TableRow>)}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Typography variant="h6" sx={{ mt: 5, mb: 3 }}>Add New Position</Typography>    
                        <PositionAddMiniModal newPosition={newPosition} setNewPosition={setNewPosition} addNewPosition={addNewPosition} disableSaveButton={false}>
                        </PositionAddMiniModal>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );

}
export default DepartmentPositionSettings;

