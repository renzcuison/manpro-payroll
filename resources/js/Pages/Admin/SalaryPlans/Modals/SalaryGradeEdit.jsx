import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, FormGroup, FormControl, InputLabel, FormControlLabel, } from '@mui/material';
import React, { useState} from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'react-quill/dist/quill.snow.css';

const SalaryGradeEdit = ({ open, close, salaryGradeInfo, onDeleted, existingSalaryGrades }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [loading, setLoading] = useState(false);

    const [salary_grade, setSalaryGrade] = useState(salaryGradeInfo.salary_grade);
    const [amount, setAmount] = useState(salaryGradeInfo.amount);
    const [salary_grade_version, setSalaryGradeVersion] = useState(salaryGradeInfo.salary_grade_version ?? '');
    const [salaryGradeInput, setSalaryGradeInput] = useState(
        salaryGradeInfo.salary_grade_version
            ? `${salaryGradeInfo.salary_grade}-${salaryGradeInfo.salary_grade_version}`
            : salaryGradeInfo.salary_grade
    );

    const [salaryGradeError, setSalaryGradeError] = useState(false);
    const [amountError, setAmountError] = useState(false);
    
    const checkInput = (event) => {
        event.preventDefault();

        if (salaryGradeInfo.employee_count > 0) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "You cannot edit this salary grade. There are existing employees with this salary grade.",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
            return;
        }

        // If input contains a dash, both numbers must be present
        if (
            salaryGradeInput.includes('-') &&
            (
                salary_grade_version === '' ||
                salary_grade_version === undefined
            )
        ) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "Please complete the fields.",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
            return;
        }

        // 1. If there is NO version, check if any row exists with the same salary_grade and NO version
        if (!salary_grade_version) {
            const baseExists = existingSalaryGrades.some((grade) =>
                String(grade.salary_grade) === String(salary_grade) &&
                (!grade.salary_grade_version || grade.salary_grade_version === '')
            );
            if (baseExists) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "That salary grade already exists.",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
                return;
            }
        }

        // 2. If there IS a version, check if any row exists with the same salary_grade AND salary_grade_version
        if (salary_grade_version) {
            const versionExists = existingSalaryGrades.some((grade) =>
                String(grade.salary_grade) === String(salary_grade) &&
                String(grade.salary_grade_version || '') === String(salary_grade_version)
            );
            if(salary_grade_version === '0') {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "That salary grade version cannot exist.",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
                return;
            } else if (versionExists) {
                Swal.fire({
                    customClass: { container: 'my-swal' },
                    text: "That salary grade already exists.",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonColor: '#177604',
                });
                return;
            }
        }

        setSalaryGradeError(!salary_grade);
        setAmountError(!amount);

        if (!salary_grade || !amount) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "This salary grade will be updated.",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Update",
                confirmButtonColor: "#177604",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const cleanedAmount = amount.replace(/,/g, '');

        const data = {
            id: salaryGradeInfo.id,
            salary_grade: salary_grade,
            salary_grade_version: salary_grade_version,
            amount: cleanedAmount
        };

        axiosInstance.post(`/editSalaryGrade/${salaryGradeInfo.id}`, data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Salary Grade updated successfully!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        close();
                        if (onUpdated) onUpdated();
                        if (onDeleted) onDeleted();
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

    };

    const formatCurrency = (value) => {
        if (!value) return "";

        let sanitizedValue = value.replace(/[^0-9.]/g, "");

        const parts = sanitizedValue.split(".");
        if (parts.length > 2) {
            sanitizedValue = parts[0] + "." + parts.slice(1).join("");
        }

        let [integerPart, decimalPart] = sanitizedValue.split(".");
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        if (decimalPart !== undefined) {
            decimalPart = decimalPart.slice(0, 2);
            return decimalPart.length > 0 ? `${integerPart}.${decimalPart}` : integerPart + ".";
        }

        return integerPart;
    };

    const handleInputChange = (e, setValue) => {
        const formattedValue = formatCurrency(e.target.value);
        setValue(formattedValue);
    };

        
        
    const handleDeleteSalaryGrade = (salaryGrade) => {
        if (salaryGradeInfo.employee_count > 0) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "You cannot delete this salary grade. There are existing employees with this salary grade.",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
            return;
        }

        Swal.fire({
            customClass: { container: "my-swal" },
            title: `Delete Salary Grade?`,
            text: `Are you sure you want to delete this salary grade? This action can't be undone!`,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#E9AE20",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                const data = {
                    salary_grade: salaryGrade.id, // or salaryGrade.salary_grade if your backend expects that
                };

                axiosInstance.post('/deleteSalaryGrade', data, { headers })
                    .then(response => {
                        Swal.fire({
                            customClass: { container: 'my-swal' },
                            text: "Salary grade deleted successfully!",
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: true,
                            confirmButtonText: 'Proceed',
                            confirmButtonColor: '#177604',
                        }).then(() => {
                            close(); // Close the modal
                            // Optionally, you can call a prop like onDeleted() to refresh the parent list
                        });
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        });
    };

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                        borderRadius: '20px',
                        minWidth: '800px',
                        maxWidth: '1000px',
                        marginBottom: '5%'
                    }
                }}>                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Edit Salary Grade </Typography>
                        <IconButton onClick={close}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    id="salary_grade"
                                    label="Salary Grade"
                                    variant="outlined"
                                    value={salaryGradeInput}
                                    error={salaryGradeError}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // Allow only numbers or numbers-dash-numbers (e.g., 1, 2-1, 10-2)
                                        const validPattern = /^(\d+|\d+-\d*)$/;
                                        if (value === '' || validPattern.test(value)) {
                                            setSalaryGradeInput(value);

                                            if (value.includes('-')) {
                                                const [main, version] = value.split('-');
                                                setSalaryGrade(main.trim());
                                                setSalaryGradeVersion(version !== undefined ? version.trim() : '');
                                            } else {
                                                setSalaryGrade(value.trim());
                                                setSalaryGradeVersion('');
                                            }
                                        }
                                    }}
                                />
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '66%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <InputLabel>Amount</InputLabel>
                                <OutlinedInput
                                    required
                                    id="amount"
                                    label="Amount"
                                    value={amount}
                                    error={amountError}
                                    startAdornment={<InputAdornment position="start">₱</InputAdornment>}
                                    onChange={(e) => handleInputChange(e, setAmount)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px', gap: 3 }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white'}} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Update Salary Grade </p>
                            </Button>
                            <Button onClick={(event) => {event.stopPropagation(); handleDeleteSalaryGrade(salaryGradeInfo);}} variant="contained" sx={{ backgroundColor: '#dc3545', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-trash mr-2 mt-1"></i> Delete Salary Grade </p>
                            </Button>
                        </Box>

                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default SalaryGradeEdit;
