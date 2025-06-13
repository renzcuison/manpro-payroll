import React, { useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Button, TextField, Grid, Checkbox, ListItemText, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Menu, Avatar, Tooltip } from "@mui/material";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import LoadingSpinner from "../../../../components/LoadingStates/LoadingSpinner";
import PositionAddMiniModal from "./PositionAddMiniModal";
import Swal from "sweetalert2";
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';

const BranchPositionsModal = ({ open, close }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [branchPositions, setBranchPositions] = useState([]);
    const [newPosition, setNewPosition] = useState({ name: "", can_review_request: false, can_approve_request: false, can_note_request: false, can_accept_request: false });


    useEffect(() => {
        getPositions();
    }, []);

    const getPositions = () => {
        axiosInstance.get(`/settings/getBranchPositions`, { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    setBranchPositions(response.data?.positions || []);          
                }
            })
            .catch((error) => {
                console.error("Error fetching education background:", error);
        })
    }

    const handlePositionChange = (index, field, value) => {
        const updatedPositions = [...branchPositions];
        updatedPositions[index][field] = value;
    };

    const savePositionChanges = async (index) => {
        const position = branchPositions[index];

        try {
            const response = await axiosInstance.post('/settings/saveBranchPosition', position, { headers });

            if (response.data.status === 200) {
                const updatedPositions = [...branchPositions];
                updatedPositions[index] = response.data.position;
                setBranchPositions(updatedPositions);

                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Position updated successfully!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            }
        } catch (error) {
            console.error("Error updating position:", error);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Error updating position!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    };

    const addNewPosition = async () => {
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

        try {
            const response = await axiosInstance.post('/settings/saveBranchPosition', newPosition, { headers });

            if (response.data.status === 200) {
                setBranchPositions(prev => [...prev, response.data.position]);
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
                    confirmButtonColor: '#177604',
                });
            }
        } catch (error) {
            console.error("Error adding position:", error);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Error adding position!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="lg" scroll="paper" >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" fontWeight="bold">Branch Positions Settings</Typography>
                        <IconButton onClick={() => close(false)}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>Existing Positions</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Position</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Review</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Approve</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Note</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Accept</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {branchPositions.map((position, index) => (
                                        <TableRow key={position.id}>
                                            <TableCell>
                                                <TextField fullWidth value={position.name} onChange={(e) => handlePositionChange(index, 'name', e.target.value) } />
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Checkbox checked={position.can_review_request} onChange={(e) => handlePositionChange(index, 'can_review_request', e.target.checked) } />
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Checkbox checked={position.can_approve_request} onChange={(e) => handlePositionChange(index, 'can_approve_request', e.target.checked) } />
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Checkbox checked={position.can_note_request} onChange={(e) => handlePositionChange(index, 'can_note_request', e.target.checked) } />
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Checkbox checked={position.can_accept_request} onChange={(e) => handlePositionChange(index, 'can_accept_request', e.target.checked) } />
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Button variant="contained" onClick={() => savePositionChanges(index)} sx={{ backgroundColor: '#177604', '&:hover': { backgroundColor: '#126903' } }} > Update </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    <PositionAddMiniModal newPosition={newPosition} setNewPosition={setNewPosition} addNewPosition={addNewPosition} disableSaveButton={false}>
                    </PositionAddMiniModal>

                </DialogContent>
            </Dialog>
        </>
    )
}

export default BranchPositionsModal;