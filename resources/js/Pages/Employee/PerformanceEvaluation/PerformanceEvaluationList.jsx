import React, { useEffect, useState } from 'react';
import {
    Table, TableHead, TableBody, TableCell, TableContainer, TableRow,
    TablePagination, Box, Typography, CircularProgress,
    TextField, InputAdornment, IconButton, Select, FormControl, InputLabel, MenuItem
} from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { getFullName } from '../../../utils/user-utils';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Swal from 'sweetalert2';

const rolePriority = {
    "Creator": 1,
    "Evaluatee": 2,
    "Evaluator": 3,
    "Commentor": 4
};

const getEvaluationRoleRoute = (row) => {
    switch (row.role) {
        case "Creator":
            return `/employee/performance-evaluation/creator/${row.id}`;
        case "Evaluatee":
            return `/employee/performance-evaluation/evaluatee/${row.id}`;
        case "Evaluator":
            return `/employee/performance-evaluation/answer/${row.id}`;
        case "Commentor":
            return `/employee/performance-evaluation/commentor/${row.id}`;
        default:
            return `/employee/performance-evaluation/answer/${row.id}`;
    }
};

const STATUS_OPTIONS = [
    { value: '', label: "All" },
    { value: 'Sent', label: "Sent" },
    { value: 'New', label: "New" },
    { value: 'Pending', label: "Pending" },
    { value: 'Submitted', label: "Submitted" },
    { value: 'Done', label: "Done" },
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
    const [rowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Search state
    const [searchValue, setSearchValue] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // Status filter state
    const [statusFilter, setStatusFilter] = useState('');

    // For white box logic
    const [hasHadResponses, setHasHadResponses] = useState(false);

    useEffect(() => {
        axiosInstance.get('/getEvaluationForms', { headers })
            .then((response) => setPerformanceEvaluation(response.data.evaluationForms || []))
            .catch(() => setPerformanceEvaluation([]));
    }, []);

    // Fetch evaluation responses for the current user
    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get('/getEvaluationResponses', {
            headers,
            params: {
                page: page + 1, // backend is 1-based
                limit: rowsPerPage,
                search: searchValue,
                status: statusFilter || undefined,
                order_by: [
                    { key: "updated_at", sort_order: "desc" }
                ]
            }
        })
            .then((response) => {
                if (response.data.status === 200) {
                    // Deduplicate by id, keep highest priority role
                    const seen = {};
                    for (const row of response.data.evaluationResponses) {
                        if (
                            !seen[row.id] ||
                            (rolePriority[row.role] < rolePriority[seen[row.id].role])
                        ) {
                            seen[row.id] = row;
                        }
                    }
                    const uniqueResponses = Object.values(seen);
                    setEvaluationResponses(uniqueResponses);
                    setTotalCount(response.data.totalResponseCount);

                    // If on any filter/search there has been at least 1 response, set flag
                    if (uniqueResponses.length > 0) {
                        setHasHadResponses(true);
                    }
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
    }, [page, rowsPerPage, searchValue, statusFilter]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
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
        const periodStart = row.period_start_at ? new Date(row.period_start_at) : null;
        const periodEnd = row.period_end_at ? new Date(row.period_end_at) : null;
        if (!periodStart || !periodEnd) return false;
        return now < periodStart || now > periodEnd;
    };

    // Handle row click for period validation
    const handleRowClick = (row) => {
        const now = new Date();
        const periodStart = row.period_start_at ? new Date(row.period_start_at) : null;
        const periodEnd = row.period_end_at ? new Date(row.period_end_at) : null;
        if (!periodStart || !periodEnd) {
            navigate(getEvaluationRoleRoute(row));
            return;
        }
        if (now < periodStart || now > periodEnd) {
            Swal.fire({
                icon: 'warning',
                title: 'Action not allowed',
                text: 'Evaluation or Comments for this form has been disabled',
                confirmButtonColor: '#f5c242'
            });
            return;
        }
        navigate(getEvaluationRoleRoute(row));
    };

    return (
        <Layout title={"PerformanceEvaluation"}>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ mx: 'auto', width: '100%', maxWidth: '1200px' }}>
                    {/* Title */}
                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Performance Evaluation
                        </Typography>
                    </Box>

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                            <CircularProgress />
                        </Box>
                    ) : hasHadResponses ? (
                        <Box sx={{ mt: 2, p: 3, bgcolor: '#fff', borderRadius: '8px' }}>
                            {/* Filters/Search always visible */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3, gap: 2 }}>
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
                            </Box>
                            {evaluationResponses.length === 0 ? (
                                <Box sx={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No evaluation responses found.
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <TableContainer sx={{ minHeight: 400 }}>
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
                                                {evaluationResponses.map((row, idx) => (
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
                                                        <TableCell align="center">{row.status}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                        <TablePagination
                                            rowsPerPageOptions={[10]}
                                            component="div"
                                            count={totalCount}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={() => { }}
                                        />
                                    </Box>
                                </>
                            )}
                        </Box>
                    ) : (
                        <Box sx={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                No evaluation responses found.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Layout>
    );
}

export default PerformanceEvaluationList;