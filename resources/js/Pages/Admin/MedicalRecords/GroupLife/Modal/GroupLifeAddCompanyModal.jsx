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
import { useState } from 'react';
import 'react-quill/dist/quill.snow.css';

const GroupLifeAddCompanyModal = ({ open, close, onAddCompany }) => {

    const navigate = useNavigate();

    const [groupLifeNameError, setGroupLifeNameError] = useState(false);
    const [groupLifeName, setGroupLifeName] = useState('');

    const [companyName, setCompanyName] = useState("");

    const handleAdd = () => {
        if (companyName.trim()) {
        onAddCompany(companyName.trim());
        setCompanyName("");
        close();
        }
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', width: '500px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Add Group Life Company</Typography>
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
                                </Box>
                            
                            
                        </Box>
                        <TableContainer sx={{
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
                                    </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {/* {rows.map((row) => ( */}
                                        <TableRow 
                                        // key={row.name}
                                        // sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                        <TableCell align="center" component="th" scope="row">
                                            St. Pere
                                        </TableCell>
                                        </TableRow>
                                    {/* // ))} */}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </DialogContent>
                </DialogTitle>
            </Dialog>
        </>
    )

}


export default GroupLifeAddCompanyModal;
