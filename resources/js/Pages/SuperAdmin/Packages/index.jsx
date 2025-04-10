import React, { useState } from "react";
import Layout from "../../../components/Layout/Layout";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
import { usePackages } from "../hooks/usePackages";
import CreatePackageModal from "./Modals/CreatePackageModal";
import { useFeatures } from "../hooks/useFeatures";
import { MoreVerticalIcon } from "lucide-react";

function Packages() {
    const { packages, isFetching } = usePackages();
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [snackBarOpen, setIsOpenSnackBar] = useState(false);
    const [snackBarMsg, setSnackBarMsg] = useState(false);

    const {
        data: features,
        isFetching: isFetchingFeatures,
        isFetched,
    } = useFeatures();
    console.log(packages);

    const handlePackageClick = (item) => {
        setSelectedPackage(item);
        setOpenDialog(true);
    };
    const handleClose = () => {
        setOpenDialog(false);
        setSelectedPackage(null);
    };

    const handleCloseSnack = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setIsOpenSnackBar(false);
    };

    return (
        <Layout>
            <Stack spacing={2}>
                <h1> Packages </h1>
                <Box>
                    <Button
                        variant="contained"
                        onClick={() => setOpenDialog(true)}
                    >
                        Add New Package
                    </Button>
                </Box>
                <Divider sx={{ borderStyle: "dashed" }} />
                <Stack spacing={2}>
                    {isFetching ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        packages?.map((packageItem, index) => (
                            <Box
                                key={index}
                                sx={{
                                    p: 2,
                                    px: 3,
                                    border: "1px solid #ccc",
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                                onClick={() => handlePackageClick(packageItem)}
                            >
                                <Stack>
                                    <Typography variant="h6">
                                        {packageItem.name}
                                    </Typography>
                                    <Typography variant="body2">
                                        {packageItem.description}
                                    </Typography>
                                </Stack>
                                <IconButton onClick={() => {}}>
                                    <MoreVerticalIcon />
                                </IconButton>
                            </Box>
                        ))
                    )}
                </Stack>
            </Stack>
            {openDialog && (
                <CreatePackageModal
                    open={openDialog}
                    onClose={handleClose}
                    selectedPackage={selectedPackage}
                    setSnackBarMsg={setSnackBarMsg}
                    setIsOpenSnackBar={setIsOpenSnackBar}
                />
            )}

            {snackBarOpen && (
                <Snackbar
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    open={snackBarOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseSnack}
                    message={snackBarMsg}
                >
                    <Alert
                        onClose={handleClose}
                        severity="success"
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {snackBarMsg}
                    </Alert>
                </Snackbar>
            )}
        </Layout>
    );
}

export default Packages;
