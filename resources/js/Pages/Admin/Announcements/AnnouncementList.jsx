import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress } from '@mui/material'
import Layout from '../../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead'
import PageToolbar from '../../../components/Table/PageToolbar'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getComparator, stableSort } from '../../../components/utils/tableUtils'

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import AnnouncementForm from './Modals/AnnouncementForm';
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const AnnouncementList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);

    // ---------------- Announcement List
    const [announcements, setAnnouncements] = useState([]);
    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = () => {
        axiosInstance.get('/announcements/getAnnouncements', { headers })
            .then((response) => {
                console.log(response.data);
                console.log(response.data.announcements);
                setAnnouncements(response.data.announcements);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching announcements:', error);
                setIsLoading(false);
            });
    }

    // ---------------- Announcement Form
    const [openAnnouncementForm, setOpenAnnouncementForm] = useState(false);
    const handleOpenAnnouncementForm = () => {
        setOpenAnnouncementForm(true);
    };
    const handleCloseAnnouncementForm = () => {
        setOpenAnnouncementForm(false);
        fetchAnnouncements();

    };

    return (
        <Layout title={"AnnouncementsList"}>
            <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: "auto", width: { xs: "100%", md: "90%" } }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Announcements
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenAnnouncementForm}
                        >
                            <p className="m-0">
                                <i className="fa fa-plus"></i> Add {" "}
                            </p>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }} >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {" "}
                                <TableContainer
                                    style={{ overflowX: "auto" }}
                                    sx={{ minHeight: 400 }}
                                >
                                    <Table aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center" sx={{ width: "50%" }}>
                                                    Title
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "25%" }}>
                                                    Date Created
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "25%" }}>
                                                    Publish Date
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {announcements.length > 0 ? (
                                                announcements.map(
                                                    (announcements, index) => (
                                                        <TableRow
                                                            key={announcements.id}
                                                            sx={{
                                                                p: 1,
                                                                backgroundColor:
                                                                    index % 2 === 0
                                                                        ? "#f8f8f8"
                                                                        : "#ffffff",
                                                            }}>
                                                            <TableCell align="center">
                                                                {announcements.title}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {dayjs(announcements.created_at).format('MMM DD, YYYY h:mm a')}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {"[insert publish date]"}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center" sx={{ color: "text.secondary", p: 1, }}>
                                                        No Announcements Found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
            {openAnnouncementForm && (
                <AnnouncementForm
                    open={openAnnouncementForm}
                    close={handleCloseAnnouncementForm}
                />
            )}
        </Layout>
    )
}

export default AnnouncementList