import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
} from "@mui/material";

import PersonIcon from '@mui/icons-material/Person';
import React from "react";
import dayjs from "dayjs";

const getMethodName = (method) => {
    switch (method) {
        case 1:
            return "Web Application";
        case 2:
            return "Mobile Application";
        case 3:
            return "Biometric Device";
        default:
            return "-";
    }
};

const AttendanceDateLog = ({ log, onClose }) => {
    const timestamp = dayjs(log?.timestamp);

    return (
        <Dialog
            open={true}
            fullWidth
            maxWidth="md"
            onClose={onClose}
            BackdropProps={{
                sx: {
                    backgroundColor: "rgba(0, 0, 0, 0)",
                },
            }}
            slotProps={{
                paper: {
                    sx: {
                        p: { xs: 0, md: 1 },
                        backgroundColor: "#f8f9fa",
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: { xs: 0, md: "20px" },
                        minWidth: { xs: "100%", md: "500px" },
                        maxWidth: 0,
                        marginBottom: "5%",
                    },
                },
            }}
        >

            <DialogTitle sx={{ padding: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h5" sx={{ marginLeft: 1, fontWeight: "bold" }}>
                        Attendance Details
                    </Typography>
                    <IconButton onClick={onClose}>
                        <i className="si si-close"></i>
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ py: 2, pb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body1">Date</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {timestamp.format("MMMM D, YYYY")}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body1">Time</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {timestamp.format("hh:mm:ss A")}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body1">Action</Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontWeight: 'bold',
                                    color:
                                        log.action === "Duty In"
                                            ? "#177604"
                                            : log.action === "Duty Out"
                                                ? "#f44336"
                                                : log.action === "Overtime In"
                                                    ? "#e9ae20"
                                                    : log.action === "Overtime Out"
                                                        ? "#f57c00"
                                                        : "#000000",
                                }}
                            >
                                {log.action || "-"}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1">Method</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {getMethodName(log.method)}
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            width: 130,
                            height: 130,
                            border: '2px solid #ccc',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxSizing: 'border-box',
                            flexShrink: 0,
                            p: 1,
                        }}
                    >
                        {log.method === 2 && log.imageUrl ? (
                            <Box
                                component="img"
                                src={log.imageUrl}
                                alt="Selfie"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <PersonIcon sx={{ fontSize: 120, color: '#b0b0b0', mb: -2 }} />
                                <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', mb: 1 }}>
                                    No image available
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>




        </Dialog>
    );
};

export default AttendanceDateLog;
