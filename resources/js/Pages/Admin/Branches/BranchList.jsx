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
    Checkbox,
    ListItemText,
    MenuItem,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    FormGroup,
    FormControl
} from "@mui/material";
import { Link } from "react-router-dom";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";
import Swal from "sweetalert2";

const BranchList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [branches, setBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedColumns, setSelectedColumns] = useState([
        "Location",
        "Contact Number",
        "Number of Employees"
    ]);

    const [openModal, setOpenModal] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [locationError, setLocationError] = useState(false);
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        axiosInstance
            .get("/settings/getBranches", { headers })
            .then((response) => {
                setBranches(response.data.branches || []);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching branches:", error);
                setIsLoading(false);
            });
    }, []);

    const filteredBranches = branches.filter((branch) =>
        branch.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    const checkInput = (event) => {
        event.preventDefault();

        setNameError(!name);
        setLocationError(!location);

        if (!name || !location) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All required fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "This branch will be added",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Add",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            name: name,
            location: location,
            contact_number: contactNumber,
            description: description
        };

        axiosInstance.post('/settings/saveBranch', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Branch saved successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        setBranches(prev => [...prev, response.data.branch]);
                        setName("");
                        setLocation("");
                        setContactNumber("");
                        setDescription("");
                        setOpenModal(false);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <Layout title={"Branches"}>
            <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
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
                        <Typography variant="h4" sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center' }}>
                            Branches
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        <Grid container spacing={2} sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }}>
                            <Grid item xs={12} md={9}>
                                <TextField
                                    fullWidth
                                    label="Search Branch"
                                    variant="outlined"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={() => setOpenModal(true)}
                                    sx={{ 
                                        backgroundColor: '#177604', 
                                        color: 'white',
                                        height: '56px',
                                        maxWidth: '200px',
                                        ml: 'auto' 
                                    }}
                                >
                                    <Box component="span" display="flex" alignItems="center" gap={1}>
                                        <i className="fa fa-plus"></i> Add Branch
                                    </Box>
                                </Button>
                            </Grid>
                        </Grid>

                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer sx={{ mt: 3, maxHeight: 500 }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Branch</TableCell>
                                                {selectedColumns.includes("Location") && (
                                                    <TableCell align="center">Location</TableCell>
                                                )}
                                                {selectedColumns.includes("Contact Number") && (
                                                    <TableCell align="center">Contact Number</TableCell>
                                                )}
                                                {selectedColumns.includes("Number of Employees") && (
                                                    <TableCell align="center">No. of Employees</TableCell>
                                                )}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredBranches.length > 0 ? (
                                                filteredBranches.map((branch) => (
                                                    <TableRow 
                                                        key={branch.id}
                                                        hover
                                                        sx={{ 
                                                            cursor: "pointer",
                                                            "&:hover": {
                                                                backgroundColor: "rgba(0, 0, 0, 0.1)"
                                                            }
                                                        }}
                                                    >
                                                        <TableCell align="center">
                                                            <Link
                                                                to={`/admin/branch/${branch.id}`}
                                                                style={{
                                                                    textDecoration: "none",
                                                                    color: "inherit",
                                                                    display: "block",
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    padding: "16px"
                                                                }}
                                                            >
                                                                <Box 
                                                                    display="flex" 
                                                                    alignItems="center"
                                                                    justifyContent="center"
                                                                >
                                                                    {branch.name}
                                                                </Box>
                                                            </Link>
                                                        </TableCell>
                                                        {selectedColumns.includes("Location") && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/branch/${branch.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    {branch.location || "-"}
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                        {selectedColumns.includes("Contact Number") && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/branch/${branch.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    {branch.contact_number || "-"}
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                        {selectedColumns.includes("Number of Employees") && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/branch/${branch.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    {branch.employee_count || "0"}
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={selectedColumns.length + 1} align="center">
                                                        No branches found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                
                                {filteredBranches.length > 0 && (
                                    <Box
                                        display="flex"
                                        sx={{
                                            py: 2,
                                            pr: 2,
                                            width: "100%",
                                            justifyContent: "flex-end",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography sx={{ mr: 2 }}>
                                            Number of Branches:
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            {filteredBranches.length}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Add Branch Modal */}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: '800px',
                        maxWidth: '1000px',
                        marginBottom: '5%'
                    }
                }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Add Branch </Typography>
                        <IconButton onClick={() => setOpenModal(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="name"
                                    label="Branch Name"
                                    variant="outlined"
                                    value={name}
                                    error={nameError}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="location"
                                    label="Location"
                                    variant="outlined"
                                    value={location}
                                    error={locationError}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    id="contactNumber"
                                    label="Contact Number"
                                    variant="outlined"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    id="description"
                                    label="Description"
                                    variant="outlined"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    multiline
                                    rows={4}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Branch </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default BranchList;