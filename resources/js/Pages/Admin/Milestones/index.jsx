import React from "react";
import Layout from "../../../components/Layout/Layout";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { useMilestones } from "./hook/useMilestones";
import { Plus } from "lucide-react";

function Milestones() {
    const { data, isFetching, refetch, isLoading } = useMilestones();
    console.log(data);

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
                <Paper sx={{ p: 3, borderRadius: 5 }}>
                    <Typography variant="h6">Milestones</Typography>
                </Paper>
            </Stack>
        </Layout>
    );
}

export default Milestones;
