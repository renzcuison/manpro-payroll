import React, { useEffect, useState } from "react";
import {Link, useParams, useNavigate, useAsyncError } from "react-router-dom";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import Layout from "../../../components/Layout/Layout";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";
import {Box,Typography,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Button,Avatar,Grid,TextField,
FormControl,InputLabel,Select,MenuItem,InputAdornment, Menu, ListItemText} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import DepartmentEdit from "./Modals/DepartmentEdit";
import DepartmentAssignPosition from "./Modals/DepartmentAssignPosition";

const DepartmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [department, setDepartment] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [branchFilter, setBranchFilter] = useState("all");
    const [branches, setBranches] = useState([]);

    const [openEditModal, setOpenEditModal] = useState(false);
    const [openPositionAssignModal, setOpenPositionAssignModal] = useState(false);
    //modal handlings
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleAddClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAddClose = () => {
        setAnchorEl(null);
    };

    const handleOpenEditModal = () => {
        handleAddClose();
        setOpenEditModal(true);
    }
    const handleCloseEditModal = (reload) => {
        setOpenEditModal(false);
        if(reload){
            fetchBranches();
            fetchDepartmentDetail();
        }
    }

    const handleOpenPositionAssignModal = () => {
        handleAddClose();
        setOpenPositionAssignModal(true)
    }
    const handleClosePositionAssignModal = (reload) => {
        setOpenPositionAssignModal(false)
        if(reload){
            fetchDepartmentDetail();
            fetchBranches();
        }
    }
    //end of modal handlings

    useEffect(() => {
        fetchBranches();
        fetchDepartmentDetail();
    }, [id]);

    //fetching data 
    const fetchDepartmentDetail = () => {
        axiosInstance.get(`/settings/getDepartmentDetails/${id}`, { headers }).then((response) => {
            setDepartment(response.data.department);
            setIsLoading(false);
        });
    }
    const fetchBranches = () => {
        axiosInstance.get('/settings/getBranches', { headers }).then((response) => {
            setBranches(response.data.branches);
            setIsLoading(false);
        }); 
    }
    //end of fetching data
    const filteredEmployees = department?.employees
    ?.filter(emp => {
        const nameMatch = `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchKeyword.toLowerCase());
        const branchMatch = branchFilter === "all" || emp.branch_id === branchFilter;
        return nameMatch && branchMatch;
    }) || [];
    if (error) return (
        <Layout title={"Departments"}>
            <Typography color="error">{error}</Typography>
        </Layout>
    );
    
    if (!department) return (
        <Layout title={"Departments"}>
            <Typography></Typography>
        </Layout>
    );

    return (
        <Layout title={"Departments"}>
            {isLoading ? (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: 'calc(100vh - 200px)'
                }}>
                    <LoadingSpinner />
                </Box>
            ) : (
                <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
                    <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>

                        {/*<--Headers-->*/}
                        <Box
                            sx={{
                                mt: 5,
                                display: "flex",
                                justifyContent: "space-between",
                                px: 1,
                                alignItems: "center"
                            }}
                        >
                            <Typography variant="h4" sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i
                                    className="fa fa-chevron-left"
                                    aria-hidden="true"
                                    style={{ fontSize: '80%', cursor: 'pointer' }}
                                    onClick={() => navigate('/admin/department/departmentlist')}
                                ></i>
                                {department.name} ({department.acronym})
                            </Typography>

                            <Grid item>
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={handleAddClick}
                                    sx={{ backgroundColor: '#177604', color: 'white' }}
                                    endIcon={<i className="fa fa-caret-down"></i>}
                                >
                                    <p className="m-0">
                                        Actions
                                    </p>
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleAddClose}
                                    MenuListProps={{
                                        'aria-labelledby': 'basic-button',
                                    }}
                                >
                                    <MenuItem onClick={handleOpenEditModal}>
                                        <ListItemText>Edit Department</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={handleOpenPositionAssignModal}>
                                        <ListItemText>Assign Employees</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </Grid>
                        </Box>
                        
                        {/*<--Main Content>*/}
                        <Box sx={{mt: 6, p: 3, bgcolor: "#ffffff", borderRadius: "8px",}}>
                            <Box sx={{ mt: 1 }}>
                                {/*<--Search bar and filtering system>*/}
                                <Grid container spacing={2} sx={{ pb: 4, borderBottom: "1px solid rgb(255, 253, 253)" }}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Search Employees"
                                            variant="outlined"
                                            value={searchKeyword}
                                            onChange={(e) => setSearchKeyword(e.target.value)}
                                            sx={{ minWidth: 300 }}
                                            InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                <SearchIcon />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                height: 50,
                                                fontSize: '1rem',
                                                padding: '0 10px',
                                            },
                                            }}
                                            InputLabelProps={{
                                            sx: {
                                                fontSize: '1rem',
                                            },
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={6} ml={90}>
                                        <FormControl size="medium" fullWidth>
                                            <InputLabel>Filter by Branch</InputLabel>
                                            <Select
                                                value={branchFilter}
                                                onChange={(e) => setBranchFilter(e.target.value)}
                                                label="Filter by Branch"
                                                sx={{
                                                    height: 50,                 
                                                    fontSize: '1',      
                                                    padding: '4px 10px',        
                                                    minWidth: 300,             
                                                }}
                                                >
                                                <MenuItem value="all">All Branches</MenuItem>
                                                {branches.map((branch) => (
                                                    <MenuItem key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                    </MenuItem>
                                                ))}
                                                </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            
                                {/*<--Employee Display-->*/}
                                <TableContainer sx={{ mt: 3, maxHeight: 500 }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold'}}>Employee Name</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold'}}>Assigned Position</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold'}}>Branch</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {filteredEmployees.length > 0 ? (
                                            filteredEmployees.map(emp => (
                                                <TableRow key={emp.id} sx={{ "&:last-child td, &:last-child th": { border: 0 }, "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer", }, }} >
                                                    <TableCell>
                                                        <Link to={`/admin/employee/${emp.user_name}`} style={{ textDecoration: "none", color: "inherit", }} >
                                                            <Box display="flex" sx={{ alignItems: "center", }} >
                                                                <Avatar src={emp.avatar} sx={{ mr: 2 }} />
                                                                {emp.last_name}{", "}{emp.first_name}{" "}{emp.middle_name || ""}{" "}{emp.suffix || ""}
                                                            </Box>
                                                        </Link>
                                                    </TableCell>
                                                    {emp.department_position ? (
                                                        <TableCell>
                                                            {emp.department_position.name}
                                                        </TableCell>
                                                        ):(
                                                        <TableCell>
                                                            --
                                                        </TableCell>
                                                        )
                                                    }
                                                    <TableCell>{emp.branch?.name}</TableCell>
                                                </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        No employees found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                
                                {filteredEmployees.length > 0 && (
                                    <Box display="flex" sx={{ py: 2, pr: 2, width: "100%", justifyContent: "flex-end", alignItems: "center", }} >
                                        <Typography sx={{ mr: 2 }}>
                                            Number of Employees:
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            {filteredEmployees.length}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    {openEditModal && (<DepartmentEdit open={openEditModal} close={handleCloseEditModal} departmentId={id}></DepartmentEdit>)}
                    {openPositionAssignModal && (<DepartmentAssignPosition open={openPositionAssignModal} onClose={handleClosePositionAssignModal} departmentId={id}>
                    </DepartmentAssignPosition>)}
                </Box>
                
            )}

        </Layout>
    );
};

export default DepartmentDetails;