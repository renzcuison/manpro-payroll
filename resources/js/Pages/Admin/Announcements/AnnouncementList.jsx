import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, TablePagination, Box, Typography, Button, Menu, MenuItem, TextField, Stack, Grid, CircularProgress, IconButton } from '@mui/material';
import { MoreVert } from "@mui/icons-material";
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import PageHead from '../../../components/Table/PageHead';
import PageToolbar from '../../../components/Table/PageToolbar';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getComparator, stableSort } from '../../../components/utils/tableUtils';
import Swal from "sweetalert2";


import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import AnnouncementForm from './Modals/AnnouncementForm';
import AnnouncementPublishModal from './Modals/AnnouncementPublishModal';
import AnnouncementEdit from './Modals/AnnouncementEdit';
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const AnnouncementList = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);

    // ---------------- Announcement List
    const [announcements, setAnnouncements] = useState([]);
    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = () => {
        axiosInstance.get('/announcements/getAnnouncements', { headers })
            .then((response) => {
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

    // ---------------- Announcement Publishing
    const [openAnnouncementPublish, setOpenAnnouncementPublish] = useState(null);
    const handleOpenAnnouncementPublish = (announcement) => {
        setOpenAnnouncementPublish(announcement)
    }
    const handleCloseAnnouncementPublish = () => {
        setOpenAnnouncementPublish(null);
        fetchAnnouncements();
    }

    // ---------------- Announcement Publishing
    const [openAnnouncementEdit, setOpenAnnouncementEdit] = useState(null);
    const handleOpenAnnouncementEdit = (announcement) => {
        setOpenAnnouncementEdit(announcement)
    }
    const handleCloseAnnouncementEdit = () => {
        setOpenAnnouncementEdit(null);
        fetchAnnouncements();
    }

    // ---------------- Application Hiding
    const handleToggleHide = (toggle, id) => {
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: `${toggle ? "Hide" : "Unhide"} Announcement?`,
            text: `The Announcement will be ${toggle ? "Hidden from" : "Visible to"} Employees`,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: toggle ? "Hide" : "Unhide",
            confirmButtonColor: "#E9AE20",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance
                    .get(`announcements/toggleHide/${id}`, {
                        headers
                    })
                    .then((response) => {
                        Swal.fire({
                            customClass: { container: "my-swal" },
                            title: "Success!",
                            text: `Your Announcement is now ${toggle ? "Hidden" : "Visible"}`,
                            icon: "success",
                            showConfirmButton: true,
                            confirmButtonText: "Okay",
                            confirmButtonColor: "#177604",
                        }).then((res) => {
                            if (res.isConfirmed) {
                                fetchAnnouncements();
                            }
                        });
                    })
                    .catch((error) => {
                        console.error("Error toggling Hide Status:", error);
                    });
            }
        });
    };

    // ---------------- Menu Items
    const [menuStates, setMenuStates] = useState({});
    const handleMenuOpen = (event, id) => {
        setMenuStates((prevStates) => ({
            ...prevStates,
            [id]: {
                ...prevStates[id],
                open: true,
                anchorEl: event.currentTarget,
            },
        }));
    };

    const handleMenuClose = (id) => {
        setMenuStates((prevStates) => ({
            ...prevStates,
            [id]: {
                ...prevStates[id],
                open: false,
                anchorEl: null,
            },
        }));
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
                                                <TableCell align="center" sx={{ width: "22.5%" }}>
                                                    Title
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "22.5%" }}>
                                                    Date Created
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "22.5%" }}>
                                                    Publish Date
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "22.5%" }}>
                                                    Status
                                                </TableCell>
                                                <TableCell align="center" sx={{ width: "10%" }}>
                                                    Action
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {announcements.length > 0 ? (
                                                announcements.map(
                                                    (announcements, index) => {

                                                        if (!menuStates[announcements.id]) {
                                                            menuStates[announcements.id] = { open: false, anchorEl: null, };
                                                        }

                                                        return (
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
                                                                    {announcements.published
                                                                        ? dayjs(announcements.published).format('MMM DD, YYYY h:mm a')
                                                                        : "-"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {!announcements.published
                                                                        ? "Pending"
                                                                        : !announcements.hidden
                                                                            ? "Published"
                                                                            : "Hidden"}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <IconButton
                                                                        aria-label="more"
                                                                        aria-controls={menuStates[announcements.id]?.open
                                                                            ? `announcement-menu-${announcements.id}`
                                                                            : undefined
                                                                        }
                                                                        aria-haspopup="true"
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            handleMenuOpen(event, announcements.id);
                                                                        }}>
                                                                        <MoreVert />
                                                                    </IconButton>
                                                                    <Menu id={`announcement-menu-${announcements.id}`}
                                                                        anchorEl={menuStates[announcements.id]?.anchorEl}
                                                                        open={menuStates[announcements.id]?.open || false}
                                                                        onClose={(event) => {
                                                                            event.stopPropagation();
                                                                            handleMenuClose(
                                                                                announcements.id
                                                                            );
                                                                        }}
                                                                        MenuListProps={{
                                                                            "aria-labelledby": `application-menu-${announcements.id}`,
                                                                        }}>
                                                                        {/* Editing */}
                                                                        {!announcements.published && (
                                                                            <MenuItem
                                                                                onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    handleOpenAnnouncementEdit(announcements);
                                                                                    handleMenuClose(announcements.id);
                                                                                }}>
                                                                                Edit
                                                                            </MenuItem>
                                                                        )}
                                                                        {/* Publishing */}
                                                                        {!announcements.published && (
                                                                            <MenuItem
                                                                                onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    handleOpenAnnouncementPublish(announcements);
                                                                                    handleMenuClose(announcements.id);
                                                                                }}>
                                                                                Publish
                                                                            </MenuItem>
                                                                        )}
                                                                        {/* Hide Toggle */}
                                                                        {(announcements.published) && (
                                                                            <MenuItem
                                                                                onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    handleToggleHide(!announcements.hidden, announcements.id);
                                                                                    handleMenuClose(announcements.id);
                                                                                }}
                                                                            >
                                                                                {announcements.hidden ? 'Unhide' : 'Hide'}
                                                                            </MenuItem>
                                                                        )}
                                                                        <MenuItem
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                handleMenuClose(announcements.id);
                                                                            }}>
                                                                            Close Menu
                                                                        </MenuItem>
                                                                    </Menu>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    }
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
            {openAnnouncementPublish && (
                <AnnouncementPublishModal
                    open={true}
                    close={handleCloseAnnouncementPublish}
                    announceInfo={openAnnouncementPublish}
                />
            )}
            {openAnnouncementEdit && (
                <AnnouncementEdit
                    open={true}
                    close={handleCloseAnnouncementEdit}
                    announceInfo={openAnnouncementEdit}
                />
            )}
        </Layout>
    )
}

export default AnnouncementList