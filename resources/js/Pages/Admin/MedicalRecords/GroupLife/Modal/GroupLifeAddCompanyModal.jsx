import {    Box, 
            Button, 
            Dialog, 
            DialogTitle, 
            DialogContent, 
            FormControl, 
            TextField, 
            Typography,  
            IconButton, 
            FormGroup,  
            InputLabel, 
            MenuItem, 
            OutlinedInput,
            InputAdornment,
            Autocomplete,
            TableContainer,
            Paper,
            Table,
            TableHead,
            TableRow,
            TableCell,
            TableBody  
        } from "@mui/material";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import axios from "axios";
import axiosInstance, { getJWTHeader } from '../../../../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { GlobalStyles } from '@mui/material';

const GroupLifeAddCompanyModal = ({ open, close, onAddCompany }) => {

    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState("");
    const [companies, setCompanies] = useState([]);
    const [warning, setWarning] = useState(false);
    const storedUser = localStorage.getItem("nasya_user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const [isRenaming, setIsRenaming] = useState(false);
    const [isEditingRow, setIsEditingRow] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState("");
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);

    useEffect(() => {
        if (open) {
        fetchCompanies();
        }
    }, [open]);

    const fetchCompanies = async () => {
        console.log("fetchCompanies called");
        if (!user) return;
        try {
        const res = await axiosInstance.get('/medicalRecords/getGroupLifeCompanies', {
            headers: { Authorization: `Bearer ${user.token}` }
        });
        setCompanies(res.data.companies);
        } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]);
        }
    };

    const handleAdd = async () => {
        console.log("user from localStorage:", user);
        if (!companyName.trim() || !user) return;
        try {
            const response = await axiosInstance.post('/medicalRecords/saveGroupLifeCompanies',
                { name: companyName.trim() },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            if (onAddCompany) onAddCompany(response.data);
            setCompanyName("");
            await fetchCompanies();
            Swal.fire({
                icon: 'success',
                title: "Success",
                text: 'Company saved successfully!',
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: "Error",
                text: 'Error saving company!'
                });
        }
        if (!companyName.trim() || !user) {
        setWarning(true);
        return;
        }
        setWarning(false);
    };

    const handleRenameSave = () => {
    if (!selectedCompanyId) return;

    axiosInstance.put(`/medicalRecords/editGroupLifeCompany/${selectedCompanyId}`, {
        name: newCompanyName,
    }, {
        headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(() => {
        Swal.fire({
        icon: 'success',
        text: 'Company name updated!',
        timer: 1500,
        showConfirmButton: false,
        });
        setIsRenaming(false);
        setNewCompanyName("");
        setSelectedCompanyId(null);
        fetchCompanies();
    })
    .catch(err => {
        console.error("Rename failed:", err);
        Swal.fire({ icon: 'error', title: "Error", text: 'Rename failed.' });
    });
    };

    const handleDeleteCompany = (companyId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the company.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`/medicalRecords/deleteGroupLifeCompany/${companyId}`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });

                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted successfully.',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    setIsRenaming(false);
                    setSelectedCompanyId(null);
                    setNewCompanyName("");
                    fetchCompanies();
                } catch (error) {
                    console.error("Delete failed:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Delete failed.',
                        text: 'Company has existing plans.'
                    });
                }
            }
        });
    };


    return (
        <>
            <Dialog open={open} fullWidth maxWidth="lg" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 3, paddingBottom: 1, mt:2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}>  {isRenaming ? 'Edit Group Life Company' : 'Add Group Life Company'}</Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>

                    <DialogContent sx={{ padding: 1, paddingBottom: 1 }}>
                        {!isRenaming && (
                        <Box display="flex" alignItems="center" gap={2} sx={{ width: "100%", marginBottom: 3 }}>                            
                            <Box display="flex" alignItems="center" gap={2} sx={{ width: '100%', marginTop: 2, marginBottom: 3, p: 2 }}>
                                <TextField
                                    label="Group Life Company Name"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    sx={{ flex: 40, '& label.Mui-focused': { color: '#97a5ba' }, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } }}}
                                />
                                <Button variant="contained" sx={{backgroundColor: "#177604", color: "white" , height: '51px', width: '80px'}} onClick={handleAdd} >
                                    <p className="m-0">Add</p>
                                </Button>
                            </Box>
                        </Box>)}

                    {isRenaming ? (
                        
                    <Box>
                        <Box sx={{ mt: 2, p:2}}>
                        <TextField
                        fullWidth
                        label="Company Name"
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        sx={{ mb: 2 }}
                        /></Box>
                        <Box display="flex" justifyContent="flex-end" sx={{ p: 2}} gap={2} >
                        <Button variant="contained" onClick={handleRenameSave}>
                            Save
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => {
                            setIsRenaming(false);
                            setSelectedCompanyId(null);
                            setNewCompanyName("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleDeleteCompany(selectedCompanyId)}
                        >
                            Delete
                        </Button>
                        </Box>
                    </Box>
                    ) : (
                        <TableContainer 
                                sx={{
                                    marginTop: 2,
                                    overflowY: "scroll",
                                    minHeight: 300,
                                    maxHeight: 300,
                                }}
                                    style={{ overflowX: "auto" }}>
                                <Table aria-label="simple table">
                                    <TableHead >
                                    <TableRow sx={{                                        
                                            backgroundColor: "#e0e0e0"        
                                    }}>
                                        <TableCell align="center"> Company List</TableCell>
                                        <TableCell align="center">Plans</TableCell>
                                    </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {companies.length > 0 ? companies.map((company) => (
                                            <TableRow 
                                                key={company.id}
                                                hover 
                                                sx={{ cursor: 'pointer' }} 
                                                onClick={() => {
                                                    setIsRenaming(true);
                                                    setSelectedCompanyId(company.id);
                                                    setNewCompanyName(company.name);
                                                }}>
                                                <TableCell align="left" component="th" scope="row">
                                                    {company.name}
                                                </TableCell>
                                                <TableCell align="center">{company.plans ?? 0}</TableCell>
                                        </TableRow>
                                            
                                        )) : (
                                            <TableRow>
                                                <TableCell align="center">No companies found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>)}
                        </DialogContent>
                </DialogTitle>
            </Dialog>
                  <GlobalStyles styles={{
                    '.swal2-container': { zIndex: 2000 }
                }} />
        </>
    )

}


export default GroupLifeAddCompanyModal;
