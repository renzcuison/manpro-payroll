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
            Select,
            Table,
            TableBody,
            TableCell,
            TableContainer,
            TableHead,
            TableRow,
            Paper,
        } from "@mui/material";
import axiosInstance, { getJWTHeader } from "@/utils/axiosConfig";
import { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const GroupLifeEditEmployee = ({ open, close, employeePlanId }) => {

    const storedUser = localStorage.getItem("nasya_user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [dependents, setDependents] = useState([]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newDependent, setNewDependent] = useState({ name: "", relationship: "" });

    const [formData, setFormData] = useState({
        employee_name: '',
        branch_name: '',
        department_name: '',
        enroll_date: '',
        dependents: []
    });

    useEffect(() => {
    if (!employeePlanId) return;

    axiosInstance.get(`/medicalRecords/getGroupLifeEmployeePlanById/${employeePlanId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => {
        console.log("Fetched data:", res.data);
        const data = res.data.data;

        setFormData({
        employee_name: data.employee_name,
        branch_name: data.branch_name,
        department_name: data.department_name,
        enroll_date: data.enroll_date,
        dependents: data.dependents || []
        });

        setDependents(data.dependents.map(dep => ({
        id: dep.id,
        name: dep.name,
        relationship: dep.relationship
        })));

    })
    .catch(err => {
        console.error("Error fetching employee plan:", err);
    });
    }, [employeePlanId]);

    const [editingIndex, setEditingIndex] = useState(null);

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

    const handleSubmit = () => {
        if (!formData.enroll_date) {
            alert("Enroll date is required.");
            return;
    }

    if (!dependents.length || dependents.some(d => !d.name.trim() || !d.relationship.trim())) {
        alert("Please ensure all dependents have both name and relationship.");
        return;
    }
    console.log("Submitting:", {
        enroll_date: formData.enroll_date,
        // dependents: dependents.map(dep => ({
        //     id: dep.id,
        //     name: dep.name,
        //     relationship: dep.relationship
        // }))
        dependents: dependents.map(dep => {
        const details = {
            name: dep.name,
            relationship: dep.relationship
        };
        return dep.id ? { ...details, id: dep.id } : details;
    })
    });

    axiosInstance.put(`/medicalRecords/editGroupLifeEmployeePlan/${employeePlanId}`, {
        enroll_date: formData.enroll_date,
        dependents: dependents.map(dep => ({
            id: dep.id,
            name: dep.name,
            relationship: dep.relationship
        }))
        }, {
        headers: { Authorization: `Bearer ${user.token}` }
        })
    .then(res => {
        console.log("Success:", res.data);
        alert("Employee Plan updated.");
        close(false); // Close modal
    })
    .catch(err => {

    if (err.response?.status === 422) {
        console.error("Validation errors:", err.response.data.errors);
        alert("Validation failed. See console.");
    } else {
        console.error("Other error:", err);
        alert("Failed to update employee plan.");
    }
    });
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
                    <Box sx={{ mb: 2, textAlign: 'left' }}>
                        <Typography variant="body1"><strong>Employee Name:</strong> {formData.employee_name || '-'}</Typography>
                        <Typography variant="body1"><strong>Branch:</strong> {formData.branch_name || '-'}</Typography>
                        <Typography variant="body1"><strong>Department:</strong> {formData.department_name || '-'}</Typography>
                        <Typography variant="body1"><strong>Enroll Date:</strong> {formData.enroll_date || '-'}</Typography>

                {showAddForm && (
                <Box sx={{ mb: 2 }}>
                    <Grid container spacing={2}>
                    <Grid item xs={5}>
                        <TextField
                        fullWidth
                        label="Dependent Name"
                        value={newDependent.name}
                        onChange={(e) =>
                            setNewDependent((prev) => ({ ...prev, name: e.target.value }))
                        }
                        />
                    </Grid>

                    <Grid item xs={5}>
                        <Autocomplete
                        fullWidth
                        freeSolo
                        options={relationshipOptions}
                        value={newDependent.relationship}
                        onChange={(_, newValue) =>
                            setNewDependent((prev) => ({ ...prev, relationship: newValue || "" }))
                        }
                        onInputChange={(_, newInputValue) =>
                            setNewDependent((prev) => ({ ...prev, relationship: newInputValue || "" }))
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Relationship" fullWidth />
                        )}
                        />
                    </Grid>

                    <Grid item sx={{mt: 1}}>
                        <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                            if (!newDependent.name.trim() || !newDependent.relationship.trim()) {
                            alert("Please complete both fields.");
                            return;
                            }

                            setDependents((prev) => [
                            ...prev,
                            {
                                name: newDependent.name,
                                relationship: newDependent.relationship,
                            },
                            ]);
                            setShowAddForm(false);
                        }}
                        >
                        Add
                        </Button>

                    </Grid>
                        <Grid item sx={{mt: 1}}>
                        <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setShowAddForm(false)}
                        >
                        Cancel
                        </Button>
                    </Grid>
                    </Grid>
                </Box>
                )}

                {!showAddForm && (
                <>
                    {formData.dependents.length > 0 ? (
                    <TableContainer
                        sx={{
                        marginTop: 2,
                        overflowY: "scroll",
                        minHeight: 400,
                        maxHeight: 500,
                        }}
                        style={{ overflowX: "auto" }}
                    >
                        <Table stickyHeader aria-label="simple table">
                        <TableHead>
                            <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Relationship</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dependents.map((dep, index) => (
                            <TableRow key={index}>
                                {editingIndex === index ? (
                                <>
                                    <TableCell>
                                    <TextField
                                        fullWidth
                                        value={dep.name}
                                        onChange={(e) => handleDependentChange(index, "name", e.target.value)}
                                    />
                                    </TableCell>

                                    <TableCell sx={{ width: '45%' }}>
                                        <Box sx={{ width: '100%' }}>
                                    <Autocomplete
                                        fullWidth
                                        options={relationshipOptions}
                                        freeSolo
                                        value={dep.relationship}
                                        onChange={(_, newValue) =>
                                        handleDependentChange(index, "relationship", newValue || "")
                                        }
                                        onInputChange={(_, newInputValue) =>
                                        handleDependentChange(index, "relationship", newInputValue || "")
                                        }
                                        renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Relationship"
                                            size="small"
                                        />
                                        )}
                                    />
                                    </Box>
                                    </TableCell>

                                    <TableCell>
                                    <Button onClick={() => setEditingIndex(null)}>Done</Button>
                                    </TableCell>
                                </>
                                ) : (
                                <>
                                    <TableCell>{dep.name}</TableCell>
                                    <TableCell>{dep.relationship}</TableCell>
                                    <TableCell>
                                    <IconButton onClick={() => setEditingIndex(index)}>
                                        <i className="fa fa-pencil-square-o" />
                                    </IconButton>
                                    </TableCell>
                                </>
                                )}
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </TableContainer>
                    ) : (
                    <Typography variant="body2">No dependents</Typography>
                    )}

                    {/* Centered Add & Cancel buttons BELOW the table */}
                    <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                    <Grid item>
                        <Button
                        variant="contained"
                        onClick={() => {
                            setShowAddForm(true);
                            setNewDependent({ name: "", relationship: "" });
                        }}
                        >
                        Add Dependent
                        </Button>
                    </Grid>
                    </Grid>
                </>
                )}
                <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ mt: 2 }}
                >
                Save Changes
                </Button>
                    </Box>                           
                    </DialogContent>
                </DialogTitle>
            </Dialog>
        </>
    )
}

export default GroupLifeEditEmployee;