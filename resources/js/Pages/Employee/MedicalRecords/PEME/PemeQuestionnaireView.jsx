import Layout from "../../../../components/Layout/Layout";
import React, { useState, useEffect, useRef } from "react";
import PemeRecordsFilePreview from "./Modals/PemeRecordsFilePreview";
import CancelIcon from "@mui/icons-material/Cancel";

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
    InputLabel,
    CircularProgress,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useNavigate, useParams } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const UploadForm = ({
    files = [],
    onChange,
    file,
    fileName,
    onFileClick,
    onRemoveFile,
    formID,
}) => {
    const fileInputRef = useRef();

    const handleFileChange = (e) => {
        const filesArray = Array.from(e.target.files);
        if (onChange) onChange(filesArray);
    };

    return (
        <>
            <Box
                sx={{
                    border: 1,
                    padding: 2,
                    borderRadius: 1,
                    backgroundColor: "#e6e6e6",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                {/* Show existing file from props */}
                {file && (
                    <Typography
                        color="primary"
                        onClick={() => {
                            if (onFileClick && file?.url) {
                                onFileClick(file.url, file.file_name);
                            }
                        }}
                        sx={{
                            position: "relative",
                            boxShadow: 1,
                            padding: 1,
                            borderRadius: 1,
                            display: "inline-block",
                            backgroundColor: "#fafafa",
                            cursor: "pointer",
                            mr: 2,
                        }}
                    >
                        <FileUploadIcon
                            sx={{ mr: 1, verticalAlign: "middle" }}
                        />
                        {fileName}
                        <Button
                            sx={{
                                zIndex: 10,
                                margin: 0,
                                padding: 0,
                                color: "#f92a2a",
                                position: "absolute",
                                right: -30,
                                top: -10,
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveFile && onRemoveFile(file); // Pass the file object
                            }}
                        >
                            <CancelIcon />
                        </Button>
                    </Typography>
                )}

                {/* Show newly uploaded files */}
                {Array.isArray(files) && files.length > 0 ? (
                    files.map((file, index) => (
                        <Typography
                            key={index}
                            color="primary"
                            sx={{
                                position: "relative",
                                boxShadow: 1,
                                padding: 1,
                                borderRadius: 1,
                                display: "inline-block",
                                backgroundColor: "#fafafa",
                                cursor: "pointer",
                                mr: 2,
                            }}
                            onClick={() => {
                                if (onFileClick && file?.url) {
                                    onFileClick(file.url, file.file_name);
                                }
                            }}
                        >
                            <FileUploadIcon
                                sx={{ mr: 1, verticalAlign: "middle" }}
                            />
                            {file.name || file.fileName || "Unknown file"}
                            <Button
                                sx={{
                                    zIndex: 10,
                                    margin: 0,
                                    padding: 0,
                                    color: "#c92a2a",
                                    position: "absolute",
                                    right: -30,
                                    top: -10,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFile && onRemoveFile(file); // Pass the file object
                                }}
                            >
                                <CancelIcon />
                            </Button>
                        </Typography>
                    ))
                ) : !file ? (
                    <Typography sx={{ mr: 2 }}>No file uploaded</Typography>
                ) : null}

                {/* Upload button */}
                <input
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                        fileInputRef.current && fileInputRef.current.click()
                    }
                    startIcon={<FileUploadIcon />}
                >
                    Upload
                </Button>
            </Box>
            <Typography variant="h7">
                Max File Size: <strong>5 MB</strong>
            </Typography>
        </>
    );
};

const PassOrFail = ({ value, onChange }) => {
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
                <RadioGroup value={normalizedValue} onChange={onChange}>
                    <FormControlLabel
                        value="Pass"
                        control={<Radio />}
                        label="Pass"
                    />
                    <FormControlLabel
                        value="Fail"
                        control={<Radio />}
                        label="Fail"
                    />
                </RadioGroup>
            </FormControl>
        </Box>
    );
};

const PostiveOrNegative = ({ value, onChange }) => {
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
                <RadioGroup value={normalizedValue} onChange={onChange}>
                    <FormControlLabel
                        value="Positive"
                        control={<Radio />}
                        label="Positive"
                    />
                    <FormControlLabel
                        value="Negative"
                        control={<Radio />}
                        label="Negative"
                    />
                </RadioGroup>
            </FormControl>
        </Box>
    );
};

const Remarks = ({ value, onChange }) => {
    return (
        <>
            <TextField
                onChange={onChange}
                label="Remarks"
                disabled={false}
                multiline
                rows={4}
                value={value}
            ></TextField>
        </>
    );
};

