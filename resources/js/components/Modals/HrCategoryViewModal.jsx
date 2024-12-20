import { Box, IconButton, Dialog, DialogTitle, DialogContent, Typography, Link, FormControl, InputLabel } from '@mui/material';
import React from 'react';

const HrCategoryViewModal = ({ open, close, announcement }) => {
    // Add a null check to prevent accessing properties of a null object
    if (!announcement) {
        return null; // or return a placeholder message, or handle it as needed
    }

    return (
        <Dialog open={open} fullWidth maxWidth="md">
            
            <DialogTitle sx={{ backgroundColor: '#1E5799', color: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}> {announcement.title} </Typography>
                    <IconButton onClick={close} sx={{ color: 'white' }}><i className="si si-close"></i></IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ padding: '8px', marginTop: '27px', marginBottom: '12px' }}>
                    <Typography variant="body1" dangerouslySetInnerHTML={{ __html: announcement.description }} style={{ width: '100%'}} />

                    <Typography>
                        Attachment: <Link href={location.origin + "/storage/" + announcement.attached_file} target="_blank"> {announcement.attached_file} </Link>
                    </Typography>
                </Box>
            </DialogContent>

        </Dialog>
    );
}

export default HrCategoryViewModal;
