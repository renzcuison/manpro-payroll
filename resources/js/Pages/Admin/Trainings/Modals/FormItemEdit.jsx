import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    TextField,
    Typography,
    InputAdornment,
    CircularProgress,
    FormGroup,
    FormControl,
    InputLabel,
    FormControlLabel,
    FormHelperText,
    Switch,
    Select,
    MenuItem,
    Stack,
    Radio,
    Checkbox
} from "@mui/material";
import { Cancel, FolderOff, InfoOutlined, VideocamOff } from "@mui/icons-material";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { Form, useLocation, useNavigate } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Swal from "sweetalert2";
import moment from "moment";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import PDFImage from "../../../../../../public/media/assets/PDF_file_icon.png";
import DocImage from "../../../../../../public/media/assets/Docx_file_icon.png";
import PPTImage from "../../../../../../public/media/assets/PowerPoint_file_icon.png";

const FormItemEdit = ({ open, close, itemInfo }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    // Universal Fields
    const [itemType, setItemType] = useState(itemInfo.type);
    const [points, setPoints] = useState(itemInfo.value);
    const [description, setDescription] = useState(itemInfo.description);

    const [choices, setChoices] = useState([]);
    const [correctIndices, setCorrectIndices] = useState([]);

    const [itemTypeError, setItemTypeError] = useState(false);
    const [pointsError, setPointsError] = useState(false);
    const [correctionError, setCorrectionError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    const [emptyChoices, setEmptyChoices] = useState([]);

    useEffect(() => {
        if (open && itemInfo) {
            const transformedChoices = (itemInfo.choices ?? []).map((choice) => ({
                text: choice.description,
                id: choice.id,
            }));
            setChoices(transformedChoices);

            const indices = (itemInfo.choices ?? []).reduce((acc, choice, index) => {
                if (choice.is_correct) {
                    acc.push(index);
                }
                return acc;
            }, []);
            setCorrectIndices(indices);
        }
    }, [open, itemInfo]);

    const handleAddChoice = () => {
        setChoices(prev => [...prev, { text: "", id: null }]);
    };

    const handleDeleteChoice = (index) => {
        setCorrectIndices(prev => prev.filter(i => i !== index).map(i => (i > index ? i - 1 : i)));
        setEmptyChoices(prev => prev.filter(i => i !== index).map(i => (i > index ? i - 1 : i)));
        setChoices(prev => prev.filter((_, i) => i !== index));
    };

    const checkInput = (event) => {
        event.preventDefault();

        setItemTypeError(!itemType);
        setDescriptionError(!description);

        const noPoints = points === '';
        setPointsError(noPoints);

        const noChoices = itemType != "FillInTheBlank" && choices.length == 0;
        const noCorrects = itemType != "FillInTheBlank" && correctIndices.length == 0;
        setCorrectionError(noCorrects);

        const emptyChoiceIndices = choices
            .map((choice, index) => (choice.text.trim() === "" ? index : -1))
            .filter((index) => index !== -1);
        setEmptyChoices(emptyChoiceIndices);

        if (!itemType || !description || noPoints) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "All Required Fields must be filled!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else if (noChoices) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "Choice item has no options!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else if (emptyChoiceIndices.length > 0) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "There are empty choices!",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else if (noCorrects) {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "No correct choices provided.",
                icon: "error",
                showConfirmButton: true,
                confirmButtonColor: "#177604",
            });
        } else {
            document.activeElement.blur();
            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "Do you want to save this content?",
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
        }

    }

    const saveInput = (event) => {
        event.preventDefault();

        const choiceType = ["Choice", "MultiSelect"].includes(itemType);

        const formData = new FormData();
        formData.append("item_id", itemInfo.id);
        formData.append("item_type", itemType)
        formData.append("description", description);
        formData.append("points", itemType == "MultiSelect" ? correctIndices.length : points);
        if (choiceType && choices.length > 0) {
            choices.forEach((choice, index) => {
                formData.append(`choices[${index}][text]`, choice.text);
                formData.append(`choices[${index}][id]`, choice.id);
            });
        } else {
            formData.append('choices[]', null);
        }
        if (choiceType && correctIndices.length > 0) {
            correctIndices.forEach(correct => {
                formData.append('correctItems[]', correct);
            });
        } else {
            formData.append('correctItems[]', null);
        }

        axiosInstance.post("/trainings/editFormItem", formData, { headers })
            .then((response) => {
                if (response.data.status == 200) {
                    document.activeElement.blur();
                    document.body.removeAttribute("aria-hidden");
                    Swal.fire({
                        customClass: { container: "my-swal" },
                        title: "Success!",
                        text: `Form item saved!`,
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
            <Dialog open={open} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#f8f9fa', boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: { xs: "100%", sm: "700px" }, maxWidth: '800px', marginBottom: '5%' } }}>
                <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }} >
                        <Typography variant="h4" sx={{ ml: 1, mt: 2, fontWeight: "bold" }}> Edit Form Item </Typography>
                        <IconButton onClick={() => close(false)}> <i className="si si-close"></i> </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ padding: 5, mb: 3 }}>
                    <Box component="form" onSubmit={checkInput} noValidate autoComplete="off" >
                        <Grid container columnSpacing={2} rowSpacing={2} sx={{ mt: 1 }}>
                            {/* Item Type */}
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="item-type-select-label"> Type </InputLabel>
                                    <Select
                                        labelId="item-type-select-label"
                                        id="item-type-select"
                                        value={itemType}
                                        label="Type"
                                        onChange={(event) => setItemType(event.target.value)}
                                    >
                                        <MenuItem value="Choice"> Multiple Choice </MenuItem>
                                        <MenuItem value="MultiSelect"> Selection </MenuItem>
                                        <MenuItem value="FillInTheBlank"> Fill In The Blank </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* Item Value */}
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Value"
                                        variant="outlined"
                                        type="number"
                                        value={itemType == "MultiSelect" ? correctIndices.length : points}
                                        error={pointsError}
                                        InputProps={{
                                            readOnly: itemType == "MultiSelect",
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        pts
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            inputProps: {
                                                min: 0,
                                                step: 1,
                                            },
                                        }}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            if (value === "" || (Number(value) >= 0 && Number.isInteger(Number(value)))) {
                                                setPoints(value === "" ? "" : Number(value));
                                            }
                                        }}
                                    />
                                    {itemType == "MultiSelect" && (
                                        <FormHelperText>
                                            Value automatically adjusted to number of correct answers.
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            {/* Description Field */}
                            <Grid item xs={12}>
                                <FormControl error={descriptionError} fullWidth>
                                    <div style={{ border: descriptionError ? '1px solid red' : '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                        <ReactQuill
                                            id='description'
                                            name='description'
                                            value={description}
                                            onChange={(value) => {
                                                if (value.length <= 256) {
                                                    setDescription(value);
                                                }
                                            }}
                                            placeholder="Enter item text here *"
                                            modules={{
                                                toolbar: [
                                                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
                                                    ['link'],
                                                    ['clean']
                                                ],
                                            }}
                                            formats={[
                                                'header', 'font', 'size',
                                                'bold', 'italic', 'underline', 'strike', 'blockquote',
                                                'list', 'bullet', 'indent',
                                                'align',
                                                'link', 'image', 'video'
                                            ]}
                                            theme="snow"
                                            style={{ marginBottom: '3rem', height: '150px', width: '100%' }}
                                        ></ReactQuill>
                                        <FormHelperText>
                                            {description.length}/{256}
                                        </FormHelperText>
                                    </div>
                                </FormControl>

                            </Grid>
                            {/* Item Choices */}
                            {itemType !== "FillInTheBlank" && (
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <Box sx={{ width: "100%" }}>
                                            <Stack direction="row" spacing={1}
                                                sx={{
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    width: "100%",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, width: "30%" }}>
                                                    <Typography noWrap>
                                                        Choices
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        sx={{ backgroundColor: "#42a5f5", color: "white", marginLeft: "auto" }}
                                                        onClick={handleAddChoice}
                                                    >
                                                        <p className="m-0">
                                                            <i className="fa fa-plus"></i> Add Choice
                                                        </p>
                                                    </Button>
                                                </Box>
                                                <Stack direction="row" spacing={1}
                                                    sx={{
                                                        justifyContent: "flex-end",
                                                        alignItems: "center",
                                                        width: "70%",
                                                        mt: 1
                                                    }}
                                                >
                                                    {choices.length > 0 && (
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                Correct Answer
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                Remove
                                                            </Typography>
                                                        </Stack>
                                                    )}
                                                </Stack>
                                            </Stack>
                                            {/* Added Choices */}
                                            {choices.length > 0 && (
                                                <Stack direction="column" spacing={1} sx={{ mt: 1, width: "100%" }}>
                                                    {choices.map((choice, index) => (
                                                        <Box
                                                            key={index}
                                                            spacing={2}
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                border: correctionError || choice.deleted ? "1px solid #f44336" : "1px solid #e0e0e0",
                                                                borderRadius: "4px",
                                                                padding: "4px 8px",
                                                            }}
                                                        >
                                                            <TextField
                                                                fullWidth
                                                                variant="outlined"
                                                                size="small"
                                                                value={choice.text}
                                                                error={emptyChoices.includes(index)}
                                                                onChange={(e) => {
                                                                    const newText = e.target.value;
                                                                    setChoices(prev =>
                                                                        prev.map((c, i) =>
                                                                            i === index ? { ...c, text: newText } : c
                                                                        )
                                                                    );
                                                                }}
                                                                placeholder={`Option ${index + 1}`}
                                                                sx={{ mr: 2 }}
                                                            />
                                                            <Stack direction="row" spacing={3}>
                                                                <Checkbox
                                                                    checked={correctIndices.includes(index)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setCorrectIndices(prev => [...prev, index]);
                                                                        } else {
                                                                            setCorrectIndices(prev => prev.filter(i => i !== index));
                                                                        }
                                                                    }}
                                                                    inputProps={{ "aria-label": `Set as correct choice` }}
                                                                />
                                                                <IconButton onClick={() => handleDeleteChoice(index)} size="small">
                                                                    <Cancel />
                                                                </IconButton>
                                                            </Stack>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            )}
                                        </Box>
                                    </FormControl>
                                </Grid>
                            )}
                            {/* Submit Button */}
                            <Grid
                                item
                                xs={12}
                                align="center"
                                sx={{
                                    justifyContent: "center", alignItems: "center",
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
                                    <p className="m-0"> <i className="fa fa-floppy-o mr-2 mt-1"></i> Save Content </p>
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    );
};

export default FormItemEdit;
