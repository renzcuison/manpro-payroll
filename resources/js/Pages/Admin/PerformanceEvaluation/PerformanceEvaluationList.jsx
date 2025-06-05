import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, CircularProgress, Divider } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PerformanceEvaluationAdd from './Modals/PerformanceEvaluationAdd';
import { useNavigate } from 'react-router-dom';


const PerformanceEvaluationList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const user = JSON.parse(storedUser);
    const headers = getJWTHeader(user);


    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [evaluationResponses, setEvaluationResponses] = useState([]);
    const [performanceEvaluations, setPerformanceEvaluation] = useState([]);


    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Menu Items
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);


    // Modal state for New Form
    const [modalOpen, setModalOpen] = useState(false);


    // Fetch evaluation forms for menu dropdown
    useEffect(() => {
        axiosInstance.get('/getEvaluationForms', { headers })
            .then((response) => setPerformanceEvaluation(response.data.evaluationForms || []))
            .catch(() => setPerformanceEvaluation([]));
    }, []);


    // Fetch evaluation responses for the current user (as evaluatee or evaluator)
    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get('/getEvaluationResponses', {
            headers,
            params: {
                page: page + 1,
                limit: rowsPerPage
            }
        })
        .then((response) => {
            if (response.data.status === 200) {
                setEvaluationResponses(response.data.evaluationResponses);
                setTotalCount(response.data.totalResponseCount);
            } else {
                setEvaluationResponses([]);
                setTotalCount(0);
            }
        })
        .catch(() => {
            setEvaluationResponses([]);
            setTotalCount(0);
        })
        .finally(() => setIsLoading(false));
    }, [page, rowsPerPage]);


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };


    return (
        <Layout title={"PerformanceEvaluation"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: '100%', maxWidth: '1200px' }}>
                    {/* Title */}
                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Performance Evaluation </Typography>
                    </Box>
                    {/* White Box Containing the Buttons and Table */}
                    <Box sx={{ mt: 2, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {/* Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            {/* Create Evaluation Button */}
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => navigate('/admin/performance-evaluation/create-evaluation')}
                            >
                                <i className="fa"></i> Create Evaluation
                            </Button>
                            {/* Forms Dropdown Button */}
                            <Button
                                id="performance-evaluation-menu"
                                variant="contained"
                                color="success"
                                aria-controls={open ? 'perf-eval-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                                onClick={handleMenuOpen}
                            >
                                Forms <i className="fa fa-caret-down ml-2"></i>
                            </Button>
                            <Menu
                                id="perf-eval-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleMenuClose}
                                MenuListProps={{
                                    'aria-labelledby': 'performance-evaluation-menu',
                                }}
                            >
                                {performanceEvaluations.map(({ name }) => (
                                    <MenuItem key={name} onClick={() => {
                                        handleMenuClose();
                                        navigate(`/admin/performance-evaluation/form/${name}`);
                                    }}>
                                        {name}
                                    </MenuItem>
                                ))}
                                <Divider sx={{ my: 1 }} />
                                <MenuItem
                                    onClick={() => { setModalOpen(true); handleMenuClose(); }}
                                    sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                    <Typography variant="body1" sx={{ mr: 1, fontWeight: 'bold' }}>+</Typography> New Form
                                </MenuItem>
                            </Menu>
                        </Box>
                        {/* Modal for New Form */}
                        <PerformanceEvaluationAdd
                            open={modalOpen}
                            onClose={() => setModalOpen(false)}
                            onOpen={() => setModalOpen(true)}
                            onSuccess={formName => navigate(`form/${formName}`)}
                        />

                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">DATE</TableCell>
                                                <TableCell align="center">NAME</TableCell>
                                                <TableCell align="center">DEPARTMENT</TableCell>
                                                <TableCell align="center">BRANCH</TableCell>
                                                <TableCell align="center">STATUS</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {evaluationResponses.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center">
                                                        No evaluation responses found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                evaluationResponses.map(row => (
                                                    <TableRow key={row.id}>
                                                        <TableCell align="center">{row.date}</TableCell>
                                                        <TableCell align="center">{`${row.last_name}, ${row.first_name} ${row.middle_name || ''}`}</TableCell>
                                                        <TableCell align="center">{row.department_name}</TableCell>
                                                        <TableCell align="center">{row.branch_name}</TableCell>
                                                        <TableCell align="center">{row.status}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Pagination controls */}
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <TablePagination
                                        rowsPerPageOptions={[10]}
                                        component="div"
                                        count={totalCount}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={() => {}}
                                    />
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
}


export default PerformanceEvaluationList;