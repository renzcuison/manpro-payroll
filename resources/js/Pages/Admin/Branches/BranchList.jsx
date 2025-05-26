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
        "Assigned Manager",
        "Assigned Supervisor",
        "Number of Employees",
        "Assigned Approver"
    ]);

    const [openModal, setOpenModal] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [acronymError, setAcronymError] = useState(false);
    const [name, setName] = useState("");
    const [acronym, setAcronym] = useState("");
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

    const filteredBranches = branches.filter((bran) =>
        bran.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    const checkInput = (event) => {
        event.preventDefault();

        setNameError(!name);
        setAcronymError(!acronym);

        if (!name || !acronym) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
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
            acronym: acronym,
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
                        setBranches(prev => [...prev, response.data.branches]);
                        setName("");
                        setAcronym("");
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

                         <Grid item>
                                <Button 
                                variant="contained" 
                                color="primary"
                                onClick={() => setOpenModal(true)}
                                sx={{ backgroundColor: '#177604', color: 'white' }}
                                >
                                <p className="m-0">
                                    <i className="fa fa-plus mr-2"></i> Add Branches
                                </p>
                                </Button>
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
                        <Grid container spacing={2} sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }}>
                            <Grid item xs={9}>
                                <TextField
                                    fullWidth
                                    label="Search Branch"
                                    variant="outlined"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={3}>
                               
                            </Grid>
                            <Grid container justifyContent="flex-end">
 
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
                                                {selectedColumns.includes("Assigned Manager") && (
                                                    <TableCell align="center">Assigned Manager</TableCell>
                                                )}
                                                {selectedColumns.includes("Assigned Supervisor") && (
                                                    <TableCell align="center">Assigned Supervisor</TableCell>
                                                )}
                                                {selectedColumns.includes("Approver") && (
                                                    <TableCell align="center">Approver</TableCell>
                                                )}
                                                {selectedColumns.includes("Number of Employees") && (
                                                    <TableCell align="center">No. of Employees</TableCell>
                                                )}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredBranches.length > 0 ? (
                                                filteredBranches.map((bran) => (
                                                    <TableRow 
                                                        key={bran.id}
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
                                                                to={`/admin/branches/${bran.id}`}
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
                                                                    {bran.name}
                                                                </Box>
                                                            </Link>
                                                        </TableCell>
                                                        {selectedColumns.includes("Assigned Manager") && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/branches/${bran.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    {bran.manager_name ? (
                                                                        <Box display="flex" alignItems="center" justifyContent="center">
                                                                            <Avatar 
                                                                                src={bran.manager_avatar} 
                                                                                sx={{ mr: 2, width: 32, height: 32 }}
                                                                            />
                                                                            {bran.manager_name}
                                                                        </Box>
                                                                    ) : "-"}
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                        {selectedColumns.includes("Assigned Supervisor") && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/branches/${bran.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    {bran.supervisor_name ? (
                                                                        <Box display="flex" alignItems="center" justifyContent="center">
                                                                            <Avatar 
                                                                                src={bran.supervisor_avatar} 
                                                                                sx={{ mr: 2, width: 32, height: 32 }}
                                                                            />
                                                                            {bran.supervisor_name}
                                                                        </Box>
                                                                    ) : "-"}
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                        {selectedColumns.includes("Approver") && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/branches/${bran.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    {bran.approver_name ? (
                                                                        <Box display="flex" alignItems="center" justifyContent="center">
                                                                            <Avatar 
                                                                                src={bran.approver_avatar} 
                                                                                sx={{ mr: 2, width: 32, height: 32 }}
                                                                            />
                                                                            {bran.approver_name}
                                                                        </Box>
                                                                    ) : "-"}
                                                                </Link>
                                                            </TableCell>
                                                        )}
                                                        {selectedColumns.includes("Number of Employees") && (
                                                            <TableCell align="center">
                                                                <Link
                                                                    to={`/admin/branches/${bran.id}`}
                                                                    style={{
                                                                        textDecoration: "none",
                                                                        color: "inherit",
                                                                        display: "block",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        padding: "16px"
                                                                    }}
                                                                >
                                                                    {bran.employees_count || "0"}
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
                                            Number of branches:
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

            {/*  Add branches Modal */}
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
                                marginBottom: 3, width: '66%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="name"
                                    label="Name"
                                    variant="outlined"
                                    value={name}
                                    error={nameError}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="acronym"
                                    label="Acronym"
                                    variant="outlined"
                                    value={acronym}
                                    error={acronymError}
                                    onChange={(e) => setAcronym(e.target.value)}
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
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save branches </p>
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default BranchList;