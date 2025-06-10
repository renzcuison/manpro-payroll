import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, CircularProgress, Divider, TextField, InputAdornment, IconButton } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { getFullName } from '../../../utils/user-utils';
import PerformanceEvaluationAdd from './Modals/PerformanceEvaluationAdd';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const PerformanceEvaluationList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const user = JSON.parse(storedUser);
    const headers = getJWTHeader(user);

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [evaluationResponses, setEvaluationResponses] = useState([]);
    const [performanceEvaluations, setPerformanceEvaluation] = useState([]);

    // Pagination state
    const [page, setPage] = useState(0); // 0-based for TablePagination
    const [rowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Search state
    const [searchValue, setSearchValue] = useState('');
    const [searchInput, setSearchInput] = useState('');

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

    // Fetch evaluation responses for the current user (as evaluatee or evaluator or commentor)
    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get('/getEvaluationResponses', {
            headers,
            params: {
                page: page + 1, // backend is 1-based
                limit: rowsPerPage,
                search: searchValue
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
    }, [page, rowsPerPage, searchValue]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Search handlers
    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(0);
        setSearchValue(searchInput.trim());
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchValue('');
        setPage(0);
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
                        {/* Buttons and Search */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            {/* Left: Create Evaluation */}
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => navigate('/admin/performance-evaluation/create-evaluation')}
                            >
                                <i className="fa"></i> Create Evaluation
                            </Button>
                            {/* Right group: Search and Forms */}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {/* Search Field */}
                                <Box
                                component="form"
                                onSubmit={handleSearchSubmit}
                                sx={{ mr: 1, width: 260 }}
                                >
                                <TextField
                                    placeholder="Search..."
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                        <SearchIcon />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        searchInput && (
                                        <InputAdornment position="end">
                                            <IconButton
                                            aria-label="clear search"
                                            onClick={handleClearSearch}
                                            edge="end"
                                            size="small"
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        </InputAdornment>
                                        )
                                    )
                                    }}
                                />
                                </Box>
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
                                {performanceEvaluations.map(({name }) => (
                                    <MenuItem key={name} onClick={() => {
                                    handleMenuClose();
                                    // Use id or name as appropriate for navigation
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
                                    <Table aria-label="simple table"  sx={{
                                            '& .MuiTableCell-root': {
                                            borderBottom: 'none',
                                            },
                                        }}>
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
                                                evaluationResponses.map((row, idx) => (
                                                    <TableRow 
                                                        key={row.id}
                                                        hover
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => navigate(`/admin/performance-evaluation/answer/${row.id}`)}
                                                        sx={{
                                                        backgroundColor: idx % 2 === 0 ? 'action.hover' : 'background.paper'
                                                        }}
                                                    >
                                                        <TableCell align="center">{row.date}</TableCell>
                                                        <TableCell align="center">{getFullName(row.evaluatee)}</TableCell>
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