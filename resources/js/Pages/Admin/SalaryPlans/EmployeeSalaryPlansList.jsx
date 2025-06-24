import { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, CircularProgress, Button} from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import React from 'react';
import { Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import SalaryGradeAdd from './Modals/SalaryGradeAdd';
import SalaryGradeEdit from './Modals/SalaryGradeEdit';
import { useBenefit } from '../../../hooks/useBenefits';

const SalaryPlans = () => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    
    const [isLoading, setIsLoading] = useState(true);
    const [salaryPlans, setSalaryPlans] = useState([]);
    const [loadSalaryGrade, setLoadSalaryGrade] = useState(null);
    const [openAddSalaryGrade, setOpenAddSalaryGrade] = useState(false);

    const [page, setPage] = useState(0); // 0-based for TablePagination
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const { benefitsData, isBenefitsLoading } = useBenefit(true);
    const benefitsList = benefitsData?.benefits || [];
    const [selectedBenefitIndex, setSelectedBenefitIndex] = useState(0);
    const [allSalaryGrades, setAllSalaryGrades] = useState([]);

    const fetchAllSalaryGrades = () => {
        axiosInstance
            .get("/getSalaryPlans", {
                headers,
                params: {
                    limit: 10000, // or a large number to get all
                    page: 1,
                    onlyGrades: true, // optional: you can handle this in your backend
                }
            })
            .then((response) => {
                setAllSalaryGrades((response.data.salaryPlans || []).map(plan => ({
                    salary_grade: plan.salary_grade,
                    salary_grade_version: plan.salary_grade_version ?? ''
                })));
            })
            .catch((error) => {
                console.error("Error fetching all salary grades:", error);
            });
    };

    useEffect(() => {
        fetchSalaryPlans();
    }, [page, rowsPerPage]);    

    function formatPercentage(value) {
        // Remove trailing zeros after decimal
        return Number(value).toLocaleString('en-PH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    }

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
        fetchAllSalaryGrades();
        setOpenAddSalaryGrade(true);
    };

    const handleCloseAddSalaryGrade = () => {
        setOpenAddSalaryGrade(false);
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

    const sortedSalaryPlans = [...salaryPlans].sort((a, b) => {
        // Compare salary_grade as number
        const gradeA = Number(a.salary_grade);
        const gradeB = Number(b.salary_grade);
        if (gradeA !== gradeB) return gradeA - gradeB;

        // If grades are equal, compare version (empty string or null should come first)
        if (!a.salary_grade_version && b.salary_grade_version) return -1;
        if (a.salary_grade_version && !b.salary_grade_version) return 1;
        if (!a.salary_grade_version && !b.salary_grade_version) return 0;

        // Both have versions, compare as number if possible
        return Number(a.salary_grade_version) - Number(b.salary_grade_version);
    });


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
                                {benefitsList.length > 0 &&
                                    (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'flex-end' }}>
                                            <Tabs
                                                value={selectedBenefitIndex}
                                                onChange={(e, newValue) => setSelectedBenefitIndex(newValue)}
                                                sx={{ mb: 2 }}
                                                variant="scrollable"
                                                scrollButtons="auto"
                                            >
                                                {benefitsList.map((benefit, idx) => (
                                                <Tab key={benefit.id} label={benefit.name} />
                                                ))}
                                            </Tabs>
                                        </Box>
                                    )
                                }
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell rowSpan={2} sx={{ fontWeight: 'bold', fontSize: 16, width: '20%' }} align="center">
                                                Salary Grade
                                                </TableCell>    
                                                <TableCell rowSpan={2} sx={{ fontWeight: 'bold', fontSize: 16, width: '15%' }} align="center">
                                                Amount
                                                </TableCell>
                                                <TableCell rowSpan={2} sx={{ fontWeight: 'bold', fontSize: 16, width: '15%' }} align="center">
                                                Employees
                                                </TableCell>
                                                
                                            </TableRow>
                                            <TableRow>
                                                {benefitsList[selectedBenefitIndex] && (
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: 16 }} align="center">
                                                        {benefitsList[selectedBenefitIndex].name} Employer's Share{benefitsList[selectedBenefitIndex].type === 'Amount' ? ' (₱)':  ' (' + formatPercentage(benefitsList[selectedBenefitIndex].employer_percentage ?? 0) + '%)'}
                                                    </TableCell>
                                                )}  
                                                {benefitsList[selectedBenefitIndex] && (
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: 16 }} align="center">
                                                        {benefitsList[selectedBenefitIndex].name} Employee's Share{benefitsList[selectedBenefitIndex].type === 'Amount' ? ' (₱)': ' (' + formatPercentage(benefitsList[selectedBenefitIndex].employee_percentage ?? 0) + '%)'}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sortedSalaryPlans.length > 0 ? (
                                                sortedSalaryPlans.map((salaryPlan) => (
                                                    <TableRow
                                                        key={salaryPlan.id}
                                                        sx={{ p: 1, "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer" }}}
                                                        onClick={() => {
                                                            const gradeParam = salaryPlan.salary_grade_version
                                                                ? `${salaryPlan.salary_grade}-${salaryPlan.salary_grade_version}`
                                                                : `${salaryPlan.salary_grade}`;
                                                            navigate(`/admin/compensation/salary-plans/${gradeParam}`);
                                                        }}
                                                    >
                                                        <TableCell sx={{fontSize: 14}} align="center">
                                                        Grade {salaryPlan.salary_grade}
                                                        {salaryPlan.salary_grade_version
                                                            ? `-${salaryPlan.salary_grade_version}`
                                                            : ''}
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: 14 }} align="center">
                                                            ₱ {Number(salaryPlan.amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: 14 }} align="center">
                                                            {salaryPlan.employee_count}
                                                        </TableCell>
                                                        {benefitsList[selectedBenefitIndex] && (
                                                        <>
                                                            <TableCell align="center" sx={{ fontSize: 14 }}>
                                                            {benefitsList[selectedBenefitIndex].type === 'Amount'
                                                                ? '₱ ' + Number(benefitsList[selectedBenefitIndex].employer_amount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                                : '₱ ' + Number((benefitsList[selectedBenefitIndex].employer_percentage ?? 0) * salaryPlan.amount * 0.01).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </TableCell>
                                                            <TableCell align="center" sx={{ fontSize: 14 }}>
                                                            {benefitsList[selectedBenefitIndex].type === 'Amount'
                                                                ? '₱ ' + Number(benefitsList[selectedBenefitIndex].employee_amount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                                : '₱ ' + Number((benefitsList[selectedBenefitIndex].employee_percentage ?? 0) * salaryPlan.amount * 0.01).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </TableCell>
                                                        </>
                                                        )}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={2 + benefitsList.length * 2} align="center"> No Salary Plans </TableCell>
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
                    <SalaryGradeAdd
                        open={openAddSalaryGrade}
                        close={handleCloseAddSalaryGrade}
                        existingSalaryGrades={allSalaryGrades}
                    />
                }
            </Box>
        </Layout>
    );


}
export default SalaryPlans;