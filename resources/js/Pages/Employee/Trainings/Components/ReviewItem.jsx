import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    TextField,
    Stack,
    Grid,
    Checkbox,
    FormControlLabel,
    Radio
} from "@mui/material";

const ReviewItem = ({ itemData }) => {

    return (
        <Grid
            container
            spacing={2}
            sx={{
                mb: 2,
                p: { xs: 1.5, sm: 2 },
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
        >
            {/* Question Number */}
            <Grid size={{ xs: 4, sm: 'auto' }}>
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
                    }}
                >
                    {itemData.order}
                </Box>
            </Grid>

            {/* Main Content */}
            <Grid size={{ xs: 12, sm: 'grow' }}>
                <Grid container spacing={2}>
                    {/* Description */}
                    <Grid size={{ xs: 12 }}>
                        <Typography
                            variant="body1"
                            component="div"
                            sx={{
                                mb: 2,
                                color: 'text.primary',
                                fontSize: { xs: '0.95rem', sm: '1rem' },
                                lineHeight: 1.5,
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal',
                                '& *': {
                                    whiteSpace: 'normal !important',
                                    wordBreak: 'break-word !important',
                                    overflowWrap: 'break-word !important',
                                },
                            }}
                            id={`description-${itemData.id}`}
                            aria-label={`Question ${itemData.order}: ${itemData.description.replace(/<[^>]+>/g, '')}`}
                            dangerouslySetInnerHTML={{ __html: itemData.description }}
                        />
                        {itemData.type === 'MultiSelect' && (
                            <Typography
                                variant="body2"
                                sx={{
                                    display: 'block',
                                    mt: 1,
                                    fontStyle: 'italic',
                                    color: 'text.secondary',
                                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                }}
                            >
                                {`${itemData.value} option${itemData.value !== 1 ? 's' : ''} available for selection`}
                            </Typography>
                        )}
                    </Grid>

                    {/* User Answers */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {`Your Answer${itemData.type !== "FillInTheBlank" && itemData.answer.length > 1 ? 's' : ''}`}
                        </Typography>
                        {itemData.type === 'FillInTheBlank' ? (
                            <Box
                                sx={{
                                    p: 1,
                                    py: 2,
                                    mb: 1,
                                    width: "100%",
                                    border: "1px solid",
                                    borderColor: itemData.answer === (itemData.choices[0]?.description ?? '') ? "#177604" : "#f44336",
                                    bgcolor: itemData.answer === (itemData.choices[0]?.description ?? '') ? "#e8f5e9" : "#ffebee",
                                    borderRadius: "8px",
                                }}
                            >
                                <Typography sx={{ color: 'text.primary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                    {itemData.answer || 'No answer provided'}
                                </Typography>
                            </Box>
                        ) : ['Choice', 'MultiSelect'].includes(itemData.type) ? (
                            <Grid container spacing={1}>
                                {itemData.choices.map((choice) => (
                                    <Grid size={{ xs: 12 }} key={choice.id}>
                                        <Box
                                            sx={{
                                                p: 1,
                                                py: 2,
                                                borderRadius: '8px',
                                                border: "1px solid",
                                                borderColor: itemData.answer.includes(choice.id)
                                                    ? choice.is_correct
                                                        ? "#177604"
                                                        : "#f44336"
                                                    : "#e0e0e0",
                                                bgcolor: itemData.answer.includes(choice.id)
                                                    ? choice.is_correct
                                                        ? "#e8f5e9"
                                                        : "#ffebee"
                                                    : null,
                                            }}
                                        >
                                            <Typography sx={{ color: 'text.primary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                                {choice.description}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : null}
                    </Grid>

                    {/* Correct Answers */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {itemData.choices.filter(choice => choice.is_correct).length > 1 ? "Correct Answers" : "Correct Answer"}
                        </Typography>
                        {itemData.type === 'FillInTheBlank' ? (
                            <Box
                                sx={{
                                    p: 1,
                                    py: 2,
                                    mb: 1,
                                    width: "100%",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "8px",
                                }}
                            >
                                <Typography sx={{ color: 'text.primary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                    {itemData.choices[0]?.description || 'No correct answer provided'}
                                </Typography>
                            </Box>
                        ) : ['Choice', 'MultiSelect'].includes(itemData.type) ? (
                            <Grid container spacing={1}>
                                {itemData.choices
                                    .filter(choice => choice.is_correct)
                                    .map((choice, index) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                            <Box
                                                sx={{
                                                    py: 1,
                                                    px: 2,
                                                    bgcolor: "#e8f5e9",
                                                    borderRadius: "5px",
                                                }}
                                            >
                                                <Typography sx={{ color: "#2e7d32" }}>
                                                    {choice.description}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                            </Grid>
                        ) : null}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default ReviewItem;
