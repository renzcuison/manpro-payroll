import React, { useState } from "react";
import Layout from "../../../components/Layout/Layout";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Popover,
    Snackbar,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import { usePackages } from "../hooks/usePackages";
import CreatePackageModal from "./Modals/CreatePackageModal";
import { useFeatures } from "../hooks/useFeatures";
import { EditIcon, MoreVerticalIcon, Trash } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

function Packages() {
    const { packages, isFetching, deletePkg } = usePackages();
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [snackBarOpen, setIsOpenSnackBar] = useState(false);
    const [snackBarMsg, setSnackBarMsg] = useState(false);
    const { palette } = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        console.log(event);

        setAnchorEl(event.currentTarget);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

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
    const showDeleteSwal = () => {
        withReactContent(Swal)
            .fire({
                title: "Are you sure you want to delete this package?",
                text: "You won't be able to revert this!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    // delete package
                    deletePkg(selectedPackage.id)
                        .then((res) => {
                            console.log(res);
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                }
            });
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
                            >
                                <Stack>
                                    <Typography
                                        variant="h6"
                                        component={"a"}
                                        href="#"
                                        onClick={() =>
                                            handlePackageClick(packageItem)
                                        }
                                        sx={{
                                            color: palette.primary.main,
                                            cursor: "pointer",
                                            ":hover": {
                                                color: palette.primary.dark,
                                            },
                                        }}
                                    >
                                        {packageItem.name}
                                    </Typography>
                                    <Typography variant="body2">
                                        {packageItem.description}
                                    </Typography>
                                </Stack>
                                <IconButton
                                    onClick={(e) => {
                                        handleClick(e);
                                        setSelectedPackage(packageItem);
                                    }}
                                >
                                    <MoreVerticalIcon />
                                </IconButton>
                            </Box>
                        ))
                    )}
                </Stack>
            </Stack>

            {/* <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                The content of the Popover.
            </Popover> */}
            <Menu
                id={id}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClosePopover}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <MenuItem
                    onClick={() => {
                        handleClosePopover();
                        setOpenDialog(true);
                    }}
                >
                    <ListItemIcon>
                        <EditIcon size={16} />
                    </ListItemIcon>
                    Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleClosePopover();
                        showDeleteSwal();
                    }}
                >
                    <ListItemIcon>
                        <Trash size={16} />
                    </ListItemIcon>
                    Delete
                </MenuItem>
            </Menu>

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
