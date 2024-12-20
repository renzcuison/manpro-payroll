import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import { FormControl, Typography, Button, Grid, TextField, Stack } from '@mui/material'
import Swal from 'sweetalert2';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useUser } from '../../hooks/useUser';


const MemberChangePassword = () => {
    const { user } = useUser();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [changePass, setChangePass] = useState({
        current: '',
        new: '',
        confirm: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setChangePass({
            ...changePass,
            [name]: value,
        });

    };

    const handleChangePass = (e) => {
        e.preventDefault();

        const passwordData = new FormData();

        // Append form data
        passwordData.append('current', changePass.current);
        passwordData.append('new', changePass.new);
        passwordData.append('confirm', changePass.confirm);

        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to change password?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/change_password', passwordData, { headers }).then(function (response) {
                    console.log(response);
                    location.reload();
                })
                    .catch((error) => {
                        console.log(error)
                        location.reload();
                    })
            } else {
                console.log(error)
                location.reload();
            }
        });

    };


    return (
        <Layout>
            <div className="content-heading d-flex justify-content-between p-0">
                <h5 className='pt-3'>Change Password</h5>
            </div>
            <div className="block">
                <div className="block-content" style={{ paddingTop: 90, paddingBottom: 100 }}>
                    <Stack>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} sx={{ marginTop: 2, paddingLeft: 5, paddingRight: 5 }}>
                                <Typography sx={{ paddingLeft: 15, paddingRight: 5, fontSize: '20px', fontFamily: 'Times New Roman, Times, serif' }}>Changing your sign in password is an easy way to keep your account secure.</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                                <FormControl fullWidth variant="outlined">
                                    <Typography>Current Password</Typography>
                                    <TextField sx={{ paddingRight: 15 }} name="current" id="current" size='small' value={changePass.current} onChange={handleChange} />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ marginTop: 2, paddingLeft: 5, paddingRight: 5 }}>
                                <Typography sx={{ paddingLeft: 15, paddingRight: 15 }}>Password must contain:<br />
                                    * at least 6 characters<br />
                                    * numeric character (0-9)<br />
                                    * lowercase character (a-z)<br />
                                    * uppercase character (A-Z)</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                                <FormControl fullWidth variant="outlined">
                                    <Typography>New Password</Typography>
                                    <TextField sx={{ paddingRight: 15 }} name="new" id="new" size='small' value={changePass.new} onChange={handleChange} />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined">
                                    <Typography>Confirm New Password</Typography>
                                    <TextField sx={{ paddingRight: 15 }} name="confirm" id="confirm" size='small' value={changePass.confirm} onChange={handleChange} />
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} sx={{ marginTop: 2 }}>
                            </Grid>
                            <Grid item xs={12} sm={3} sx={{ marginTop: 2 }}>
                                <Button type="submit" variant="contained" color="primary" onClick={handleChangePass}>
                                    Update
                                </Button>
                            </Grid>
                        </Grid>
                    </Stack>
                </div>
            </div>
        </Layout>
    )
}

export default MemberChangePassword
