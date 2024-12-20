import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import { FormControl, Typography, Button, Grid, TextField, Stack, InputLabel, OutlinedInput } from '@mui/material'
import { useUser } from '../../hooks/useUser';
import { capitalize } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import HomeLogo from "../../../images/ManProTab.png";

const MemberPersonalDetails = () => {
    const { user } = useUser();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [profileData, setProfileData] = useState({
        fname: '',
        mname: '',
        lname: '',
        bdate: '',
        email: '',
        contact: '',
        address: '',
        profile_pic: null,
    });
    useEffect(() => {
        axiosInstance.get('/get_user', { headers }).then((response) => {
            const userData = response.data.user;
            setProfileData(userData[0]);
        })
            .catch((error) => {
                console.error(error);
            });
    }, [])

    const handleChange = (event) => {
        if (event.target.name === 'profile_pic') {
            // Handle file input separately
            setProfileData((currState) => ({
                ...currState,
                profile_pic: event.target.files[0],
            }));
        } else {
            const { name, value } = event.target;
            setProfileData((currState) => ({
                ...currState,
                [name]: value,
            }));
        }
    };

    const handleEditProfile = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('fname', profileData.fname || user.fname);
        formData.append('mname', profileData.mname || user.mname);
        formData.append('lname', profileData.lname || user.lname);
        formData.append('bdate', profileData.bdate || user.bdate);
        formData.append('email', profileData.email || user.email);
        formData.append('contact', profileData.contact || user.contact_number);
        formData.append('address', profileData.address || user.address);

        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to update profile?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/update_profile', formData, { headers }).then(function (response) {
                    console.log(response);
                    location.reload();
                })
                    .catch((error) => {
                        console.log(error)
                        location.reload();
                    })
            } else {
                location.reload();
            }
        });

    };

    const handlePicture = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('profile_pic', profileData.profile_pic);

        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to update profile picture?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/picture', formData, { headers }).then(function (response) {
                    console.log(response);
                    location.reload();
                })
                    .catch((error) => {
                        console.log(error)
                        location.reload();
                    })
            } else {
                location.reload();
            }
        });

    };


    return (
        <Layout>
            <div className="content-heading d-flex justify-content-between p-0">
                <h5 className='pt-3'>Personal Details</h5>
            </div>

            <Grid container spacing={3}>
                {/* <Grid item lg={4} xs={12}>
                    <Stack>
                        <div className="px-10 align-parent" style={{ background: '#e6e6e6' }}>
                            <div className="sidebar-mini-hidden-b text-center" >
                                {user.profile_pic ? (<img className="img-avatar" src={location.origin + "/storage/" + user.profile_pic} alt={user.fname + " " + user.lname} style={{ height: '155px', width: '155px', margin: '20px' }} />)
                                    : (<img className="img-avatar" src={HomeLogo} style={{ height: '155px', width: '155px', margin: '20px' }} />)}
                            </div>
                        </div>
                    </Stack>
                    <Stack>
                        <div className="text-center">
                            <div className="block-content block-content-full" style={{ backgroundImage: 'linear-gradient(190deg, rgb(42, 128, 15,0.8), rgb(233, 171, 19,1))' }}>
                                <div className="font-w600 text-white mb-5">{capitalize(user.fname)} {capitalize(user.lname)}</div>
                                <div className="font-size-sm text-white-op">NAME</div>
                            </div>
                            <div className="block-content">
                                <div className="row items-push">
                                </div>
                            </div>
                        </div>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            id="filled-read-only-input"
                            label="User ID"
                            defaultValue={user.user_id}
                            InputProps={{
                                readOnly: true,
                            }}
                            variant="filled"
                            fullWidth
                        />
                        <TextField
                            id="filled-read-only-input"
                            label="Username"
                            defaultValue={user.username}
                            InputProps={{
                                readOnly: true,
                            }}
                            variant="filled"
                            fullWidth
                        />
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ marginTop: '20px' }}>
                        <Stack direction="column" spacing={0} sx={{ padding: '0px', width: '100%' }}>
                            <Typography>Select picture</Typography>
                            <TextField variant="outlined" type='file' accept="image/*" sx={{ background: 'rgb(233, 171, 19,1)' }} name="profile_pic" id="profile_pic" required onChange={handleChange} />
                        </Stack>
                        <Stack direction="column" spacing={0} sx={{ padding: '0px', width: '100%' }}>
                            <Typography>Click Save</Typography>
                            <Button onClick={handlePicture} type="submit" variant="outlined" sx={{ height: '53.13px', background: 'rgb(233, 171, 19,1)', textTransform: 'none', color: 'black' }}>Update</Button>
                        </Stack>
                    </Stack>
                </Grid> */}

                <Grid item lg={2} xs={12}></Grid>
                <Grid item lg={8} xs={12}>
                    <div className="block">
                        <div className="block-content" style={{ paddingTop: 50, paddingBottom: 50 }}>
                            <Typography>Your personal information is never shown to other users.</Typography>
                            <Stack>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={3} sx={{ marginTop: 1 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <Typography>User ID</Typography>
                                            <TextField value={user.user_id} size='small' name='userID' id='userID' readOnly />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3} sx={{ marginTop: 1 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <Typography>Username</Typography>
                                            <TextField value={user.username} size='small' name='username' id='username' readOnly />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3} sx={{ marginTop: 1 }}>
                                        <Typography>Select picture</Typography>
                                        <TextField variant="outlined" type='file' size='small' accept="image/*" name="profile_pic" id="profile_pic" required onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={3} sx={{ marginTop: 1 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <Button onClick={handlePicture} type="submit" variant="outlined" sx={{ background: 'rgb(233, 171, 19,1)', textTransform: 'none', color: 'black', marginTop: 5, paddingBlock: 0.95 }}>Update</Button>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} sx={{ marginTop: 1 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <Typography>First Name</Typography>
                                            <TextField value={profileData.fname !== undefined ? profileData.fname : user.fname} size='small' name='fname' id='fname' onChange={handleChange} />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} sx={{ marginTop: 1 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <Typography>Middle Name</Typography>
                                            <TextField value={profileData.mname !== undefined ? profileData.mname : user.mname} size='small' name='mname' id='mname' onChange={handleChange} />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} sx={{ marginTop: 1 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <Typography>Last Name</Typography>
                                            <TextField value={profileData.lname !== undefined ? profileData.lname : user.lname} size='small' name='lname' id='lname' onChange={handleChange} />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} sx={{ marginTop: 1 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <Typography>Birthday</Typography>
                                            <TextField type="date" value={profileData.bdate !== undefined ? profileData.bdate : user.bdate} size='small' name='bdate' id='bdate' onChange={handleChange} />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} sx={{ marginTop: 1 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <Typography>Email Address</Typography>
                                            <TextField value={profileData.email !== undefined ? profileData.email : user.email} size='small' name='email' id='email' onChange={handleChange} />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} sx={{ marginTop: 1 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <Typography>Contact Number</Typography>
                                            <TextField value={profileData.contact !== undefined ? profileData.contact : user.contact_number} size='small' name='contact' id='contact' onChange={handleChange} />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sx={{ marginTop: 1 }}>
                                        <FormControl fullWidth variant="outlined">
                                            <Typography>Address</Typography>
                                            <TextField value={profileData.address !== undefined ? profileData.address : user.address} size='small' name='address' id='address' onChange={handleChange} />
                                        </FormControl>
                                    </Grid>
                                    <Grid container item xs={12} sx={{ marginTop: 2, alignItems: 'center', justifyContent: 'center' }}>
                                        <Grid item sm={3}>
                                            <Button type="submit" variant="contained" color="primary" fullWidth
                                                onClick={handleEditProfile}
                                            >
                                                Update
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </div>
                    </div>
                </Grid>
            </Grid>
        </Layout>
    )
}

export default MemberPersonalDetails
