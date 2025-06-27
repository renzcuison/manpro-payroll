import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Typography,
    IconButton,
    Grid,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress
} from "@mui/material";
import axiosInstance, { getJWTHeader } from "@/utils/axiosConfig";
import { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';

const HMOEditEmployee = ({ open, close, employeePlanId, refreshEmployees }) => {

    const storedUser = localStorage.getItem("nasya_user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [dependents, setDependents] = useState([]);
    const [showSaveButton, setShowSaveButton] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newDependent, setNewDependent] = useState({ name: "", relationship: "" });
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        employee_name: '',
        branch_name: '',
        department_name: '',
        enroll_date: '',
        dependents: []
    });

    useEffect(() => {
        if (!employeePlanId) return;
        setLoading(true);
        axiosInstance.get(`/medicalRecords/getHMOEmployeePlanById/${employeePlanId}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => {
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
            })
            .finally(() => {
                setLoading(false);
            });
    }, [employeePlanId]);

    const [editingIndex, setEditingIndex] = useState(null);
    const relationshipOptions = ["Spouse", "Child", "Parent"];
    const [dependentWarning, setDependentWarning] = useState('');

    const handleAddDependent = () => {
        const first = dependents[0];

        if (!first || !first.name.trim() || !first.relationship.trim()) {
            Swal.fire({
                icon: "error",
                title: "Delete failed",
                text: "Please fill in the previous dependent's name and relationship before adding another."
            }
            );
            // setDependentWarning("Please fill in the previous dependent's name and relationship before adding another.");
            return;
        }

        const last = dependents[dependents.length - 1];

        if (!last || !last.name.trim() || !last.relationship.trim()) {
            Swal.fire({
                icon: "error",
                title: "Delete failed",
                text: "Please fill in the previous dependent's name and relationship before adding another."
            }
            );
            // setDependentWarning("Please fill in the previous dependent's name and relationship before adding another.");
            return;
        }

        setDependentWarning('');
        setDependents((prev) => [...prev, { name: "", relationship: "" }]);
    };

    const handleRemoveDependent = (index) => {
        const dependent = dependents[index];

        if (dependent.id) {
            Swal.fire({
                title: "Are you sure?",
                text: "This will delete the dependent.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Delete",
            }).then((result) => {
                if (!result.isConfirmed) return;

                axiosInstance
                    .delete(`/medicalRecords/deleteHMODependent/${dependent.id}`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    })
                    .then((res) => {
                        Swal.fire("Deleted!", "Dependent deleted successfully.", "success");
                        setDependents((prev) => prev.filter((_, i) => i !== index));
                    })
                    .catch((err) => {
                        console.error(err);
                        Swal.fire({
                            icon: "error",
                            title: "Delete failed",
                            text: "Something went wrong."
                        });
                    });
            });
        } else {
            setDependents((prev) => prev.filter((_, i) => i !== index));
            setEditingIndex(null);
        }
    };

    const handleDependentChange = (index, field, value) => {
        const updated = [...dependents];
        updated[index][field] = value;
        setDependents(updated);
    };

    const handleDeleteEmployee = (employeePlanId) => {
        if (!employeePlanId) return;

        Swal.fire({
            title: "Are you sure?",
            text: "This will delete the employee if there are no dependents assigned.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
        }).then((result) => {
            if (!result.isConfirmed) return;

            axiosInstance
                .delete(`/medicalRecords/deleteHMOEmployee/${employeePlanId}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                })
                .then((res) => {
                    if (res.data.status === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: "Success",
                            text: 'HMO Employee deleted successfully.',
                            timer: 2000,
                            showConfirmButton: false
                        });
                        close();
                        refreshEmployees();
                    } else if (res.data.status === 400) {
                        Swal.fire({
                            icon: 'info',
                            title: 'Cannot Delete',
                            text: 'This employee has dependents assigned and cannot be deleted.',
                        });
                    }
                })
                .catch((err) => {
                    console.error(err);
                    Swal.fire({
                        icon: "error",
                        title: "Delete failed",
                        text: "Something went wrong."
                    }
                    );
                });
        });
    };

    const handleSubmit = (afterSaveCallback) => {
        if (!dependents.length || dependents.some(d => !d.name.trim() || !d.relationship.trim())) {
            Swal.fire({
                icon: 'error',
                title: 'Please ensure all dependents have both name and relationship.',
            });
            return;
        };
        axiosInstance.put(`/medicalRecords/editHMOEmployeePlan/${employeePlanId}`, {
            enroll_date: formData.enroll_date,
            dependents: dependents.map(dep => ({
                id: dep.id,
                name: dep.name,
                relationship: dep.relationship
            }))
        },
            {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(res => {
                refreshEmployees();
                Swal.fire({
                    icon: 'success',
                    title: "Success!",
                    text: 'HMO Employee updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });

                if (typeof afterSaveCallback === 'function') {
                    afterSaveCallback();
                }
            })
            .catch(err => {
                console.error("Error submitting:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error updating HMO Employee.',
                });
            });
    };

    const reloadData = () => {
        axiosInstance.get(`/medicalRecords/getHMOEmployeePlanById/${employeePlanId}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => {
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
                console.error("Error fetching HMO Employee", err);
                Swal.fire({
                    icon: 'error',
                    title: "Error",
                    text: 'Error fetching Group Life Employee.',
                });
            })
    };


    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '500px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Edit Employee</Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                    <DialogContent sx={{ padding: 1, paddingBottom: 1 }}>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box sx={{ mb: 2, textAlign: 'left' }}>
                                <Typography variant="body1"><strong>Employee Name:</strong> {formData.employee_name || '-'}</Typography>
                                <Typography variant="body1"><strong>Branch:</strong> {formData.branch_name || '-'}</Typography>
                                <Typography variant="body1"><strong>Department:</strong> {formData.department_name || '-'}</Typography>
                                <Typography variant="body1"><strong>Enroll Date:</strong> {formData.enroll_date || '-'}</Typography>

                                {showAddForm && (
                                    <Box sx={{ mb: 2, mt: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid size={6} item xs={5}>
                                                <TextField
                                                    fullWidth
                                                    label="Dependent Name"
                                                    value={newDependent.name}
                                                    onChange={(e) =>
                                                        setNewDependent((prev) => ({ ...prev, name: e.target.value }))
                                                    }
                                                />
                                            </Grid>

                                            <Grid size={6} item xs={5}>
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
                                        </Grid>
                                        <Grid container spacing={2} justifyContent="center">
                                            <Grid item sx={{ mt: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => {
                                                        if (!newDependent.name.trim() || !newDependent.relationship.trim()) {
                                                            Swal.fire({
                                                                title: "Error",
                                                                text: "Please fill in both dependent name and relationship.",
                                                                icon: "error",
                                                                showCancelButton: true,
                                                                confirmButtonText: "Delete",
                                                            })
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
                                            <Grid item sx={{ mt: 1 }}>
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
                                        {dependents.length > 0 ? (
                                            <TableContainer
                                                sx={{
                                                    marginTop: 2,
                                                    overflowY: "scroll",
                                                    minHeight: 300,
                                                }}
                                                style={{ overflowX: "auto" }}
                                            >
                                                <Table stickyHeader aria-label="simple table">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell align="center"><strong>Name</strong></TableCell>
                                                            <TableCell align="center"><strong>Relationship</strong></TableCell>
                                                            {editingIndex !== null && editingIndex < dependents.length && (
                                                                <TableCell align="center"><strong>Action</strong></TableCell>
                                                            )}
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {dependents.map((dep, index) => (
                                                            <TableRow key={index}
                                                                hover
                                                                sx={{ cursor: editingIndex === index ? 'default' : 'pointer' }}
                                                                onClick={() => {
                                                                    if (editingIndex !== index) {
                                                                        setEditingIndex(index);
                                                                    }
                                                                }}
                                                            >
                                                                {editingIndex === index ? (
                                                                    <>
                                                                        <TableCell>
                                                                            <TextField
                                                                                label="Name"
                                                                                fullWidth
                                                                                value={dep.name}
                                                                                onChange={(e) => handleDependentChange(index, "name", e.target.value)}
                                                                            />
                                                                        </TableCell>

                                                                        <TableCell sx={{ width: '40%' }}>
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

                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </Box>
                                                                        </TableCell>

                                                                        <TableCell>
                                                                            <Button
                                                                                sx={{ mr: 2 }}
                                                                                variant="contained"
                                                                                color="primary"
                                                                                size="small"
                                                                                onClick={() => {
                                                                                    handleSubmit(() => {
                                                                                        reloadData();
                                                                                        setEditingIndex(null);
                                                                                    });
                                                                                }}>
                                                                                Save
                                                                            </Button>
                                                                            <Button
                                                                                variant="contained"
                                                                                color="error"
                                                                                size="small" onClick={() => handleRemoveDependent(index)}>
                                                                                Delete
                                                                            </Button>
                                                                        </TableCell>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <TableCell>{dep.name}</TableCell>
                                                                        <TableCell>{dep.relationship}</TableCell>
                                                                        {/* <TableCell>
                                    <IconButton onClick={() => setEditingIndex(index)}>
                                        <i className="fa fa-pencil-square-o" />
                                    </IconButton>
                                    </TableCell> */}
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
                                        <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                                            <Grid item>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => {
                                                        setShowAddForm(true);
                                                        setNewDependent({ name: "", relationship: "" });
                                                        setShowSaveButton(true);
                                                    }}
                                                >
                                                    Add Dependent
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2} justifyContent="space-between" sx={{ mt: 2 }}>
                                            <Grid item>
                                                <Button variant="contained" color="error" onClick={() => handleDeleteEmployee(employeePlanId)}>
                                                    Delete
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                {showSaveButton && (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={handleSubmit}
                                                    >
                                                        Save Changes
                                                    </Button>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </>
                                )}

                            </Box>
                        )}</DialogContent>
                </DialogTitle>
            </Dialog>
        </>
    )
}

export default HMOEditEmployee;