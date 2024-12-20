import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, FormControl, FormGroup, InputLabel, FormHelperText, Select, MenuItem, TextField, Typography, Grid } from "@mui/material";
import { makeStyles } from '@mui/styles';
import Swal from 'sweetalert2';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useSearchParams } from 'react-router-dom'

const useStyles = makeStyles({
    topScrollPaper: {
        alignItems: "flex-start"
    },
    topPaperScrollBody: {
        verticalAlign: "top"
    }
});

const titleOptions = ["SSS", "PHILHEALTH", "PAGIBIG", "INSURANCE"];
const inputOptions = ["Percentage", "Brackets", "Amount"];
const cutoffOptions = ["First", "Second", "Both"];
const taxRateType = ["Daily", "Weekly", "Semi-Monthly", "Monthly"];

const HrEmployeeAdditionalBenefitModal = ({ open, close, type, benefitData }) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const empID = searchParams.get('employeeID')
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const classes = useStyles();
    const [titleError, setTitleError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        chooseType: '',
        percentage: '',
        brackets: [],
        amount: '',
        newRange: {
            rangeFrom: '',
            rangeTo: '',
            share: '',
            shareAmount: '',
        },
        emp_id: '',
        chooseCutoff: '',
        amountTotal: '',
    });
    const [employeeDetails, setEmployeeDetails] = useState([]);

    useEffect(() => {
        axiosInstance.get(`/employees/${empID}`, { headers }).then((response) => {
            setEmployeeDetails(response.data.employee);
        });
    }, [])

    const handleSubmitBenefit = (e) => {
        e.preventDefault();

        // // Check for non - alphanumeric characters
        // if (!/^[a-zA-Z0-9\s]+$/.test(formData.title)) {
        //     setTitleError('Only alphanumeric characters are allowed.');
        //     return;
        // }

        if (benefitData !== null) {
            if (window.confirm('Confirm Addition of Benefits')) {
                axiosInstance.post('/add_additional_benefits', {
                    title: benefitData.title || formData.title,
                    type: type,
                    amount: formData.amount,
                    emp_id: formData.emp_id,
                    chooseCutoff: formData.chooseCutoff,
                    benefitlist_id: benefitData.benefitlist_id,
                    amountTotal: formData.amountTotal,
                }, { headers }).then((response) => {
                    if (response.data.message === 'Success') {
                        close();
                        Swal.fire({
                            title: "Success!",
                            text: "Added successfully",
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: false
                        }).then(function () {
                            location.reload();
                        });
                    }
                });
            }
        } else {
            if (window.confirm('Confirm Addition of Benefits')) {
                axiosInstance.post('/add_additional_benefits', {
                    title: formData.title,
                    type: type,
                    chooseType: formData.chooseType,
                    percentage: formData.percentage,
                    amount: formData.amount,
                    brackets: formData.brackets,
                }, { headers }).then((response) => {
                    if (response.data.message === 'Success') {
                        close();
                        Swal.fire({
                            title: "Success!",
                            text: "Added successfully",
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: false
                        }).then(function () {
                            location.reload();
                        });
                    }
                });
            }
        }

    };

    const handleInputChange = (field, newValue) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: newValue,
        }));
    };

    const handleNewRangeChange = (field, newValue) => {
        setFormData((prevData) => ({
            ...prevData,
            newRange: {
                ...prevData.newRange,
                [field]: newValue,
            },
        }));
    };

    const addNewRange = () => {
        const newRange = { ...formData.newRange };
        setFormData((prevData) => ({
            ...prevData,
            brackets: [...prevData.brackets, newRange],
            newRange: {
                rangeFrom: '',
                rangeTo: '',
                share: '',
                shareAmount: '',
            },
        }));
    };

    const deleteRange = (index) => {
        setFormData((prevData) => ({
            ...prevData,
            brackets: prevData.brackets.filter((_, i) => i !== index),
        }));
    };

    return (
        <Dialog open={open} fullWidth maxWidth="sm" classes={{
            scrollPaper: classes.topScrollPaper,
            paperScrollBody: classes.topPaperScrollBody
        }}>
            <Box className="d-flex justify-content-between">
                <DialogTitle>
                    Add List
                </DialogTitle>
                <li className="fa fa-close text-danger p-10" onClick={close} style={{ cursor: 'pointer' }}></li>
            </Box>
            <DialogContent>
                <div className="table-responsive px-20 py-20">
                    {(type !== 2 && type !== 5 && type !== 4) ? <>
                        <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                            <InputLabel htmlFor="title">Title</InputLabel>
                            <Select
                                label="Title"
                                name="title"
                                id="title"
                                value={benefitData ? benefitData.title : formData.title}
                                onChange={(e) => {
                                    handleInputChange('title', e.target.value);
                                    setTitleError('');
                                }}
                            >
                                <MenuItem disabled value="">
                                </MenuItem>
                                {titleOptions.map((option, index) => (
                                    <MenuItem key={index} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </> :
                        <>
                            <FormGroup row={true} className="d-flex justify-content-between" sx={{
                                '& label.Mui-focused': {
                                    color: '#97a5ba',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#97a5ba',
                                    },
                                },
                            }}>
                                <FormControl
                                    sx={{
                                        marginBottom: 3, width: '100%', '& label.Mui-focused': {
                                            color: '#97a5ba',
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#97a5ba',
                                            },
                                        },
                                    }}
                                    error={!!titleError}
                                >
                                    <TextField
                                        name="title"
                                        id="title"
                                        label="Title"
                                        type="text"
                                        variant="outlined"
                                        value={benefitData ? benefitData.title : formData.title}
                                        onChange={(e) => {
                                            handleInputChange('title', e.target.value);
                                            setTitleError(''); // Clear error when input changes
                                        }}
                                        sx={{ marginTop: 2, height: 40 }}
                                    />
                                    <FormHelperText>{titleError}</FormHelperText>
                                </FormControl>
                            </FormGroup>
                        </>}
                    {(type !== 2 && type !== 5) ?
                        <FormControl fullWidth variant="outlined">
                            {type !== 4 ? <>
                                <InputLabel htmlFor="chooseType">Mode</InputLabel>
                                <Select
                                    label="Mode"
                                    name="chooseType"
                                    id="chooseType"
                                    value={formData.chooseType}
                                    onChange={(e) => handleInputChange('chooseType', e.target.value)}
                                >
                                    <MenuItem disabled value="">
                                    </MenuItem>
                                    {inputOptions.map((option, index) => (
                                        <MenuItem key={index} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select> </> : <>
                                <InputLabel htmlFor="chooseType">Cutoff Type</InputLabel>
                                <Select
                                    label="Cutoff Type"
                                    name="chooseType"
                                    id="chooseType"
                                    value={formData.chooseType}
                                    onChange={(e) => handleInputChange('chooseType', e.target.value)}
                                >
                                    <MenuItem disabled value="">
                                    </MenuItem>
                                    {taxRateType.map((option, index) => (
                                        <MenuItem key={index} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select></>}
                            {formData.chooseType === "Percentage" ?
                                <TextField
                                    name="percentage"
                                    id="percentage"
                                    label="Input Percentage"
                                    type="number"
                                    variant="outlined"
                                    value={formData.percentage}
                                    onChange={(e) => handleInputChange('percentage', e.target.value)}
                                    sx={{ marginTop: 2 }}
                                />
                                : (formData.chooseType === "Brackets" || type === 4) ?
                                    <>
                                        {formData.brackets.length > 0 && (
                                            <table>
                                                <thead>
                                                    <tr>
                                                        {type === 4 ? <>
                                                            <th>From</th>
                                                            <th>To</th>
                                                            <th></th>
                                                            <th>Percentage</th>
                                                            <th></th>
                                                            <th>Amount</th>
                                                            <th>Action</th>
                                                        </> : <>
                                                            <th>From</th>
                                                            <th>To</th>
                                                            <th></th>
                                                            <th>Percentage</th>
                                                            <th>Action</th>
                                                        </>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {formData.brackets.map((range, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <TextField
                                                                    type="number"
                                                                    value={range.rangeFrom}
                                                                    onChange={(e) => handleInputChange('rangeFrom', e.target.value)}
                                                                    variant="outlined"
                                                                />
                                                            </td>
                                                            <td>
                                                                <TextField
                                                                    type="number"
                                                                    value={range.rangeTo}
                                                                    onChange={(e) => handleInputChange('rangeTo', e.target.value)}
                                                                    variant="outlined"
                                                                />
                                                            </td>
                                                            <td>
                                                                <Typography sx={{ textAlign: 'center' }}>=</Typography>
                                                            </td>
                                                            <td>
                                                                <TextField
                                                                    type="number"
                                                                    value={range.share}
                                                                    onChange={(e) => handleInputChange('share', e.target.value)}
                                                                    variant="outlined"
                                                                />
                                                            </td>
                                                            {type === 4 && <>
                                                                <td>
                                                                    <Typography sx={{ textAlign: 'center' }}>+</Typography>
                                                                </td>
                                                                <td>
                                                                    <TextField
                                                                        type="number"
                                                                        value={range.shareAmount}
                                                                        onChange={(e) => handleInputChange('shareAmount', e.target.value)}
                                                                        variant="outlined"
                                                                    />
                                                                </td>
                                                            </>}
                                                            <td>
                                                                <Button onClick={() => deleteRange(index)}>
                                                                    <i className="si si-minus" style={{ fontSize: '24px' }}></i>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                        <div>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        {type === 4 ? <>
                                                            <th>From</th>
                                                            <th>To</th>
                                                            <th></th>
                                                            <th>Percentage</th>
                                                            <th></th>
                                                            <th>Amount</th>
                                                            <th>Action</th>
                                                        </> : <>
                                                            <th>From</th>
                                                            <th>To</th>
                                                            <th></th>
                                                            <th>Percentage</th>
                                                            <th>Action</th>
                                                        </>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <TextField
                                                                type="number"
                                                                value={formData.newRange.rangeFrom}
                                                                onChange={(e) => handleNewRangeChange('rangeFrom', e.target.value)}
                                                                variant="outlined"
                                                            />
                                                        </td>
                                                        <td>
                                                            <TextField
                                                                type="number"
                                                                value={formData.newRange.rangeTo}
                                                                onChange={(e) => handleNewRangeChange('rangeTo', e.target.value)}
                                                                variant="outlined"
                                                            />
                                                        </td>
                                                        <td>
                                                            <Typography sx={{ textAlign: 'center' }}>=</Typography>
                                                        </td>
                                                        <td>
                                                            <TextField
                                                                type="number"
                                                                value={formData.newRange.share}
                                                                onChange={(e) => handleNewRangeChange('share', e.target.value)}
                                                                variant="outlined"
                                                            />
                                                        </td>
                                                        {type === 4 && <>
                                                            <td>
                                                                <Typography sx={{ textAlign: 'center' }}>+</Typography>
                                                            </td>
                                                            <td>
                                                                <TextField
                                                                    type="number"
                                                                    value={formData.newRange.shareAmount}
                                                                    onChange={(e) => handleNewRangeChange('shareAmount', e.target.value)}
                                                                    variant="outlined"
                                                                />
                                                            </td>
                                                        </>}
                                                        <td>
                                                            <Button onClick={addNewRange}>
                                                                <i className="si si-plus" style={{ fontSize: '24px' }}></i>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                    : formData.chooseType === "Amount" ? <>
                                        <TextField
                                            name="amount"
                                            id="amount"
                                            label="Input Amount"
                                            type="number"
                                            variant="outlined"
                                            value={formData.amount}
                                            onChange={(e) => handleInputChange('amount', e.target.value)}
                                            sx={{ marginTop: 2 }}
                                        /></> : null}
                        </FormControl>
                        : type === 5 ? <>
                            <Grid container sx={{ display: 'flex' }} spacing={2}>
                                <Grid item xs={6}>
                                    <FormControl sx={{
                                        width: '100%', '& label.Mui-focused': {
                                            color: '#97a5ba',
                                        },
                                        '& .MuiOutlinedInput-root': {

                                            '&.Mui-focused fieldset': {
                                                borderColor: '#97a5ba',
                                            },
                                        },
                                    }}>
                                        <InputLabel sx={{ borderColor: '#97a5ba', }}>Select Employee</InputLabel>
                                        <Select
                                            name="emp_id"
                                            id="emp_id"
                                            variant="outlined"
                                            label="Select Employee"
                                            value={formData.emp_id}
                                            onChange={(e) => handleInputChange('emp_id', e.target.value)}
                                        >
                                            {employeeDetails.map((emp) => (
                                                <MenuItem key={emp.user_id} value={emp.user_id}>{emp.fname} {emp.lname}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid><Grid item xs={6}>
                                    <TextField
                                        name="amountTotal"
                                        id="amountTotal"
                                        label="Total Loan Amount"
                                        type="number"
                                        variant="outlined"
                                        value={formData.amountTotal}
                                        onChange={(e) => handleInputChange('amountTotal', e.target.value)}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                            <Grid container sx={{ display: 'flex', marginTop: 1 }} spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        name="amount"
                                        id="amount"
                                        label="Loan Deduction Amount"
                                        type="number"
                                        variant="outlined"
                                        value={formData.amount}
                                        onChange={(e) => handleInputChange('amount', e.target.value)}
                                        fullWidth
                                    />
                                </Grid><Grid item xs={6}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel htmlFor="chooseCutoff">Cutoff Type</InputLabel>
                                        <Select
                                            label="Cutoff Type"
                                            name="chooseCutoff"
                                            id="chooseCutoff"
                                            value={formData.chooseCutoff}
                                            onChange={(e) => handleInputChange('chooseCutoff', e.target.value)}
                                        >
                                            <MenuItem disabled value="">
                                            </MenuItem>
                                            {cutoffOptions.map((option, index) => (
                                                <MenuItem key={index} value={index + 1}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </>
                            : null}

                    <div className='d-flex justify-content-center mt-20'>
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={handleSubmitBenefit}
                        >
                            <i className="fa fa-check mr-2 mt-1"></i>Submit
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default HrEmployeeAdditionalBenefitModal;
