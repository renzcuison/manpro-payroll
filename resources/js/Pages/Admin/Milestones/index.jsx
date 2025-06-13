import React, { useState } from "react";
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
import { Plus, Trash, Trash2 } from "lucide-react";
import { useDashboard } from "../Dashboard/useDashboard";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";
import SendGreetingsForm from "./SendGreetingsForm";
import Swal from "sweetalert2";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import AddMilestoneDialog from "./modals/AddMilestoneDialog";
import MilestoneItem from "./MilestoneItem";

function Milestones() {
    // const { data, isFetching, refetch, isLoading } = useMilestones();
    const [openAddDialog, setOpendDialog] = useState(false);

    const {
        data: dashboard,
        isFetched: isFetchedDashboard,
        isLoading,
        refetch,
    } = useDashboard();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const { milestones, employees } = dashboard;

    const handleDeleteMilestone = (id) => {
        console.log(id);

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
                    await axiosInstance.delete(`/admin/milestones/${id}`, {
                        headers,
                    });
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
        <Layout>
            <Stack spacing={2}>
                <Stack>
                    <Typography variant="h3">
                        Employee Milestones & Celebrations
                    </Typography>
                    <Typography variant="body1">Manage</Typography>
                </Stack>
                <Box>
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Plus />}
                        onClick={() => setOpendDialog(true)}
                    >
                        Add New Milestone
                    </Button>
                </Box>
                <Divider sx={{ borderStyle: "dashed" }} />

                <Stack spacing={2}>
                    {milestones?.map((milestone) => (
                        <MilestoneItem
                            milestone={milestone}
                            refetch={refetch}
                            handleDelete={() =>
                                handleDeleteMilestone(milestone.id)
                            }
                        />
                    ))}
                </Stack>
            </Stack>

            {/* Add Milestone Modal */}
            {openAddDialog && (
                <AddMilestoneDialog
                    open={openAddDialog}
                    close={() => {
                        setOpendDialog(false);
                    }}
                    employees={employees}
                    refetch={refetch}
                />
            )}
        </Layout>
    );
}

export default Milestones;
