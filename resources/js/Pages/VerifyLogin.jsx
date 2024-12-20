import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";
import { Button, FormHelperText, Grid, TextField, Typography } from "@mui/material";
import axiosInstance, { getJWTHeader } from '../utils/axiosConfig';
import Swal from 'sweetalert2';

const VerifyLogin = () => {
    const navigate = useNavigate()
    const { user, isFetching } = useUser();
    const [titleError, setTitleError] = useState('');
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(60);
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        logout();
    };

    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, []);

    useEffect(() => {
        if (!isFetching) {
            if (user) {
                navigate('/')
            }
        }
    }, [])

    const handleCodeChange = (event) => {
        setCode(event.target.value);
    };

    const handleVerifyLogin = async (e) => {

        e.preventDefault();
        setLoading(true);
        
        // if (user.user_type === 'Admin') {
        //     navigate('/hr/dashboard');
        // } else if (user.user_type === 'Member') {
        //     navigate('/member/dashboard');
        // }
        
        try {
            const userId = user.user_id;
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            };
        
            // console.log('Verifying Code v6');
            // console.log('User ID: ' + userId);
            
            const response = await axiosInstance.post('/getVerificationCode', { userId }, { headers });
            // console.log('API Response:', response);
            const fetchedCode = response.data.verify_code;
            
            // console.log(`Response: ${response.data.status}`);
            // console.log(`User Info: ${response.data.userId}`);
            console.log(`${fetchedCode}`);
            // console.log(`Verified: ${response.data.verified}`);
            
            if (fetchedCode.trim() == code.trim()) {
                try {
                    if (user.user_type === 'Admin') {
                        navigate('/hr/dashboard');
                    } else if (user.user_type === 'Member') {
                        navigate('/member/dashboard');
                    }
                } catch (error) {
                    console.error('Error verifying code:', error);
                    setTitleError('An error occurred while verifying the code. Please try again.');
                }
            } else {
                setTitleError('Code did not match. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching verification code:', error);
            setTitleError('An error occurred while verifying the code. Please try again.');
        }        
    
        setLoading(false);
    };

    const handleResendOTP = () => {
        setLoading(true);
        axiosInstance.get(`/sendVerifyCode/${user.user_id}`)
            .then((response) => {
                if (response.data.userData === 'Success') {
                    Swal.fire({
                        customClass: {container: 'my-swal'},
                        title: "Success!",
                        text: "A new email has been Sent!",
                        icon: "success",
                        timer: 3000,
                        showConfirmButton: true
                    })
                } else {
                    alert("Something went wrong")
                    console.log(response)
                }
            })
            .catch((error) => {
                console.log('error', error.response)
            })
        setCountdown(60);
        setLoading(false);
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
                                        <Link to="/" className="text-white" onClick={handleLogout}>
                                            <i className="fa fa-arrow-left mr-5"></i> Back
                                        </Link>
                                    </div>
                                    <div className="block-content">
                                        <div className="form-group">
                                            <div className="col-12">
                                                <Typography variant="h5">OTP Verification</Typography>
                                                <Typography>We've sent a verification code to your email - {user.email}</Typography>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <TextField
                                                    id='code'
                                                    name='code'
                                                    label='Enter verification code'
                                                    variant="outlined"
                                                    fullWidth
                                                    onChange={handleCodeChange}
                                                    sx={{ marginBottom: 1 }}
                                                />
                                            </div>
                                            <FormHelperText sx={{ color: '#FF0000', display: 'inline' }}>{titleError}</FormHelperText>
                                            {countdown > 0 ? <p>Time remaining: {countdown} seconds</p> : null}
                                        </div>
                                        <div className="form-group mb-0 py-20">
                                            <Grid item xs={12} sm={6} sx={{ paddingLeft: 10, paddingRight: 10, paddingBottom: 2 }}>
                                                {countdown > 0 ? <>
                                                    <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleVerifyLogin}>
                                                        <i className="fa fa-send-o" style={{ marginRight: '8px' }} /> Submit Code
                                                    </Button>
                                                </> : <>
                                                    <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleResendOTP}>
                                                        <i className="fa fa-send-o" style={{ marginRight: '8px' }} /> Resend OTP
                                                    </Button>
                                                </>}
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

export default VerifyLogin
