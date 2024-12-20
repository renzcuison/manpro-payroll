import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { Button, FormHelperText, Grid, TextField, Typography } from "@mui/material";
import axiosInstance from "../utils/axiosConfig";
import Swal from 'sweetalert2';

const ForgotPassword = () => {
    const navigate = useNavigate()
    const { user, isFetching } = useUser();
    const [titleError, setTitleError] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (!isFetching) {
            if (user) {
                navigate('/')
            }
        }
    }, [])

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();

        axiosInstance.post('/verifyEmail', { email: email }).then((response) => {
            if (response.data.message === 'Success') {
                const linkValue = location.origin + "/resetPassword?pass=" + response.data.pass + "&user_id=" + response.data.user_id;
                axiosInstance.post(`/sendForgotPasswordMail/${response.data.user_id}`, { linkValue: linkValue })
                    .then((response) => {
                        if (response.data.userData === 'Success') {
                            Swal.fire({
                                customClass: {
                                    container: 'my-swal'
                                },
                                title: "Success!",
                                text: "Email has been Sent!",
                                icon: "success",
                                timer: 1000,
                                showConfirmButton: true
                            }).then(function () {
                                navigate('/')
                            });
                        } else {
                            alert("Something went wrong")
                            console.log(response)
                        }
                    })
                    .catch((error) => {
                        console.log('error', error.response)
                    })
            } else {
                setTitleError('No match found. Please try again.');
            }
        })
            .catch((error) => {
                console.log(error)
                location.reload();
            })
    };

    return (
        <div id="page-container" className="main-container">
            <div className="main-container">
                <div className="bg-body-dark bg-pattern">
                    <div className="row mx-0 justify-content-center">
                        <div className="hero-static col-lg-6 col-xl-4">
                            <div className="content content-full overflow-hidden">
                                <div className="py-30 text-center">
                                    <h1 className="h4 font-w700 mt-30 mb-10">Welcome to ManPro</h1>
                                    <h2 className="h5 font-w400 text-muted mb-0">It’s a great day today!</h2>
                                </div>
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
                                                <Typography variant="h5">Forgot your password?</Typography>
                                                <Typography>Please enter the email address you'd like your password reset information sent to</Typography>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <TextField
                                                    id='email'
                                                    name='email'
                                                    label='Enter email address'
                                                    variant="outlined"
                                                    fullWidth
                                                    onChange={handleEmailChange}
                                                    sx={{ marginBottom: 1 }}
                                                />
                                            </div>
                                            <FormHelperText sx={{ color: '#FF0000', display: 'inline' }}>{titleError}</FormHelperText>
                                        </div>
                                        <div className="form-group mb-0 py-20">
                                            <Grid item xs={12} sm={6} sx={{ paddingLeft: 10, paddingRight: 10, paddingBottom: 2 }}>
                                                <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleForgotPassword}>
                                                    <i className="fa fa-send-o" style={{ marginRight: '8px' }} /> Request reset link
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

export default ForgotPassword