const TextBox = ({ value, onChange }) => {
    return (
        <TextField
            label="Description"
            value={value || ""}
            onChange={onChange}
        />
    );
};

const PemeQuestionnaireView = () => {
    const [answers, setAnswers] = useState({});

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const { PemeResponseID } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [employeeResponse, setEmployeeResponse] = useState([]);
    const [expirationDate, setExpirationDate] = useState(dayjs());
    const [nextSchedule, setNextSchedule] = useState(dayjs());
    const [status, setStatus] = useState("");
    const [isDraftStatus, setIsDraftStatus] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreviewOpen, setFilePreviewOpen] = useState(false);

    useEffect(() => {
        axiosInstance
            .get(`/peme-response/${PemeResponseID}/details`, {
                headers,
            })
            .then((response) => {
                console.log("RESPONSE.DATA", response.data);
                setEmployeeResponse(response.data);
                setIsDraftStatus(response.data.isDraft);
                setStatus(response.data.status);
                const initialAnswers = {};
                if (Array.isArray(response.data.details)) {
                    response.data.details.forEach((form) => {
                        initialAnswers[form.question_id] = {};
                        if (Array.isArray(form.input_type)) {
                            form.input_type.forEach((type) => {
                                initialAnswers[form.question_id][
                                    type.input_type
                                ] = type.value ?? "";
                            });
                        }
                    });
                }
                setAnswers(initialAnswers);

                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching PEME records:", error);
                setIsLoading(false);
            });
    }, []);

    //Set FE dates and status to values from DB
    useEffect(() => {
        if (employeeResponse) {
            setExpirationDate(dayjs(employeeResponse.expiry_date));
            setNextSchedule(dayjs(employeeResponse.next_schedule));
        }
    }, [employeeResponse]);

    const [errorMessage, setErrorMessage] = useState("");

    const handleOnConfirmClick = (draftStatus) => {
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: `You want to save changes?`,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Save",
            confirmButtonColor: "#2b8a3e",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then(async (res) => {
            const responses = [];
            const attachedMedia = [];
            if (Array.isArray(employeeResponse.details)) {
                employeeResponse.details.forEach((form) => {
                    if (Array.isArray(form.input_type)) {
                        form.input_type.forEach((type) => {
                            const value =
                                answers[form.question_id]?.[type.input_type] ??
                                null;

                            let answerValue = value;

                            const responseEntry = {
                                peme_q_item_id: form.question_id,
                                peme_q_type_id: type.id,
                                value: answerValue,
                            };

                            if (
                                Array.isArray(answerValue) &&
                                answerValue[0] instanceof File
                            ) {
                                responseEntry.files = answerValue;
                            }

                            responses.push(responseEntry);

                            // If value is an array of Files
                            if (
                                Array.isArray(value) &&
                                value[0] instanceof File
                            ) {
                                value.forEach((file) => {
                                    attachedMedia.push({
                                        file: file,
                                    });
                                });
                            }
                        });
                    }
                });
            }

            const formData = new FormData();
            formData.append("peme_response_id", PemeResponseID);
            formData.append("isDraft", draftStatus);

            responses.forEach((item, index) => {
                formData.append(
                    `responses[${index}][peme_q_item_id]`,
                    item.peme_q_item_id
                );
                formData.append(
                    `responses[${index}][peme_q_type_id]`,
                    item.peme_q_type_id
                );

                if (
                    Array.isArray(item.files) &&
                    item.files[0] instanceof File
                ) {
                    item.files.forEach((file, fileIndex) => {
                        formData.append(
                            `responses[${index}][files][${fileIndex}]`,
                            file
                        );
                    });
                    formData.append(`responses[${index}][value]`, "");
                } else {
                    formData.append(
                        `responses[${index}][value]`,
                        item.value ?? ""
                    );
                }
            });

            for (const pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            try {
                await axiosInstance.post(`/peme-responses/storeAll`, formData, {
                    headers,
                });
                Swal.fire({
                    icon: "success",
                    text: "Draft saved successfully.",
                    showConfirmButton: false,
                    timer: 1500,
                });
            } catch (error) {
                setIsDraftStatus(1);
                const status = error.response.status;

                console.log("ERROR", error);
                if (status >= 500) {
                    Swal.fire({
                        title: "Server Error",
                        text: `error`,
                        icon: "error",
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    });
                } else if (status === 400) {
                    Swal.fire({
                        title: "Error",
                        text: `Submission Failed`,
                        icon: "error",
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    });
                } else {
                    Swal.fire({
                        title: "Error",
                        text: `Please Fill out all required fields`,
                        icon: "error",
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    });
                }

                console.log(error);
            }
        });
    };

    const handleSaveDraft = async (draftStatus) => {
        const responses = [];

        if (Array.isArray(employeeResponse.details)) {
            employeeResponse.details.forEach((form) => {
                if (Array.isArray(form.input_type)) {
                    form.input_type.forEach((type) => {
                        const value =
                            answers[form.question_id]?.[type.input_type] ??
                            null;

                        // Handle attachments
                        if (type.input_type === "attachment") {
                            // Existing backend files
                            const existingFiles = Array.isArray(form.media)
                                ? form.media
                                : [];
                            // New files (File objects)
                            const newFiles = Array.isArray(value)
                                ? value.filter((f) => f instanceof File)
                                : [];

                            const responseEntry = {
                                peme_q_item_id: form.question_id,
                                peme_q_type_id: type.id,
                                existing_file_ids: existingFiles.map(
                                    (f) => f.id
                                ), // <-- use .id, not .file
                            };

                            if (newFiles.length > 0) {
                                responseEntry.files = newFiles;
                            }

                            responses.push(responseEntry);
                        } else {
                            // Non-attachment types
                            responses.push({
                                peme_q_item_id: form.question_id,
                                peme_q_type_id: type.id,
                                value: value,
                            });
                        }
                    });
                }
            });
        }

        console.log("DRAFT PAYLOAD", responses);
        const formData = new FormData();
        formData.append("peme_response_id", PemeResponseID);
        formData.append("isDraft", draftStatus);

        responses.forEach((item, index) => {
            formData.append(
                `responses[${index}][peme_q_item_id]`,
                item.peme_q_item_id
            );
            formData.append(
                `responses[${index}][peme_q_type_id]`,
                item.peme_q_type_id
            );

            // Always append existing file IDs
            if (item.existing_file_ids) {
                item.existing_file_ids.forEach((id, idIndex) => {
                    formData.append(
                        `responses[${index}][existing_file_ids][${idIndex}]`,
                        id
                    );
                });
            }

            // Append new files
            if (Array.isArray(item.files) && item.files[0] instanceof File) {
                item.files.forEach((file, fileIndex) => {
                    formData.append(
                        `responses[${index}][files][${fileIndex}]`,
                        file
                    );
                });
            }

            // For non-attachments
            if (item.value !== undefined && item.value !== null) {
                formData.append(`responses[${index}][value]`, item.value);
            }
        });

        try {
            await axiosInstance.post(`/peme-responses/storeAll`, formData, {
                headers,
            });

            const response = await axiosInstance.get(
                `/peme-response/${PemeResponseID}/details`,
                { headers }
            );
            setEmployeeResponse(response.data);
            Swal.fire({
                icon: "success",
                text: "Draft saved successfully.",
                showConfirmButton: false,
                timer: 1500,
            });
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Failed to save draft. Please try again.",
                icon: "error",
                confirmButtonText: "Okay",
                confirmButtonColor: "#177604",
            });
            console.log(error);
        }
    };

    const handleFileClick = (fileUrl, fileName = "File Preview") => {
        setSelectedFile({ url: fileUrl, file_name: fileName });
        setFilePreviewOpen(true);
    };

    const navigator = useNavigate();
    const handleOnCancelClick = () => {
        navigator(`/employee/medical-records/peme/peme-responses`);
    };

    const handleInputChange = (questionId, inputType, value) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [inputType]: value,
            },
        }));
    };

    //Remove file in backend
    const handleRemoveFile = (questionId, fileToRemove) => {
        // Remove from answers (new files)
        setAnswers((prev) => {
            let prevFiles = prev[questionId]?.attachment;
            if (!Array.isArray(prevFiles)) prevFiles = [];
            // Only remove if it's a File object (new upload)
            const updatedFiles = prevFiles.filter(
                (file) => file !== fileToRemove
            );
            return {
                ...prev,
                [questionId]: {
                    ...prev[questionId],
                    attachment: updatedFiles,
                },
            };
        });

        // Remove from employeeResponse.details (existing backend files)
        setEmployeeResponse((prev) => ({
            ...prev,
            details: prev.details.map((form) =>
                form.question_id === questionId
                    ? {
                          ...form,
                          media: Array.isArray(form.media)
                              ? form.media.filter(
                                    (file) => file.id !== fileToRemove.id
                                )
                              : [],
                      }
                    : form
            ),
        }));
    };

    return (
        <Layout>
            {isLoading ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "50vh",
                    }}
                >
                    <CircularProgress color="success" />
                </Box>
            ) : (
                <>
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
                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    {employeeResponse.peme_name}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    {employeeResponse.respondent}
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
                                        sx={{
                                            fontWeight: "bold",
                                            marginBottom: 3,
                                        }}
                                    >
                                        {form.question_text}
                                    </Typography>

                                    {Array.isArray(form.input_type) &&
                                        form.input_type.map((type, i) => {
                                            const value =
                                                answers[form.question_id]?.[
                                                    type.input_type
                                                ] || "";

                                            // const attachmentValue =
                                            //     answers[form.question_id]
                                            //         ?.attachment || [];

                                            // // Extract only File objects
                                            // const filesOnly = Array.isArray(
                                            //     attachmentValue
                                            // )
                                            //     ? attachmentValue.filter(
                                            //           (item) =>
                                            //               item instanceof File
                                            //       )
                                            //     : [];

                                            switch (type.input_type) {
                                                case "remarks":
                                                    return (
                                                        <Remarks
                                                            key={i}
                                                            value={value}
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    form.question_id,
                                                                    type.input_type,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    );
                                                case "text":
                                                    return (
                                                        <TextBox
                                                            key={i}
                                                            value={value}
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    form.question_id,

                                                                    type.input_type,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    );
                                                case "pass_fail":
                                                    return (
                                                        <PassOrFail
                                                            key={i}
                                                            value={value}
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    form.question_id,

                                                                    type.input_type,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    );
                                                case "pos_neg":
                                                    return (
                                                        <PostiveOrNegative
                                                            key={i}
                                                            value={value}
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    form.question_id,

                                                                    type.input_type,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    );
                                                case "attachment":
                                                    return (
                                                        <>
                                                            {Array.isArray(
                                                                form.media
                                                            ) &&
                                                            form.media.length >
                                                                0 ? (
                                                                form.media.map(
                                                                    (
                                                                        file,
                                                                        j
                                                                    ) => {
                                                                        return (
                                                                            <UploadForm
                                                                                key={
                                                                                    j
                                                                                }
                                                                                formID={
                                                                                    form.question_id
                                                                                }
                                                                                fileID={
                                                                                    file.id
                                                                                }
                                                                                fileSizeLimit={
                                                                                    type.file_size_limit
                                                                                }
                                                                                file={
                                                                                    file
                                                                                }
                                                                                files={
                                                                                    value
                                                                                }
                                                                                fileName={
                                                                                    file.file_name
                                                                                }
                                                                                onFileClick={
                                                                                    handleFileClick
                                                                                }
                                                                                onRemoveFile={() => {
                                                                                    handleRemoveFile(
                                                                                        form.question_id,
                                                                                        file
                                                                                    );
                                                                                }}
                                                                                onChange={(
                                                                                    newFiles
                                                                                ) => {
                                                                                    handleInputChange(
                                                                                        form.question_id,

                                                                                        "attachment",
                                                                                        [
                                                                                            ...(answers[
                                                                                                form
                                                                                                    .question_id
                                                                                            ]
                                                                                                ?.attachment ||
                                                                                                []),
                                                                                            ...newFiles,
                                                                                        ]
                                                                                    );
                                                                                }}
                                                                            />
                                                                        );
                                                                    }
                                                                )
                                                            ) : (
                                                                <UploadForm
                                                                    key={i}
                                                                    files={
                                                                        value
                                                                    }
                                                                    onChange={(
                                                                        newFiles
                                                                    ) => {
                                                                        handleInputChange(
                                                                            form.question_id,

                                                                            "attachment",
                                                                            [
                                                                                ...(answers[
                                                                                    form
                                                                                        .question_id
                                                                                ]
                                                                                    ?.attachment ||
                                                                                    []),
                                                                                ...newFiles,
                                                                            ]
                                                                        );
                                                                    }}
                                                                />
                                                            )}
                                                        </>
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })}

                                    {form.isRequired === 1 ? (
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                color: "red",
                                            }}
                                        >
                                            REQUIRED
                                        </Typography>
                                    ) : (
                                        ""
                                    )}
                                </Box>
                            ))}
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    alignItems: "center",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#7a7a7a",
                                    }}
                                    onClick={handleOnCancelClick}
                                >
                                    Cancel
                                </Button>

                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        label="Expiration Date"
                                        value={expirationDate}
                                        onChange={setExpirationDate}
                                    />
                                </LocalizationProvider>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        label="Next Schedule"
                                        value={nextSchedule}
                                        onChange={setNextSchedule}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => handleSaveDraft(1)}
                                >
                                    Save Draft
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => handleOnConfirmClick(0)}
                                >
                                    Submit
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                    <PemeRecordsFilePreview
                        open={filePreviewOpen}
                        close={() => setFilePreviewOpen(false)}
                        file={selectedFile}
                    />
                </>
            )}
        </Layout>
    );
};

export default PemeQuestionnaireView;
