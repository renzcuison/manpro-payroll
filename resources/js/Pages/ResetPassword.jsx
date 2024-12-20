import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { Button, FormHelperText, Grid, TextField, Typography } from "@mui/material";
import axiosInstance from "../utils/axiosConfig";
import Swal from 'sweetalert2';

const ResetPassword = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const empID = searchParams.get('user_id');
    const current = searchParams.get('pass');
    const navigate = useNavigate()
    const { user, isFetching } = useUser();
    const [changePass, setChangePass] = useState({
        email: '',
        new: '',
        confirm: '',
    })

    useEffect(() => {
        if (!isFetching) {
            if (user) {
                navigate('/')
            }
        }
    }, [])

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
        passwordData.append('user_id', empID);
        passwordData.append('current', current);
        passwordData.append('new', changePass.new);
        passwordData.append('confirm', changePass.confirm);
        passwordData.append('email', changePass.email);
        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to reset password?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/reset_password',
                    {
                        user_id: empID,
                        current: current,
                        new: changePass.new,
                        confirm: changePass.confirm,
                        email: changePass.email,
                    }).then(function (response) {
                        console.log(empID, current, changePass.new, changePass.confirm, changePass.email);
                        console.log(response.data.message);
                        if (response.data.message === 'Success') {
                            Swal.fire({
                                customClass: {
                                    container: 'my-swal'
                                },
                                title: "Success!",
                                text: "Password reset successfully",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: true
                            }).then(function () {
                                navigate('/')
                            });
                            console.log(response);
                            // location.reload();
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                        // location.reload();
                    })
            } else {
                console.log(error)
                // location.reload();
            }
        });

    };

    return (
        <div id="page-container" className="main-container">
            <div className="main-container">
                <div className="bg-body-dark bg-pattern">
                    <div className="row mx-0 justify-content-center">
                        <div className="hero-static col-lg-6 col-xl-4">
                            <div className="content content-full overflow-hidden">
                                <div className="py-30 text-center"></div>
                                <div className="block block-themed block-rounded block-shadow">
                                    <div className="block-header" style={{ backgroundImage: 'linear-gradient(190deg, rgb(42, 128, 15,0.8), rgb(233, 171, 19,1))' }}>
                                        <h3 className="block-title">ManPro - Smart Business Management</h3>
                                        <Link to="/" type="submit" className="text-white" data-toggle="click-ripple">
                                            <i className="fa fa-arrow-left mr-5"></i> Back
                                        </Link>
                                    </div>
                                    <div className="block-content">
                                        <div className="form-group">
                                            <div className="col-12">
                                                <Typography variant="h5">Password reset</Typography>
                                                <Typography>Please enter the email address and new password</Typography>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <TextField
                                                    id='email'
                                                    name='email'
                                                    value={changePass.email}
                                                    label='Enter email address'
                                                    variant="outlined"
                                                    fullWidth
                                                    onChange={handleChange}
                                                    sx={{ marginBottom: 2 }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <TextField
                                                    id='new'
                                                    name='new'
                                                    value={changePass.new}
                                                    label='Enter new password'
                                                    variant="outlined"
                                                    fullWidth
                                                    onChange={handleChange}
                                                    sx={{ marginBottom: 2 }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <TextField
                                                    id='confirm'
                                                    name='confirm'
                                                    value={changePass.confirm}
                                                    label='Confirm new password'
                                                    variant="outlined"
                                                    fullWidth
                                                    onChange={handleChange}
                                                    sx={{ marginBottom: 2 }}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group mb-0 py-20">
                                            <Grid item xs={12} sm={6} sx={{ paddingLeft: 10, paddingRight: 10, paddingBottom: 2 }}>
                                                <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleChangePass}>
                                                    <i className="fa fa-refresh" style={{ marginRight: '8px' }} /> Reset Password
                                                </Button>
                                            </Grid>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
