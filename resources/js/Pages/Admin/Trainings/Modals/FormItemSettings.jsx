import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    Typography,
    Divider,
} from "@mui/material";
import { DragIndicator } from "@mui/icons-material";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { Form } from "react-router-dom";
import Swal from "sweetalert2";

const FormItemSettings = ({ open, close, formId, formItems }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [items, setItems] = useState([]);
    const [initialItems, setInitialItems] = useState([]);
    const [newOrder, setNewOrder] = useState([]);
    const [dropPosition, setDropPosition] = useState(null);

    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    useEffect(() => {
        if (open && formItems && Array.isArray(formItems)) {
            const itemsCopy = formItems.map((item) => ({
                id: item.id,
                order: item.order || formItems.indexOf(item) + 1,
                description: item.description,
                type: item.type,
                value: item.value,
            }));
            setItems(itemsCopy);
            setInitialItems(itemsCopy);
            const initialOrder = itemsCopy.map((item) => ({
                id: item.id,
                order: item.order,
            }));
            setNewOrder(initialOrder);
        } else if (open) {
            setItems([]);
            setInitialItems([]);
            setNewOrder([]);
        }
    }, [open, formItems]);

    // Drag and Drop Handlers
    const handleDragStart = (e, index) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index);
    };

    const handleDragEnter = (e, index) => {
        e.preventDefault();
        dragOverItem.current = index;
        setDropPosition(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragLeave = (e) => {
        e.target.style.opacity = "1";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dragIndex = dragItem.current;
        const dropIndex = dragOverItem.current;

        if (dragIndex === null || dropIndex === null) return;

        const updatedItems = Array.from(items);
        const [draggedItem] = updatedItems.splice(dragIndex, 1);
        updatedItems.splice(dropIndex, 0, draggedItem);

        const reorderedItems = updatedItems.map((item, index) => ({
            ...item,
            order: index + 1,
        }));

        setItems(reorderedItems);

        const updatedOrder = reorderedItems.map((item) => ({
            id: item.id,
            order: item.order,
        }));
        setNewOrder(updatedOrder);
        setDropPosition(null);

        dragItem.current = null;
        dragOverItem.current = null;
        e.target.style.opacity = "1";
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = "1";
        setDropPosition(null);
        dragItem.current = null;
        dragOverItem.current = null;
    };

    // Reset Order to Default
    const handleResetToDefault = () => {
        setItems(initialItems);
        const resetOrder = initialItems.map((item) => ({
            id: item.id,
            order: item.order,
        }));
        setNewOrder(resetOrder);
    };

    const confirmExit = (event) => {
        event.preventDefault();

        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Leave Settings?",
            text: "Any unsaved changes will be lost!",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Leave",
            confirmButtonColor: "#177604",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                close(false);
            }
        });
    };

    const checkInput = (event) => {
        event.preventDefault();
        document.activeElement.blur();
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "Do you want to update the form item settings?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Save",
            confirmButtonColor: "#177604",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                saveInput(event);
            }
        });
    };

    const saveInput = (event) => {
        event.preventDefault();

        const data = {
            form_id: formId,
            new_order: newOrder,
        };

        axiosInstance
            .post("/trainings/saveFormItemSettings", data, { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    document.activeElement.blur();
                    document.body.removeAttribute("aria-hidden");
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: "Success!",
                        text: "Form item settings updated!",
                        icon: "success",
                        showConfirmButton: true,
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    }).then((res) => {
                        if (res.isConfirmed) {
                            close(true);
                            document.body.setAttribute("aria-hidden", "true");
                        } else {
                            document.body.setAttribute("aria-hidden", "true");
                        }
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                document.body.setAttribute("aria-hidden", "true");
            });
    };

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        backgroundColor: "#f8f9fa",
                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                        borderRadius: "20px",
                        minWidth: { xs: "100%", sm: "700px" },
                        maxWidth: "800px",
                        marginBottom: "5%",
                    },
                }}
            >
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}>
                            Form Item Manager
                        </Typography>
                        <IconButton onClick={(event) => confirmExit(event)}>
                            <i className="si si-close"></i>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mb: 3 }}>
                    <Box component="form" onSubmit={checkInput} noValidate autoComplete="off">
                        <Grid container columnSpacing={2} rowSpacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} display="flex" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                <Box display="flex" sx={{ alignItems: "center" }}>
                                    <Typography>Items</Typography>
                                    <Typography variant="body2" sx={{ ml: 1, color: "text.secondary" }}>
                                        (Drag and Drop to Reorder)
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#f57c00",
                                        color: "white",
                                    }}
                                    onClick={handleResetToDefault}
                                    disabled={initialItems.length === 0}
                                    className="m-1"
                                >
                                    <p className="m-0">
                                        <i className="fa fa-undo mr-2 mt-1"></i> Reset to Default
                                    </p>
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        maxHeight: "450px",
                                        overflowY: "auto",
                                        "&::-webkit-scrollbar": {
                                            width: "8px",
                                        },
                                        "&::-webkit-scrollbar-track": {
                                            background: "#f1f1f1",
                                        },
                                        "&::-webkit-scrollbar-thumb": {
                                            background: "#888",
                                            borderRadius: "4px",
                                        },
                                        "&::-webkit-scrollbar-thumb:hover": {
                                            background: "#555",
                                        },
                                    }}
                                >
                                    <Grid container item xs={12} spacing={1}>
                                        {items && items.length > 0 && items.every((item) => item && item.id) ? (
                                            items.map((item, index) => (
                                                <Grid
                                                    item
                                                    xs={12}
                                                    key={item.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, index)}
                                                    onDragEnter={(e) => handleDragEnter(e, index)}
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={handleDrop}
                                                    onDragEnd={handleDragEnd}
                                                >
                                                    {dropPosition !== null && (dropPosition === index && dragItem.current > index) && (
                                                        <Box
                                                            sx={{
                                                                left: 0,
                                                                width: "100%",
                                                                height: "2px",
                                                                backgroundColor: "#42a5f5",
                                                                boxShadow: "0 0 10px #42a5f5",
                                                                zIndex: 10,
                                                                mb: 1,
                                                            }}
                                                        />
                                                    )}
                                                    {/* Form Item Details */}
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            p: "8px 12px",
                                                            border: "1px solid #e0e0e0",
                                                            borderRadius: "8px",
                                                            backgroundColor: "white",
                                                            "&:hover": { backgroundColor: "#f0f0f0" },
                                                            transition: "background-color 0.2s ease",
                                                        }}
                                                    >
                                                        {/* Primary Content */}
                                                        <Box display="flex" sx={{ justifyContent: "space-between", alignItems: "center", }} >
                                                            {/* Type and Description */}
                                                            <Box display="flex" alignItems="center" sx={{ width: "56%" }}>
                                                                <DragIndicator sx={{ color: "text.secondary", cursor: "grab" }} />
                                                                {/* Item Type */}
                                                                <Box
                                                                    sx={{
                                                                        mr: 1,
                                                                        px: 1,
                                                                        py: 0.5,
                                                                        width: "20%",
                                                                        borderRadius: "4px",
                                                                        backgroundColor:
                                                                            item.type === "Choice"
                                                                                ? "#e3f2fd"
                                                                                : item.type === "MultiSelect"
                                                                                    ? "#fff3e0"
                                                                                    : item.type === "FillInTheBlank"
                                                                                        ? "#e8f5e9"
                                                                                        : "#ffebee",
                                                                        color:
                                                                            item.type === "Choice"
                                                                                ? "#1976d2"
                                                                                : item.type === "MultiSelect"
                                                                                    ? "#f57c00"
                                                                                    : item.type === "FillInTheBlank"
                                                                                        ? "#2e7d32"
                                                                                        : "#d32f2f",
                                                                        fontSize: "0.75rem",
                                                                        fontWeight: "bold",
                                                                        textTransform: "uppercase",
                                                                        textAlign: "center",
                                                                    }}
                                                                >
                                                                    {item.type == "Choice" ? "Choice" :
                                                                        item.type == "MultiSelect" ? "Selection" :
                                                                            item.type == "FillInTheBlank" ? "Fill" :
                                                                                "Unknown"}
                                                                </Box>

                                                                {/* Short Description*/}
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        flex: 1,
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                        whiteSpace: "nowrap",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        lineHeight: 1,
                                                                        "& *": { margin: 0, padding: 0 },
                                                                    }}
                                                                    dangerouslySetInnerHTML={{ __html: item.description }}
                                                                />
                                                            </Box>
                                                            {/* Points */}
                                                            <Box display="flex" sx={{ width: "19%", justifyContent: "flex-end", alignItems: "center" }}>
                                                                {/* Points */}
                                                                <Box
                                                                    sx={{
                                                                        width: "50%",
                                                                        mr: 1,
                                                                        px: 1,
                                                                        py: 0.5,
                                                                        borderRadius: "12px",
                                                                        backgroundColor: "#e8f5e9",
                                                                        color: "#2e7d32",
                                                                        fontSize: "0.875rem",
                                                                        fontWeight: "bold",
                                                                        textAlign: "center"
                                                                    }}
                                                                >
                                                                    {`${item.value} pt${item.value > 1 ? 's' : ''}`}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                    {dropPosition !== null && (dropPosition === index && dragItem.current < index) && (
                                                        <Box
                                                            sx={{
                                                                left: 0,
                                                                width: "100%",
                                                                height: "2px",
                                                                backgroundColor: "#42a5f5",
                                                                boxShadow: "0 0 10px #42a5f5",
                                                                zIndex: 10,
                                                                mb: 1,
                                                            }}
                                                        />
                                                    )}
                                                </Grid>
                                            ))
                                        ) : (
                                            <Typography sx={{ color: "text.secondary" }}>
                                                No form items available
                                            </Typography>
                                        )}
                                    </Grid>
                                </Box>
                            </Grid>
                            {/* Submit Button */}
                            <Grid
                                item
                                xs={12}
                                align="center"
                                sx={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#177604",
                                        color: "white",
                                    }}
                                    className="m-1"
                                >
                                    <p className="m-0">
                                        <i className="fa fa-floppy-o mr-2 mt-1"></i> Save Changes
                                    </p>
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default FormItemSettings;