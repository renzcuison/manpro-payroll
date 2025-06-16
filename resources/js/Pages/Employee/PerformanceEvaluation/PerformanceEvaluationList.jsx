import React, { useEffect, useState } from 'react';
import {
    Table, TableHead, TableBody, TableCell, TableContainer, TableRow,
    TablePagination, Box, Typography, CircularProgress
} from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { getFullName } from '../../../utils/user-utils';
import { useNavigate } from 'react-router-dom';

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

const PerformanceEvaluationList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const user = JSON.parse(storedUser);
    const headers = getJWTHeader(user);

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [evaluationResponses, setEvaluationResponses] = useState([]);

    // Pagination state
    const [page, setPage] = useState(0); // 0-based for TablePagination
    const [rowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Search state
    const [searchValue, setSearchValue] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // Fetch evaluation responses for the current user (as evaluatee or evaluator or commentor)
    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get('/getEvaluationResponses', {
            headers,
            params: {
                page: page + 1, // backend is 1-based
                limit: rowsPerPage,
                search: searchValue,
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
                    setEvaluationResponses(Object.values(seen));
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
                    {/* White Box Containing the Table */}
                    <Box sx={{ mt: 2, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {/* Table with Search */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
                            <Box
                                component="form"
                                onSubmit={handleSearchSubmit}
                                sx={{ mr: 1, width: 260 }}
                            >
                                <input
                                    placeholder="Search..."
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                    size="small"
                                    style={{
                                        width: "100%",
                                        padding: "6px 12px",
                                        borderRadius: "4px",
                                        border: "1px solid #ccc"
                                    }}
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        style={{
                                            position: "absolute",
                                            right: "10px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer"
                                        }}
                                    >×</button>
                                )}
                            </Box>
                        </Box>
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
                                                        onClick={() => navigate(getEvaluationRoleRoute(row))}
                                                        sx={{
                                                            backgroundColor: idx % 2 === 0 ? 'action.hover' : 'background.paper'
                                                        }}
                                                    >
                                                        <TableCell align="center">{row.date}</TableCell>
                                                        <TableCell align="center">{getFullName(row.evaluatee)}</TableCell>
                                                        <TableCell align="center">{row.evaluatee?.department?.name ?? '—'}</TableCell>
                                                        <TableCell align="center">{row.evaluatee?.branch?.name ?? '—'}</TableCell>
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
                                        onRowsPerPageChange={() => { }}
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