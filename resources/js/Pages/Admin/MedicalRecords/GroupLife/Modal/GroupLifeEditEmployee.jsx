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

const GroupLifeEditEmployee = ({ open, close }) => {

const storedUser = localStorage.getItem("nasya_user");
const headers = getJWTHeader(JSON.parse(storedUser));
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        axiosInstance
            .get("/employee/getEmployees", { headers })
            .then((response) => {
                setEmployees(response.data.employees);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching clients:", error);
                setIsLoading(false);
            });

        axiosInstance
            .get("/settings/getDepartments", { headers })
            .then((response) => {
                const fetchedDepartments = response.data.departments;
                setDepartments(fetchedDepartments);
                const allDepartmentIds = fetchedDepartments.map(
                    (department) => department.id
                );
                setSelectedDepartments(allDepartmentIds);
            })
            .catch((error) => {
                console.error("Error fetching departments:", error);
            });

        axiosInstance
            .get("/settings/getBranches", { headers })
            .then((response) => {
                const fetchedBranches = response.data.branches;
                setBranches(fetchedBranches);
                const allBranchIds = fetchedBranches.map((branch) => branch.id);
                setSelectedBranches(allBranchIds);
            })
            .catch((error) => {
                console.error("Error fetching branches:", error);
            });
    }, []);

    const [showDependents, setShowDependents] = useState(false);

    const [dependents, setDependents] = useState([]);

    const relationshipOptions = ["Spouse", "Child", "Parent"];

    const [dependentWarning, setDependentWarning] = useState('');

    const handleAddDependent = () => {
        const first = dependents[0];

        if (!first || !first.name.trim() || !first.relationship.trim()) {
            setDependentWarning("Please fill in the previous dependent's name and relationship before adding another.");
            return;
        }

        const last = dependents[dependents.length - 1];

        if (!last || !last.name.trim() || !last.relationship.trim()) {
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

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md"PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '500px', marginBottom: '5%' }}}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1 ,fontWeight: 'bold' }}> Edit Employee</Typography>
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

                                                <Typography><strong><h5>Employee Name:</h5></strong> Samuel Christian D. Nacar</Typography>
                                                    
                                                {/* <Autocomplete sx={{width: 750}}
                                                    options={employees}
                                                    getOptionLabel={(employee) =>
                                                        `${employee.first_name} ${employee.middle_name || ""} ${employee.last_name} ${employee.suffix || ""}`.trim()
                                                    }
                                                    noOptionsText="No Employee Found"
                                                    renderInput={(params) => (
                                                        <TextField {...params} label="Select Employee" variant="outlined" />
                                                    )}
                                                /> */}

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

                                                <FormControl sx={{ marginLeft: 2, marginBottom: 3, width: '45%', '& label.Mui-focused': { color: '#97a5ba' },
                                                    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                                                    }}>
                                                    <Grid item xs={12} sm={5}>
                                                        <FormControl fullWidth>
                                                            <Autocomplete
                                                                freeSolo
                                                                options={relationshipOptions}
                                                                value={dependents[0]?.relationship || ""}
                                                                onChange={(event, newValue) => {
                                                                    const updated = [...dependents];
                                                                    if (!updated[0]) updated[0] = { name: "", relationship: "" };
                                                                    updated[0].relationship = newValue || "";
                                                                    setDependents(updated);
                                                                }}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                    {...params}
                                                                    label="Relationship"
                                                                    fullWidth
                                                                    />
                                                                )}
                                                                fullWidth
                                                                />
                                                    </FormControl>
                                                </Grid></FormControl>
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
                                                            <InputLabel>Relationship</InputLabel>
                                                            <Select
                                                                value={dep.relationship}
                                                                label="Relationship"
                                                                onChange={(e) =>
                                                                    handleDependentChange(index + 1, "relationship", e.target.value)
                                                                }
                                                            >
                                                                {relationshipOptions.map((rel) => (
                                                                    <MenuItem key={rel} value={rel}>{rel}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid></FormControl>

                                                </Grid>
                                                        <Grid item xs={12} sm={2} >
                                                        <Button sx={{marginLeft: 85}}
                                                            variant="contained"
                                                            color="error"
                                                            onClick={() => handleRemoveDependent(index + 1)}
                                                            >
                                                            Remove
                                                        </Button>
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
                                                <DatePicker label="Enroll Date" />
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

export default GroupLifeEditEmployee;