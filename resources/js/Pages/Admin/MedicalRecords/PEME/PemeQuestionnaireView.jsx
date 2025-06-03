import Layout from "../../../../components/Layout/Layout";
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

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useNavigate, useParams } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import FileUploadIcon from "@mui/icons-material/FileUpload";

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

const PassOrFail = ({ value }) => {
    const normalizedValue =
        value?.toLowerCase() === "pass"
            ? "Pass"
            : value?.toLowerCase() === "fail"
            ? "Fail"
            : "";

    return (
        <Box
            sx={{ borderBottom: "solid", borderWidth: 1, borderColor: "#ccc" }}
        >
            <FormControl>
                <RadioGroup value={normalizedValue}>
                    <FormControlLabel
                        value="Pass"
                        control={<Radio />}
                        label="Pass"
                        disabled
                    />
                    <FormControlLabel
                        value="Fail"
                        control={<Radio />}
                        label="Fail"
                        disabled
                    />
                </RadioGroup>
            </FormControl>
        </Box>
    );
};

const PostiveOrNegative = ({ value }) => {
    const normalizedValue =
        value?.toLowerCase() === "positive"
            ? "Positive"
            : value?.toLowerCase() === "negative"
            ? "Negative"
            : "";

    return (
        <Box
            sx={{ borderBottom: "solid", borderWidth: 1, borderColor: "#ccc" }}
        >
            <FormControl>
                <RadioGroup value={normalizedValue}>
                    <FormControlLabel
                        value="Positive"
                        control={<Radio />}
                        label="Positive"
                        disabled
                    />
                    <FormControlLabel
                        value="Negative"
                        control={<Radio />}
                        label="Negative"
                        disabled
                    />
                </RadioGroup>
            </FormControl>
        </Box>
    );
};

const Remarks = ({ value }) => {
    return (
        <>
            <TextField
                label="Remarks"
                disabled={true}
                multiline
                rows={4}
                value={value || ""}
            ></TextField>
        </>
    );
};

const TextBox = ({ value }) => {
    return (
        <TextField label="Description" value={value || ""} disabled={true} />
    );
};

const PemeQuestionnaireView = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const { PemeResponseID } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [employeeResponse, setEmployeeResponse] = useState([]);

    useEffect(() => {
        axiosInstance
            .get(`/peme-response/${PemeResponseID}/details`, {
                headers,
            })
            .then((response) => {
                const data = response.data;

                const updatedDetails = data.details.map((detail) => {
                    const valueMap = detail.value || {};

                    const updatedInputTypes = detail.input_type.map((input) => {
                        const encryptedVal = valueMap[input.id];

                        let decrypted = "";
                        if (encryptedVal) {
                            try {
                                const parsed = JSON.parse(encryptedVal);
                                decrypted = parsed.value || "";
                            } catch (e) {
                                decrypted = encryptedVal;
                            }
                        }

                        return {
                            ...input,
                            value: decrypted,
                        };
                    });

                    return {
                        ...detail,
                        input_type: updatedInputTypes,
                    };
                });

                setEmployeeResponse({
                    ...data,
                    details: updatedDetails,
                });

                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching PEME records:", error);
                setIsLoading(false);
            });
    }, []);
    useEffect(() => {
        axiosInstance
            .get(`/peme-response/${PemeResponseID}/details`, {
                headers,
            })
            .then((response) => {
                setEmployeeResponse(response.data);
                console.log("response", response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching PEME records:", error);
                setIsLoading(false);
            });
    }, []);

    const handleOnDeleteClick = () => {};
    const handleOnCancelClick = () => {
        navigator();
        // `/admin/medical-records/peme-records/peme-responses/${PemeID}`
    };
    const findResponseValue = (questionId, inputTypeName) => {
        if (!Array.isArray(employeeResponse)) return "";
        const matched = employeeResponse.find(
            (res) =>
                res.question.id === questionId &&
                res.input_type.input_type === inputTypeName
        );
        return matched?.value || "";
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
                    gap: 4,
                }}
            >
                {/* QUESTIONNAIRE */}
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
                            {employeeResponse.peme_name}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Employee Name
                        </Typography>
                    </Box>
                </Box>
                {/* QUESTION */}
                {Array.isArray(employeeResponse.details) &&
                    employeeResponse.details.map((form, index) => (
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
                            {/* QUESTION NAME */}
                            <Typography
                                variant="h4"
                                sx={{ fontWeight: "bold", marginBottom: 3 }}
                            >
                                {form.question_text}
                            </Typography>
                            {/* INPUT TYPES OF THAT QUESTION */}
                            {Array.isArray(form.input_type) &&
                                form.input_type.map((type, i) => {
                                    const value = type.value || "";

                                    switch (type.input_type) {
                                        case "remarks":
                                            return (
                                                <Remarks
                                                    key={i}
                                                    value={value}
                                                />
                                            );
                                        case "text":
                                            return (
                                                <TextBox
                                                    key={i}
                                                    value={value}
                                                />
                                            );
                                        case "pass_fail":
                                            return (
                                                <PassOrFail
                                                    key={i}
                                                    value={value}
                                                />
                                            );
                                        case "pos_neg":
                                            return (
                                                <PostiveOrNegative
                                                    key={i}
                                                    value={value}
                                                />
                                            );
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

export default PemeQuestionnaireView;
