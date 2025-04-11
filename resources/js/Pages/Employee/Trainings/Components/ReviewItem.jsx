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
                display="flex"
                sx={{
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
                        mb: 2,
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
                            {`${itemData.value} option${itemData.value !== 1 ? 's' : ''} available for selection`}
                        </Typography>
                    )}
                </Typography>

                <Typography variant="body2">
                    {`Your Answer${itemData.type != "FillInTheBlank" && itemData.answer.length > 1 ? 's' : ''}`}
                </Typography>

                {/* Answers */}
                {itemData.type == "FillInTheBlank" ? (
                    <>
                        <Box
                            sx={{
                                p: 1,
                                py: 2,
                                mb: 1,
                                width: "100%",
                                border: "solid 1px #e0e0e0",
                                borderRadius: "8px",
                                ...(itemData.answer == (itemData.choices[0]?.description ?? '') ? {
                                    borderColor: "#177604",
                                    bgcolor: "#e8f5e9"
                                } : {
                                    borderColor: "#f44336",
                                    bgcolor: "#ffebee"
                                })
                            }}>
                            <Typography sx={{ color: 'text.primary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                {itemData.answer}
                            </Typography>
                        </Box>
                    </>
                ) : ['Choice', 'MultiSelect'].includes(itemData.type) ? (
                    itemData.choices.map((choice) => (
                        <Box
                            key={choice.id}
                            display="flex"
                            alignItems="center"
                            sx={{
                                p: 1,
                                py: 2,
                                mb: 1,
                                borderRadius: '8px',
                                border: "solid 1px",
                                borderColor: itemData.answer.includes(choice.id) ? choice.is_correct
                                    ? "#177604"
                                    : "#f44336"
                                    : "#e0e0e0",
                                bgcolor: itemData.answer.includes(choice.id) ? choice.is_correct
                                    ? "#e8f5e9"
                                    : "#ffebee"
                                    : null
                            }}
                        >
                            <Typography sx={{ color: 'text.primary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                {choice.description}
                            </Typography>
                        </Box>
                    ))
                ) : null}

                {/* Correct Answer */}
                <Typography variant="body2" sx={{ mt: 2 }}>
                    {itemData.choices.filter(choice => choice.is_correct).length > 1 ? "Correct Answers" : "Correct Answer"}
                </Typography>
                {itemData.type == "FillInTheBlank" && (
                    <Box
                        sx={{
                            p: 1,
                            py: 2,
                            mb: 1,
                            width: "100%",
                            border: "solid 1px #e0e0e0",
                            borderRadius: "8px"
                        }}>
                        <Typography sx={{ color: 'text.primary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                            {itemData.choices[0]?.description || ''}
                        </Typography>
                    </Box>
                )}
                {['Choice', 'MultiSelect'].includes(itemData.type) && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                        {itemData.choices.filter(choice => choice.is_correct).map((choice, index) => (
                            <Box
                                key={index}
                                sx={{
                                    py: 1,
                                    px: 2,
                                    bgcolor: "#e8f5e9",
                                    borderRadius: "5px"
                                }}
                            >
                                <Typography sx={{ color: "#2e7d32" }}>
                                    {choice.description}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

        </Box>
    );
};

export default ReviewItem;
