import React, { useEffect, useState } from "react";
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";

const EmployeeDetailsEdit = ({ open, close }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [nameError, setNameError] = useState(false);
    const [acronymError, setAcronymError] = useState(false);

    const [name, setName] = useState("");
    const [acronym, setAcronym] = useState("");
    const [description, setDescription] = useState("");

    const saveBranch = async (event) => {
        event.preventDefault();

        if (!validateBranchInput()) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Please fill all required fields!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
            return;
        }

        try {
            const data = { name, acronym, description };
            const response = await axiosInstance.post('/settings/saveBranch', data, { headers });

            if (response.data.status === 200) {
                // setBranches(prev => [...prev, response.data.branch]);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Branch saved successfully!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
                resetBranchForm();
                close(true);
            }
        } catch (error) {
            console.error("Error saving branch:", error);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Error saving branch!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    };

    const validateBranchInput = () => {
        const valid = name && acronym;
        setNameError(!name);
        setAcronymError(!acronym);
        return valid;
    };

    const resetBranchForm = () => {
        setName("");
        setAcronym("");
        setDescription("");
        setNameError(false);
        setAcronymError(false);
    };
    
    return (
        <>
            <Dialog open={open} fullWidth maxWidth="sm" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' } }} >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" fontWeight="bold">Add New Branch</Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }} onSubmit={saveBranch} >
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField fullWidth required label="Branch Name" variant="outlined" value={name} error={nameError} onChange={(e) => setName(e.target.value)} helperText={nameError ? "Branch name is required" : ""} sx={{ flex: 2 }} />
                            <TextField fullWidth required label="Acronym" variant="outlined" value={acronym} error={acronymError} onChange={(e) => setAcronym(e.target.value)} helperText={acronymError ? "Acronym is required" : ""} sx={{ flex: 1 }} />
                        </Box>

                        <TextField fullWidth label="Description" variant="outlined" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={4} />

                        <DialogActions sx={{ mt: 2 }}>
                            <Button variant="outlined" onClick={() => close(false)} > Cancel </Button>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604' }} > Save </Button>
                        </DialogActions>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    )
}
export default EmployeeDetailsEdit;