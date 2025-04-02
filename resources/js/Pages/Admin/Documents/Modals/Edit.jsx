import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    Popover,
    Stack,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Download, EllipsisVertical, Trash, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { useDocuments } from "../hook/useDocuments";
import { renderIcon } from "../../../../utils/constants";

function EditDocumentDialog({ open, close, document, handleDelete }) {
    const { deleteDoc } = useDocuments();
    const mimetype = document.media?.[0]?.mime_type;
    console.log(document.media?.[0]?.original_url);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpenLink = (e) => {
        e.preventDefault();
        window.open(document.media?.[0]?.original_url);
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const openpop = Boolean(anchorEl);
    const id = openpop ? "simple-popover" : undefined;

    return (
        <div>
            <Dialog
                open={open}
                onClose={close}
                aria-labelledby="form-dialog-title"
                aria-describedby="form-dialog-description"
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    style: {
                        borderRadius: 15,
                    },
                }}
            >
                <DialogTitle sx={{ paddingBottom: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h5" sx={{ fontWeight: "400" }}>
                            Document Details
                        </Typography>
                        <IconButton onClick={() => close(false)}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>
                <Divider sx={{ borderStyle: "dashed" }} />
                <DialogContent>
                    <Stack direction="row">
                        <Box>{renderIcon(mimetype, 90)}</Box>
                        <Divider
                            orientation="vertical"
                            sx={{ mx: 2, borderStyle: "dashed" }}
                        />
                        <Stack
                            spacing={1}
                            sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: 600 }}
                                >
                                    {document.title}
                                </Typography>
                                <IconButton
                                    aria-describedby={id}
                                    size="small"
                                    color="inherit"
                                    onClick={handleClick}
                                >
                                    <EllipsisVertical />
                                </IconButton>
                            </Box>
                            <Typography
                                variant="body1"
                                sx={{ fontWeight: "400" }}
                            >
                                {document.description}
                            </Typography>
                            <Typography variant="caption">
                                {document.media?.[0]?.file_name}
                            </Typography>
                            {/* downdload button */}
                            <Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleOpenLink}
                                    startIcon={<Download />}
                                    size="small"
                                >
                                    Download Document
                                </Button>
                            </Box>
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
            <Popover
                id={id}
                open={openpop}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <MenuList>
                    <MenuItem LinkComponent={Button} onClick={handleDelete}>
                        <ListItemIcon>
                            <Trash2 color="red" />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </MenuList>
            </Popover>
        </div>
    );
}

export default EditDocumentDialog;
