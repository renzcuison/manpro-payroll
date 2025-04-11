import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Swal from 'sweetalert2';
import moment from 'moment';
import dayjs from 'dayjs';

const EmployeeDetailsEdit = ({ open, close, employee }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [jobTitles, setJobTitles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [workGroups, setWorkGroups] = useState([]);
    
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [emailAddressError, setEmailAddressError] = useState(false);
    const [birthdateError, setBirthdateError] = useState(false);

    const [firstName, setFirstName] = useState(employee.first_name);
    const [middleName, setMiddleName] = useState(employee.middle_name);
    const [lastName, setLastName] = useState(employee.last_name);
    const [suffix, setSuffix] = useState(employee.suffix);
    const [emailAddress, setEmailAddress] = useState(employee.email);
    const [phoneNumber, setPhoneNumber] = useState(employee.contact_number);
    const [address, setAddress] = useState(employee.address);
    const [birthdate, setBirthdate] = React.useState(dayjs(employee.birth_date));

    const [salary, setSalary] = useState(employee.salary);
    const [fixedSalary, setFixedSalary] = useState(employee.is_fixed_salary);
    const [salaryType, setSalaryType] = useState(employee.salary_type);
    const [creditLimit, setCreditLimit] = useState(employee.credit_limit);

    const [tinNumber, setTinNumber] = useState(employee.tin_number);
    const [taxStatus, setTaxStatus] = useState(employee.deduct_tax);

    const [selectedRole, setSelectedRole] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedWorkGroup, setSelectedWorkGroup] = useState('');

    const [startDate, setStartDate] = React.useState(dayjs(employee.date_start));
    const [endDate, setEndDate] = React.useState(dayjs(employee.date_end));

    const [selectedType, setSelectedType] = useState(employee.employment_type);
    const [selectedStatus, setSelectedStatus] = useState(employee.employment_status);

    useEffect(() => {
        console.log(employee);
        populateDropdown();
    }, []);

    const populateDropdown = () => {
        axiosInstance.get('/settings/getRoles', { headers })
            .then((response) => {
                setRoles(response.data.roles);
                setSelectedRole(employee.role_id);
            }).catch((error) => {
                console.error('Error fetching branches:', error);
            });

        axiosInstance.get('/settings/getBranches', { headers })
            .then((response) => {
                setBranches(response.data.branches);
                setSelectedBranch(employee.branch_id);
            }).catch((error) => {
                console.error('Error fetching branches:', error);
            });

        axiosInstance.get('/settings/getJobTitles', { headers })
            .then((response) => {
                setJobTitles(response.data.jobTitles);
                setSelectedJobTitle(employee.job_title_id);
            }).catch((error) => {
                console.error('Error fetching branches:', error);
            });

        axiosInstance.get('/settings/getDepartments', { headers })
            .then((response) => {
                setDepartments(response.data.departments);
                setSelectedDepartment(employee.department_id);
            }).catch((error) => {
                console.error('Error fetching departments:', error);
            });

        axiosInstance.get('/workshedule/getWorkGroups', { headers })
            .then((response) => {
                setWorkGroups(response.data.workGroups);
                setSelectedWorkGroup(employee.work_group_id);
            }).catch((error) => {
                console.error('Error fetching branches:', error);
            });
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            userName: employee.user_name,

            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            suffix: suffix,
            emailAddress: emailAddress,
            phoneNumber: phoneNumber,
            address: address,
            birthdate: birthdate,

            salary: salary,
            salaryType: salaryType,
            creditLimit: creditLimit,

            tinNumber: tinNumber,
            taxStatus: taxStatus,

            selectedRole: selectedRole,
            selectedBranch: selectedBranch,
            selectedJobTitle: selectedJobTitle,
            selectedDepartment: selectedDepartment,
            selectedWorkGroup: selectedWorkGroup,
            selectedType: selectedType,
            selectedStatus: selectedStatus,
            startDate: startDate,
            endDate: endDate,
        };

        axiosInstance.post('/employee/editEmployeeDetails', data, { headers })
            .then(response => {
                if (response.data.status === 200) {
                    Swal.fire({
                        customClass: { container: 'my-swal' },
                        text: "Employee Details updated successfully!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true,
                        confirmButtonText: 'Proceed',
                        confirmButtonColor: '#177604',
                    }).then(() => {
                        close(true);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <>
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { padding: '16px', backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Employee Details </Typography>
                        <IconButton onClick={() => close(false)}><i className="si si-close"></i></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
                    <Box component="form" sx={{ mt: 3, my: 3 }} onSubmit={saveInput} noValidate autoComplete="off" encType="multipart/form-data" >

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="firstName"
                                    label="First Name"
                                    variant="outlined"
                                    value={firstName}
                                    error={firstNameError}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="middleName"
                                    label="Middle Name"
                                    variant="outlined"
                                    value={middleName ?? ''}
                                    onChange={(e) => setMiddleName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '28%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="lastName"
                                    label="Last Name"
                                    variant="outlined"
                                    value={lastName}
                                    error={lastNameError}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '10%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="suffix"
                                    label="Suffix"
                                    variant="outlined"
                                    value={suffix ?? ''}
                                    onChange={(e) => setSuffix(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        id="birthdate"
                                        label="Birth Date"
                                        value={birthdate}
                                        onChange={(newValue) => setBirthdate(newValue)}
                                        slotProps={{
                                            textField: { required: true, error: birthdateError }
                                        }}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                            
                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    required
                                    id="emailAddress"
                                    label="Email Address"
                                    variant="outlined"
                                    value={emailAddress}
                                    error={emailAddressError}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '32%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="phoneNumber"
                                    label="Phone Number"
                                    variant="outlined"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="address"
                                    label="Address"
                                    variant="outlined"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <Divider sx={{ my: 4 }} />

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="role"
                                    label="Role"
                                    value={selectedRole}
                                    onChange={(event) => setSelectedRole(event.target.value)}
                                >
                                    {roles.map((role) => (
                                        <MenuItem key={role.id} value={role.id}> {role.name} ({role.acronym}) </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="jobTitle"
                                    label="Job Title"
                                    value={selectedJobTitle}
                                    onChange={(event) => setSelectedJobTitle(event.target.value)}
                                >
                                    {jobTitles.map((jobTitle) => (
                                        <MenuItem key={jobTitle.id} value={jobTitle.id}> {jobTitle.name} ({jobTitle.acronym}) </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '21%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="workGroup"
                                    label="Work Group"
                                    value={selectedWorkGroup}
                                    onChange={(event) => setSelectedWorkGroup(event.target.value)}
                                >
                                    {workGroups.map((workGroup) => (
                                        <MenuItem key={workGroup.id} value={workGroup.id}> {workGroup.name} </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{
                                marginBottom: 3, width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="department"
                                    label="Department"
                                    value={selectedDepartment}
                                    onChange={(event) => setSelectedDepartment(event.target.value)}
                                >
                                    {departments.map((department) => (
                                        <MenuItem key={department.id} value={department.id}> {department.name} ({department.acronym}) </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>

                            <FormControl sx={{
                                marginBottom: 3, width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="branch"
                                    label="Branch"
                                    value={selectedBranch}
                                    onChange={(event) => setSelectedBranch(event.target.value)}
                                >
                                    {branches.map((branch) => (
                                        <MenuItem key={branch.id} value={branch.id}> {branch.name} ({branch.acronym}) </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '21%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        id="startDate"
                                        label="Start Date"
                                        value={startDate}
                                        onChange={(newValue) => {
                                            setStartDate(newValue);
                                        }}
                                        slotProps={{ textField: { variant: 'outlined' } }}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                        }}>
                            <FormControl sx={{ width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="type"
                                    label="Employment Type"
                                    value={selectedType}
                                    onChange={(event) => setSelectedType(event.target.value)}
                                >
                                    <MenuItem key="Probationary" value="Probationary"> Probationary </MenuItem>
                                    <MenuItem key="Regular" value="Regular"> Regular </MenuItem>
                                    <MenuItem key="Part-Time" value="Part-Time"> Part-Time </MenuItem>
                                    <MenuItem key="Full-Time" value="Full-Time"> Full-Time </MenuItem>
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ width: '38%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="status"
                                    label="Employee Status"
                                    value={selectedStatus}
                                    onChange={(event) => setSelectedStatus(event.target.value)}
                                >
                                    <MenuItem key="Active" value="Active"> Active </MenuItem>
                                    <MenuItem key="Resigned" value="Resigned"> Resigned </MenuItem>
                                    <MenuItem key="Terminated" value="Terminated"> Terminated </MenuItem>
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ width: '21%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        id="endDate"
                                        label="End Date"
                                        variant="outlined"
                                        value={endDate}
                                        onChange={(newValue) => {
                                            setEndDate(newValue);
                                        }}
                                        slotProps={{ textField: { variant: 'outlined' } }}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </FormGroup>

                        <Divider sx={{ my: 4 }} />

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '14%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="salaryFixed"
                                    label="Fixed Salary"
                                    value={fixedSalary}
                                    onChange={(event) => setFixedSalary(event.target.value)}
                                >
                                    <MenuItem key="0" value="0"> No </MenuItem>
                                    <MenuItem key="0" value="1"> Yes </MenuItem>
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '14%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="salaryType"
                                    label="Salary Type"
                                    value={salaryType}
                                    onChange={(event) => setSalaryType(event.target.value)}
                                >
                                    {/* <MenuItem key="Hourly" value="Hourly"> Hourly </MenuItem> */}
                                    {/* <MenuItem key="Daily" value="Daily"> Daily </MenuItem> */}
                                    {/* <MenuItem key="Weekly" value="Weekly"> Weekly </MenuItem> */}
                                    {/* <MenuItem key="Bi-Monthly" value="Bi-Monthly"> Bi-Monthly </MenuItem> */}
                                    <MenuItem key="Monthly" value="Monthly"> Monthly </MenuItem>
                                </TextField>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '34%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    label="Salary"
                                    variant="outlined"
                                    value={salary}
                                    onChange={(e) => setSalary(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '34%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    label="Credit Limit"
                                    variant="outlined"
                                    value={creditLimit}
                                    onChange={(e) => setCreditLimit(e.target.value)}
                                />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>                            
                            <FormControl sx={{ marginBottom: 3, width: '77%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' }},
                            }}>
                                <TextField
                                    id="tin"
                                    label="TIN Number"
                                    variant="outlined"
                                    value={tinNumber}
                                    onChange={(e) => setTinNumber(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '21%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="taxStatus"
                                    label="Tax Status"
                                    value={taxStatus}
                                    onChange={(event) => setTaxStatus(event.target.value)}
                                >
                                    <MenuItem key="Active" value="1"> Active </MenuItem>
                                    <MenuItem key="Inactive" value="0"> Inactive </MenuItem>
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        <Box display="flex" justifyContent="center" sx={{ marginTop: 4 }}>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Save Details </p>
                            </Button>
                        </Box>

                    </Box>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default EmployeeDetailsEdit;
