import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import { Box, Grid, Link, Stack, Typography } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useUser } from '../../hooks/useUser';
import HomeLogo from "../../../images/ManProTab.png";
import HrCategoryViewModal from '../../components/Modals/HrCategoryViewModal';

export default function MemberAnnouncements() {
    const { user } = useUser();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [announcementsList, setAnnouncementsList] = useState([]);

    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [openViewModal, setOpenViewModal] = useState(false);

    useEffect(() => {
        axiosInstance.get('/announcements_list', { headers }).then((response) => {
            setAnnouncementsList(response.data.listData);
        });
    }, [])

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
            <Box sx={{ mx: 12, mt: 4 }}>
                <Grid item sx={{ marginBottom: 2 }}>
                    <div className="d-flex justify-content-between align-items-center p-0">
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <h5 className='pt-3'>Announcements</h5>
                            </Grid>
                        </Grid>
                    </div>
                </Grid>

                {announcementsList.map((item, index) => (
                    <Grid container sx={{ marginBottom: 2, cursor: 'pointer' }} key={index}>
                        <Grid item xs={12}>
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

                                        <Grid item xs={9} onClick={() => handleOpenViewModal(item)}>
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

                                    </Grid>
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                ))
                }

                <HrCategoryViewModal open={openViewModal} close={handleCloseViewModal} announcement={selectedAnnouncement} />

            </Box>
        </Layout >
    )
}
