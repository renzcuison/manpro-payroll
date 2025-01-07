import React, { useEffect, useState } from 'react'
import { Select, MenuItem, InputLabel, Box, FormControl, Typography, FormGroup, IconButton, Button, Icon, Divider, Dialog, DialogTitle, DialogContent } from '@mui/material'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import moment from 'moment';
import { useUser } from '../../hooks/useUser';

const HrEmployeeEditModal = ({ open, close, wkdays, data: { user_id, fname, mname, lname, address, contact_number, email, bdate, user_type, status, hr_workshift_id, hourly_rate, daily_rate, monthly_rate, work_days, department, category, bank, date_hired, sss, philhealth, pagibig, atm, limit } }, empEdit) => {

    const { user } = useUser();
    const [statusDetails, setStatusDetails] = useState([]);
    const [branchDetails, setBranchDetails] = useState([]);
    const [bankDetails, setBankDetails] = useState([]);
    const [workShifts, setWorkshifts] = useState([]);
    const storedUser = localStorage.getItem("nasya_user");
    const [showEdit, setShowEdit] = useState(empEdit);
    const [editedRate, setEditedRate] = useState({
        daily_rate: '',
        hourly_rate: ''
    });
    const [updateEmployee, setUpdateEmployee] = useState({
        user_type: '',
        status: '',
        hr_workshift_id: '',
        date_hired: '',
        work_days: '',
        hourly_rate: '',
        daily_rate: '',
        monthly_rate: '',
        department: '',
        category: '',
        bank: '',
        sss: '',
        philhealth: '',
        pagibig: '',
        atm: '',
    });
    const headers = getJWTHeader(JSON.parse(storedUser));
    useEffect(() => {
        axiosInstance.get('/status', { headers }).then((response) => {
            setStatusDetails(response.data.status);
        });
        axiosInstance.get('/branch', { headers }).then((response) => {
            setBranchDetails(response.data.branch);
        });
        axiosInstance.get('/bank', { headers }).then((response) => {
            setBankDetails(response.data.bank);
        });
        // axiosInstance.get('/getWorkShifts', { headers }).then((response) => {
            // setWorkshifts(response.data.workShifts);
        // });
    }, [])
    useEffect(() => {
        handleEditrate(daily_rate, hourly_rate)
    }, [daily_rate, hourly_rate])

    const handleEditrate = (daily, hourly) => {
        setEditedRate({
            ...editedRate,
            daily_rate: daily,
            hourly_rate: hourly
        });
    }

    const handleEdit = (e) => {
        e.preventDefault();
        const id = user_id
        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "Confirm to Update this employee?",
            icon: "warning",
            allowOutsideClick: false,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.put(`/edit-employees/${id}`, {
                    user_type: userType || user_type,
                    status: updateEmployee.status || status,
                    hr_workshift_id: updateEmployee.hr_workshift_id || hr_workshift_id,
                    work_days: wkdays,
                    date_hired: updateEmployee.date_hired || date_hired,
                    hourly_rate: updateEmployee.hourly_rate || hourly_rate.toFixed(2) || 0,
                    daily_rate: updateEmployee.daily_rate || daily_rate.toFixed(2) || 0,
                    monthly_rate: updateEmployee.monthly_rate || parseInt(monthly_rate.toFixed(2)) || 0,
                    department: updateEmployee.department || department,
                    category: updateEmployee.category || category,
                    bank: updateEmployee.bank || bank,
                    sss: updateEmployee.sss || sss,
                    philhealth: updateEmployee.philhealth || philhealth,
                    pagibig: updateEmployee.pagibig || pagibig,
                    atm: updateEmployee.atm || atm
                }, { headers }).then(function (res) {
                    Swal.fire({
                        customClass: {
                            container: 'my-swal'
                        },
                        title: "Success!",
                        text: "Employee has been updated successfully",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: true
                    }).then(function (res) {
                        // console.log(res);
                        location.reload();
                    });
                })
            } else {
                location.reload()
            }
        });


    }
    const handleRate = (e) => {
        const mrate = e.target.value;
        const val = wkdays;
        const drate = mrate / val;
        const hrate = drate / 8;
        setUpdateEmployee({
            ...updateEmployee,
            monthly_rate: mrate,
            hourly_rate: Number.isFinite(hrate) ? hrate.toFixed(2) : '0',
            daily_rate: Number.isFinite(drate) ? drate.toFixed(2) : '0',
        })
    }

    const handleCloseButton = (e) => {
        e.preventDefault();
        setShowEdit(false)
        setUpdateEmployee({
            ...updateEmployee,
            monthly_rate: '',
            hourly_rate: '',
            daily_rate: ''
        })

    }
    const [userType, setUserType] = useState('');
    const handleUserTypeChange = (event) => {
        setUserType(event.target.value);
    };

    const handleClose = () => {
        // Close the modal
        close();

        // Reload the page
        location.reload();
    };

    return (
        <>
            <Dialog sx={{
                "& .MuiDialog-container": {
                    justifyContent: "flex-center",
                    alignItems: "flex-start"
                }
            }}
                open={open} fullWidth maxWidth="sm">
                <Box className="d-flex justify-content-between" >
                    <DialogTitle>
                        <Typography></Typography>
                    </DialogTitle>
                    <IconButton sx={{ float: 'right', marginRight: 2, color: 'red' }} data-dismiss="modal" aria-label="Close" onClick={handleClose}><i className="si si-close"></i></IconButton>
                </Box>
                <DialogContent>
                    <Typography className="text-center" sx={{ backgroundColor: '#1976d2', width: '100%', paddingBlock: 2, marginBottom: 3, color: '#FFFFFF', fontWeight: 1000 }}>
                        EMPLOYEE FORM
                    </Typography>

                    <Box component="form" noValidate autoComplete="off" encType="multipart/form-data" sx={{ minWidth: 120 }} >
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' }
                            },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '30%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Firstname</InputLabel>
                                <input className='form-control bg-white' readOnly defaultValue={fname} type="text" style={{ height: 50 }} />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '30%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Middlename</InputLabel>
                                <input className='form-control bg-white' readOnly defaultValue={mname} type="text" style={{ height: 50 }} />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '30%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Lastname</InputLabel>
                                <input className='form-control bg-white' readOnly defaultValue={lname} type="text" style={{ height: 50 }} />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{ '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                            },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Email</InputLabel>
                                <input className='form-control bg-white' maxLength="11" readOnly defaultValue={email} type="text" style={{ height: 50 }} />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Contact Number</InputLabel>
                                <input className='form-control bg-white' readOnly defaultValue={contact_number} type="number" style={{ height: 50 }} />
                            </FormControl>
                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Date of Birth</InputLabel>
                                <input className='form-control bg-white' readOnly defaultValue={bdate} maxLength="11" type="date" style={{ height: 50 }} />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Address</InputLabel>
                                <input className='form-control bg-white' readOnly defaultValue={address} type="text" style={{ height: 50 }} />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Date Hired</InputLabel>
                                <input className='form-control bg-white' defaultValue={updateEmployee.date_hired ? updateEmployee.date_hired : date_hired ? moment(date_hired).format('YYYY-MM-DD') : ''} type="date" onChange={(e) => setUpdateEmployee({ ...updateEmployee, date_hired: e.target.value })} style={{ height: 50, cursor: 'pointer' }} />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Type</InputLabel>
                                <Select defaultValue={userType ? userType : user_type} onChange={handleUserTypeChange} style={{ height: 50 }} className='form-control bg-white' >
                                    {user.user_type === 'Super Admin' ? <> <MenuItem value="Admin">Admin</MenuItem></> : null}
                                    <MenuItem value="Member">Member</MenuItem>
                                    <MenuItem value="Suspended">Suspended</MenuItem>
                                </Select>
                            </FormControl>
                        </FormGroup>

                        <Divider light style={{ marginBottom: 20 }} />
                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                            },
                        }}>

                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>SSS Number</InputLabel>
                                <input className='form-control bg-white bg-white' type='number' defaultValue={updateEmployee.sss} placeholder={sss} onChange={(e) => setUpdateEmployee({ ...updateEmployee, sss: e.target.value })} style={{ height: 50 }} />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ borderColor: '#97a5ba', }}>Bank Name</InputLabel>
                                <Select sx={{ width: '100%', height: 50 }}
                                    label="Bank Name"
                                    notched={true}
                                    defaultValue={updateEmployee.bank ? updateEmployee.bank : bank ? bank : 'N/A'}
                                    readOnly={showEdit ? false : true}
                                    onChange={(e) => setUpdateEmployee({ ...updateEmployee, bank: e.target.value })}
                                >
                                    {bankDetails.map((res) => (
                                        <MenuItem key={res.bank_id} value={res.bank_name}>{res.bank_name}</MenuItem>
                                    ))}

                                </Select>
                            </FormControl>
                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>PhilHealth Number</InputLabel>
                                <input className='form-control bg-white bg-white' type='number' defaultValue={updateEmployee.philhealth} placeholder={philhealth} onChange={(e) => setUpdateEmployee({ ...updateEmployee, philhealth: e.target.value })} style={{ height: 50 }} />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>ATM Account Number</InputLabel>
                                <input className='form-control bg-white bg-white' type='number' defaultValue={updateEmployee.atm} placeholder={atm} onChange={(e) => setUpdateEmployee({ ...updateEmployee, atm: e.target.value })} style={{ height: 50 }} />
                            </FormControl>
                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Pag-Ibig Number</InputLabel>
                                <input className='form-control bg-white bg-white' type='number' defaultValue={updateEmployee.pagibig} placeholder={pagibig} onChange={(e) => setUpdateEmployee({ ...updateEmployee, pagibig: e.target.value })} style={{ height: 50 }} />
                            </FormControl>
                        </FormGroup>

                        <Divider light style={{ marginBottom: 20 }} />

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                            },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ borderColor: '#97a5ba', }}>Status</InputLabel>
                                <Select sx={{ width: '100%', height: 50 }}
                                    label="Status"
                                    notched={true}
                                    defaultValue={updateEmployee.status ? updateEmployee.status : status ? status : 'N/A'}
                                    readOnly={showEdit ? false : true}
                                    onChange={(e) => setUpdateEmployee({ ...updateEmployee, status: e.target.value })}
                                >
                                    {statusDetails.map((res) => (
                                        <MenuItem key={res.status_id} value={res.status_name}>{res.status_name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ borderColor: '#97a5ba', }}>Shift</InputLabel>
                                <Select sx={{ width: '100%', height: 50 }}
                                    label="Shift"
                                    notched={true}
                                    defaultValue={updateEmployee.hr_workshift_id ? updateEmployee.hr_workshift_id : hr_workshift_id ? hr_workshift_id : 'N/A'}
                                    // value={updateEmployee.hr_workshift_id || 'N/A'}
                                    readOnly={showEdit ? false : true}
                                    onChange={(e) => setUpdateEmployee({ ...updateEmployee, hr_workshift_id: e.target.value })}
                                >
                                    {workShifts.map((res) => (
                                        <MenuItem key={res.id} value={res.id}>{res.description}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                            },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ borderColor: '#97a5ba', }}>Branch</InputLabel>
                                <Select sx={{ width: '100%', height: 50 }}
                                    label="Branch"
                                    notched={true}
                                    defaultValue={updateEmployee.category ? updateEmployee.category : category ? category : 'N/A'}
                                    readOnly={showEdit ? false : true}
                                    onChange={(e) => setUpdateEmployee({ ...updateEmployee, category: e.target.value })}
                                >
                                    {branchDetails.map((res) => (
                                        <MenuItem key={res.branch_id} value={res.branch_name}>{res.branch_name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': {color: '#97a5ba'},
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {borderColor: '#97a5ba'},
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Department</InputLabel>
                                <input className='form-control bg-white' maxLength="11" defaultValue={updateEmployee.department} placeholder={department ? department : "Not yet assigned"} type="text" style={{ height: 50, textTransform: 'uppercase' }} onChange={(e) => setUpdateEmployee({ ...updateEmployee, department: e.target.value.toUpperCase() })} />
                            </FormControl>
                        </FormGroup>

                        <Divider style={{ marginBottom: 20 }} />

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                            },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Work Days</InputLabel>
                                <input className='form-control bg-white' defaultValue={updateEmployee.work_days} placeholder={wkdays} onChange={(e) => setUpdateEmployee({ ...updateEmployee, work_days: e.target.value })} readOnly type="text" style={{ height: 50 }} />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: '48%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Leave Credits</InputLabel>
                                <input className='form-control bg-white bg-white' type='number' placeholder={limit + ' days'} style={{ height: 50 }} readOnly />
                            </FormControl>
                        </FormGroup>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                            },
                        }}>
                            <FormControl sx={{ marginBottom: 3, width: '30%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Monthly Rate</InputLabel>
                                <input className='form-control bg-white bg-white' defaultValue={updateEmployee.monthly_rate} placeholder={monthly_rate} onChange={(e) => handleRate(e)} type="text" style={{ height: 50 }} />
                            </FormControl>
                            <FormControl sx={{
                                marginBottom: 3, width: '30%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Daily Rate</InputLabel>
                                <input className='form-control bg-white bg-white' readOnly defaultValue={updateEmployee.daily_rate ? updateEmployee.daily_rate : (editedRate.daily_rate ? parseFloat(editedRate.daily_rate).toFixed(2) : '')} type="text" onChange={(e) => setUpdateEmployee({ ...updateEmployee, daily_rate: e.target.value })} style={{ height: 50 }} />
                            </FormControl>
                            <FormControl sx={{
                                marginBottom: 3, width: '30%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                                },
                            }}>
                                <InputLabel shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Hourly Rate</InputLabel>
                                <input className='form-control bg-white' defaultValue={updateEmployee.hourly_rate ? updateEmployee.hourly_rate : (editedRate.hourly_rate ? parseFloat(editedRate.hourly_rate).toFixed(2) : '')} readOnly onChange={(e) => setUpdateEmployee({ ...updateEmployee, hourly_rate: e.target.value })} type="number" style={{ height: 50 }} />
                            </FormControl>
                        </FormGroup>

                        <div className='d-flex justify-content-center mt-50'>
                            <Button type={"submit"} variant="contained" color={"primary"} onClick={handleEdit} >
                                {'Update'}
                            </Button>
                        </div>
                    </Box>
                </DialogContent >
            </Dialog >
        </>
    )
}

export default HrEmployeeEditModal
