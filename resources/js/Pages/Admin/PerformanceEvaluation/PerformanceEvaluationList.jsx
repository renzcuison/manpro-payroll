import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, CircularProgress, Divider } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'
import PerformanceEvaluationAdd from './Modals/PerformanceEvaluationAdd';

const PerformanceEvaluationList = () => {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [performanceEvaluations, setPerformanceEvaluation] = useState([]);

    // ----- Menu Items
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Modal state for New Form
    const [modalOpen, setModalOpen] = useState(false);

    // Fetch evaluation forms
    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get('/getEvaluationForms', { headers })
            .then((response) => {
                setPerformanceEvaluation(response.data.evaluationForms || []);
            })
            .catch(() => {
                setPerformanceEvaluation([]);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <Layout title={"PerformanceEvaluation"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: '100%', maxWidth: '1200px' }}>

                    {/* Title outside of the white box */}
                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Performance Evaluation </Typography>
                    </Box>

                    {/* White Box Containing the Buttons and Table */}
                    <Box sx={{ mt: 2, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {/* Buttons inside the white box */}
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
{
                                    performanceEvaluations.map(({ name }) => (
                                        <MenuItem key={name} onClick={() => navigate(`/admin/performance-evaluation/form/${name}`)}>
                                            {name}
                                        </MenuItem>
                                    ))
                                }

                                {/* Divider before the New Form */}
                                <Divider sx={{ my: 1 }} />

                                {/* New Form Option */}
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
                            onSuccess={formName => navigate(`forms/${formName}`)}
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
                                                <TableCell align="center">DESIGNATION</TableCell>
                                                <TableCell align="center">STATUS</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {/* Data rows should go here */}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => navigate('/admin/performance-evaluation/form')}
                                >
                                    Go to Performance Evaluation Form
                                </Button>

                                {/* Pagination controls */}
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <TablePagination
                                        rowsPerPageOptions={[10]}
                                        component="div"
                                        count={performanceEvaluations.length}
                                        rowsPerPage={10}
                                        page={0}
                                        onPageChange={() => {}}
                                    />
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Layout>
    )
}

export default PerformanceEvaluationList