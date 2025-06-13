import Layout from "../../../../components/Layout/Layout";
import { useParams } from "react-router-dom";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import React, { useState, useEffect } from "react";
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

const UploadForm = ({ fileSizeLimit }) => {
    const limit = fileSizeLimit;
    return (
        <>
            <Typography variant="h7">
                Max File Size: <strong>{limit}MB</strong>
            </Typography>
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
                        backgroundColor: "#f0f0f0   ",
                        boxShadow: 1,
                        "&:hover": {
                            backgroundColor: "#dbdbdb  ",
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

const PemeQuestionnairePreview = () => {
    const getJWTHeader = (user) => {
        return {
            Authorization: `Bearer ${user.token}`,
        };
    };
    const storedUser = localStorage.getItem("nasya_user");
    const [pemePreview, setPemePreview] = useState([]);

    const headers = getJWTHeader(JSON.parse(storedUser));
    const { PemeID } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const navigator = useNavigate();
    const handleOnDeleteClick = () => {};
    const handleOnCancelClick = () => {
        navigator(
            `/admin/medical-records/peme-records/peme-responses/${PemeID}`
        );
    };

    useEffect(() => {
        axiosInstance
            .get(`/peme/${PemeID}/questionnaire`, { headers })
            .then((response) => {
                setPemePreview(response.data);
                console.log("PEME Records responses:", response.data);

                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching loan applications:", error);
                Swal.fire({
                    title: "Error",
                    text:
                        "Failed to fetch PEME records. Please try again later.",
                    icon: "error",
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                });
                setIsLoading(false);
            });
    }, []);

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
                    gap: 4,
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
                            {pemePreview.peme}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Employee Name
                        </Typography>
                    </Box>
                </Box>

                {Array.isArray(pemePreview.questions) &&
                    pemePreview.questions.map((form, index) => (
                        <Box
                            key={index}
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
                            <Typography
                                variant="h4"
                                sx={{ fontWeight: "bold", marginBottom: 3 }}
                            >
                                {form.question}
                            </Typography>

                            {Array.isArray(form.input_types) &&
                                form.input_types.map((type, i) => {
                                    switch (type.input_type) {
                                        case "attachment":
                                            return (
                                                <Box
                                                    key={i}
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <UploadForm
                                                        fileSizeLimit={
                                                            type.file_size_limit
                                                        }
                                                    />
                                                </Box>
                                            );
                                        case "remarks":
                                            return <Remarks key={i} />;
                                        case "text":
                                            return <TextBox key={i} />;
                                        case "pass_fail":
                                            return <PassOrFail key={i} />;
                                        case "pos_neg":
                                            return (
                                                <PostiveOrNegative key={i} />
                                            );
                                        default:
                                            return null;
                                    }
                                })}
                        </Box>
                    ))}
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

export default PemeQuestionnairePreview;
