import React from "react";
import Layout from "../../../components/Layout/Layout";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { useMilestones } from "./hook/useMilestones";
import { Plus } from "lucide-react";
import CakeIcon from "@mui/icons-material/Cake";
import WorkIcon from "@mui/icons-material/Work";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useDashboard } from "../Dashboard/useDashboard";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";

const iconMap = {
    birthday: <CakeIcon color="secondary" />,
    anniversary: <WorkIcon color="primary" />,
    achievement: <EmojiEventsIcon color="warning" />,
};

function Milestones() {
    // const { data, isFetching, refetch, isLoading } = useMilestones();

    const {
        data: dashboard,
        isFetched: isFetchedDashboard,
        isLoading,
    } = useDashboard();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const { milestones } = dashboard;
    console.log(milestones);

    return (
        <Layout>
            <Stack spacing={2}>
                <Stack>
                    <Typography variant="h3">
                        Employee Milestones & Celebrations
                    </Typography>
                    <Typography variant="body1">
                        This is a list of documents
                    </Typography>
                </Stack>
                <Box>
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Plus />}
                        onClick={() => {}}
                    >
                        Add New Milestone
                    </Button>
                </Box>
                <Divider sx={{ borderStyle: "dashed" }} />

                <Grid container spacing={2}>
                    {milestones?.map((milestone) => (
                        <Grid size={{ xs: 12, md: 6 }} key={milestone.id}>
                            <Card
                                elevation={3}
                                sx={{ borderRadius: 4, width: "100%" }}
                            >
                                <CardContent>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={2}
                                    >
                                        <Avatar
                                            src={
                                                milestone.user.media?.[0]
                                                    ?.original_url
                                            }
                                            alt={milestone.user.first_name}
                                        />
                                        <Box>
                                            <Typography variant="h6">
                                                {milestone.user.first_name}{" "}
                                                {milestone.user.last_name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {milestone.description ||
                                                    milestone.type}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={milestone.type.toUpperCase()}
                                            icon={iconMap[milestone.type]}
                                            color="primary"
                                        />
                                    </Box>
                                    <Typography variant="caption" mt={2}>
                                        {new Date(
                                            milestone.date
                                        ).toDateString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Stack>
        </Layout>
    );
}

export default Milestones;
