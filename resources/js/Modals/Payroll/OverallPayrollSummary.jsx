import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell,
    TableContainer, TableFooter, TableHead, TableRow, Box, Typography,
    IconButton, Button, FormControl, InputLabel, Select, MenuItem,
    Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ManPro from '../../../images/ManPro.png';
import LoadingSpinner from '../../components/LoadingStates/LoadingSpinner';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';

const OverallPayrollSummary = ({ open, close, records = [], totals = {}, headerConfig = [], payrollDateRange, preparedBy: propPreparedBy, approvedBy: propApprovedBy, onAddSignatoryClick }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = useMemo(() => getJWTHeader(JSON.parse(storedUser)), [storedUser]);
    const [signatories, setSignatories] = useState([]);
    const [loadingSignatories, setLoadingSignatories] = useState(false);
    const [localPreparedBy, setLocalPreparedBy] = useState('');
    const [localApprovedBy, setLocalApprovedBy] = useState('');
    const [isPrintingOrDownloading, setIsPrintingOrDownloading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const dialogRef = useRef();
    const [selectedPreparers, setSelectedPreparers] = useState([{ id: Date.now(), name: '' }]);
    const [selectedApprovers, setSelectedApprovers] = useState([{ id: Date.now() + 1, name: '' }]);
    const [selectedReviewers, setSelectedReviewers] = useState([{ id: Date.now(), name: '' }]);

    const fetchSignatories = useCallback(async () => {
        if (!open) return;
        setLoadingSignatories(true);
        try {
            const response = await axiosInstance.get('/getSignatories', { headers });
            setSignatories(response.data.data ?? []);
        } catch (err) {
            console.error("Error fetching signatories:", err);
            setSignatories([]);
        } finally {
            setLoadingSignatories(false);
        }
    }, [headers, open]);

    useEffect(() => {
        console.log("Totals");
        console.log(totals);

        if (open) {
            setIsPrintingOrDownloading(false);
            setIsDownloading(false);
            fetchSignatories();
        }
    }, [open, fetchSignatories]);

    useEffect(() => {
        if (open) {
            setLocalPreparedBy(propPreparedBy || '');
            setLocalApprovedBy(propApprovedBy || '');
        }
    }, [open, propPreparedBy, propApprovedBy]);

    const preparedByOptions = useMemo(() => (
        Array.isArray(signatories) ? signatories.filter(s => s.purpose === 'Preparer').map(s => s.name) : []
    ), [signatories]);

    const reviewedByOptions = useMemo(() => (
        Array.isArray(signatories) ? signatories.filter(s => s.purpose === 'Reviewer').map(s => s.name) : []
    ), [signatories]);

    const approvedByOptions = useMemo(() => (
        Array.isArray(signatories) ? signatories.filter(s => s.purpose === 'Approver').map(s => s.name) : []
    ), [signatories]);

    const formatCurrency = useCallback((value) => {
        const num = Number(value);
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(!isNaN(num) ? num : 0);
    }, []);

    const handlePrint = async () => {
        setIsPrintingOrDownloading(true);
        const dialogContent = dialogRef.current;
        if (!dialogContent) {
            setIsPrintingOrDownloading(false);
            return;
        }

        try {
            const addButtons = dialogContent.querySelectorAll('.add-signatory-button');
            addButtons.forEach(button => button.style.display = 'none');

            Array.from(dialogContent.querySelectorAll('.signatory-dropdown')).forEach(el => el.style.display = 'none');
            Array.from(dialogContent.querySelectorAll('.signatory-text')).forEach(el => {
                el.style.display = 'block';
                const role = el.dataset.role;
                const hasValue = role === 'preparer' ? !!localPreparedBy : !!localApprovedBy;
                el.style.paddingTop = '4px';
                el.style.minHeight = '20px';
                el.style.fontSize = '12px';
                el.style.fontWeight = 'bold';
                el.style.textAlign = 'center';
                el.style.borderTop = hasValue ? 'none' : '1px solid #000';
                el.innerHTML = (role === 'preparer' ? localPreparedBy : localApprovedBy) || ' ';
            });

            const canvas = await html2canvas(dialogContent, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            });

            addButtons.forEach(button => button.style.display = '');
            Array.from(dialogContent.querySelectorAll('.signatory-dropdown')).forEach(el => el.style.display = '');
            Array.from(dialogContent.querySelectorAll('.signatory-text')).forEach(el => {
                el.style.display = 'none';
                el.style.paddingTop = '';
                el.style.minHeight = '';
                el.style.fontSize = '';
                el.style.fontWeight = '';
                el.style.textAlign = '';
                el.style.borderTop = '';
            });

            const imgData = canvas.toDataURL('image/png');
            const printWindow = window.open('', '', 'width=1200,height=800');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Overall Payroll Summary - ${payrollDateRange || ''}</title>
                        <style>
                            @media print {
                                @page { size: landscape; margin: 5mm; }
                                body { margin: 0; display: flex; align-items: center; }
                                img { max-width: 100%; height: auto; }
                            }
                            body { margin: 0; }
                            img { display: block; }
                        </style>
                    </head>
                    <body>
                        <img src="${imgData}" style="width: 100%; height: auto;" />
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();

            setTimeout(() => {
                try {
                    printWindow.print();
                } catch (error) {
                    console.error("Printing failed:", error);
                } finally {
                    printWindow.close();
                    setIsPrintingOrDownloading(false);
                }
            }, 500);
        } catch (error) {
            console.error("Error capturing screenshot for print:", error);
            setIsPrintingOrDownloading(false);
        }
    };

    const addPreparer = () => {
        setSelectedPreparers(prev => [...prev, { id: Date.now(), name: '' }]);
    };

    const removePreparer = (id) => {
        setSelectedPreparers(prev => prev.filter(p => p.id !== id));
    };

    const updatePreparerName = (id, name) => {
        setSelectedPreparers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    };

    const addApprover = () => {
        setSelectedApprovers(prev => [...prev, { id: Date.now(), name: '' }]);
    };

    const removeApprover = (id) => {
        setSelectedApprovers(prev => prev.filter(a => a.id !== id));
    };

    const updateApproverName = (id, name) => {
        setSelectedApprovers(prev => prev.map(a => a.id === id ? { ...a, name } : a));
    };

    const addReviewer = () => {
        setSelectedReviewers(prev => [...prev, { id: Date.now(), name: '' }]);
    };

    const removeReviewer = (id) => {
        setSelectedReviewers(prev => prev.filter(p => p.id !== id));
    };

    const updateReviewerName = (id, name) => {
        setSelectedReviewers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    };

    const handleDownloadPDF = async () => {
        if (!dialogRef.current) return;

        setIsDownloading(true);

        const addButtons = dialogRef.current.querySelectorAll('.add-signatory-button');
        addButtons.forEach(button => button.style.visibility = 'hidden');

        await new Promise(resolve => setTimeout(resolve, 150));

        const element = dialogRef.current;
        try {
            element.style.backgroundColor = "#ffffff";

            const html2CanvasScale = 2;

            const canvas = await html2canvas(element, {
                scale: html2CanvasScale,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                onclone: (document) => {
                    Array.from(document.querySelectorAll('.signatory-dropdown')).forEach(el => el.style.display = 'none');
                    Array.from(document.querySelectorAll('.signatory-text')).forEach(el => {
                        el.style.display = 'block';
                        const role = el.dataset.role;
                        const hasValue = role === 'preparer' ? !!localPreparedBy : !!localApprovedBy;
                        el.style.paddingTop = '4px';
                        el.style.minHeight = '20px';
                        el.style.fontSize = '12px';
                        el.style.fontWeight = 'bold';
                        el.style.textAlign = 'center';
                        el.style.borderTop = hasValue ? 'none' : '1px solid #000';
                        el.innerHTML = (role === 'preparer' ? localPreparedBy : localApprovedBy) || ' ';
                    });
                    Array.from(document.querySelectorAll('.add-signatory-button')).forEach(el => el.style.display = 'none');
                    Array.from(document.querySelectorAll('.net-pay-cell')).forEach(el => el.style.fontWeight = 'bold');
                }
            });

            addButtons.forEach(button => button.style.visibility = 'visible');

            const imgData = canvas.toDataURL("image/png");

            const pdfWidth = 841.89;
            const pdfHeight = 595.28;

            const imgWidth = canvas.width / html2CanvasScale;
            const imgHeight = canvas.height / html2CanvasScale;

            const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const finalWidth = imgWidth * scale;
            const finalHeight = imgHeight * scale;

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: "pt",
                format: 'a4'
            });

            pdf.addImage(imgData, "PNG", 0, 0, finalWidth, finalHeight);

            pdf.save(`Overall-Payroll-Summary-${payrollDateRange || 'period'}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            addButtons.forEach(button => button.style.visibility = 'visible');
        } finally {
            setIsDownloading(false);
            setIsPrintingOrDownloading(false);
            element.style.backgroundColor = "";
        }
    };

    const breakdownTotals = useMemo(() => {
        return records.reduce((acc, curr) => {
            acc.payroll += Number(curr.payrollNetPay - curr.totalAllowance || 0);
            acc.sssEmployer += Number(curr.sssEmployer || 0);
            acc.philHealthEmployer += Number(curr.philHealthEmployer || 0);
            acc.pagIbigEmployer += Number(curr.pagIbigEmployer || 0);
            acc.insuranceEmployer += Number(curr.insuranceEmployer || 0);
            acc.allowance += Number(curr.totalAllowance || 0);
            acc.advance += Number(curr.advance || 0);
            acc.tax += Number(curr.tax || 0);
            acc.loan += Number(curr.loan || 0);
            acc.bonuses += Number(curr.bonuses || 0);
            return acc;
        }, {
            payroll: 0, sssEmployer: 0, philHealthEmployer: 0, pagIbigEmployer: 0,
            insuranceEmployer: 0, allowance: 0, advance: 0, tax: 0, loan: 0, bonuses: 0,
        });
    }, [records]);

    const breakdownGrandTotal = useMemo(() => {
        return (breakdownTotals.payroll || 0) +
            (breakdownTotals.sssEmployer || 0) +
            (breakdownTotals.philHealthEmployer || 0) +
            (breakdownTotals.pagIbigEmployer || 0) +
            (breakdownTotals.insuranceEmployer || 0) +
            (breakdownTotals.allowance || 0) +
            (breakdownTotals.bonuses || 0) -
            (breakdownTotals.advance || 0) -
            (breakdownTotals.tax || 0) -
            (breakdownTotals.loan || 0);
    }, [breakdownTotals]);

    return (
        <Dialog
            open={open}
            onClose={close}
            fullWidth
            maxWidth="xl"
            PaperProps={{ style: { padding: "16px", backgroundColor: "#f8f9fa", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", borderRadius: "15px" } }}
        >
            <DialogTitle variant="h5" sx={{ fontWeight: "bold", pb: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        Overall Payroll Summary
                    </Typography>
                    <IconButton onClick={close} className="print-hide">
                        <i className="si si-close"></i>
                    </IconButton>
                </Box>
            </DialogTitle>

            <Box ref={dialogRef} sx={{ backgroundColor: "#ffffff", padding: 3, mt: 1, pb:10 }}>
                <Box sx={{ display: "flex", flexDirection:"column", justifyContent: "center", alignItems: "center", mb: 2 }}>
                    <img src={ManPro} alt="Company Logo" className="company-logo" style={{ maxWidth: '300px', maxHeight: '80px', objectFit: 'contain' }}/>
                    <Typography className="payroll-date-title" sx={{fontSize: "12px"}}>
                        (Payroll Period: {payrollDateRange || 'N/A'})
                    </Typography>
                </Box>

                <DialogContent sx={{ p: 0, overflow: 'visible' }}>
                    {loadingSignatories && <LoadingSpinner />}

                    <TableContainer style={{ overflowX: 'auto' }} sx={{ mt: 0 }}>
                        <Table size="small" className="table table-md table-striped table-vcenter table-bordered">
                            <TableBody className='table-body-head'>
                                <TableRow>
                                    {headerConfig.map(group => (
                                        <TableCell
                                            key={group.key} align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f2f2f2', fontSize: '10px', padding: '4px 6px' }}
                                            rowSpan={group.rowSpan || 1} colSpan={group.isGroup ? group.children?.length : (group.colSpan || 1)}
                                        > {group.primaryLabel} </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    {headerConfig.map(group => {
                                        if (!group.isGroup || !group.children) return null;
                                        return group.children.map(child => (
                                            <TableCell key={child.key} align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f2f2f2', fontSize: '10px', padding: '4px 6px' }}> {child.secondaryLabel} </TableCell>
                                        ));
                                    })}
                                </TableRow>
                            </TableBody>
                            <TableBody>
                                {records.map((record, index) => (
                                    <TableRow key={record.record || record.id || index} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& > td': { fontSize: '10px', padding: '4px 6px' } }}>
                                        {headerConfig.map(group => {
                                            if (!group.isGroup) {
                                                const isNetPay = (group.dataKey || group.key) === 'payrollNetPay';
                                                return ( <TableCell key={`${group.key}-${record.record || index}`} align={group.key === 'employeeName' ? "left" : "center"}
                                                             className={isNetPay ? 'net-pay-cell' : ''} sx={{ fontWeight: isNetPay ? 'bold' : 'normal' }}
                                                         >
                                                         {group.isTotaled ? formatCurrency(record[group.dataKey || group.key]) : record[group.dataKey || group.key] || '-'} </TableCell> );
                                            } else { return group.children?.map(child => {
                                                const isNetPay = child.dataKey === 'payrollNetPay';
                                                return ( <TableCell key={`${child.key}-${record.record || index}`} align="center"
                                                             className={isNetPay ? 'net-pay-cell' : ''} sx={{ fontWeight: isNetPay ? 'bold' : 'normal' }}
                                                         >
                                                        {child.isTotaled ? formatCurrency(record[child.dataKey]) : record[child.dataKey] || '-'} </TableCell> );
                                                }); }
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    <Typography className='breakdown' sx={{ mb: 1, fontWeight: 'bold', fontStyle: 'italic', fontSize: '12px', mt: 3 }}>Breakdown Summary:</Typography>
                    <Box className="breakdown-summary" sx={{ fontSize: '11px', '& p': { marginBottom: 0 }}}>
                        <p>Payroll: {formatCurrency(breakdownTotals.payroll)}</p>
                        <p>SSS Employer Share: {formatCurrency(breakdownTotals.sssEmployer)}</p>
                        <p>Philhealth Employer Share: {formatCurrency(breakdownTotals.philHealthEmployer)}</p>
                        <p>Pagibig Employer Share: {formatCurrency(breakdownTotals.pagIbigEmployer)}</p>
                        <p>Insurance Employer Share: {formatCurrency(breakdownTotals.insuranceEmployer)}</p>
                        <p>Allowance: {formatCurrency(breakdownTotals.allowance)}</p>
                        <p>Bonuses: {formatCurrency(breakdownTotals.bonuses)}</p>
                        <p>Advance: ({formatCurrency(breakdownTotals.advance)})</p>
                        <p>Tax: ({formatCurrency(breakdownTotals.tax)})</p>
                        <p>Loan: ({formatCurrency(breakdownTotals.loan)})</p>
                        <p style={{ marginTop: '8px', fontWeight: 'bold' }}> Total: {formatCurrency(breakdownGrandTotal)} </p>
                    </Box>

                    <Box sx={{mt:5, display: 'flex', justifyContent: 'left', gap:25}}>
                        <Typography sx={{ fontWeight: 'bold'}}>
                            Prepared by:
                            <Typography sx={{}}>
                                {selectedPreparers.map((prep, idx) => (
                                    <Typography key={`selected-prep-${idx}`} sx={{mt:5}}>{prep.name}</Typography>
                                ))}
                            </Typography>
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold'}}>
                            Approved by:
                            <Typography sx={{}}>
                                {selectedApprovers.map((appr, idx) => (
                                    <Typography key={`selected-appr-${idx}`} sx={{mt:5}}>{appr.name}</Typography>
                                ))}
                            </Typography>
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold'}}>
                            Reviewed by:
                            <Typography sx={{ display: 'flex', flexDirection: 'column'}}>
                                {selectedReviewers.map((rev, idx) => (
                                    <Typography key={`selected-rev-${idx}`} sx={{mt:5}}>{rev.name}</Typography>
                                ))}
                            </Typography>
                        </Typography>
                    </Box>
                </DialogContent>
            </Box>
            <Box sx={{display: 'flex', justifyContent:'space-between'}}>
                <Box className="print-signatory-row" sx={{ mt: 2, display: "flex", justifyContent: "start",flexWrap: 'wrap', gap: 2 }}>
                    <Box className="print-signatory-box" sx={{ minWidth: 220, }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography className='label' sx={{ fontSize: '12px', mr: 1 }}>Prepared By:</Typography>
                            <Tooltip title="Add Another Preparer">
                                <IconButton
                                size="small"
                                onClick={addPreparer}
                                className="add-signatory-button print-hide"
                                sx={{ p: '2px' }}
                                disabled={loadingSignatories}
                                >
                                <AddCircleOutlineIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        
                        <Box className="dropdown-box" sx={{display: "flex", flexDirection:"column", flexWrap: "wrap"}}>
                            {selectedPreparers.map((preparer, index) => (
                                <Box key={preparer.id} sx={{ alignItems: 'center', mb: 1,  }}>
                                    <Typography
                                        className="signatory-text"
                                        data-role="preparer"
                                        data-id={preparer.id}
                                        sx={{
                                            display: 'none',
                                            pt: 1,
                                            minHeight: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            flexGrow: 1,
                                            borderTop: preparer.name ? 'none' : '1px solid #000',
                                            mr: 0.5
                                        }}
                                    >
                                        {preparer.name || <> </>}
                                    </Typography>
                                    <FormControl size="small" className="signatory-dropdown print-hide">
                                        <Select
                                            displayEmpty
                                            value={preparer.name}
                                            onChange={(e) => updatePreparerName(preparer.id, e.target.value)}
                                            sx={{ backgroundColor: '#ffffff', fontSize: '12px' }}
                                            disabled={loadingSignatories}
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return <em>Select Preparer</em>;
                                                }
                                                return selected;
                                            }}
                                        >
                                            <MenuItem value="" disabled><em>Select Preparer</em></MenuItem>
                                            {preparedByOptions.map((name, idx) => (
                                                 <MenuItem
                                                    key={`prep-opt-${idx}`}
                                                    value={name}
                                                    disabled={selectedPreparers.some(p => p.name === name && p.id !== preparer.id)}
                                                >
                                                    {name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {selectedPreparers.length > 1 && (
                                        <Tooltip title="Remove Preparer">
                                            <IconButton onClick={() => removePreparer(preparer.id)} size="small" className="signatory-controls print-hide" sx={{ ml: 0.5 }} color="error">
                                                <i className="si si-minus"></i>
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box className="print-signatory-box" sx={{ minWidth: 220 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography className='label' sx={{ fontSize: '12px', mr: 1 }}>Approved By:</Typography>
                            <Tooltip title="Add Another Approver">
                                <IconButton
                                size="small"
                                onClick={addApprover}
                                className="add-signatory-button print-hide"
                                sx={{ p: '2px'}}
                                disabled={loadingSignatories}
                                >
                                <AddCircleOutlineIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Box className="dropdown-box" sx={{display: "flex", flexDirection:"column", flexWrap: "wrap"}}>
                            {selectedApprovers.map((approver, index) => (
                                <Box key={approver.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography
                                        className="signatory-text"
                                        data-role="approver"
                                        data-id={approver.id}
                                        sx={{
                                            display: 'none',
                                            pt: 1,
                                            minHeight: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            flexGrow: 1,
                                            borderTop: approver.name ? 'none' : '1px solid #000',
                                            mr: 0.5
                                        }}
                                    >
                                        {approver.name || <> </>}
                                    </Typography>
                                    <FormControl size="small" className="signatory-dropdown print-hide">
                                        <Select
                                            displayEmpty
                                            value={approver.name}
                                            onChange={(e) => updateApproverName(approver.id, e.target.value)}
                                            sx={{ backgroundColor: '#ffffff', fontSize: '12px' }}
                                            disabled={loadingSignatories}
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                return <em>Select Approver</em>;
                                                }
                                                return selected;
                                            }}
                                        >
                                            <MenuItem value="" disabled><em>Select Approver</em></MenuItem>
                                            {approvedByOptions.map((name, idx) => {
                                                const isSelected = selectedApprovers.some(
                                                (a) => a.name === name && a.id !== approver.id
                                                );
                                                return (
                                                <MenuItem
                                                    key={`appr-opt-${idx}`}
                                                    value={name}
                                                    disabled={isSelected}
                                                >
                                                    {name}
                                                </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                    {selectedApprovers.length > 1 && (
                                        <Tooltip title="Remove Approver">
                                            <IconButton onClick={() => removeApprover(approver.id)} size="small" className="signatory-controls print-hide" sx={{ ml: 0.5 }} color="error">
                                                <i className="si si-minus"></i>
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box className="print-signatory-box" sx={{ minWidth: 220, }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography className='label' sx={{ fontSize: '12px', mr: 1 }}>Reviewed By:</Typography>
                            <Tooltip title="Add Another Reviewer">
                                <IconButton
                                size="small"
                                onClick={addReviewer}
                                className="add-signatory-button print-hide"
                                sx={{ p: '2px' }}
                                disabled={loadingSignatories}
                                >
                                <AddCircleOutlineIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Box className="dropdown-box" sx={{display: "flex", flexDirection:"column", flexWrap: "wrap"}}>
                            {selectedReviewers.map((reviewer, index) => (
                                <Box key={reviewer.id} sx={{ alignItems: 'center', mb: 1, }}>
                                    <Typography
                                        className="signatory-text"
                                        data-role="reviewer"
                                        data-id={reviewer.id}
                                        sx={{
                                            display: 'none',
                                            pt: 1,
                                            minHeight: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            flexGrow: 1,
                                            borderTop: reviewer.name ? 'none' : '1px solid #000',
                                            mr: 0.5
                                        }}
                                    >
                                        {reviewer.name || <> </>}
                                    </Typography>
                                    <FormControl size="small" className="signatory-dropdown print-hide">
                                        <Select
                                            displayEmpty
                                            value={reviewer.name}
                                            onChange={(e) => updateReviewerName(reviewer.id, e.target.value)}
                                            sx={{ backgroundColor: '#ffffff', fontSize: '12px' }}
                                            disabled={loadingSignatories}
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return <em>Select Reviewer</em>;
                                                }
                                                return selected;
                                            }}
                                        >
                                            <MenuItem value="" disabled><em>Select Reviewer</em></MenuItem>
                                            {reviewedByOptions.map((name, idx) => (
                                                <MenuItem
                                                    key={`rev-opt-${idx}`}
                                                    value={name}
                                                    disabled={selectedReviewers.some(r => r.name === name && r.id !== reviewer.id)}
                                                >
                                                    {name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {selectedReviewers.length > 1 && (
                                        <Tooltip title="Remove Reviewer">
                                            <IconButton onClick={() => removeReviewer(reviewer.id)} size="small" className="signatory-controls print-hide" sx={{ ml: 0.5 }} color="error">
                                                <i className="si si-minus"></i>
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
                <Box className="print-hide" sx={{mt: 2, display: "flex", gap: 2, alignItems: "center", justifyContent: "flex-end"}}>
                    <Button
                        color='secondary'
                        onClick={handleDownloadPDF}
                        variant="contained"
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                    <Button
                        onClick={handlePrint}
                        variant="contained"
                        disabled={isPrintingOrDownloading}
                    >
                        {isPrintingOrDownloading ? 'Preparing...' : 'Print'}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default OverallPayrollSummary;