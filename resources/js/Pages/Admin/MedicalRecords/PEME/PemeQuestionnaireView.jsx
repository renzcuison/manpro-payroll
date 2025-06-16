import Layout from "../../../../components/Layout/Layout";
import PemeRecordsFilePreview from "./Modals/PemeRecordsFilePreview";
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
    InputLabel,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useNavigate, useParams } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import dayjs from "dayjs";
import { Bold } from "lucide-react";
import Swal from "sweetalert2";

const UploadForm = ({ fileSizeLimit, file, fileName, onFileClick }) => {
    const limit = fileSizeLimit;

    return (
        <>
            <Typography variant="h7">
                Max File Size: <strong>{limit}MB</strong>
            </Typography>
            <Box
                sx={{
                    border: 1,
                    padding: 2,
                    borderRadius: 1,
                    backgroundColor: "#e6e6e6",
                }}
            >
                {file ? (
                    <Typography
                        color="primary"
                        onClick={() => {
                            if (onFileClick && file?.url) {
                                onFileClick(file.url, file.file_name);
                            }
                        }}
                        sx={{
                            boxShadow: 1,
                            padding: 1,
                            borderRadius: 1,
                            display: "inline-block",
                            backgroundColor: "#fafafa",
                            cursor: "pointer",
                        }}
                    >
                        {fileName}
                    </Typography>
                ) : (
                    <Typography>No file uploaded</Typography>
                )}
            </Box>
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
                        onClick={(e) => e.preventDefault()}
                    />
                    <FormControlLabel
                        value="Fail"
                        control={<Radio />}
                        label="Fail"
                        onClick={(e) => e.preventDefault()}
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
                        onClick={(e) => e.preventDefault()}
                    />
                    <FormControlLabel
                        value="Negative"
                        control={<Radio />}
                        label="Negative"
                        onClick={(e) => e.preventDefault()}
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
                disabled={false}
                multiline
                rows={4}
                value={value || ""}
            ></TextField>
        </>
    );
};

const TextBox = ({ value }) => {
    return <TextField label="Description" value={value || ""} />;
};

const PemeQuestionnaireView = () => {
    const [answers, setAnswers] = useState([]);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const { PemeResponseID } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [employeeResponse, setEmployeeResponse] = useState([]);
    const [expirationDate, setExpirationDate] = useState(dayjs());
    const [nextSchedule, setNextSchedule] = useState(dayjs());
    const [status, setStatus] = useState("");
    const [pemeResponses, setPemeResponses] = useState("");
    const [filePreviewOpen, setFilePreviewOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        axiosInstance
            .get(`/peme-response/${PemeResponseID}/details`, {
                headers,
            })
            .then((response) => {
                setEmployeeResponse(response.data);
                console.log(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching PEME records:", error);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (pemeResponses && pemeResponses[0]) {
            const res = pemeResponses[0];
            if (res.expiry_date) setExpirationDate(dayjs(res.expiry_date));
            if (res.next_schedule) setNextSchedule(dayjs(res.next_schedule));
            if (res.status) setStatus(res.status);
        }
    }, [pemeResponses]);

    const handleOnConfirmClick = () => {
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
            if (res.isConfirmed) {
                try {
                    const payload = {
                        expiry_date: expirationDate,
                        next_schedule: nextSchedule,

                        status: status,
                    };
                    console.log(payload);

                    await axiosInstance.patch(
                        `/peme-responses/${PemeResponseID}/status`,
                        payload,
                        { headers }
                    );

                    console.log("payload", payload);

                    Swal.fire({
                        icon: "success",
                        text: "Changes updated successfully.",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "Failed to save changes. Please try again.",
                        icon: "error",
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    });
                }
            }
        });
    };

    const navigator = useNavigate();
    const handleOnDeleteClick = () => { };
    const handleOnCancelClick = () => {
        navigator(
            `/admin/medical-records/peme-records/peme-responses/${PemeResponseID}`
        );
    };
    const handleFileClick = (fileUrl, fileName = "File Preview") => {
        setSelectedFile({ url: fileUrl, file_name: fileName });
        setFilePreviewOpen(true);
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
                                sx={{ fontWeight: "bold", marginBottom: 3 }}
                            >
                                {form.question_text}
                            </Typography>
                            {/* INPUT TYPES OF THAT QUESTION */}
                            {Array.isArray(form.input_type) &&
                                form.input_type.map((type, i) => {
                                    const value = type.value || "";
                                    let fileUrl, fileName;

                                    {
                                        Array.isArray(form.media) &&
                                            form.media.length > 0 ? (
                                            form.media.map((file, i) => (
                                                <UploadForm
                                                    key={i}
                                                    fileSizeLimit={
                                                        type.file_size_limit
                                                    }
                                                    file={file.url}
                                                    fileName={file.file_name}
                                                    onFileClick={handleFileClick}
                                                />
                                            ))
                                        ) : (
                                            <UploadForm
                                                fileSizeLimit={type.file_size_limit}
                                                onFileClick={handleFileClick}
                                            />
                                        );
                                    }

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
                                                    {Array.isArray(
                                                        form.media
                                                    ) &&
                                                        form.media.length > 0 ? (
                                                        form.media.map(
                                                            (file, j) => (
                                                                <UploadForm
                                                                    key={j}
                                                                    fileSizeLimit={
                                                                        type.file_size_limit
                                                                    }
                                                                    file={
                                                                        file
                                                                    }
                                                                    fileName={
                                                                        file.file_name
                                                                    }
                                                                    onFileClick={handleFileClick}
                                                                />
                                                            )
                                                        )
                                                    ) : (
                                                        <UploadForm
                                                            fileSizeLimit={
                                                                type.file_size_limit
                                                            }
                                                            onFileClick={handleFileClick}
                                                        />
                                                    )}
                                                </Box>
                                            );
                                    }
                                })}
                        </Box>
                    ))}
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        marginTop: 2,
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

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Expiration Date"
                            value={expirationDate}
                            onChange={setExpirationDate}
                        />
                    </LocalizationProvider>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Next Schedule"
                            value={nextSchedule}
                            onChange={setNextSchedule}
                        />
                    </LocalizationProvider>

                    <FormControl sx={{ width: 200 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            label="Status"
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <MenuItem value={"Pending"}>Pending</MenuItem>
                            <MenuItem value={"Clear"}>Clear</MenuItem>
                            <MenuItem value={"Rejected"}>Rejected</MenuItem>
                        </Select>
                    </FormControl>

                    <Button variant="contained" onClick={handleOnConfirmClick}>
                        Confirm
                    </Button>
                </Box>
            </Box>
            <PemeRecordsFilePreview
                open={filePreviewOpen}
                close={() => setFilePreviewOpen(false)}
                file={selectedFile}
            />
        </Layout>
    );
};

export default PemeQuestionnaireView;
