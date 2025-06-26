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
    CircularProgress,
    Autocomplete,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,

} from "@mui/material";
import axiosInstance from "@/utils/axiosConfig";
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const HMOPlanEdit = ({ open, close, employeePlanId, selectedEmployeePlanId, refreshEmployees }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const [planDetails, setPlanDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [dependents, setDependents] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const relationshipOptions = ["Spouse", "Child", "Parent"];
    const [dependentWarning, setDependentWarning] = useState('');
    const [newDependent, setNewDependent] = useState({ name: "", relationship: "" });
    const [newDependents, setNewDependents] = useState([]);

    // useEffect(() => {
    //     console.log("🧪 selectedEmployeePlanId:", selectedEmployeePlanId);
    // }, [selectedEmployeePlanId]);

    // useEffect(() => {
    //     if (!employeePlanId || !open) return;

    //     setLoading(true);
    //     setError("");

    //     axiosInstance
    //         .get(`/medicalRecords/getEmployeeGroupLifePlanById/${employeePlanId}`, {
    //             headers: {
    //                 Authorization: `Bearer ${user?.token}`,
    //             },
    //         })
    //         .then((res) => {
    //             setPlanDetails(res.data);
    //         })
    //         .catch((err) => {
    //             if (err.response?.status === 403) {
    //                 setError("Unauthorized");
    //             } else {
    //                 setError("Plan not found or error occurred");
    //             }
    //         })
    //         .finally(() => {
    //             setLoading(false);
    //         });
    // }, [employeePlanId, open]);

    // const handleSave = () => {
    //     if (!planDetails) return;

    //     const payload = {
    //         enroll_date: planDetails.enroll_date,
    //         dependents: newDependents,
    //     };

    //     axiosInstance
    //         .put(`/medicalRecords/editEmployeeGroupLifePlan/${employeePlanId}`, payload, {
    //             headers: {
    //                 Authorization: `Bearer ${user?.token}`,
    //             },
    //         })
    //         .then((res) => {
    //             close(false);
    //         })
    //         .catch((err) => {
    //             console.error(err);
    //             setError("Failed to update plan.");
    //         });
    // };



    return (
        <Dialog open={open} onClose={() => close(false)} fullWidth maxWidth="md" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '500px', marginBottom: '5%', }, }} >
            <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}>
                        Edit Group Life Plan
                    </Typography>
                    <IconButton onClick={() => close(false)}>
                        <i className="si si-close"></i>
                    </IconButton>
                </Box>

                <DialogContent sx={{ padding: 1, paddingBottom: 1 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" my={4}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : planDetails ? (
                        <Box sx={{ mb: 2, textAlign: 'left' }}>
                            <Typography><strong>Name:</strong> {planDetails.employee_name || '-'}</Typography>
                            <Typography><strong>Enroll Date:</strong> {planDetails.enroll_date || '-'}</Typography>
                            <Typography><strong>Plan Name:</strong> {planDetails.plan_name || '-'}</Typography>
                            <Typography><strong>Plan Type:</strong> {planDetails.plan_type || '-'}</Typography>
                            <Typography><strong>Company:</strong> {planDetails.company_name || '-'}</Typography>
                            <Typography><strong>Employee Share:</strong> {planDetails.employee_share || '-'}</Typography>
                            <Typography><strong>Employer Share:</strong> {planDetails.employer_share || '-'}</Typography>

                            {planDetails.dependents && planDetails.dependents.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6">
                                        Dependents
                                    </Typography>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Name</strong></TableCell>
                                                <TableCell><strong>Relationship</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {planDetails.dependents.map((dep, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{dep.dependent_name}</TableCell>
                                                    <TableCell>{dep.relationship}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            )}


                            <Box sx={{ mb: 2, mt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid size={6} item xs={5}>
                                        <TextField
                                            fullWidth
                                            label="Dependent Name"
                                            onChange={(e) =>
                                                setNewDependent((prev) => ({ ...prev, name: e.target.value }))
                                            }
                                        />
                                    </Grid>

                                    <Grid size={6} item xs={5} >
                                        <Autocomplete
                                            fullWidth
                                            freeSolo
                                            options={relationshipOptions}
                                            onChange={(_, newValue) =>
                                                setNewDependent((prev) => ({ ...prev, relationship: newValue || "" }))
                                            }
                                            renderInput={(params) => (
                                                <TextField {...params} label="Relationship" />
                                            )}
                                        />


                                    </Grid>                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            setShowAddForm(true);
                                            setNewDependent({ name: "", relationship: "" });
                                            setDependentWarning("");
                                        }}
                                    >
                                        Add Dependent
                                    </Button>
                                </Grid>
                            </Box>

                            <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={handleSave}
                                    // disabled={loading || newDependents.length === 0}
                                    >
                                        Save Plan
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Typography>No details found.</Typography>
                    )}
                </DialogContent>
            </DialogTitle>


        </Dialog>
    );
};

export default HMOPlanEdit;
