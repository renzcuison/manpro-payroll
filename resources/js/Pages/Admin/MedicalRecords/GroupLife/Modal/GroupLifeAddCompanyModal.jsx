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
                text: 'Company saved successfully!',
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                text: 'Error saving department!'
                });
        }
        if (!companyName.trim() || !user) {
        setWarning(true);
        return;
        }
        setWarning(false);
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', width: '500px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Companies</Typography>
                            <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>

                    <DialogContent sx={{ padding: 1, paddingBottom: 1 }}>
                        <Box display="flex"
                                alignItems="center"
                                gap={2}
                                sx={{ width: "100%", marginBottom: 3 }}>                            
                            

                                <Box display="flex" alignItems="center" gap={2} sx={{ width: '100%', marginTop: 3, marginBottom: 3 }}>
                                <TextField
                                    label="Group Life Company Name"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    sx={{
                                        flex: 7,
                                    '& label.Mui-focused': { color: '#97a5ba' },
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': { borderColor: '#97a5ba' }
                                    }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    sx={{flex: 3, backgroundColor: "#177604", color: "white" }}
                                    onClick={handleAdd}
                                    >
                                    <p className="m-0">
                                    <i className="fa fa-floppy-o mr-2 mt-1"></i> Save
                                    </p>
                                </Button>

                                  {warning && (
                                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                    yo
                                    </Typography>
                                )}
                                </Box>
                        </Box>
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
                                        <TableCell aligh="center">Plans</TableCell>
                                    </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {companies.length > 0 ? companies.map((company) => (
                                            <TableRow key={company.id}>
                                                <TableCell align="left" component="th" scope="row">
                                                    {company.name}
                                                </TableCell>
                                                <TableCell> 0</TableCell>
                                            </TableRow>
                                            
                                        )) : (
                                            <TableRow>
                                                <TableCell align="center">No companies found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
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
