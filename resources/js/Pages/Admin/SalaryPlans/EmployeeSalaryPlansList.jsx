import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Grid, TextField, FormControl, CircularProgress, Button, IconButton} from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from "sweetalert2";
import { Link } from 'react-router-dom';

import SalaryGradeAdd from './Modals/SalaryGradeAdd';
import SalaryGradeEdit from './Modals/SalaryGradeEdit';

const SalaryPlans = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    
    const [isLoading, setIsLoading] = useState(true);
    const [salaryPlans, setSalaryPlans] = useState([]);
    const [loadSalaryGrade, setLoadSalaryGrade] = useState(null);
    const [openAddSalaryGrade, setOpenAddSalaryGrade] = useState(false);
    const [openEditSalaryGrade, setOpenEditSalaryGrade] = useState(false);

    const [page, setPage] = useState(0); // 0-based for TablePagination
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchSalaryPlans();
    }, [page, rowsPerPage]);    

    const fetchSalaryPlans = () => {
        axiosInstance
            .get("/getSalaryPlans", {
                headers,
                params: {
                    page: page + 1, // backend is usually 1-based
                    limit: rowsPerPage,
                }
            })
            .then((response) => {
                setSalaryPlans(response.data.salaryPlans || []);
                setTotalCount(response.data.totalCount || 0); // Make sure your backend returns this
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching salary plans:", error);
                setIsLoading(false);
            });
    };

    //Add Salary Plan Functions
    const handleOpenAddSalaryGrade = () => {
        setOpenAddSalaryGrade(true);
    }

    const handleCloseAddSalaryGrade = () => {
        setOpenAddSalaryGrade(false);
        fetchSalaryPlans();
    }

    // Edit Salary Plan Functions
    const handleOpenEditSalaryGrade = (salaryGrade) => {
        setLoadSalaryGrade(salaryGrade)
        setOpenEditSalaryGrade(true);
    }

    const handleCloseEditSalaryGrade = () => {
        setOpenEditSalaryGrade(false);
        fetchSalaryPlans();
    }

    //Pagination Functions
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Layout title={"Salary Plans"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', my: 5, width: { xs: '100%', md: '1400px' } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            &nbsp; Salary Plans
                        </Typography>

                        <Button variant="contained" color="primary" onClick={handleOpenAddSalaryGrade}>
                            <p className='m-0'><i className="fa fa-plus"></i> Add </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', fontSize: 16, width: "20%" }} align="center"> Salary Grade </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', fontSize: 16, width: "80%" }} align="center"> Amount </TableCell>
                                                {/* <TableCell sx={{ fontWeight: 'bold', fontSize: 16, width: "20%" }} align="center"> Actions </TableCell> */}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {salaryPlans.length > 0 ? (
                                                salaryPlans.map((salaryPlan) => (
                                                    // onClick={() => setOpenEditSalaryType(salaryPlan)}
                                                    <TableRow key={salaryPlan.id} sx={{ p: 1, "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer" }}} onClick={() => handleOpenEditSalaryGrade(salaryPlan)}>
                                                        <TableCell sx={{fontSize: 14}} align="center">Grade {salaryPlan.salary_grade}</TableCell>
                                                        <TableCell sx={{ fontSize: 14 }} align="center">
                                                            ₱ {Number(salaryPlan.amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        {/* <TableCell sx={{fontSize: 14}} align="center">
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => handleOpenEditSalaryGrade(salaryPlan)}
                                                                aria-label="edit"
                                                                size="small"
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                color="error"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleDeleteSalaryGrade(salaryPlan);
                                                                }}
                                                                aria-label="delete"
                                                                size="small"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell> */}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center"> No Salary Plans </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                {/* Pagination controls */}
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <TablePagination
                                        rowsPerPageOptions={[10, 25, 50]}
                                        component="div"
                                        count={totalCount}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
                {openAddSalaryGrade &&
                    <SalaryGradeAdd open={openAddSalaryGrade} close={handleCloseAddSalaryGrade} existingSalaryGrades={salaryPlans.map(plan => plan.salary_grade)} />
                }
                {openEditSalaryGrade &&
                    <SalaryGradeEdit open={openEditSalaryGrade} close={handleCloseEditSalaryGrade} salaryGradeInfo={loadSalaryGrade} onDeleted={fetchSalaryPlans}/>
                }
            </Box>
        </Layout>
    );


}
export default SalaryPlans;