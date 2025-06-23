import React, { useEffect, useState } from 'react';
import {
    Table, TableHead, TableBody, TableCell, TableContainer, TableRow,
    TablePagination, Box, Typography, Button, Menu, MenuItem, CircularProgress,
    Divider, TextField, InputAdornment, IconButton, Select, FormControl, InputLabel, Chip
} from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { getFullName } from '../../../utils/user-utils';
import PerformanceEvaluationAdd from './Modals/PerformanceEvaluationAdd';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Swal from 'sweetalert2';

const STATUS_STYLES = {
    Pending: {
        background: '#f8e414',
        color: '#fff',
        borderRadius: 20,
        padding: '2px 22px',
        fontSize: 13,
        minWidth: 60,
        display: 'inline-block',
        textAlign: 'center'
    },
    Sent: {
        background: '#f89c14',
        color: '#fff',
        borderRadius: 20,
        padding: '2px 22px',
        fontSize: 13,
        minWidth: 60,
        display: 'inline-block',
        textAlign: 'center'
    },
    New: {
        background: '#ffcc14',
        color: '#fff',
        borderRadius: 20,
        padding: '2px 22px',
        fontSize: 13,
        minWidth: 60,
        display: 'inline-block',
        textAlign: 'center'
    },
    Submitted: {
        background: '#78b42c',
        color: '#fff',
        borderRadius: 20,
        padding: '2px 22px',
        fontSize: 13,
        minWidth: 60,
        display: 'inline-block',
        textAlign: 'center'
    },
    Done: {
        background: '#209c3c',
        color: '#fff',
        borderRadius: 20,
        padding: '2px 22px',
        fontSize: 13,
        minWidth: 60,
        display: 'inline-block',
        textAlign: 'center'
    },
    Disabled: {
        background: '#e57373',
        color: '#fff',
        borderRadius: 20,
        padding: '2px 22px',
        fontSize: 13,
        minWidth: 60,
        display: 'inline-block',
        textAlign: 'center'
    }
};

const getEvaluationRoleRoute = (row) => {
    switch (row.role) {
        case "Creator":
            return `/admin/performance-evaluation/creator/${row.id}`;
        case "Evaluatee":
            return `/admin/performance-evaluation/evaluatee/${row.id}`;
        case "Evaluator":
            return `/admin/performance-evaluation/answer/${row.id}`;
        case "Commentor":
            return `/admin/performance-evaluation/commentor/${row.id}`;
        default:
            return `/admin/performance-evaluation/answer/${row.id}`;
    }
};

