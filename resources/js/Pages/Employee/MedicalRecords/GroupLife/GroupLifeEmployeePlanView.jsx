import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Autocomplete,
    Grid,
    CircularProgress,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    FormControl,
    IconButton,
} from "@mui/material";
import Layout from "../../../../components/Layout/Layout";
import axiosInstance from "../../../../utils/axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CloseIcon from '@mui/icons-material/Close';

const relationshipOptions = ["Spouse", "Child", "Parent"];

const GroupLifeEmployeePlanView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Get nasya_user from localStorage for token
    const storedUser = useMemo(() => {
        const item = localStorage.getItem("nasya_user");
        return item ? JSON.parse(item) : null;
    }, []);
    const token = storedUser?.token;

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dependents, setDependents] = useState([]);
    const [addOpen, setAddOpen] = useState(false);
    const [newDep, setNewDep] = useState({ name: "", relationship: "" });
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        axiosInstance
            .get(`/medicalRecords/getEmployeeGroupLifePlan/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setPlan(res.data.plan);
                setDependents(res.data.dependents || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id, token]);

    const handleAddDependent = () => {
        if (!newDep.name.trim() || !newDep.relationship.trim()) {
            Swal.fire({ icon: "error", title: "Please fill all fields." });
            return;
        }
        axiosInstance.post(
            "/medicalRecords/addEmployeeDependent",
            {
                employee_plan_id: id,
                ...newDep
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )
        .then(() => {
            setDependents(deps => [...deps, newDep]);
            setAddOpen(false);
            setNewDep({ name: "", relationship: "" });
            Swal.fire({ icon: "success", title: "Dependent added! Pending admin review." });
        })
        .catch(() => {
            Swal.fire({ icon: "error", title: "Failed to add dependent." });
        });
    };

    // Filter dependents by search
    const filteredDependents = useMemo(() => {
        if (!search) return dependents;
        return dependents.filter(dep =>
            (dep.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (dep.relationship?.toLowerCase() || "").includes(search.toLowerCase())
        );
    }, [dependents, search]);

    if (loading) {
        return (
            <Layout title="Group Life Plan Details">
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                    <CircularProgress />
                </Box>
            </Layout>
        );
    }

    if (!plan) {
        return (
            <Layout title="Group Life Plan Details">
                <Typography>No plan found</Typography>
            </Layout>
        );
    }

    return (
        <Layout title="Group Life Plan Details">
            <Box sx={{ mx: "auto", width: { xs: "100%", md: "1100px" }, px: { xs: 1, md: 3, px:3 } }}>
                <Box sx={{
                    mt: 5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                   
                }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {plan.plan_name}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <IconButton
                        onClick={() => navigate(-1)}
                            sx={{
                                color: "#333", // dark gray/black
                                backgroundColor: "transparent",
                                border: "1px solid #ddd",
                                width: 40,
                                height: 40,
                                "&:hover": {
                                backgroundColor: "#f5f5f5"
                                }
                            }}
                        >
                        <CloseIcon />
                        </IconButton>
                        {/* If you want to add assign, edit, delete plan buttons, uncomment below */}
                        {/* <Button variant="contained" sx={{ backgroundColor: "#388e3c" }}>ASSIGN</Button>
                        <Button variant="contained" sx={{ backgroundColor: "#388e3c" }}>EDIT PLAN</Button>
                        <Button variant="contained" sx={{ backgroundColor: "#d32f2f" }}>DELETE PLAN</Button> */}
                    </Box>
                </Box>

                {/* DETAILS CARD */}
                <Paper elevation={3} sx={{
                    borderRadius: 3,
                    p: { xs: 2, md: 4 },
                    mb: 4,
                    width: "100%",
                    boxSizing: "border-box"
                }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", mb: 4, textAlign: "left" }}>
                        Group Life Details
                    </Typography>
                    <Grid container spacing={3} alignItems="center" justifyContent="space-between">
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", display: "inline-block", mr: 1 }}>
                                Payment Type:
                            </Typography>
                            <Typography variant="h6" sx={{ display: "inline-block" }}>
                                {plan.type || "N/A"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", display: "inline-block", mr: 1 }}>
                                Employer Share:
                            </Typography>
                            <Typography variant="h6" sx={{ display: "inline-block" }}>
                                {plan.employer_share !== undefined
                                    ? `₱${parseFloat(plan.employer_share).toFixed(2)}`
                                    : "N/A"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", display: "inline-block", mr: 1 }}>
                                Employee Share:
                            </Typography>
                            <Typography variant="h6" sx={{ display: "inline-block" }}>
                                {plan.employee_share !== undefined
                                    ? `₱${parseFloat(plan.employee_share).toFixed(2)}`
                                    : "N/A"}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* DEPENDENTS CARD */}
                <Paper elevation={3} sx={{
                    borderRadius: 3,
                    p: 4,
                    mb: 4,
                    boxShadow: "0px 8px 24px #00000014"
                }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>My Dependents</Typography>
                        <Button variant="contained" onClick={() => setAddOpen(true)}>
                            Add Dependent
                        </Button>
                    </Box>
                    <FormControl variant="outlined" sx={{ width: "100%", mb: 2 }}>
                        <InputLabel htmlFor="dependent-search">Search dependents</InputLabel>
                        <OutlinedInput
                            id="dependent-search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            label="Search dependents"
                            endAdornment={
                                search && (
                                    <InputAdornment position="end">
                                        <Typography variant="body2" sx={{ color: "gray" }}>
                                            {filteredDependents.length} {filteredDependents.length === 1 ? "Match" : "Matches"}
                                        </Typography>
                                    </InputAdornment>
                                )
                            }
                        />
                    </FormControl>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Relationship</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredDependents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center">
                                        <Typography>No dependents</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDependents.map((dep, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{dep.name}</TableCell>
                                        <TableCell>{dep.relationship}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Paper>

                {/* Add Dependent Dialog */}
                <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Add Dependent</DialogTitle>
                    <DialogContent>
                        <Box sx={{ py: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Name"
                                        value={newDep.name}
                                        onChange={e => setNewDep(dep => ({ ...dep, name: e.target.value }))}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        options={relationshipOptions}
                                        value={newDep.relationship}
                                        onChange={(_, v) => setNewDep(dep => ({ ...dep, relationship: v || "" }))}
                                        renderInput={params => (
                                            <TextField {...params} label="Relationship" fullWidth />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                                <Button variant="contained" onClick={handleAddDependent}>Add</Button>
                            </Box>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default GroupLifeEmployeePlanView;