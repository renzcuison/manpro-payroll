import Layout from "../../../../components/Layout/Layout";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import React, { useState } from "react";
import {
    Box,
    Button,
    Typography,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    TextField,
    Select,
    MenuItem,
} from "@mui/material";

import { Navigate, useNavigate } from "react-router-dom";

const UploadForm = () => {
    return (
        <>
            <input
                accept="pdf/*"
                style={{ display: "none" }}
                id="contained-button-file"
                type="file"
                disabled={true}
            />
            <label htmlFor="contained-button-file">
                <Box
                    sx={{
                        cursor: "pointer",
                        padding: 6,
                        borderRadius: 1,
                        backgroundColor: "#ccc",
                        boxShadow: 1,
                        "&:hover": {
                            backgroundColor: "#a3a3a3",
                        },
                        transition: ".2s",
                    }}
                >
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <FileUploadIcon fontSize="large" />
                    </Box>
                </Box>
            </label>
        </>
    );
};

const PassOrFail = () => {
    return (
        <>
            <Box
                sx={{
                    borderBottom: "solid",
                    borderWidth: 1,
                    borderColor: "#ccc",
                }}
            >
                <FormControl>
                    <RadioGroup>
                        <FormControlLabel
                            value="Pass"
                            control={<Radio />}
                            label="Pass"
                            disabled={true}
                        />
                        <FormControlLabel
                            value="Fail"
                            control={<Radio />}
                            label="Fail"
                            disabled={true}
                        />
                    </RadioGroup>
                </FormControl>
            </Box>
        </>
    );
};

const Remarks = () => {
    return (
        <>
            <TextField
                label="Remarks"
                disabled={true}
                multiline
                rows={4}
            ></TextField>
        </>
    );
};

const TextBox = () => {
    return (
        <>
            <TextField label="Description" disabled={true}></TextField>
        </>
    );
};

const PostiveOrNegative = () => {
    return (
        <>
            <Box
                sx={{
                    borderBottom: "solid",
                    borderWidth: 1,
                    borderColor: "#ccc",
                }}
            >
                <FormControl>
                    <RadioGroup>
                        <FormControlLabel
                            value="Positive"
                            control={<Radio />}
                            label="Positive"
                            disabled={true}
                        />
                        <FormControlLabel
                            value="Negative"
                            control={<Radio />}
                            label="Negative"
                            disabled={true}
                        />
                    </RadioGroup>
                </FormControl>
            </Box>
        </>
    );
};

const PemeQuestionnaireView = () => {
    const navigator = useNavigate();
    const handleOnDeleteClick = () => {};
    const handleOnCancelClick = () => {
        navigator("/admin/medical-records/peme-records/peme-responses");
    };

    return (
        <Layout>
            <Box
                sx={{
                    backgroundColor: "white",
                    paddingY: 6,
                    paddingX: 12,
                    borderRadius: 1,
                    boxShadow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: 2,
                        borderBottom: "1px solid #ccc",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Questionnaire Name
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Employee Name
                        </Typography>
                    </Box>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                        }}
                    ></div>
                </Box>
                <Box
                    sx={{
                        backgroundColor: "#fafafa",
                        paddingX: 8,
                        paddingY: 6,
                        borderRadius: 1,
                        boxShadow: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        Drug Test
                    </Typography>
                    <UploadForm></UploadForm>
                    <PassOrFail></PassOrFail>
                    <Remarks></Remarks>
                    <TextBox></TextBox>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: "#7a7a7a" }}
                        onClick={handleOnCancelClick}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: "#c82e2e" }}
                        onClick={handleOnDeleteClick}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>
        </Layout>
    );
};

export default PemeQuestionnaireView;
