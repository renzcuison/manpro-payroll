import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, CircularProgress, Avatar, Button, Menu, MenuItem } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import { Link, useParams} from 'react-router-dom';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useBenefit } from '../../../hooks/useBenefits';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


import SalaryGradeEdit from './Modals/SalaryGradeEdit';

const SalaryPlanView = () => {
    const navigate = useNavigate();
    const { gradeParam } = useParams(); 
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [openEditSalaryGrade, setOpenEditSalaryGrade] = useState(false);
    const [loadSalaryGrade, setLoadSalaryGrade] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [existingSalaryGrades, setExistingSalaryGrades] = useState([]);

    const { benefitsData, isBenefitsLoading } = useBenefit(true);
    const benefitsList = benefitsData?.benefits || [];

    useEffect(() => {
        axiosInstance.get('/getSalaryPlans', { headers, params: { limit: 1000, page: 1 } })
            .then(res => setExistingSalaryGrades(res.data.salaryPlans || []));
    }, []);

    const [isLoading, setIsLoading] = useState(true);

    let salary_grade = gradeParam;
    let salary_grade_version = '';
    if (gradeParam.includes('-')) {
        [salary_grade, salary_grade_version] = gradeParam.split('-');
    }

    const [salaryPlan, setSalaryPlan] = useState(null);

    const handleOpenActions = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseActions = () => {
        setAnchorEl(null);
    };

    const handleOpenEditSalaryGrade = () => {
        if (salaryPlan && salaryPlan.employee_count > 0) {
            Swal.fire({
                text: "You cannot edit this salary grade. There are existing employees with this salary grade.",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        setLoadSalaryGrade(salaryPlan); // salaryPlan includes employee_count for this grade/version
        setOpenEditSalaryGrade(true);
    };

    const handleCloseEditSalaryGrade = () => {
        setOpenEditSalaryGrade(false);
    };

    const handleDeleteSalaryGrade = () => {
        if (salaryPlan && salaryPlan.employee_count > 0) {
            Swal.fire({
                text: "You cannot delete this salary grade. There are existing employees with this salary grade.",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        if (!salaryPlan) return;
        Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the salary grade.",
            icon: "warning",
            showCancelButton: true, //shiloh's here
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Delete"
        }).then((result) => {
            if (result.isConfirmed) {
                axiosInstance.post('/deleteSalaryGrade', {
                    id: salaryPlan.id
                }, { headers })
                .then(() => {
                    Swal.fire("Deleted!", "Salary grade has been deleted.", "success")
                    .then(() => {
                        // Redirect back to the salary plans list
                        window.location.href = "/admin/compensation/salary-plans";
                    });
                })
                .catch(() => {
                    Swal.fire("Error", "Failed to delete salary grade.", "error");
                });
            }
        });
    };

    useEffect(() => {
        axiosInstance.get('/getSalaryPlan', {
            params: {
                salary_grade,
                salary_grade_version
            },
            headers
        }).then(response => {
            console.log('API response:', response.data);
            setSalaryPlan(response.data.salaryPlan);
            setIsLoading(false);
        });
    }, [salary_grade, salary_grade_version]);

    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        if (salary_grade) {
            axiosInstance.get('/getEmployeesBySalaryGrade', {
                params: {
                    salary_grade,
                    salary_grade_version
                },
                headers
            }).then(res => {
                setEmployees(res.data.employees || []);
            });
        }
    }, [salary_grade, salary_grade_version]);

    return (
        <Layout title={"Salary Plan View"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', my: 5, width: '100%', px: { xs: 1, md: 3 } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> 
                            <Link to="/admin/compensation/salary-plans" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <i className="fa fa-chevron-left" aria-hidden="true" style={{ fontSize: '80%', cursor: 'pointer' }}> </i>
                            </Link>
                            &nbsp; View Salary Plan
                        </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenActions}>Actions</Button>
    
                        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseActions}>
                            <MenuItem onClick={handleOpenEditSalaryGrade}>Edit Salary Grade</MenuItem>
                            <MenuItem onClick={handleDeleteSalaryGrade}>Delete Salary Grade</MenuItem>
                        </Menu>
                    </Box>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4} sx={{width: '100%', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'}}>
                            <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px', height: '100%'}}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold'}}>Salary Grade Details</Typography>
                                <Grid container spacing={2} sx={{display: 'flex', justifyContent: 'space-around'}}>
                                    <Box sx={{display:'flex', alignItems:'center', gap:'10px'}} >
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="subtitle1" fontWeight="bold">Salary Grade:</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={8}>
                                            <Typography variant="body1">{salaryPlan ? (
                                                salaryPlan.salary_grade_version
                                                    ? `${salaryPlan.salary_grade}-${salaryPlan.salary_grade_version}`
                                                    : salaryPlan.salary_grade
                                            ) : gradeParam}
                                            </Typography>
                                        </Grid>
                                    </Box>

                                    <Box sx={{display:'flex', alignItems:'center', gap:'10px'}} >
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="subtitle1" fontWeight="bold">Amount:</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={8}>
                                            <Typography variant="body1">
                                                {salaryPlan ? `₱ ${Number(salaryPlan.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : ''}
                                            </Typography>
                                        </Grid>
                                    </Box>

                                    <Box sx={{display:'flex', alignItems:'center', gap:'10px'}} >
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="subtitle1" fontWeight="bold">Created on:</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={8}>
                                            <Typography variant="body1">
                                                {salaryPlan && salaryPlan.created_at
                                                    ? new Date(salaryPlan.created_at).toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })
                                                    : ''}
                                            </Typography>
                                        </Grid>
                                    </Box>

                                    <Box sx={{display:'flex', alignItems:'center', gap:'10px'}} >
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="subtitle1" fontWeight="bold">Updated on:</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={8}>
                                            <Typography variant="body1">
                                                {salaryPlan && salaryPlan.updated_at
                                                    ? new Date(salaryPlan.updated_at).toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })
                                                    : ''}
                                            </Typography>
                                        </Grid>
                                    </Box>

                                </Grid>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{width: '100%', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'}}>
                            <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '8px', height: '100%'}}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold'}}>Benefits Comptutation</Typography>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 200 }}>
                                    <Table aria-label="employees table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 'bold', width: '20%'}}>Benefit Name</TableCell>
                                                <TableCell align="center" sx={{fontWeight: 'bold', width: '40%'}}>Employer's Share</TableCell>
                                                <TableCell align="center" sx={{fontWeight: 'bold', width: '40%'}}>Employee's Share</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {isBenefitsLoading || !salaryPlan ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center">
                                                        <CircularProgress size={24} />
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                benefitsList.length > 0 ? (
                                                    benefitsList.map((benefit) => (
                                                        <TableRow key={benefit.id}>
                                                            <TableCell>{benefit.name}</TableCell>
                                                            <TableCell align="center">
                                                                {benefit.type === 'Amount'
                                                                    ? '₱ ' + Number(benefit.employer_amount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                                    : '₱ ' + Number((benefit.employer_percentage ?? 0) * salaryPlan.amount * 0.01).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {benefit.type === 'Amount'
                                                                    ? '₱ ' + Number(benefit.employee_amount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                                    : '₱ ' + Number((benefit.employee_percentage ?? 0) * salaryPlan.amount * 0.01).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} align="center">
                                                            No benefits found.
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8} sx={{width: '100%', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'}}>
                            <Box sx={{ mb: 4, py: 3, px: 4, bgcolor: '#ffffff', borderRadius: '8px' }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Assigned Employees</Typography>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 200 }}>
                                    <Table aria-label="employees table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" sx={{fontWeight: 'bold'}}>Name</TableCell>
                                                <TableCell align="center" sx={{fontWeight: 'bold'}}>Branch</TableCell>
                                                <TableCell align="center" sx={{fontWeight: 'bold'}}>Department</TableCell>
                                                <TableCell align="center" sx={{fontWeight: 'bold'}}>Role</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {employees.length > 0 ? (
                                                employees.map((employee, index) => (
                                                    <TableRow
                                                        key={employee.id || index}
                                                    >
                                                        <TableCell align="left">
                                                                {employee.last_name}, {employee.first_name} {employee.middle_name || ''} {employee.suffix || ''}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                        {employee.branch_name || '-'} {employee.branch_acronym ? `(${employee.branch_acronym})` : ''}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                        {employee.department_name || '-'} {employee.department_acronym ? `(${employee.department_acronym})` : ''}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                        {employee.role_name || '-'} {employee.role_acronym ? `(${employee.role_acronym})` : ''}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        No employees assigned to this salary grade.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Grid>
                    </Grid>
                    )}
                </Box>
            </Box>

            {/* Modals */}
            {openEditSalaryGrade && loadSalaryGrade &&
                <SalaryGradeEdit
                    open={openEditSalaryGrade}
                    close={handleCloseEditSalaryGrade}
                    salaryGradeInfo={loadSalaryGrade}
                    existingSalaryGrades={existingSalaryGrades}
                    onUpdated={() => navigate('/admin/compensation/salary-plans')}
                    onDeleted={() => navigate('/admin/compensation/salary-plans')}
                />
            }

        </Layout >
    )
}

export default SalaryPlanView;