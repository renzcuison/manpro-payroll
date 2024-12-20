import React, { useEffect, useRef, useState } from 'react'
import { InputLabel, FormControl, Typography, IconButton, Dialog, DialogTitle, DialogContent, Box } from '@mui/material'
import moment from 'moment';
import '../../../../resources/css/customcss.css'
import { useReactToPrint } from 'react-to-print';
import HomeLogo from '../../../images/ManPro.png'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import PayrollHistoryModal from './PayrollHistoryModal';

const PayrollHistory = ({ open, close, data }) => {
    const contentToPrint = useRef()
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const handleClosePayroll = () => {
        close()
    }
    const handleToPrintHistory = useReactToPrint({
        content: () => contentToPrint.current,
        documentTitle: 'Payroll_data',
        onAfterPrint: () => {
            close()
            Swal.fire({
                customClass: {
                    container: 'my-swal'
                },
                title: "Success!",
                text: "Successfully Printed!",
                icon: "success",
                timer: 1000,
                showConfirmButton: false
            });
        },
    })

    return (
        <Dialog open={open} fullWidth maxWidth="lg">
            <DialogTitle className='d-flex justify-content-between'>
                <Typography></Typography>
                <IconButton sx={{ color: 'red' }} onClick={handleClosePayroll}><i className="si si-close" ></i></IconButton>
            </DialogTitle>
            <DialogContent>
                <Box component='div' className="payroll_details px-2" ref={contentToPrint} sx={{
                    '@media print': {
                        '@page': {
                            size: 'A4',
                        },
                    }
                }}>
                    <div>
                        <img className="d-flex justify-content-center" src={HomeLogo} style={{
                            height: 50, width: 200, margin: '0 auto', display: 'block', marginTop: '30px'
                        }} />
                        <Typography className='text-center' sx={{ marginBottom: '20px', marginTop: '5px' }}>Employee Payslip</Typography>
                    </div>
                    <div className="block-content">
                        <div className='row'>
                            <div className="col-lg-12">
                                <div className='row'>
                                    <div className='col-6'>
                                        <FormControl sx={{
                                            marginBottom: 2, width: '100%', '& label.Mui-focused': {
                                                color: '#97a5ba',
                                            },
                                            '& .MuiOutlinedInput-root': {

                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#97a5ba',
                                                },
                                            },
                                        }}>
                                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Employee Name</InputLabel>
                                            <input id="demo-simple-select" className='form-control' type="text" defaultValue={data.fname + ' ' + data.mname + ' ' + data.lname} style={{ height: 30 }} />
                                        </FormControl>
                                        <FormControl sx={{
                                            marginBottom: 2, width: '100%', '& label.Mui-focused': {
                                                color: '#97a5ba',
                                            },
                                            '& .MuiOutlinedInput-root': {

                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#97a5ba',
                                                },
                                            },
                                        }}>
                                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Designation</InputLabel>
                                            <input id="demo-simple-select" className='form-control' type="text" defaultValue={data.category} style={{ height: 30 }} />
                                        </FormControl>
                                        <FormControl sx={{
                                            marginBottom: 2, width: '100%', '& label.Mui-focused': {
                                                color: '#97a5ba',
                                            },
                                            '& .MuiOutlinedInput-root': {

                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#97a5ba',
                                                },
                                            },
                                        }}>
                                            <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Employee ID</InputLabel>
                                            <input id="demo-simple-select" className='form-control' type="text" defaultValue={data.user_id} style={{ height: 30 }} />
                                        </FormControl>
                                    </div>
                                    <div className='col-6'>
                                        <div className='d-flex justify-content-end'>
                                            <FormControl sx={{
                                                marginBottom: 2, width: '100%', '& label.Mui-focused': {
                                                    color: '#97a5ba',
                                                },
                                                '& .MuiOutlinedInput-root': {

                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#97a5ba',
                                                    },
                                                },
                                            }}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Payroll Date</InputLabel>
                                                <input id="demo-simple-select" className='form-control' type="text" defaultValue={moment(data.payroll_fromdate).format('MMM.DD') + ' - ' + moment(data.payroll_todate).format('MMM.DD')} style={{ height: 30 }} />
                                            </FormControl>
                                        </div>
                                        <div className='d-flex justify-content-end'>
                                            <FormControl sx={{
                                                marginBottom: 2, width: '100%', '& label.Mui-focused': {
                                                    color: '#97a5ba',
                                                },
                                                '& .MuiOutlinedInput-root': {

                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#97a5ba',
                                                    },
                                                },
                                            }}>
                                                <InputLabel id="demo-simple-select-label" shrink={true} sx={{ backgroundColor: 'white', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba' }}>Payroll Cut Off</InputLabel>
                                                <input id="demo-simple-select" className='form-control' type="text" defaultValue={data.workdays + ' days'} style={{ height: 30 }} />
                                            </FormControl>
                                        </div>
                                    </div>
                                </div>

                                <PayrollHistoryModal data={data} close={close} handleToPrint={handleToPrintHistory} />
                            </div>
                        </div>
                    </div>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default PayrollHistory
