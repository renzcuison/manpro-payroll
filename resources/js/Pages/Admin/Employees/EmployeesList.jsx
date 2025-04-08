import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress, Avatar, FormControl, FormControlLabel, Checkbox, ListItemText } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';

const EmployeesList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);

    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);

    const [searchName, setSearchName] = useState('');

    useEffect(() => {
        axiosInstance.get('/employee/getEmployees', { headers })
            .then((response) => {
                setEmployees(response.data.employees);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching clients:', error);
                setIsLoading(false);
            });

        axiosInstance.get('/settings/getDepartments', { headers })
            .then((response) => {
                const fetchedDepartments = response.data.departments;
                setDepartments(fetchedDepartments);
                const allDepartmentIds = fetchedDepartments.map((department) => department.id);
                setSelectedDepartments(allDepartmentIds);
            })
            .catch((error) => {
                console.error('Error fetching departments:', error);
            });

        axiosInstance.get('/settings/getBranches', { headers })
            .then((response) => {
                const fetchedBranches = response.data.branches;
                setBranches(fetchedBranches);

                const allBranchIds = fetchedBranches.map((branch) => branch.id);
                setSelectedBranches(allBranchIds);
            })
            .catch((error) => {
                console.error('Error fetching branches:', error);
            });

    }, []);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const [blobMap, setBlobMap] = useState({});

    const renderImage = (id, data, mime) => {
        if (!blobMap[id]) {
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mime });
            const newBlob = URL.createObjectURL(blob);

            setBlobMap((prev) => ({ ...prev, [id]: newBlob }));

            return newBlob;
        } else {
            return blobMap[id];
        }
    }

    useEffect(() => {
        return () => {
            Object.values(blobMap).forEach((url) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            setBlobMap({});
        };
    }, []);

    const filteredEmployees = employees.filter((employee) => {
        const fullName = `${employee.first_name} ${employee.middle_name || ''} ${employee.last_name} ${employee.suffix || ''}`.toLowerCase();
        return fullName.includes(searchName.toLowerCase());
    });

    return (
        <Layout title={"EmployeesList"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Employees </Typography>

                        {/*
                        <Link to="/admin/employees/add">
                            <Button variant="contained" color="primary">
                                <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                            </Button>
                        </Link>
                         */}

                        <Button id="employee-menu" variant="contained" color="primary" aria-controls={open ? 'emp-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleMenuOpen} >
                            <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                        </Button>
                        <Menu id="emp-menu" anchorEl={anchorEl} open={open} onClose={handleMenuClose} MenuListProps={{ 'aria-labelledby': 'employee_menu' }} >
                            <MenuItem component={Link} to="/admin/employees/add" onClick={handleMenuClose}> Add Employee </MenuItem>
                            <MenuItem component={Link} to="/admin/employees/formlinks" onClick={handleMenuClose}> Employee Form Links </MenuItem>
                        </Menu>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        <Grid container direction="row" justifyContent="space-between" sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }} >
                            <Grid container item direction="row" justifyContent="flex-start" xs={4} spacing={2}>
                                <Grid item xs={6}>
                                    <FormControl sx={{ width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                    }}>
                                        <TextField
                                            id="searchName"
                                            label="Search Name"
                                            variant="outlined"
                                            value={searchName}
                                            onChange={(e) => setSearchName(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    
                                </Grid>
                            </Grid>
                            <Grid container item direction="row" justifyContent="flex-end" xs={4} spacing={2}>
                                <Grid item xs={6}>
                                    {/* <FormControl sx={{width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                    }}>
                                        <TextField
                                            select
                                            id="department"
                                            label="Department"
                                            value={selectedDepartments}
                                            SelectProps={{
                                                multiple: true,
                                                renderValue: (selected) => departments.filter((department) => selected.includes(department.id)).map((department) => department.acronym).join(', ')
                                            }}
                                        >
                                            {departments.map((department) => (
                                                <MenuItem
                                                    key={department.id}
                                                    value={department.id}
                                                    onClick={() => {
                                                        setSelectedDepartments((prevSelected) => prevSelected.includes(department.id) ? prevSelected.filter((id) => id !== department.id) : [...prevSelected, department.id] );
                                                    }}
                                                >
                                                    <Checkbox checked={selectedDepartments.includes(department.id)} />
                                                    <ListItemText primary={`${department.name} (${department.acronym})`} />
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </FormControl> */}
                                </Grid>
                                <Grid item xs={6}>
                                    {/* <FormControl sx={{width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                        '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                                    }}>
                                        <TextField
                                            select
                                            id="branch"
                                            label="Branch"
                                            value={selectedBranches}
                                            SelectProps={{
                                                multiple: true,
                                                renderValue: (selected) => branches.filter((branch) => selected.includes(branch.id)).map((branch) => branch.acronym).join(', ')
                                            }}
                                        >
                                            {branches.map((branch) => (
                                                <MenuItem
                                                    key={branch.id}
                                                    value={branch.id}
                                                    onClick={() => {
                                                        setSelectedBranches((prevSelected) => prevSelected.includes(branch.id) ? prevSelected.filter((id) => id !== branch.id) : [...prevSelected, branch.id]);
                                                    }}
                                                >
                                                    <Checkbox checked={selectedBranches.includes(branch.id)} />
                                                    <ListItemText primary={`${branch.name} (${branch.acronym})`} />
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </FormControl> */}
                                </Grid>
                            </Grid>
                        </Grid>

                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Name</TableCell>
                                                <TableCell align="center">Branch</TableCell>
                                                <TableCell align="center">Department</TableCell>
                                                <TableCell align="center">Role</TableCell>
                                                <TableCell align="center">Status</TableCell>
                                                <TableCell align="center">Type</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {filteredEmployees.map((employee) => (
                                                <TableRow key={employee.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                                    <TableCell align="left">
                                                        <Link to={`/admin/employee/${employee.user_name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            <Box display="flex" sx={{ alignItems: "center" }}>
                                                                <Avatar src={renderImage(employee.id, employee.avatar, employee.avatar_mime)} sx={{ mr: 2 }} />
                                                                {employee.first_name} {employee.middle_name || ''} {employee.last_name} {employee.suffix || ''}
                                                            </Box>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Link to={`/admin/employee/${employee.user_name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            {employee.branch || '-'}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Link to={`/admin/employee/${employee.user_name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            {employee.department || '-'}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Link to={`/admin/employee/${employee.user_name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            {employee.role || '-'}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Link to={`/admin/employee/${employee.user_name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            {employee.employment_status || '-'}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Link to={`/admin/employee/${employee.user_name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            {employee.employment_type || '-'}
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>

                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>

                </Box>
            </Box>
        </Layout >
    )
}

export default EmployeesList