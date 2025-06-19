import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Box,
    Typography,
    Button,
    TextField,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    CircularProgress,
    Menu,
    MenuItem,
    ListItemText
} from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const EmployeeBenefits = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();
    const [benefits, setBenefits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [fetchError, setFetchError] = useState(null);

    // Modal states
    const [openAddModal, setOpenAddModal] = useState(false);
    const [newBenefit, setNewBenefit] = useState({
        name: "",
        type: "Percentage",
        employee_percentage: "",
        employer_percentage: "",
        employee_amount: "",
        employer_amount: ""
    });
    const [nameError, setNameError] = useState(false);

    // Menu states
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setFetchError(null);

                const response = await axiosInstance.get("/benefits/getBenefits", { headers });
                setBenefits(response.data?.benefits || []);

            } catch (error) {
                console.error("Error in fetchData:", error);
                setFetchError(error.message);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Error loading data! Please try again.",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredBenefits = React.useMemo(() => {
        return benefits.filter(benefit => 
            benefit.name?.toLowerCase().includes(searchKeyword.toLowerCase())
        );
    }, [benefits, searchKeyword]);

    const handleAddClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAddClose = () => {
        setAnchorEl(null);
    };

    const handleAddNew = () => {
        handleAddClose();
        setOpenAddModal(true);
        setNewBenefit({
            name: "",
            type: "Percentage",
            employee_percentage: "",
            employer_percentage: "",
            employee_amount: "",
            employer_amount: ""
        });
    };

    const validateBenefitInput = () => {
        const valid = newBenefit.name;
        setNameError(!newBenefit.name);
        
        if (newBenefit.type === "Percentage") {
            return valid && newBenefit.employee_percentage && newBenefit.employer_percentage;
        } else {
            return valid && newBenefit.employee_amount && newBenefit.employer_amount;
        }
    };

    const saveBenefit = async (event) => {
        event.preventDefault();
        
        if (!validateBenefitInput()) {
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
            const data = {
                benefitName: newBenefit.name,
                benefitType: newBenefit.type,
                employeeAmount: newBenefit.employee_amount,
                employerAmount: newBenefit.employer_amount,
                employeePercentage: newBenefit.employee_percentage,
                employerPercentage: newBenefit.employer_percentage,
            };

            const response = await axiosInstance.post('/benefits/saveBenefit', data, { headers });

            if (response.data.status === 200) {
                setBenefits(prev => [...prev, response.data.benefit]);
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "Benefit saved successfully!",
                    icon: "success",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
                setOpenAddModal(false);
            }
        } catch (error) {
            console.error("Error saving benefit:", error);
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Error saving benefit!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        }
    };

    const renderBenefitsTable = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (fetchError) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">Error loading data: {fetchError}</Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => window.location.reload()}
                        sx={{ mt: 2, backgroundColor: '#177604' }}
                    >
                        Retry
                    </Button>
                </Box>
            );
        }

        if (benefits.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>No benefits found. Please add a new benefit.</Typography>
                </Box>
            );
        }

        if (filteredBenefits.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>No benefits match your search criteria.</Typography>
                </Box>
            );
        }

        return (
            <TableContainer sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow 
                            //key={benefit.uid} 
                            hover 
                            onClick={() => navigate(`/admin/benefits/${benefit.uid}`)}
                            sx={{ cursor: 'pointer' }}
                        >
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Employee Share</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Employer Share</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                            {filteredBenefits.map((benefit) => (
                                <TableRow 
                                    key={benefit.uid} 
                                    hover 
                                     onClick={() => navigate(`/employees/benefits/${benefit.uid}`)} 
                                    sx={{ cursor: 'pointer' }}
                                >

                                <TableCell align="left">{benefit.name}</TableCell>
                                <TableCell align="center">{benefit.type}</TableCell>
                                
                                {benefit.type === "Percentage" ? (
                                    <>
                                        <TableCell align="center">{benefit.employee_percentage}%</TableCell>
                                        <TableCell align="center">{benefit.employer_percentage}%</TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell align="center">₱{benefit.employee_amount}</TableCell>
                                        <TableCell align="center">₱{benefit.employer_amount}</TableCell>
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <Layout title={"Employee Benefits"}>
            <Box sx={{ overflowX: "auto", width: "100%" }}>
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
                    <Box
                        sx={{
                            mt: 5,
                            display: "flex",
                            justifyContent: "space-between",
                            px: 1,
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Employee Benefits
                        </Typography>

                        <Grid item>
                            <Button 
                                variant="contained" 
                                onClick={handleAddClick}
                                sx={{ backgroundColor: '#177604', color: 'white' }}
                                endIcon={<i className="fa fa-caret-down"></i>}
                            >
                                <i className="fa fa-plus mr-2"></i> Add
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleAddClose}
                            >
                                <MenuItem onClick={handleAddNew}>
                                    <ListItemText>Add New Benefit</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Grid>
                    </Box>

                    <Box
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        <Grid container spacing={2} sx={{ pb: 4 }}>
                            <Grid item xs={12} md={9}>
                                <TextField
                                    fullWidth
                                    label="Search Benefits"
                                    variant="outlined"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <i className="fa fa-search mr-2"></i>
                                        )
                                    }}
                                />
                            </Grid>
                        </Grid>

                        {renderBenefitsTable()}
                        
                        {filteredBenefits.length > 0 && (
                            <Box
                                display="flex"
                                sx={{
                                    py: 2,
                                    pr: 2,
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                }}
                            >
                                <Typography sx={{ mr: 2 }}>
                                    Showing {filteredBenefits.length} of {benefits.length} benefits
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>


        </Layout>
    );
};

export default EmployeeBenefits;