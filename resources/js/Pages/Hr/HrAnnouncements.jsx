import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import { Button, Grid, Link, Stack, TextField, Typography, Box } from '@mui/material';
import HrCategoryViewModal from '../../components/Modals/HrCategoryViewModal';
import HrCategoryAddModal from '../../components/Modals/HrCategoryAddModal';
import HrCategoryEditModal from '../../components/Modals/HrCategoryEditModal';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import { useUser } from '../../hooks/useUser';
import HomeLogo from "../../../images/ManProTab.png";

export default function HrAnnouncements() {
    const { user } = useUser();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [announcementsList, setAnnouncementsList] = useState([]);
    const [readBy, setReadBy] = useState([]);
    const [openCategoryAdd, setOpenCategoryAdd] = useState(false)
    const [openCategoryEdit, setOpenCategoryEdit] = useState(false)
    const [categoryData, setCategoryData] = useState({
        title: '',
        description: '',
        attached_file: null, // To store the selected file
    });

    const [openViewModal, setOpenViewModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    useEffect(() => {
        axiosInstance.get('/announcements_list', { headers }).then((response) => {
            setAnnouncementsList(response.data.listData);
        });
    }, [])

    const handleChange = (event) => {
        if (event.target.name === 'attached_file') {
            setCategoryData({
                ...categoryData,
                attached_file: event.target.files[0],
            });
        } else {
            setCategoryData({
                ...categoryData,
                [event.target.name]: event.target.value,
            });
        }
    };

    const handleOpenCategoryAdd = () => {
        setOpenCategoryAdd(true)
    }

    const handleCloseCategoryAdd = () => {
        setOpenCategoryAdd(false)
    }

    const handleOpenCategoryEdit = (data) => {
        setOpenCategoryEdit(true)
        setCategoryData(data)
    }

    const handleCloseCategoryEdit = () => {
        setOpenCategoryEdit(false)
    }

    const handleReadBy = (data) => {
        axiosInstance.post('/add_viewers', { category_id: data.category_id }, { headers }).then(function (response) {
            console.log(response);
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleOpenViewModal = (announcement) => {

        setSelectedAnnouncement(announcement);
        
        axiosInstance.get('/getCategory', {
            headers: headers,
            params: {
                category_id: announcement.category_id
            }
        }).then((response) => {
            console.log(response.data);
            setOpenViewModal(true);
            // window.location.href = `/hr/announcement-view?category_id=${announcement.category_id}`;
        })
        .catch((error) => {
            console.error('Error fetching announcement details:', error);
        });
    }
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
        return date.toLocaleString('en-US', options);
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setSelectedAnnouncement(null);
    }

    return (
        <Layout>
            <Box sx={{ mx: 12 }}>
                <div className="content-heading d-flex justify-content-between px-4">
                    <h5 className='pt-3'>Announcements</h5>

                    <div className="btn-group" role="group">
                        {/* <Button variant="contained" sx={{ height: '75%', width: '100%', background: 'linear-gradient(190deg, rgb(42, 128, 15,0.8), rgb(233, 171, 19,1))', color: 'white', }} onClick={handleOpenCategoryAdd} > */}
                            {/* Add */}
                        {/* </Button> */}

                        {user.user_type !== 'Super Admin' && (
                            <Button sx={{ height: '75%', width: '100%', marginTop: -1, bgcolor: '#022e57', color: 'white', }} variant="contained" onClick={handleOpenCategoryAdd} >
                                Add Annoucement
                            </Button>
                        )}
                    </div>
                </div>

                {announcementsList.map((item, index) => (
                    <Grid container sx={{ marginBottom: 2, cursor: 'pointer' }} key={index}>
                        <Grid item size={12}>
                            <div className='block'>
                                <div className="block-content col-lg-12 col-sm-12">
                                    <Grid container>
                                        <Grid item xs={1} onClick={() => handleOpenViewModal(item)}>
                                            <Stack>
                                                <div className="sidebar-mini-hidden-b text-center" >
                                                    {item.author_profile_pic ? (<img className="img-avatar" src={location.origin + "/storage/" + item.author_profile_pic} alt={item.author_fname + " " + item.author_mname + " " + item.author_lname} style={{ height: '50px', width: '50px' }} />)
                                                        : (<img className="img-avatar" src={HomeLogo} style={{ height: '50px', width: '50px' }} />)}
                                                </div>
                                            </Stack>
                                        </Grid>

                                        <Grid item xs={8} onClick={() => handleOpenViewModal(item)}>
                                            <Grid container alignItems="left" justifyContent="space-between">
                                                <Grid item sx={{ marginTop: 1 }}>
                                                    <Typography variant="h6">{item.title}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Grid item xs={2} onClick={() => handleOpenViewModal(item)}>
                                            <Grid container alignItems="flex-start" justifyContent="space-between">
                                                <Grid item>

                                                    <Grid item sx={{ marginTop: 2 }}>
                                                        <Typography>{formatDate(item.created_at)}</Typography>
                                                    </Grid>

                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Grid item xs={1}>
                                            <Grid container alignItems="flex-start" justifyContent="flex-end"> {/* Changed justifyContent to 'flex-end' */}
                                                <Grid item>
                                                    {(item.author_id === user.user_id || user.user_type === 'Super Admin') && (
                                                        <Grid item sx={{ marginTop: 1 }}>
                                                            {/* <Button onClick={() => handleOpenCategoryEdit(item)}><i className="fa fa-pencil" style={{ fontSize: 20 }}></i></Button> */}
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                    </Grid>
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                ))
                }

                <HrCategoryAddModal open={openCategoryAdd} close={handleCloseCategoryAdd} category="Announcement" />
                <HrCategoryEditModal open={openCategoryEdit} close={handleCloseCategoryEdit} category="Announcement" data={categoryData} />
                <HrCategoryViewModal open={openViewModal} close={handleCloseViewModal} announcement={selectedAnnouncement} />
            </Box>
        </Layout >
    )
}
