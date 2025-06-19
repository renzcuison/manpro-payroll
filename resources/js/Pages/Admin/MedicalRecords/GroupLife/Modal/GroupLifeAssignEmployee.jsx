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
            Grid,  
            Autocomplete,
            Select
        } from "@mui/material";
import axiosInstance, { getJWTHeader } from "@/utils/axiosConfig";
import { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Swal from 'sweetalert2';

const GroupLifeAssignEmployee = ({ open, close, planId, refreshEmployees }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [enrollDate, setEnrollDate] = useState(null);
    const [showDependents, setShowDependents] = useState(false);
    const [dependents, setDependents] = useState([]);
    const relationshipOptions = ["Spouse", "Child", "Parent"];
    const [dependentWarning, setDependentWarning] = useState('');
    const isFilled = (dep) =>
        dep &&
        typeof dep.name === "string" &&
        dep.name.trim().length > 0 &&
        typeof dep.relationship === "string" &&
        dep.relationship.trim().length > 0;

    const handleAddDependent = () => {
        if (
            dependents.length === 0 || !isFilled(dependents[0]) || !isFilled(dependents[dependents.length - 1])
        ) {
            setDependentWarning("Please fill in the previous dependent's name and relationship before adding another.");
            return;
        }
        setDependentWarning('');
        setDependents((prev) => [...prev, { name: "", relationship: "" }]);
        };

    const handleRemoveDependent = (index) => {
        const updated = [...dependents];
        updated.splice(index, 1);
        setDependents(updated);
    };

    const handleDependentChange = (index, field, value) => {
        const updated = [...dependents];
        updated[index][field] = value;
        setDependents(updated);
    };

    const handleSubmit = async () => {
        try {
            if (!selectedEmployee || !selectedEmployee.id || !enrollDate) {
                alert("Please select an employee and enrollment date.");
                return;
            }

            const payload = {
                group_life_plan_id: planId, 
                employee_id: selectedEmployee.id,
                enroll_date: enrollDate.format("YYYY-MM-DD"), 
                dependents: dependents.filter(dep => dep.name && dep.relationship)
            };

            const res = await axiosInstance.post('/medicalRecords/saveGroupLifeEmployees', payload, {
            headers: { Authorization: `Bearer ${user.token}` }
                });
                refreshEmployees(); 

                close();

            console.log("Success:", res.data);
            Swal.fire({
                icon: 'success',
                text: 'Group Life Plan saved successfully!',
                timer: 2000,
                showConfirmButton: false
            });
            close();
        } catch (err) {
            console.error("Error submitting:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error saving Group Life Plan!',
            });
        }
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '500px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Assign Employee</Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>

                    <DialogContent sx={{ padding: 1, paddingBottom: 1 }}>
                            <Box component="form" sx={{ mt: 1, my: 5 }} 
                                    // onSubmit={checkInput}
                                    noValidate autoComplete="off" encType="multipart/form-data">
                            
                                        <FormGroup  row={true} className="d-flex justify-content-between" sx={{
                                            '& label.Mui-focused': { color: '#97a5ba' },
                                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                            }}>
                                            <FormControl sx={{ marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                                            }}>
                                                    
                                                <Autocomplete fullWidth
                                                    options={employees}
                                                    getOptionLabel={(employee) =>
                                                        `${employee.first_name} ${employee.middle_name || ""} ${employee.last_name} ${employee.suffix || ""}`.trim()
                                                    }
                                                    value={selectedEmployee}
                                                    onChange={(e, newValue) => setSelectedEmployee(newValue)}
                                                    noOptionsText="No Employee Found"
                                                    renderInput={(params) => (
                                                        <TextField {...params} label="Select Employee" variant="outlined" />
                                                    )}
                                                />

                                            </FormControl>   
                                        </FormGroup>

                                        <Button
                                            onClick={() => {
                                                if (showDependents) {
                                                    setDependents([]);
                                                    setDependentWarning('');
                                                }
                                                setShowDependents(!showDependents);
                                            }}
                                            variant="contained"
                                            >
                                            {showDependents ? "Remove Dependents" : "Add Dependents"}
                                        </Button>

                                            {showDependents && (
                                        <><Box sx={{ height: 24 }} />

                                        {/* Default Dependent */}
                                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, mb: 2,  }}>
                                                                                                                                    
                                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Add Dependent</Typography>
                                            <Grid item spacing={2} >
                                                <FormControl sx={{ justifyContent: 'space-between', marginBottom: 3, width: '45%', '& label.Mui-focused': { color: '#97a5ba' },
                                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                                                }}>
                                                
                                                    <TextField
                                                        label="Dependent Name"
                                                        value={dependents[0]?.name || ""}
                                                        onChange={(e) => {
                                                            const updated = [...dependents];
                                                            if (!updated[0]) updated[0] = { name: "", relationship: "" };
                                                            updated[0].name = e.target.value;
                                                            setDependents(updated);
                                                        }}                                                    
                                                    />
                                                </FormControl>

                                                <FormControl sx={{ marginLeft: 2, marginBottom: 3, width: '45%' }}>
                                                <Autocomplete
                                                    options={relationshipOptions}
                                                    value={dependents[0]?.relationship || ""}                                                    
                                                    freeSolo
                                                    onChange={(_, newValue) => {
                                                    const updated = [...dependents];
                                                    if (!updated[0]) updated[0] = { name: "", relationship: "" };
                                                    updated[0].relationship = newValue || "";
                                                    setDependents(updated);
                                                    }}
                                                    renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Relationship"
                                                        variant="outlined"
                                                        onChange={e => {
                                                        const updated = [...dependents];
                                                        if (!updated[0]) updated[0] = { name: "", relationship: "" };
                                                        updated[0].relationship = e.target.value;
                                                        setDependents(updated);
                                                        }}
                                                    />
                                                    )}
                                                />
                                                </FormControl>
                                            </Grid>
                                        </Box>

                                        {/* Additional dependents */}                              
                                        {dependents.slice(1).map((dep, index) => (
                                            <Box key={index + 1} sx={{ border: '1px solid #ccc', borderRadius: 1, p: 1, mb: 1 }}>
                                                <Typography variant="subtitle1" sx={{ p: 1 }}>Additional Dependent</Typography>
                                                <Grid container spacing={2}>
                                                <FormControl sx={{ marginLeft: 1, marginBottom: 3, width: '44%', '& label.Mui-focused': { color: '#97a5ba' },
                                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                                                    }}>      
                                                    <Grid item xs={12} sm={5}>
                                                        <TextField
                                                            label="Dependent Name"
                                                            value={dep.name}
                                                            onChange={(e) =>
                                                                handleDependentChange(index + 1, "name", e.target.value)
                                                            }
                                                            fullWidth
                                                        />
                                                    </Grid></FormControl>
                                                    <FormControl sx={{ marginBottom: 3, width: '44%', '& label.Mui-focused': { color: '#97a5ba' },
                                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                                                    }}>   
                                                    <Grid item xs={12} sm={5}>
                                                        <FormControl fullWidth>
                                                            <Autocomplete
                                                                        freeSolo
                                                                        options={relationshipOptions}
                                                                        value={dep.relationship || ""}
                                                                        onChange={(_, newValue) =>
                                                                        handleDependentChange(index + 1, "relationship", newValue || "")
                                                                        }
                                                                        onInputChange={(_, newInputValue) =>
                                                                        handleDependentChange(index + 1, "relationship", newInputValue || "")
                                                                        }
                                                                        renderInput={(params) => (
                                                                        <TextField {...params} label="Relationship" variant="outlined" />
                                                                        )}
                                                                    />
                                                        </FormControl>
                                                    </Grid>                                                    
                                                    <Grid item xs={12} sm={2} sx={{ marginTop: 2 }} >
                                                        <Button sx={{marginLeft: 35}}
                                                            variant="contained"
                                                            color="error"
                                                            onClick={() => handleRemoveDependent(index + 1)}
                                                            >
                                                            Remove
                                                        </Button>
                                                    </Grid></FormControl>

                                                </Grid>
                                            </Box>
                                        ))}
                                        {dependentWarning && (
                                            <Typography color="error" sx={{ mt: 1, mb: 2 }}>
                                                {dependentWarning}
                                            </Typography>
                                        )}
                                        {/* Add Another Dependent Button */}
                                        <Button
                                            variant="contained"
                                            onClick={handleAddDependent}
                                            >
                                            Add Another Dependent
                                        </Button>
                                    </>
                                )}
                                <Box sx={{ height: 24 }} />
                                        <Box>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker 
                                                label="Enroll Date"
                                                value={enrollDate}
                                                onChange={(newValue) => setEnrollDate(newValue)} />
                                            </LocalizationProvider></Box>
                                <Box sx={{ height: 24 }} />

                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>

                                        <Button
                                            variant="contained"
                                            sx={{ backgroundColor: "#7a7a7a" }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmit}
                                        >
                                            Submit
                                    </Button>
                                </Box>
                        </Box>
                    </DialogContent>
                </DialogTitle>
            </Dialog>
        </>
    )
}

export default GroupLifeAssignEmployee;