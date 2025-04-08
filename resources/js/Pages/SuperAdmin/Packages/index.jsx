import React, { useState } from "react";
import Layout from "../../../components/Layout/Layout";
import { Box, Button, CircularProgress, Divider, Stack } from "@mui/material";
import { usePackages } from "../hooks/usePackages";
import CreatePackageModal from "./Modals/CreatePackageModal";

function Packages() {
    const { packages, isFetching } = usePackages();
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    const handlePackageClick = (item) => {
        setSelectedPackage(item);
        setOpenDialog(true);
    };
    const handleClose = () => {
        setOpenDialog(false);
        setSelectedPackage(null);
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
                <Box>
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
                        packages?.map((packageItem) => (
                            <Box
                                key={packageItem.id}
                                sx={{ p: 2, border: "1px solid #ccc" }}
                                onClick={() => handlePackageClick(packageItem)}
                            >
                                <h2>{packageItem.name}</h2>
                                <p>{packageItem.description}</p>
                            </Box>
                        ))
                    )}
                </Box>
            </Stack>
            {openDialog && (
                <CreatePackageModal
                    open={openDialog}
                    onClose={handleClose}
                    selectedPackage={selectedPackage}
                />
            )}
        </Layout>
    );
}

export default Packages;
