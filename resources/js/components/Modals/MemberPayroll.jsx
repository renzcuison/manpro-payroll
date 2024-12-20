import React, { useEffect, useRef, useState } from 'react'
import { InputLabel, FormControl, Typography, IconButton, Dialog, DialogTitle, DialogContent } from '@mui/material'
import moment from 'moment';
import PayrollUpdateModal from './PayrollUpdateModal';
import MemberPayrollModal from './MemberPayrollModal';
// import '../../../../resources/css/profile.css'
import { useReactToPrint } from 'react-to-print';
import HomeLogo from '../../../images/ManPro.png'
import { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';

const contentToPrintStyle = {
    '@media print': {
        '@page': {
            size: '12in 11in', /* Custom page size */
            margin: '1in', /* Adjust margins as needed */
        },
    },
};

const MemberPayroll = ({ open, close, data, cutoff, type, processtype }) => {
    const contentToPrint = useRef()
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const handleClosePayroll = () => {
        close()
    }
    const handleToPrint = useReactToPrint({
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
                <div className=" payroll_details pt-10 px-2" ref={contentToPrint} style={{
                    '@media print': {
                        '@page': {
                            size: '12in 11in', /* Custom page size */
                            margin: '1in', /* Adjust margins as needed */
                        },
                    }
                }}>
                    <div>
                        <img className="d-flex justify-content-center" src={HomeLogo} style={{
                            height: 50, width: 200, margin: '0 auto', display: 'block'
                        }} />
                        <Typography className='text-center' sx={{ marginBottom: '20px', marginTop: '5px' }}>Employee Payslip</Typography>
                    </div>
                    <div className="block-content my-20">
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
                                            <input id="demo-simple-select" className='form-control' type="text" defaultValue={data.fname + ' ' + data.mname + ' ' + data.lname} style={{ height: 40, backgroundColor: '#fff' }} readOnly />
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
                                            <input id="demo-simple-select" className='form-control' type="text" defaultValue={data.category} style={{ height: 40, backgroundColor: '#fff' }} readOnly />
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
                                            <input id="demo-simple-select" className='form-control' type="text" defaultValue={data.user_id} style={{ height: 40, backgroundColor: '#fff' }} readOnly />
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
                                                <input id="demo-simple-select" className='form-control' type="text" defaultValue={moment(type != 2 ? data.fromDate : data.payroll_fromdate).format('MMM.DD') + ' - ' + moment(type != 2 ? data.todate : data.payroll_todate).format('MMM.DD')} style={{ height: 40, backgroundColor: '#fff' }} readOnly />
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
                                                <input id="demo-simple-select" className='form-control' type="text" defaultValue={data.workdays + ' days'} style={{ height: 40, backgroundColor: '#fff' }} readOnly />
                                            </FormControl>
                                        </div>
                                    </div>
                                </div>

                                <MemberPayrollModal data={data} handleToPrint={handleToPrint} close={close} cutoff={cutoff} />

                                {/* {type != 2 ? <MemberPayrollSaveModal data={data} close={close} cutoff={cutoff} processtype={processtype} /> : <PayrollUpdateModal data={data} handleToPrint={handleToPrint} close={close} cutoff={cutoff} />} */}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default MemberPayroll
