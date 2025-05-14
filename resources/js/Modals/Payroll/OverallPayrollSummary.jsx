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


const OverallPayrollSummary = ({
    open,
    close,
    records = [],
    totals = {},
    headerConfig = [],
    payrollDateRange,
    preparedBy: propPreparedBy,
    approvedBy: propApprovedBy,
    onAddSignatoryClick
}) => {

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
        console.log("Fetching signatories...");
        try {
            const response = await axiosInstance.get('/signatories', { headers });
            let data = response.data;
            if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
                 data = data[0];
            } else if (!Array.isArray(data)) {
                 console.warn("Signatories data received is not an array:", response.data);
                 data = [];
            }
            setSignatories(Array.isArray(data) ? data : []);
            console.log("Signatories fetched:", data);
        } catch (err) {
            console.error("Error fetching signatories:", err);
            setSignatories([]);
        }
    }, [headers, open]);


    useEffect(() => {
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
        Array.isArray(signatories) ? [...new Set(signatories.map(s => s.prepared_by).filter(Boolean))] : []
    ), [signatories]);

    const reviewedByOptions = useMemo(() => (
        Array.isArray(signatories) ? [...new Set(signatories.map(s => s.reviewed_by).filter(Boolean))] : []
    ), [signatories]);


    const formatCurrency = useCallback((value) => {
        const num = Number(value);
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(!isNaN(num) ? num : 0);
    }, []);

    const handlePrint = () => {
        setIsPrintingOrDownloading(true);
        setTimeout(() => {
            const dialogContent = dialogRef.current;
            if (!dialogContent) {
                setIsPrintingOrDownloading(false);
                return;
            }

            const clonedContent = dialogContent.cloneNode(true);

            const addButtons = clonedContent.querySelectorAll('.add-signatory-button');
            addButtons.forEach(button => button.style.display = 'none');

            const tables = clonedContent.querySelectorAll('table');

            tables.forEach((table) => {
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach((row, index) => {
                    if ((index + 1) % 20 === 0 && rows.length > index + 1) {
                        const pageBreak = document.createElement('tr');
                        pageBreak.innerHTML = `<td colspan="${row.children.length}" style="border: none; height: 1px; padding: 0; margin: 0; page-break-after: always;"></td>`;
                        row.after(pageBreak);
                    }
                });
            });
            const printWindow = window.open('', '', 'width=1200,height=800');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Overall Payroll Summary - ${payrollDateRange || ''}</title>
                        <style>
                            @media print {
                                @page { size: landscape; margin: 15mm; }
                                body { font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; zoom: 85%; }
                                .print-hide, .add-signatory-button { display: none !important; }
                                .signatory-dropdown { display: none !important; }
                                .signatory-text { display: block !important; }
                                .print-signatory-row { display: flex !important; flex-direction: column; margin-top: 40px; page-break-inside: avoid; }
                                .print-signatory-box { min-width: 200px; }
                                .dropdown-box {display: flex; flex-direction: row; gap: 50px; flex-wrap: wrap;}
                                .label {font-weight: bold;}

                                table { width: 100%; border-collapse: collapse; table-layout: auto; word-wrap: break-word; page-break-inside: auto; }
                                tr { page-break-inside: avoid; page-break-after: auto; }
                                th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: center; font-size: 10px; page-break-inside: avoid; word-break: break-word; }
                                th { background-color: #f2f2f2; font-weight: bold; }
                                td:first-child, th:first-child { text-align: left; }
                                .company-logo { display: block; margin: 0 auto 10px auto; max-width: 300px; max-height: 80px; }
                                .payroll-date-title { text-align: center; font-weight: bold; font-size: 10px; margin-bottom: 15px; }
                                .breakdown-summary { margin-top: 20px; font-size: 11px; page-break-inside: avoid; }
                                .breakdown-summary p { margin: 2px 0; text-transform: uppercase; }
                                .breakdown {margin-top: 2px 0; text-transform: uppercase; font-style: italic; font-size: 12px;}
                                .table-body-head {font-weight: bold; font-size: 12px; text-align: center; background-color: #f2f2f2;}
                                .signatory-text {}
                            }
                            .signatory-text { display: none; }
                        </style>
                    </head>
                    <body>
                        ${clonedContent.innerHTML}
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
        }, 100);
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
        setSelectedApprovers(prev =>
          prev.map(a => (a.id === id ? { ...a, name } : a))
        );
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

    const approvedByOptions = useMemo(() => (
        Array.isArray(signatories) ? [...new Set([
            ...signatories.map(s => s.approved_by_one),
            ...signatories.map(s => s.approved_by_two),
            ...signatories.map(s => s.approved_by_three)
        ].filter(Boolean))] : []
    ), [signatories]);

    const handleDownloadPDF = async () => {
        if (!dialogRef.current) return;

        setIsDownloading(true);
        setIsPrintingOrDownloading(true);

        const addButtons = dialogRef.current.querySelectorAll('.add-signatory-button');
        addButtons.forEach(button => button.style.visibility = 'hidden');


        await new Promise(resolve => setTimeout(resolve, 150));

        const element = dialogRef.current;
        try {
            element.style.backgroundColor = "#ffffff";

            const canvas = await html2canvas(element, {
                scale: 2,
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
                         el.innerHTML = (role === 'preparer' ? localPreparedBy : localApprovedBy) || '&nbsp;';
                    });
                     Array.from(document.querySelectorAll('.add-signatory-button')).forEach(el => el.style.display = 'none');
                 }
            });

             addButtons.forEach(button => button.style.visibility = 'visible');


            const imgData = canvas.toDataURL("image/png");

             const a4WidthPt = 841.89;
             const a4HeightPt = 595.28;

             const imgWidth = canvas.width;
             const imgHeight = canvas.height;

             const scaleFactor = a4WidthPt / (imgWidth / canvas.scale);

             const pdfWidth = a4WidthPt;
             const pdfHeight = (imgHeight / canvas.scale) * scaleFactor;


             const pdf = new jsPDF({
                 orientation: 'landscape',
                 unit: "pt",
                 format: 'a4'
             });

             pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

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
             acc.philhealthEmployer += Number(curr.philhealthEmployer || 0);
             acc.pagibigEmployer += Number(curr.pagibigEmployer || 0);
             acc.insuranceEmployer += Number(curr.insuranceEmployer || 0);
             acc.allowance += Number(curr.totalAllowance || 0);
             acc.advance += Number(curr.advance || 0);
             acc.tax += Number(curr.tax || 0);
             acc.loan += Number(curr.loan || 0);
             acc.bonuses += Number(curr.bonuses || 0);
             return acc;
         }, {
             payroll: 0, sssEmployer: 0, philhealthEmployer: 0, pagibigEmployer: 0,
             insuranceEmployer: 0, allowance: 0, advance: 0, tax: 0, loan: 0, bonuses: 0,
         });
     }, [records]);

    const breakdownGrandTotal = useMemo(() => {
        return (breakdownTotals.payroll || 0) +
            (breakdownTotals.sssEmployer || 0) +
            (breakdownTotals.philhealthEmployer || 0) +
            (breakdownTotals.pagibigEmployer || 0) +
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
            <DialogTitle variant="h5" sx={{ fontWeight: "bold", borderBottom: '1px solid #e0e0e0', pb: 1 }}>
                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                         Overall Payroll Summary
                     </Typography>
                     <IconButton onClick={close} className="print-hide">
                         <i className="si si-close"></i>
                     </IconButton>
                 </Box>
             </DialogTitle>

             <Box ref={dialogRef} sx={{ backgroundColor: "#ffffff", padding: 3, mt: 1 }}>
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
                                                   return ( <TableCell key={`${group.key}-${record.record || index}`} align={group.key === 'employeeName' ? "left" : "center"}>
                                                       {group.isTotaled ? formatCurrency(record[group.dataKey || group.key]) : record[group.dataKey || group.key] || '-'} </TableCell> );
                                               } else { return group.children?.map(child => ( <TableCell key={`${child.key}-${record.record || index}`} align="center">
                                                   {child.isTotaled ? formatCurrency(record[child.dataKey]) : record[child.dataKey] || '-'} </TableCell> )); }
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
                            <p>Philhealth Employer Share: {formatCurrency(breakdownTotals.philhealthEmployer)}</p>
                            <p>Pagibig Employer Share: {formatCurrency(breakdownTotals.pagibigEmployer)}</p>
                            <p>Insurance Employer Share: {formatCurrency(breakdownTotals.insuranceEmployer)}</p>
                            <p>Allowance: {formatCurrency(breakdownTotals.allowance)}</p>
                            <p>Bonuses: {formatCurrency(breakdownTotals.bonuses)}</p>
                            <p>Advance: ({formatCurrency(breakdownTotals.advance)})</p>
                            <p>Tax: ({formatCurrency(breakdownTotals.tax)})</p>
                            <p>Loan: ({formatCurrency(breakdownTotals.loan)})</p>
                            <p style={{ marginTop: '8px', fontWeight: 'bold' }}> Total: {formatCurrency(breakdownGrandTotal)} </p>
                        </Box>

                        <Box className="print-signatory-row" sx={{ mt: 4, display: "flex", flexDirection: "column", justifyContent: "start",flexWrap: 'wrap', gap: 2 }}>
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
                                
                                <Box className="dropdown-box" sx={{display: "flex", flexDirection:"row", flexWrap: "wrap"}}>
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
                                                {preparer.name || <>&nbsp;</>}
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
                                                    {preparedByOptions.map((name, idx) => ( <MenuItem key={`prep-opt-${idx}`} value={name}>{name}</MenuItem> ))}
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
                                
                                <Box className="dropdown-box" sx={{display: "flex", flexDirection:"row", flexWrap: "wrap"}}>
                                    {selectedReviewers.map((reviewer, index) => (
                                        <Box key={reviewer.id} sx={{ alignItems: 'center', mb: 1,  }}>
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
                                                {reviewer.name || <>&nbsp;</>}
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
                                                    {reviewedByOptions.map((name, idx) => ( <MenuItem key={`revr-opt-${idx}`} value={name}>{name}</MenuItem> ))}
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

                                <Box className="dropdown-box" sx={{display: "flex", flexDirection:"row", flexWrap: "wrap"}}>
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
                                                {approver.name || <>&nbsp;</>}
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
                        </Box>
                  </DialogContent>
             </Box>


             <Box sx={{ display: "flex", justifyContent: "end", mt: 2, gap: 2, p: 2, borderTop: '1px solid #e0e0e0' }} className="print-hide">
                  <Button variant="contained" color="secondary" onClick={handleDownloadPDF} disabled={isPrintingOrDownloading || records.length === 0 || loadingSignatories} size="small">
                      {isDownloading ? "Downloading...": "Download PDF"}
                  </Button>
                  <Button variant="contained" color="primary" onClick={handlePrint} disabled={isPrintingOrDownloading || records.length === 0 || loadingSignatories} size="small">
                      Print
                  </Button>
             </Box>
        </Dialog>
    );
};

export default OverallPayrollSummary;