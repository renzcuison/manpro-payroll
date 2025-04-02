import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    TextField,
    Stack,
    Grid,
    Chip,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    breadcrumbsClasses,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Pagination,
    IconButton,
    Divider,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Tooltip,
    CardActionArea,
    Checkbox,
    FormControlLabel,
    Radio
} from "@mui/material";
import { TaskAlt, MoreVert, Download, WarningAmber, OndemandVideo, Image, Description, Quiz, SwapHoriz, CheckCircle, Visibility, Pending, CheckBox } from "@mui/icons-material";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from "sweetalert2";

const FormItem = ({ itemData, handleAnswer }) => {
    // Answer Data
    const [fillAnswer, setFillAnswer] = useState('');
    const [selectedChoices, setSelectedChoices] = useState([]);

    const handleSelectionChange = (choiceId) => {
        let updatedChoices;
        let validChoice = true;
        if (itemData.type === 'Choice') {
            updatedChoices = [choiceId];
        } else if (itemData.type === 'MultiSelect') {
            if (selectedChoices.includes(choiceId)) {
                updatedChoices = selectedChoices.filter((id) => id !== choiceId);
            } else if (selectedChoices.length < itemData.value) {
                updatedChoices = [...selectedChoices, choiceId];
            } else {
                updatedChoices = selectedChoices;
                validChoice = false;

            }
        } else {
            return;
        }
        if (validChoice) {
            setSelectedChoices(updatedChoices);
            handleAnswer(itemData.id, updatedChoices);
        }
    };

    return (
        <Grid item xs={12}>
            <Box
                display="flex"
                sx={{
                    mb: 2,
                    p: { xs: 1.5, sm: 2 },
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    justifyContent: 'flex-start',
                    alignItems: 'start',
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
            >
                {/* Question No. */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        backgroundColor: '#f5f5f5',
                        borderRadius: '5px',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        fontWeight: 'bold',
                        mr: 2,
                    }}
                >
                    {itemData.order}
                </Box>

                {/* Main Content */}
                <Box
                    sx={{
                        mt: 0.5,
                        width: "100%",
                        overflow: 'hidden',
                    }}
                >
                    {/* Description */}
                    <Typography
                        variant="body1"
                        component="div"
                        sx={{
                            mb: 3,
                            color: 'text.primary',
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                        }}
                        id={`description-${itemData.id}`}
                        aria-label={`Question ${itemData.order}: ${itemData.description.replace(/<[^>]+>/g, '')}`}
                    >
                        <div
                            style={{
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal',
                                '& *': {
                                    whiteSpace: 'normal !important',
                                    wordBreak: 'break-word !important',
                                    overflowWrap: 'break-word !important',
                                },
                            }}
                            dangerouslySetInnerHTML={{ __html: itemData.description }}
                        />
                        {itemData.type === 'MultiSelect' && (
                            <Typography
                                variant="body2"
                                component="span"
                                sx={{
                                    display: 'block',
                                    mt: 1,
                                    fontStyle: 'italic',
                                    color: 'text.secondary',
                                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                }}
                            >
                                Select up to {itemData.value} option{itemData.value !== 1 ? 's' : ''}.
                            </Typography>
                        )}
                    </Typography>

                    {/* Answer Field */}
                    {itemData.type == "FillInTheBlank" ? (
                        <TextField
                            fullWidth
                            required
                            id={`item-${itemData.id}-answer-field`}
                            placeholder="Enter Your Answer"
                            variant="outlined"
                            onChange={(e) => setFillAnswer(e.target.value)}
                            onBlur={() => handleAnswer(itemData.id, fillAnswer)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.target.blur();
                                }
                            }}
                        />
                    ) : ['Choice', 'MultiSelect'].includes(itemData.type) ? (
                        itemData.choices.map((choice) => (
                            <Box
                                key={choice.id}
                                display="flex"
                                alignItems="center"
                                onClick={() => handleSelectionChange(choice.id)}
                                sx={{
                                    p: 1,
                                    mb: 1,
                                    borderRadius: '8px',
                                    backgroundColor: '#f9f9f9',
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: '#f1f1f1',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    },
                                }}
                                role="option"
                                aria-selected={selectedChoices.includes(choice.id)}
                            >
                                <FormControlLabel
                                    control={
                                        itemData.type === 'Choice' ? (
                                            <Radio
                                                checked={selectedChoices.includes(choice.id)}
                                                onChange={() => { }}
                                                value={choice.id}
                                                name={`item-${itemData.id}-choice`}
                                                sx={{
                                                    color: 'text.secondary',
                                                    '&.Mui-checked': {
                                                        color: 'primary.main',
                                                    },
                                                }}
                                            />
                                        ) : (
                                            <Checkbox
                                                checked={selectedChoices.includes(choice.id)}
                                                onChange={() => { }}
                                                value={choice.id}
                                                sx={{
                                                    color: 'text.secondary',
                                                    '&.Mui-checked': {
                                                        color: 'primary.main',
                                                    },
                                                }}
                                            />
                                        )
                                    }
                                    label={
                                        <Typography sx={{ color: 'text.primary', fontSize: { xs: '0.9rem', sm: '1rem' }, }} >
                                            {choice.description}
                                        </Typography>
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </Box>
                        ))
                    ) : null}
                </Box>
            </Box>
        </Grid>
    );
};

export default FormItem;
