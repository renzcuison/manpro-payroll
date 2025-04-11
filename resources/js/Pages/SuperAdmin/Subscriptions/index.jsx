import React, { useState } from "react";
import Layout from "../../../components/Layout/Layout";
import { Box, Button, Divider, Grid, Stack, Typography } from "@mui/material";
import { BorderStyle } from "@mui/icons-material";
import CreateSubscriptionModal from "./Modals/CreateSubscriptionModal";

function SubscriptionList() {
    const [openDialog, setOpenDialog] = useState(false);

    const handleClose = () => {
        setOpenDialog(false);
        setSelectedPackage(null);
    };
    return (
        <Layout>
            <Stack spacing={2}>
                <Stack>
                    <Typography variant="h4">Subscription List</Typography>
                    <Typography variant="body1">
                        This is a list of all the clients subscribed to our
                        services.
                    </Typography>
                </Stack>
                <Box>
                    <Button
                        variant="contained"
                        onClick={() => setOpenDialog(true)}
                    >
                        Add New Subscription
                    </Button>
                </Box>
                <Divider sx={{ borderStyle: "dashed" }} />
                <Box sx={{ p: 2 }}>
                    <Grid container>
                        <Grid
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Typography variant="h6">Client Name</Typography>
                            <Typography variant="h6">
                                Subscription Status
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Stack>
            {openDialog && (
                <CreateSubscriptionModal
                    open={openDialog}
                    onClose={handleClose}
                />
            )}
        </Layout>
    );
}

export default SubscriptionList;
