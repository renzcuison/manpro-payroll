import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";
import { Trash2 } from "lucide-react";
import React from "react";
import SendGreetingsForm from "./SendGreetingsForm";
import CakeIcon from "@mui/icons-material/Cake";
import WorkIcon from "@mui/icons-material/Work";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Swal from "sweetalert2";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import moment from "moment";
import { Link } from "react-router-dom";

const iconMap = {
    birthday: <CakeIcon color="secondary" />,
    anniversary: <WorkIcon color="primary" />,
    monthsary: <WorkIcon color="warning" />,
    promotion: <WorkIcon color="primary" />,
    transfer: <WorkIcon color="primary" />,
};

function MilestoneItem({ milestone, refetch, handleDelete }) {
    const handleDeleteComment = (id) => {
        // Prompt if sure to delete
        Swal.fire({
            title: "Are you sure you want to delete greeting?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
            denyButtonText: "No",
            showLoaderOnConfirm: true,
            preConfirm: async (login) => {
                try {
                    const storedUser = localStorage.getItem("nasya_user");
                    const headers = storedUser
                        ? getJWTHeader(JSON.parse(storedUser))
                        : {};
                    await axiosInstance.delete(
                        `/admin/milestones/${milestone.id}/comments/${id}`,
                        {
                            headers,
                        }
                    );
                    refetch();
                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                }
            },
            allowOutsideClick: () => !Swal.isLoading(),
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire("Deleted!", "", "success");
            } else if (result.isDismissed) {
                // Swal.fire("Changes are not saved", "", "info");
            }
        });
    };

    return (
        <>
            <Accordion
                sx={{
                    borderRadius: 5,
                    border: "none",
                    "&::before": {
                        // Removes the default divider line
                        display: "none",
                    },
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    sx={{ borderRadius: 5 }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                            src={milestone.user.media?.[0]?.original_url}
                            alt={milestone.user.first_name}
                            component={Link}
                            to={`/admin/employee/${milestone.user.user_name}`}
                        />
                        <Box>
                            <Typography variant="h5">
                                {moment(milestone.date).format(
                                    "dddd, MMMM DD, YYYY"
                                )}
                            </Typography>
                            <Typography variant="h6">
                                {milestone.user.first_name}{" "}
                                {milestone.user.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {milestone.description || milestone.type} -{" "}
                                {milestone.type}
                            </Typography>
                        </Box>
                        <Chip
                            label={
                                milestone.type === "monthsary"
                                    ? "Employee Service Milestone"
                                    : milestone.type.toUpperCase()
                            }
                            icon={iconMap[milestone.type]}
                            color="primary"
                        />
                    </Box>
                </AccordionSummary>
                <Divider sx={{ my: 1, borderStyle: "dashed" }} />
                <AccordionDetails sx={{ borderRadius: 5 }}>
                    <Stack spacing={1}>
                        <Typography variant="h5">
                            {moment(milestone.date).format(
                                "dddd, MMMM DD, YYYY"
                            )}
                        </Typography>
                        <div>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleDelete}
                            >
                                Delete milestone
                            </Button>
                        </div>
                    </Stack>
                    <Divider sx={{ my: 1, borderStyle: "dashed" }} />
                    <List>
                        {milestone?.comments?.map((comment) => (
                            <React.Fragment key={comment.id}>
                                <ListItem
                                    sx={{
                                        alignItems: "flex-start",
                                        px: 0,
                                        py: 1,
                                    }}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => {
                                                handleDeleteComment(comment.id);
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            alt={
                                                comment.user.media
                                                    ?.original_url ??
                                                comment?.user?.first_name
                                            }
                                            src="/static/images/avatar/3.jpg"
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={comment?.user?.first_name}
                                        secondary={
                                            <React.Fragment>
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    sx={{
                                                        color: "text.primary",
                                                        display: "inline",
                                                    }}
                                                >
                                                    {comment.comment}
                                                </Typography>
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>

                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                    <Divider sx={{ my: 1, borderStyle: "dashed" }} />
                    <SendGreetingsForm
                        milestoneId={milestone.id}
                        refetch={refetch}
                    />
                </AccordionDetails>
            </Accordion>
        </>
    );
}

export default MilestoneItem;
