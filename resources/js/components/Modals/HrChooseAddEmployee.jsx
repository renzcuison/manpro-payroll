import { Box, Button, IconButton, Typography, Dialog, DialogTitle, DialogContent, Grid, Divider, } from '@mui/material';
import React, { useState } from 'react'
import { getJWTHeader } from '../../utils/axiosConfig';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';

const HrChooseAddEmployee = ({ open, close }) => {
    const { user } = useUser();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const linkValue = location.origin + "/add-employee?team=" + (user.team && user.user_type !== 'Super Admin' ? user.team : 'ManPro') + "&user_type=Member";

    const handleCopyClick = async () => {
        try {
            await navigator.clipboard.writeText(linkValue);
            alert('Link copied to clipboard: \n' + linkValue);
            location.reload();
        } catch (err) {
            console.error('Unable to copy to clipboard: ', err);
        }
    };

    return (
        <>
            <Dialog sx={{
                "& .MuiDialog-container": {
                    justifyContent: "flex-center",
                    alignItems: "flex-start"
                }
            }}
                open={open} fullWidth maxWidth="sm">
                <Box className="d-flex justify-content-between" >
                    <DialogTitle sx={{ marginTop: 2 }}>Add New Employee</DialogTitle>
                    <IconButton sx={{ float: 'right', marginRight: 2, marginTop: 2, color: 'red' }} data-dismiss="modal" aria-label="Close" onClick={close}><i className="si si-close"></i></IconButton>
                </Box>
                <Divider variant="middle" light style={{ borderTop: '4px solid black' }} />
                <DialogContent>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item>
                            <Typography>If you want to send a link to the employee:</Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                size='small'
                                variant="contained"
                                color="primary"
                                startIcon={<FileCopyIcon />}
                                onClick={handleCopyClick}
                            >
                                Copy Link
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid container alignItems="center" spacing={2} sx={{ marginTop: 2 }}>
                        <Grid item>
                            <Typography>Or create manually:</Typography>
                        </Grid>
                        <Grid item>
                            <NavLink
                                to={`/hr/create-employee`}
                            >
                                <Button
                                    size='small'
                                    variant="contained"
                                    color="error"
                                >
                                    Add
                                </Button>
                            </NavLink>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog >
        </>

    )
}

export default HrChooseAddEmployee
