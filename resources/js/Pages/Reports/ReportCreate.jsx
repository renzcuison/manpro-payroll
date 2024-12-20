import React, {  useState, useEffect, useRef } from 'react'
import { Box, Button, TextField, Typography, FormGroup, InputLabel, Select, MenuItem, FormControl, OutlinedInput, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Layout from '../../components/Layout/Layout'
import ReactQuill from 'react-quill';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';

import moment from 'moment';
import Swal from "sweetalert2";
import styled from '@emotion/styled';

import dayjs, { Dayjs } from 'dayjs';
import { DatePicker, DatePickerProps  } from '@mui/x-date-pickers/DatePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import ReportsAddTypeModal from '../../components/Modals/ReportsModal/ReportsAddTypeModal';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function getStyles(name, selectedEmployees, theme) {
    return {
        fontWeight: selectedEmployees.includes(name)
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular,
    };
}

const ReportCreate = () => {
    
    const { user } = useUser();
    const theme    = useTheme();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [loading, setLoading] = useState(true);

    const [reportTypes, setReportTypes] = useState([]);
    
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(''); 
    const [type, setType] = useState('');
    const [periodFrom, setPeriodFrom] = useState('');
    const [periodTo, setPeriodTo] = useState('');
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    const [titleError, setTitleError] = useState(false);
    const [dateError, setDateError] = useState(false);
    const [typeError, setTypeError] = useState(false);
    const [periodFromError, setPeriodFromError] = useState(false);
    const [periodToError, setPeriodToError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    const [selectedEmployeesError, setSelectedEmployeesError] = useState(false);
    const [attachmentError, setAttachmentError] = useState(false);

    const [addReportModalOpen, setAddReportModalOpen] = useState(false)

    useEffect(() => {
        axiosInstance.get(`/getEmployees`, {headers})
            .then((response) => {
                setEmployees(response.data.employees);
            }).catch((error) => {
                console.error('Error fetching employees:', error);
            });

        axiosInstance.get(`/getReportTypes`, {headers})
            .then((response) => {
                setReportTypes(response.data.reportTypes);
            }).catch((error) => {
                console.error('Error fetching document types:', error);
            });
    }, []);

    const addReportType = (newType) => {
        setReportTypes((prevTypes) => [...prevTypes, newType]);
    };

    const handleAssignedEmployee = (event) => {
        const { target: { value }, } = event;

        setSelectedEmployees(typeof value === 'string' ? value.split(',') : value);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAttachment(file.name);
        } else {
            setAttachment('');
        }
    };

    const handleAttachmentField = () => {
        fileInputRef.current.click();
    };

    const openAddReportTypeModal = () => {
        setAddReportModalOpen(true)
    };

    const closeAddReportTypeModal = () => {
        setAddReportModalOpen(false)
    }

    const handleTypeChange = (event) => {
        const value = event.target.value;
        if (value === 'addNewType') {
            openAddReportTypeModal();
            setType('');
        } else {
            setType(value);
            setTypeError(false);
        }
    };
    
    const checkInput = (event) => {
        event.preventDefault();

        const selectedEmployee = selectedEmployees.map(name => {
            const employee = employees.find(emp => `${emp.fname} ${emp.lname}` === name);
            return employee ? employee.user_id : null;
        }).filter(id => id !== null);

        if (!title) {
            setTitleError(true);
        } else {
            setTitleError(false);
        }
        
        if (!date) {
            setDateError(true);
        } else {
            setDateError(false);
        }

        if (!type) {
            setTypeError(true);
        } else {
            setTypeError(false);
        }

        if (!periodFrom) {
            setPeriodFromError(true);
        } else {
            setPeriodFromError(false);
        }

        if (!periodTo) {
            setPeriodToError(true);
        } else {
            setPeriodToError(false);
        }

        if (!attachment) {
            setAttachmentError(true);
        } else {
            setAttachmentError(false);
        }

        if (!description || description == '<p><br></p>') {
            setDescriptionError(true);
        } else {
            setDescriptionError(false);
        }

        if (selectedEmployee.length == 0) {
            setSelectedEmployeesError(true);
        } else {
            setSelectedEmployeesError(false);
        }
        
        if ( !title || !date || !type || !periodFrom || !periodTo || !description || !attachment || !selectedEmployees ) {
            Swal.fire({
                customClass: { container: 'my-swal' },
                text: "All fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: '#177604',
            });
        } else {
            new Swal({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "You want to save this evaluation form?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: 'Save',
                confirmButtonColor: '#177604',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
            }).then((res) => {
                if (res.isConfirmed) {
                    saveInput(event);
                }
            });
        }
    };

    const saveInput = (event) => {
        event.preventDefault();

        const selectedEmployee = selectedEmployees.map(name => {
            const employee = employees.find(emp => `${emp.fname} ${emp.lname}` === name);
            return employee ? employee.user_id : null;
        }).filter(id => id !== null);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('date', date);
        formData.append('type', type);
        formData.append('periodFrom', periodFrom);
        formData.append('periodTo', periodTo);
        formData.append('description', description);
        formData.append('attachment', fileInputRef.current.files[0]);

        selectedEmployee.forEach(id => {
            formData.append('selectedEmployee[]', id);
        });

        axiosInstance.post('/saveReport', formData, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Document saved successfully!",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        navigate(`/report-view/${response.data.report.id}`);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <Layout title={"ReportCreateForm"}>
            <Box sx={{ mx: 12, pt: 12 }}>
                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}>
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >

                        {/* <TextField id={`comment-field-${indicator.id}`} variant="standard" sx={{ width: '95%' }} value={indicator.response?.comment || ''}  InputProps={{ readOnly: true }} /> */}

                        <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }}>Create Document</Typography>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '75%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    required
                                    variant="outlined"
                                    id="reportTitle"
                                    label="Title"
                                    value={title}
                                    error={titleError}
                                    onChange={(e) => setTitle(e.target.value)}
                                    inputProps={{ maxLength: 128 }}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Date"
                                        onChange={(newValue) => setDate(newValue)}
                                        slotProps={{
                                            textField: { required: true, error: dateError }
                                        }}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '50%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    select
                                    required
                                    id="reportType"
                                    label="Type"
                                    value={type}
                                    error={typeError}
                                    onChange={handleTypeChange}
                                >
                                    <MenuItem value='addNewType'>Add New Type</MenuItem>
                                    {reportTypes.map((reportType) => (
                                        <MenuItem key={reportType.id} value={reportType.id} >
                                            {reportType.type_name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <LocalizationProvider label="Period From" dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Period From"
                                        onChange={(newValue) => setPeriodFrom(newValue)}
                                        slotProps={{
                                            textField: { required: true, error: periodFromError }
                                        }}
                                    />
                                </LocalizationProvider>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '22%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <LocalizationProvider label="Period To" dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Period To"
                                        onChange={(newValue) => setPeriodTo(newValue)}
                                        slotProps={{
                                            textField: { required: true, error: periodToError }
                                        }}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </FormGroup>
                        
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl error={descriptionError} sx={{ marginBottom: 3, width: '100%' }}>
                                <div style={{ border: descriptionError ? '1px solid red' : '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                    <ReactQuill
                                        id='description'
                                        name='description'
                                        value={description}
                                        onChange={setDescription}
                                        // onChange={(value) => setDescription({ ...description, description: value })}
                                        placeholder="Enter announcement description here..."
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
                                                ['link', 'clean'],
                                            ],
                                        }}
                                        formats={[
                                            'header', 'font', 'size',
                                            'bold', 'italic', 'underline', 'strike', 'blockquote',
                                            'list', 'bullet', 'indent',
                                            'align', 'link',
                                        ]}
                                        theme="snow"
                                        style={{ marginBottom: '3rem', height: '300px', width: '100%' }}
                                    />
                                </div>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <TextField
                                    required
                                    variant="outlined"
                                    id="attachment"
                                    label="Attachment"
                                    value={attachment}
                                    error={attachmentError}
                                    onClick={handleAttachmentField}
                                    InputProps={{ readOnly: true }}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl error={selectedEmployeesError} required sx={{ marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <InputLabel id="selectedEmployeeLabel">Assigned Employee</InputLabel>
                                <Select
                                    labelId="selectedEmployeeLabel"
                                    id="selectedEmployee"
                                    multiple
                                    value={selectedEmployees}
                                    onChange={handleAssignedEmployee}
                                    input={<OutlinedInput id="select-multiple-chip" label="Assigned Employee" />}
                                    slotProps={{
                                        textField: { required: true, error: selectedEmployeesError }
                                    }}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                >
                                    {employees.map((employee) => (
                                        <MenuItem
                                            key={employee.user_id}
                                            value={`${employee.fname} ${employee.lname}`}
                                            style={getStyles(employee.fname, selectedEmployees, theme)}
                                        >
                                            {`${employee.fname} ${employee.mname} ${employee.lname}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Document </p>
                            </Button>
                        </Box>
                    </Box>
                </div > 

            </Box>

            <ReportsAddTypeModal open={addReportModalOpen} close={closeAddReportTypeModal} onReportTypeAdded={addReportType} />
        </Layout >
    )
}

export default ReportCreate
