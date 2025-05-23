import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import React from "react";
import { PiCalendarHeart, PiCalendarStar } from "react-icons/pi";
import { format } from "date-fns";
import moment from "moment";

function EventDialog({ modalOpen, setModalOpen, selectedEvent, onDelete }) {
    return (
        <Dialog
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {selectedEvent?.type === "holiday" ? (
                    <PiCalendarStar color="#e53935" size={24} />
                ) : (
                    <PiCalendarHeart color="#1976d2" size={24} />
                )}
                <Typography variant="h6" component="div">
                    {selectedEvent?.title}
                </Typography>
                <Chip
                    label={
                        selectedEvent?.type === "holiday"
                            ? "Holiday"
                            : "Schedule"
                    }
                    color={
                        selectedEvent?.type === "holiday" ? "error" : "primary"
                    }
                    size="small"
                />
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Date & Time
                        </Typography>
                        <Typography variant="body2">
                            {moment(selectedEvent?.start).format(
                                "MMM. DD, YYYY"
                            )}
                            {selectedEvent?.end &&
                                ` - ${moment(selectedEvent?.end).format(
                                    "MMM. DD, YYYY"
                                )} / ${moment(selectedEvent?.start).format(
                                    "hh:mm a"
                                )}`}
                        </Typography>
                    </Box>

                    {selectedEvent?.description && (
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Description
                            </Typography>
                            <Typography variant="body2">
                                {selectedEvent.description}
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => onDelete(selectedEvent.id)}
                >
                    Delete Event
                </Button>
                <Button onClick={() => setModalOpen(false)} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EventDialog;
