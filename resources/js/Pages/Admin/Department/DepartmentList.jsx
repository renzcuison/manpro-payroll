import React, { useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Box, Typography, Button, TextField, Grid, Checkbox, ListItemText,
MenuItem, Avatar, InputAdornment, Tooltip, Menu } from "@mui/material";
import { Link } from "react-router-dom";
import { useDepartments } from "../../../hooks/useDepartments";
import Layout from "../../../components/Layout/Layout";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";
import DepartmentPositionSettings from "./Modals/DepartmentPositionSettings";
import SearchIcon from "@mui/icons-material/Search";
import DepartmentAdd from "./Modals/DepartmentAdd";

const DepartmentList = () => {
    const [searchKeyword, setSearchKeyword] = useState("");
    const {departmentsWithPositions, departmentPositions} = useDepartments({loadDeptWithPositions: true, loadDeptPositions: true});
    const departments = departmentsWithPositions.data?.departments || [];
    const deptPositions = departmentPositions.data?.positions || [];

    // Add Department Modal
    const [openAddModal, setOpenAddModal] = useState(false);
    
    // Department Positions Settings Modal
    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    

    // Add Button Dropdown
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const filteredDepartments = departments.filter(dep =>
        dep.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    // Add Button Dropdown Handlers
    const handleAddClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAddClose = () => {
        setAnchorEl(null);
    };

    const handleOpenDepartmentAddModal = () => {
        handleAddClose();
        setOpenAddModal(true);
    };
    const handleCloseDepartmentAddModal = (reload) =>{
        setOpenAddModal(false);
        if(reload){
            departmentsWithPositions.refetch();
        }
    }

    const handleOpenDepartmentSettingsModal = () => {
        handleAddClose();
        setOpenSettingsModal(true);
    };
    
    const handleCloseDepartmentSettingsModal = () => {
        setOpenSettingsModal(false);
        departmentPositions.refetch();
    }

    // console.log(departments)
    return (
        <Layout title={"Departments"}>
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
                            Departments
                        </Typography>

                        <Grid item>
                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={handleAddClick}
                                sx={{ backgroundColor: '#177604', color: 'white' }}
                                endIcon={<  i className="fa fa-caret-down"></i>}
                            >
                                <p className="m-0">
                                    Menu
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
                                <MenuItem onClick={handleOpenDepartmentAddModal}>
                                    <ListItemText>Add New Department</ListItemText>
                                </MenuItem>
                                {/* <MenuItem onClick={handleOpenDepartmentSettingsModal}> */}
                                    {/* <ListItemText>Department Positions Settings</ListItemText> */}
                                {/* </MenuItem> */}
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
                        <Grid container spacing={2} sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }}>
                            <Grid item xs={9}>
                                <TextField
                                    fullWidth
                                    label="Search Department"
                                    variant="outlined"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                {/* Empty grid item for alignment */}
                            </Grid>
                        </Grid>

                        {departmentsWithPositions.isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer sx={{ mt: 3, maxHeight: 500 }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow >
                                                <TableCell align='center' sx={{ fontWeight: 'bold'}}>Department</TableCell>
                                                {deptPositions.length > 0 ? (
                                                    deptPositions.map((position) => (
                                                        <TableCell key={position.id} align="center" sx={{ fontWeight: 'bold' }}>
                                                        {position.name}
                                                        </TableCell>
                                                    ))
                                                ) : (
                                                null
                                                )}
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>No. of Employees</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {filteredDepartments.length > 0 ? (
                                                filteredDepartments.map((dep) => {
                                                
                                                //get all employees <used for counting>
                                                const allEmployees = [
                                                    ...(dep.assigned_positions?.flatMap(pos => pos.employees || []) || []),
                                                    ...(dep.unassigned_employees || [])
                                                  ];
                                    
                                                // Group by department_position_id
                                                const groupedByPosition = dep.assigned_positions?.reduce((acc, pos) => {
                                                    acc[pos.id] = pos.employees || [];
                                                    return acc;
                                                }, {});
                                                
                                                //store unassigned <will be useful for later implementation>
                                                const groupedUnassigned = dep.unassigned_employees || [];

                                                return (
                                                    <TableRow key={dep.id} sx={{
                                                        '&:hover': {
                                                          backgroundColor: '#f0f0f0', 
                                                        },
                                                      }}>
                                                        {/* Department Name */}
                                                        <TableCell>
                                                            <Link
                                                            to={`/admin/department/${dep.id}`}
                                                            style={{
                                                                textDecoration: "none",
                                                                color: "inherit",
                                                                display: "block",
                                                                width: "100%",
                                                                height: "100%",
                                                                padding: "16px",
                                                            }}
                                                            >
                                                                <Box display="flex" alignItems="center" justifyContent="center" >
                                                                    {dep.name}
                                                                </Box>
                                                            </Link>
                                                        </TableCell>

                                                    {/* Per-Position Employee Avatars */}
                                                    {deptPositions.map((position) => {
                                                        const employees = groupedByPosition[position.id] || [];
                                                        return (
                                                        <TableCell key={position.id} align="center">
                                                            {employees.length > 0 ? (
                                                            <Box display="flex" justifyContent="center">
                                                                {employees.map((emp) => (
                                                                <Tooltip
                                                                    key={emp.id}
                                                                    title={`${emp.first_name} ${emp.last_name}`}
                                                                    arrow
                                                                    placement="top"
                                                                >
                                                                    <Avatar
                                                                    src={
                                                                        emp.avatar && emp.avatar_mime
                                                                        ? `data:${emp.avatar_mime};base64,${emp.avatar}`
                                                                        : "/default-avatar.png"
                                                                    }
                                                                    alt={`${emp.first_name} ${emp.last_name}`}
                                                                    sx={{ width: 32, height: 32, cursor: "pointer", mx: 0.2 }}
                                                                    />
                                                                </Tooltip>
                                                                ))}
                                                            </Box>
                                                            ) : (
                                                            <Typography>-</Typography>
                                                            )}
                                                        </TableCell>
                                                        );
                                                    })}

                                                    {/* Total Employee Count */}
                                                        <TableCell align="center">{allEmployees.length}</TableCell>
                                                    </TableRow>
                                                    );
                                                    }
                                                    )
                                            ) : (
                                                <TableRow>
                                                <TableCell colSpan={2 + deptPositions.length}>
                                                    No department found
                                                </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                
                                {filteredDepartments.length > 0 && (
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
                                        <Typography sx={{ mr: 2 }}> Number of Departments:</Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            {filteredDepartments.length}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Add New Department Modal */}
            {openAddModal && <DepartmentAdd open={openAddModal} close={handleCloseDepartmentAddModal}></DepartmentAdd>}

            {/* Department Positions Settings Modal */}
            {openSettingsModal && <DepartmentPositionSettings open={openSettingsModal} close={handleCloseDepartmentSettingsModal}></DepartmentPositionSettings>}
        </Layout>
    );
};

export default DepartmentList;