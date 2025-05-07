import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox, ListItemText, TableFooter } from '@mui/material';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import Swal from "sweetalert2";

import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';

import PayslipView from '../../../Modals/Payroll/PayslipView';
import OverallPayrollSummaryModal from '../../../Modals/Payroll/OverallPayrollSummary';
import AddIcon from '@mui/icons-material/Add';
import AddSignatory from './Modals/AddSignatory';

const PayrollSummary = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = useMemo(() => getJWTHeader(JSON.parse(storedUser)), [storedUser]);

    const [isLoading, setIsLoading] = useState(true);
    const [allRecords, setAllRecords] = useState([]);
    const [openViewPayrollModal, setOpenViewPayrollModal] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState('');
    const [openOverallSummaryModal, setOpenOverallSummaryModal] = useState(false);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedCutOff, setSelectedCutOff] = useState('');
    const [openSignatoryDialog, setOpenSignatoryDialog] = useState(false);
    const [preparedBy, setPreparedBy] = useState('');
    const [approvedBy, setApprovedBy] = useState('');

    const currentYear = new Date().getFullYear();
    const years = useMemo(() => Array.from({ length: currentYear - 2014 }, (_, i) => (2015 + i).toString()), [currentYear]);

    const handleOpenSignatoryDialog = () => setOpenSignatoryDialog(true);
    const handleCloseSignatoryDialog = () => setOpenSignatoryDialog(false);

    const headerConfig = useMemo(() => [
        { key: 'employeeName', primaryLabel: 'Employee Name', secondaryLabel: null, rowSpan: 2, colSpan: 1, isVisible: () => true, dataKey: 'employeeName' },
        {
            key: 'monthlyBaseGroup', primaryLabel: 'Monthly Base', colSpan: 2, isGroup: true, children: [
                { key: 'monthlyBaseHours', secondaryLabel: 'Hours', dataKey: 'monthlyBaseHours', isVisible: (cols) => cols.includes('monthlyBaseHours') },
                { key: 'monthlyBasePay', secondaryLabel: 'Pay', dataKey: 'monthlyBasePay', isVisible: (cols) => cols.includes('monthlyBasePay'), isTotaled: true }
            ]
        },
        {
            key: 'overtimeGroup', primaryLabel: 'Overtime', colSpan: 2, isGroup: true, children: [
                { key: 'overTimeHours', secondaryLabel: 'Hours', dataKey: 'overTimeHours', isVisible: (cols) => cols.includes('overTimeHours') },
                { key: 'overTimePay', secondaryLabel: 'Pay', dataKey: 'overTimePay', isVisible: (cols) => cols.includes('overTimePay'), isTotaled: true }
            ]
        },
        {
            key: 'paidLeaveGroup', primaryLabel: 'Paid Leave', colSpan: 2, isGroup: true, children: [
                { key: 'paidLeaveDays', secondaryLabel: 'Days', dataKey: 'paidLeaveDays', isVisible: (cols) => cols.includes('paidLeaveDays') },
                { key: 'paidLeaveAmount', secondaryLabel: 'Pay', dataKey: 'paidLeaveAmount', isVisible: (cols) => cols.includes('paidLeaveAmount'), isTotaled: true }
            ]
        },
        {
            key: 'deductionGroup', primaryLabel: 'Deduction', colSpan: 2, isGroup: true, children: [
                { key: 'absences', secondaryLabel: 'Absences', dataKey: 'absences', isVisible: (cols) => cols.includes('absences'), isTotaled: true },
                { key: 'tardiness', secondaryLabel: 'Tardiness', dataKey: 'tardiness', isVisible: (cols) => cols.includes('tardiness'), isTotaled: true }
            ]
        },
        { key: 'totalAllowance', primaryLabel: 'Allowance', secondaryLabel: null, rowSpan: 2, colSpan: 1, dataKey: 'totalAllowance', isVisible: (cols) => cols.includes('totalAllowance'), isTotaled: true },
        { key: 'payrollGrossPay', primaryLabel: 'Gross Pay', secondaryLabel: null, rowSpan: 2, colSpan: 1, dataKey: 'payrollGrossPay', isVisible: (cols) => cols.includes('payrollGrossPay'), isTotaled: true },
        { key: 'payrollNetPay', primaryLabel: 'Net Pay', secondaryLabel: null, rowSpan: 2, colSpan: 1, dataKey: 'payrollNetPay', isVisible: (cols) => cols.includes('payrollNetPay'), isTotaled: true },
    ], []);

    const allSelectableColumns = useMemo(() => [
        { key: 'monthlyBaseHours', label: 'Monthly Base Hours' },
        { key: 'monthlyBasePay', label: 'Monthly Base Pay' },
        { key: 'overTimeHours', label: 'Overtime Hours' },
        { key: 'overTimePay', label: 'Overtime Pay' },
        { key: 'paidLeaveDays', label: 'Paid Leave Days' },
        { key: 'paidLeaveAmount', label: 'Paid Leave Amount' },
        { key: 'absences', label: 'Absences' },
        { key: 'tardiness', label: 'Tardiness' },
        { key: 'totalAllowance', label: 'Allowance' },
        { key: 'payrollGrossPay', label: 'Gross Pay' },
        { key: 'payrollNetPay', label: 'Net Pay' },
    ], []);

    const [visibleColumns, setVisibleColumns] = useState(allSelectableColumns.map(c => c.key));

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const response = await axiosInstance.get('/payroll/getPayrollSummary', { headers });
                const records = response.data.records.map(record => ({
                    ...record,
                    payrollStartDate: record.payrollStartDate,
                    payrollEndDate: record.payrollEndDate,
                }));
                setAllRecords(records);
            } catch (error) {
                console.error('Error fetching initial payroll data:', error);
                Swal.fire('Error', 'Failed to fetch initial payroll data.', 'error');
                setAllRecords([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [headers]);

    const filteredRecords = useMemo(() => {
        let records = [...allRecords];

        if (selectedYear) {
            records = records.filter(record =>
                record.payrollEndDate && dayjs(record.payrollEndDate).year().toString() === selectedYear
            );
        }
        if (selectedMonth) {
            records = records.filter(record =>
                record.payrollEndDate && dayjs(record.payrollEndDate).format('MMMM') === selectedMonth
            );
        }
        if (selectedCutOff) {
            records = records.filter(record =>
                record.payrollCutOff && record.payrollCutOff.toLowerCase() === selectedCutOff.toLowerCase()
            );
        }
        return records;
    }, [allRecords, selectedYear, selectedMonth, selectedCutOff]);

    const payrollDateRange = useMemo(() => {
        if (filteredRecords.length > 0) {
            const formatDate = (dateString) => {
                if (!dateString) return '';
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                try {
                     return new Date(dateString).toLocaleDateString(undefined, options);
                } catch (e) {
                    console.error("Error formatting date:", dateString, e);
                    return 'Invalid Date';
                }
            };
            const firstRecord = filteredRecords[0];
            const start = formatDate(firstRecord.payrollStartDate);
            const end = formatDate(firstRecord.payrollEndDate);
            return `${start} - ${end}`;
        }
        return "";
    }, [filteredRecords]);

    const handleOpenViewPayrollModal = (id) => {
        setSelectedPayroll(id);
        setOpenViewPayrollModal(true);
    }

    const handleCloseViewPayrollModal = () => {
        setOpenViewPayrollModal(false);
    }

    const handleOpenOverallSummaryModal = () => {
        setOpenOverallSummaryModal(true);
    };

    const handleCloseOverallSummaryModal = () => {
        setOpenOverallSummaryModal(false);
    };

     const totalableColumnsLookup = useMemo(() => {
        const lookup = new Map();
        headerConfig.forEach(group => {
            if (!group.isGroup) {
                if (group.isTotaled) {
                    lookup.set(group.dataKey || group.key, true);
                }
            } else {
                group.children?.forEach(child => {
                    if (child.isTotaled) {
                        lookup.set(child.dataKey, true);
                    }
                });
            }
        });
        return lookup;
    }, [headerConfig]);

    const calculateTotals = useCallback((records) => {
       return records.reduce((acc, curr) => {
           totalableColumnsLookup.forEach((_, key) => {
               if (!acc[key]) acc[key] = 0;
               acc[key] += parseFloat(curr[key] || 0);
           });
           return acc;
       }, {});
   }, [totalableColumnsLookup]);

   const totals = useMemo(() => {
        return calculateTotals(filteredRecords);
    }, [filteredRecords, calculateTotals]);


    const recordsForModal = useMemo(() => {
        const essentialKeys = ['record', 'employeeName'];
        const modalColumnKeys = new Set([...essentialKeys, ...visibleColumns]);

        return filteredRecords.map(record => {
            const newRecord = {};
            modalColumnKeys.forEach(key => {
                if (record.hasOwnProperty(key)) {
                    newRecord[key] = record[key];
                }
            });
             // Ensure essential keys are always present even if not 'visible'
             essentialKeys.forEach(key => {
                if (record.hasOwnProperty(key) && !newRecord.hasOwnProperty(key)) {
                    newRecord[key] = record[key];
                }
            });
            return newRecord;
        });
    }, [filteredRecords, visibleColumns]);

    const totalsForModal = useMemo(() => {
        const allCalculatedTotals = calculateTotals(filteredRecords);
        const newTotals = {};

        visibleColumns.forEach(key => {
            if (allCalculatedTotals.hasOwnProperty(key) && totalableColumnsLookup.has(key)) {
                newTotals[key] = allCalculatedTotals[key];
            }
        });

        return newTotals;
    }, [filteredRecords, visibleColumns, totalableColumnsLookup, calculateTotals]);


    const visibleHeaderConfigForModal = useMemo(() => {
        const visibleConfig = [];
        headerConfig.forEach(group => {
            if (!group.isGroup) {
                 if (group.key === 'employeeName' || group.isVisible(visibleColumns)) {
                    visibleConfig.push(group);
                }
            } else {
                const visibleChildren = group.children?.filter(child => child.isVisible(visibleColumns));
                if (visibleChildren && visibleChildren.length > 0) {
                    visibleConfig.push({ ...group, children: visibleChildren, colSpan: visibleChildren.length }); // Adjust colSpan based on visible children
                }
            }
        });
        return visibleConfig;
    }, [visibleColumns, headerConfig]);

    const handleVisibleColumnsChange = (event) => {
        const { target: { value } } = event;
        const updatedVisibleColumns = typeof value === 'string' ? value.split(',') : value;
        setVisibleColumns(updatedVisibleColumns);
    };

    const getTotalVisibleSubColumns = useCallback(() => {
         let count = 0;
         headerConfig.forEach(group => {
             if (!group.isGroup) {
                 if (group.isVisible(visibleColumns)) {
                     count++;
                 }
             } else {
                 group.children?.forEach(child => {
                     if (child.isVisible(visibleColumns)) {
                         count++;
                     }
                 });
             }
         });
         return count;
     }, [headerConfig, visibleColumns]);

    return (
        <Layout title={"PayrollProcess"}>
            <Box sx={{ width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '95%', marginBottom: '10px' } }} >

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Summary of Payroll</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                             <Button variant='contained' onClick={handleOpenSignatoryDialog}>
                                <AddIcon />
                                Add Signatory
                            </Button>
                            <FormControl sx={{ minWidth: 200 }} size="small">
                                <InputLabel>Columns</InputLabel>
                                <Select
                                    label='Columns'
                                    multiple
                                    value={visibleColumns}
                                    onChange={handleVisibleColumnsChange}
                                    renderValue={(selected) =>
                                        selected.length === allSelectableColumns.length ? "All Columns" : `${selected.length} Selected`
                                    }
                                >
                                    {allSelectableColumns.map((col) => (
                                        <MenuItem key={col.key} value={col.key}>
                                            <Checkbox checked={visibleColumns.includes(col.key)} />
                                            <ListItemText primary={col.label} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 2, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'end', }}>
                            <FormControl size="small" sx={{ minWidth: 120, backgroundColor: '#ffffff' }}>
                                <InputLabel>Year</InputLabel>
                                <Select
                                    value={selectedYear}
                                    label="Year"
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {years.map((year) => (
                                        <MenuItem key={year} value={year}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 120, backgroundColor: '#ffffff' }}>
                                <InputLabel>Month</InputLabel>
                                <Select
                                    value={selectedMonth}
                                    label="Month"
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {[
                                        'January', 'February', 'March', 'April', 'May', 'June',
                                        'July', 'August', 'September', 'October', 'November', 'December'
                                    ].map((month) => (
                                        <MenuItem key={month} value={month}>{month}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 120, backgroundColor: '#ffffff' }}>
                                <InputLabel>Cutoff</InputLabel>
                                <Select
                                    value={selectedCutOff}
                                    label="Cutoff"
                                    onChange={(e) => setSelectedCutOff(e.target.value)}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="First">First</MenuItem>
                                    <MenuItem value="Second">Second</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                                    <Table stickyHeader className="table table-md table-striped table-vcenter table-bordered">
                                        <TableHead>
                                            <TableRow>
                                                {headerConfig.map(group => {
                                                    const visibleChildren = group.isGroup ? group.children?.filter(child => child.isVisible(visibleColumns)) : null;
                                                    const visibleChildrenCount = visibleChildren ? visibleChildren.length : 0;
                                                    const shouldRenderGroup = (!group.isGroup && group.isVisible(visibleColumns)) || (group.isGroup && visibleChildrenCount > 0);

                                                    if (!shouldRenderGroup) return null;

                                                    return (
                                                        <TableCell
                                                            key={group.key}
                                                            align="center"
                                                            sx={{ fontWeight: 'bold' }}
                                                            rowSpan={group.rowSpan || 1}
                                                            colSpan={group.isGroup ? visibleChildrenCount : (group.colSpan || 1)}
                                                        >
                                                            {group.primaryLabel}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                            <TableRow>
                                                {headerConfig.map(group => {
                                                    if (!group.isGroup) return null;

                                                    return group.children?.map(child => {
                                                        if (!child.isVisible(visibleColumns)) return null;
                                                        return (
                                                            <TableCell key={child.key} align="center" sx={{ fontWeight: 'bold' }}>
                                                                {child.secondaryLabel}
                                                            </TableCell>
                                                        );
                                                    });
                                                })}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredRecords.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={getTotalVisibleSubColumns()} align="center" sx={{ color: 'gray', fontWeight: 'bold', fontSize: '1.5rem', height: 300 }}>
                                                        No payroll data found for the selected filters.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredRecords.map((record) => (
                                                    <TableRow
                                                        key={record.record}
                                                        hover
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                                                        onClick={() => handleOpenViewPayrollModal(record.record)}
                                                    >
                                                        {headerConfig.map(group => {
                                                            if (!group.isGroup) {
                                                                if (!group.isVisible(visibleColumns)) return null;
                                                                return (
                                                                    <TableCell key={`${group.key}-${record.record}`} align={group.key === 'employeeName' ? "left" : "center"}>
                                                                        {record[group.dataKey || group.key]}
                                                                    </TableCell>
                                                                );
                                                            } else {
                                                                return group.children?.map(child => {
                                                                    if (!child.isVisible(visibleColumns)) return null;
                                                                    return (
                                                                        <TableCell key={`${child.key}-${record.record}`} align="center">
                                                                            {record[child.dataKey]}
                                                                        </TableCell>
                                                                    );
                                                                });
                                                            }
                                                        })}
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>

                                        {filteredRecords.length > 0 && (
                                            <TableFooter sx={{ backgroundColor: '#f0f0f0' }}>
                                                <TableRow>
                                                    {headerConfig.map(group => {
                                                        if (!group.isGroup) {
                                                            if (!group.isVisible(visibleColumns)) return null;
                                                            return (
                                                                <TableCell key={`${group.key}-total`} align={group.key === 'employeeName' ? "left" : "center"} sx={{ fontWeight: 'bold' }}>
                                                                    {group.key === 'employeeName' ? 'Total' : (group.isTotaled && totals[group.dataKey || group.key] !== undefined ? totals[group.dataKey || group.key].toFixed(2) : '')}
                                                                </TableCell>
                                                            );
                                                        } else {
                                                            return group.children?.map(child => {
                                                                if (!child.isVisible(visibleColumns)) return null;
                                                                return (
                                                                    <TableCell key={`${child.key}-total`} align="center" sx={{ fontWeight: 'bold' }}>
                                                                        {(child.isTotaled && totals[child.dataKey] !== undefined) ? totals[child.dataKey].toFixed(2) : ''}
                                                                    </TableCell>
                                                                );
                                                            });
                                                        }
                                                    })}
                                                </TableRow>
                                            </TableFooter>
                                        )}
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                    <Button
                        sx={{ mt: 2, ml: 1, mb: 3, float: 'left' }}
                        variant="contained"
                        color="primary"
                        onClick={handleOpenOverallSummaryModal}
                        disabled={isLoading || filteredRecords.length === 0}
                    >
                        Overall Summary
                    </Button>

                </Box>

                <OverallPayrollSummaryModal
                    open={openOverallSummaryModal}
                    close={handleCloseOverallSummaryModal}
                    records={recordsForModal}
                    totals={totalsForModal}
                    headerConfig={visibleHeaderConfigForModal}
                    payrollDateRange={payrollDateRange}
                    preparedBy={preparedBy}
                    approvedBy={approvedBy}
                />

                {openViewPayrollModal && selectedPayroll &&
                    <PayslipView open={openViewPayrollModal} close={handleCloseViewPayrollModal} selectedPayroll={selectedPayroll} />
                }

                <AddSignatory
                    open={openSignatoryDialog}
                    onClose={handleCloseSignatoryDialog}
                    preparedBy={preparedBy}
                    setPreparedBy={setPreparedBy}
                    approvedBy={approvedBy}
                    setApprovedBy={setApprovedBy}
                    headers={headers}
                />
            </Box>
        </Layout >
    )
}

export default PayrollSummary;