const STATUS_OPTIONS = [
    { value: '', label: "All" },
    { value: 'Sent', label: "Sent" },
    { value: 'New', label: "New" },
    { value: 'Pending', label: "Pending" },
    { value: 'Submitted', label: "Submitted" },
    { value: 'Done', label: "Done" },
    { value: 'Disabled', label: "Disabled"}
];

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
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Search state
    const [searchValue, setSearchValue] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // Status filter state
    const [statusFilter, setStatusFilter] = useState('');

    // Menu Items
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    // Modal state for New Form
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        axiosInstance.get('/getEvaluationForms', { headers })
            .then((response) => setPerformanceEvaluation(response.data.evaluationForms || []))
            .catch(() => setPerformanceEvaluation([]));
    }, []);

    // Fetch evaluation responses for the current user (as evaluatee or evaluator or commentor)
    useEffect(() => {
        setIsLoading(true);
        const statusToSend = statusFilter && statusFilter !== 'Disabled' ? statusFilter : undefined;
        // Use a high limit if filtering on frontend
        const fetchAll = statusFilter === 'Disabled' || statusFilter === '';
        axiosInstance.get('/getEvaluationResponses', {
            headers,
            params: {
                page: 1,
                limit: fetchAll ? 1000 : rowsPerPage,
                search: searchValue,
                status: statusToSend,
                order_by: [
                    {key: "status", sort_order: "asc"},
                    {key: "created_at", sort_order: "asc"},
                    {key: "last_name", sort_order: "asc"},
                    {key: "first_name", sort_order: "asc"},
                    {key: "middle_name", sort_order: "asc"},
                    {key: "suffix", sort_order: "asc"}
                ]
            }
        })
        .then((response) => {
            if (response.data.status === 200) {
                setEvaluationResponses(response.data.evaluationResponses);
                // No need to set totalCount, use filteredResponses.length for pagination
            } else {
                setEvaluationResponses([]);
            }
        })
        .catch(() => {
            setEvaluationResponses([]);
        })
        .finally(() => setIsLoading(false));
    }, [searchValue, statusFilter]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Search handlers
    const handleSearchChange = (e) => setSearchInput(e.target.value);
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

    // Status filter handler
    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(0); // reset to first page
    };

    // Check if the evaluation/comment period is disabled
    const isRowDisabled = (row) => {
        const now = new Date();
        const start = row.period_start_at ? new Date(row.period_start_at) : null;
        const end = row.period_end_at ? new Date(row.period_end_at) : null;
        if (!start || !end) return false;
        return now < start || now > end;
    };

    // Handle row click for period validation
    const handleRowClick = (row) => {
        // Get period info
        const now = new Date();
        const periodStart = row.period_start_at ? new Date(row.period_start_at) : null;
        const periodEnd = row.period_end_at ? new Date(row.period_end_at) : null;
        const isDisabled = periodStart && periodEnd && (now < periodStart || now > periodEnd);

        // 1. Disabled check takes precedence (show this SWAL even if status is "Sent")
        if (isDisabled) {
            Swal.fire({
                icon: 'warning',
                title: 'Action not allowed',
                text: 'Evaluation or Comments for this form has been disabled',
                confirmButtonColor: '#f5c242'
            });
            return;
        }

        // 2. If not disabled, but status is Sent
        if (row.status === "Sent") {
            Swal.fire({
                icon: 'info',
                title: 'This Evaluation is still on going.',
                text: "You can't Access this Form yet.",
                confirmButtonColor: '#f5c242'
            });
            return;
        }

        // 3. Otherwise, allow navigation
        navigate(getEvaluationRoleRoute(row));
    };


    let filteredResponses = evaluationResponses;
    if (statusFilter === 'Disabled') {
        filteredResponses = evaluationResponses.filter(isRowDisabled);
    } else if (statusFilter === '') { // "All"
        filteredResponses = evaluationResponses.filter(row => !isRowDisabled(row));
    } else {
        filteredResponses = evaluationResponses.filter(
            row => row.status === statusFilter && !isRowDisabled(row)
        );
    }
    const paginatedResponses = filteredResponses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Helper to render status as a "chip"
    const renderStatus = (status) => (
        <span style={STATUS_STYLES[status] || STATUS_STYLES.Pending}>{status}</span>
    );

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
                            {/* Right group: Search, Status Filter, Forms */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {/* Search Field */}
                                <Box
                                    component="form"
                                    onSubmit={handleSearchSubmit}
                                    sx={{ width: 220 }}
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
                                {/* Status Filter */}
                                <FormControl size="small" sx={{ minWidth: 110 }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        label="Status"
                                        onChange={handleStatusChange}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
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
                                    <Table aria-label="simple table" sx={{
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
                                            <TableCell align="center">ROLE</TableCell>
                                            <TableCell align="center">STATUS</TableCell>
                                        </TableRow>
                                    </TableHead>
                                        <TableBody>
                                            {paginatedResponses.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">
                                                        No evaluation responses found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedResponses.map((row, idx) => (
                                                    <TableRow
                                                        key={row.id}
                                                        hover
                                                        style={{
                                                            cursor: isRowDisabled(row) ? 'not-allowed' : 'pointer',
                                                            backgroundColor: idx % 2 === 0 ? 'action.hover' : 'background.paper',
                                                            opacity: isRowDisabled(row) ? 0.5 : 1,
                                                        }}
                                                        onClick={() => handleRowClick(row)}
                                                    >
                                                        <TableCell align="center">{row.date}</TableCell>
                                                        <TableCell align="center">{getFullName(row.evaluatee)}</TableCell>
                                                        <TableCell align="center">{row.evaluatee?.department?.name ?? '—'}</TableCell>
                                                        <TableCell align="center">{row.evaluatee?.branch?.name ?? '—'}</TableCell>
                                                        <TableCell align="center">{row.role}</TableCell>
                                                        <TableCell align="center">{renderStatus(row.status)}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Pagination controls */}
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <TablePagination
                                        rowsPerPageOptions={[10, 25, 50]}
                                        component="div"
                                        count={filteredResponses.length}
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
            </Box>
        </Layout>
    );
}

export default PerformanceEvaluationList;