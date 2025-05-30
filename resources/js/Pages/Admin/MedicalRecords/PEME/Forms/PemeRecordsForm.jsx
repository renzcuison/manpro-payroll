import {
    Typography,
    Box,
    Button,
    FormControl,
    FormGroup,
    TextField,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import Swal from "sweetalert2";

import Layout from "../../../../../components/Layout/Layout";
import { useState, useEffect } from "react";
import axiosInstance, { getJWTHeader } from "../../../../../utils/axiosConfig";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const SelectForm = ({
    formName,
    setFormName,
    formType,
    setFormType,
    fileSize,
    setFileSize,
    readOnly,
}) => {
    return (
        <FormGroup inputprops={{ readOnly: readOnly }}>
            <FormControl>
                <TextField
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    label="Question Name"
                />
            </FormControl>
            <FormControl>
                <Box sx={{ display: "flex", marginTop: 2 }}>
                    <FormControlLabel
                        value="attachment"
                        control={
                            <Checkbox
                                checked={
                                    Array.isArray(formType) &&
                                    formType.includes("attachment")
                                }
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormType((prev) => [
                                            ...prev,
                                            "attachment",
                                        ]);
                                    } else {
                                        setFormType((prev) =>
                                            prev.filter(
                                                (type) => type !== "attachment"
                                            )
                                        );
                                    }
                                }}
                            />
                        }
                        label="Attachment"
                    />
                    <FormControlLabel
                        value="pass_fail"
                        control={
                            <Checkbox
                                checked={
                                    Array.isArray(formType) &&
                                    formType.includes("pass_fail")
                                }
                                disabled={
                                    Array.isArray(formType) &&
                                    formType.includes("pos_neg")
                                }
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormType((prev) => [
                                            ...prev,
                                            "pass_fail",
                                        ]);
                                    } else {
                                        setFormType((prev) =>
                                            prev.filter(
                                                (type) => type !== "pass_fail"
                                            )
                                        );
                                    }
                                }}
                            />
                        }
                        label="Pass/Fail"
                    />
                    <FormControlLabel
                        value="pos_neg"
                        control={
                            <Checkbox
                                checked={
                                    Array.isArray(formType) &&
                                    formType.includes("pos_neg")
                                }
                                disabled={
                                    Array.isArray(formType) &&
                                    formType.includes("pass_fail")
                                }
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormType((prev) => [
                                            ...prev,
                                            "pos_neg",
                                        ]);
                                    } else {
                                        setFormType((prev) =>
                                            prev.filter(
                                                (type) => type !== "pos_neg"
                                            )
                                        );
                                    }
                                }}
                            />
                        }
                        label="Positive/Negative"
                    />
                    <FormControlLabel
                        value="remarks"
                        control={
                            <Checkbox
                                checked={
                                    Array.isArray(formType) &&
                                    formType.includes("remarks")
                                }
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormType((prev) => [
                                            ...prev,
                                            "remarks",
                                        ]);
                                    } else {
                                        setFormType((prev) =>
                                            prev.filter(
                                                (type) => type !== "remarks"
                                            )
                                        );
                                    }
                                }}
                            />
                        }
                        label="Remarks"
                    />{" "}
                    <FormControlLabel
                        value="text"
                        control={
                            <Checkbox
                                checked={
                                    Array.isArray(formType) &&
                                    formType.includes("text")
                                }
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormType((prev) => [
                                            ...prev,
                                            "text",
                                        ]);
                                    } else {
                                        setFormType((prev) =>
                                            prev.filter(
                                                (type) => type !== "text"
                                            )
                                        );
                                    }
                                }}
                            />
                        }
                        label="Text Box"
                    />
                </Box>
            </FormControl>
            {Array.isArray(formType) && formType.includes("attachment") && (
                <Box
                    sx={{
                        marginTop: 2,
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <FormControl>
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                            }}
                        >
                            <TextField
                                value={fileSize}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    if (value === "") {
                                        setFileSize("");
                                        return;
                                    }
                                    value = Number(value);
                                    if (isNaN(value)) return;
                                    if (value < 0) value = 0;
                                    if (value > 500) value = 500;
                                    setFileSize(value);
                                }}
                                type="number"
                                label="File Size"
                                inputprops={{
                                    min: 0,
                                    max: 500,
                                }}
                            ></TextField>
                            <Typography
                                sx={{
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                }}
                            >
                                MB
                            </Typography>
                            <Typography sx={{ color: "#ccc" }}>
                                Max 500MB
                            </Typography>
                        </Box>
                    </FormControl>
                </Box>
            )}
        </FormGroup>
    );
};

const PemeRecordsForm = () => {
    const getJWTHeader = (user) => {
        return {
            Authorization: `Bearer ${user.token}`,
        };
    };
    const navigator = useNavigate();

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const { PemeID } = useParams();
    const [questionnaireForms, setQuestionnaireForms] = useState([]);
    const [formName, setFormName] = useState("");
    const [formType, setFormType] = useState([]);
    const [fileSize, setFileSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [pemeForms, setPemeForms] = useState({ questions: [] });
    const [initialForms, setInitialForms] = useState([]);

    useEffect(() => {
        axiosInstance
            .get(`/peme/${PemeID}/questionnaire`, { headers })
            .then((response) => {
                setPemeForms(response.data);
                console.log("PEME Records FORM:", response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching loan applications:", error);
                Swal.fire({
                    title: "Error",
                    text: "Failed to fetch forms. Please try again later.",
                    icon: "error",
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#177604",
                });
                setIsLoading(false);
            });
    }, []);

    const handleSaveForm = async (formToSave) => {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));

        try {
            const payload = {
                peme_id: PemeID,
                question: formToSave.question,
                input_types: formToSave.input_types,
                file_size_limit: formToSave.file_size_limit,
            };

            console.log("Payload to send:", payload);

            Swal.fire({
                customClass: { container: "my-swal" },
                title: "Are you sure?",
                text: "You want to add this question?",
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "Save",
                confirmButtonColor: "green",
                showCancelButton: true,
                cancelButtonText: "Cancel",
            }).then(async (res) => {
                if (res.isConfirmed) {
                    const response = await axiosInstance.post(
                        "/peme/questionnaire",
                        payload,
                        { headers }
                    );

                    // Update frontend state
                    setQuestionnaireForms((prev) => [...prev, response.data]);
                    setInitialForms((prev) =>
                        prev.filter((form) => form.tempId !== formToSave.tempId)
                    );

                    // Fetch updated forms
                    try {
                        const refreshed = await axiosInstance.get(
                            `/peme/${PemeID}/questionnaire`,
                            { headers }
                        );
                        setPemeForms(refreshed.data);
                    } catch (err) {
                        console.error("Error fetching forms:", err);
                        Swal.fire({
                            title: "Error",
                            text:
                                "Failed to fetch forms. Please try again later.",
                            icon: "error",
                            confirmButtonText: "Okay",
                            confirmButtonColor: "#177604",
                        });
                    } finally {
                        setIsLoading(false);
                    }

                    // ✅ Now reset fields here
                    setFormName("");
                    setFormType([]);
                    setFileSize(10); // reset to default value
                }
            });

            // Refresh backend
        } catch (error) {
            console.error("Error posting form:", error);
        }
    };

    const handleAddForm = () => {
        if (formName === "" || formType.length === 0) {
            Swal.fire({
                customClass: { container: "my-swal" },
                text: "Please Fill in All Missing Fields.",
                icon: "error",
                showConfirmButton: true,
                confirmButtonText: "OK",
            });
            return;
        }

        const newForm = {
            tempId: Date.now(), // unique temporary ID
            question: formName,
            input_types: formType,
            file_size_limit:
                fileSize === "" || Number(fileSize) === 0
                    ? 10
                    : Number(fileSize),
        };

        setInitialForms((prev) => [...prev, newForm]);
        setFormName("");
        setFormType([]);
        setFileSize("");
    };

    const handleDeleteForm = (index, isInitial = false) => {
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to delete this form?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33", // red color
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then(async (res) => {
            if (res.isConfirmed) {
                if (isInitial) {
                    console.log("intialForms", index);
                    setInitialForms((prev) =>
                        prev.filter((_, i) => i !== index)
                    );
                } else {
                    const storedUser = localStorage.getItem("nasya_user");
                    const headers = getJWTHeader(JSON.parse(storedUser));

                    // Get the ID of the question
                    const questionId = pemeForms.questions[index].id;

                    if (!questionId) {
                        console.error("No question ID found at index", index);
                        return;
                    }

                    try {
                        await axiosInstance.delete(
                            `/questionnaire/${questionId}`,
                            { headers }
                        );

                        // Remove from local state after successful deletion
                        setPemeForms((prev) => ({
                            ...prev,
                            questions: prev.questions.filter(
                                (_, i) => i !== index
                            ),
                        }));

                        Swal.fire({
                            icon: "success",
                            text: "Form deleted successfully.",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    } catch (error) {
                        console.error("Error deleting form:", error);
                        Swal.fire({
                            title: "Error",
                            text: "Failed to delete form. Please try again.",
                            icon: "error",
                            confirmButtonText: "Okay",
                            confirmButtonColor: "#177604",
                        });
                    }
                }
            }
        });
    };

    const handleConfirmQuestionnaire = () => {
        navigator(
            `/admin/medical-records/peme-records/peme-responses/${PemeID}`
        );
    };
    return (
        <Layout>
            <Box>
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: 2,
                    }}
                >
                    {/* HEADER */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {pemeForms.peme}
                        </Typography>
                        <Button
                            onClick={handleConfirmQuestionnaire}
                            variant="contained"
                        >
                            Confirm Questionnaire
                        </Button>
                    </Box>

                    {/* FORM */}
                    <Box
                        sx={{
                            maxHeight: 700,
                            overflowY: "scroll",
                            marginTop: 6,
                            padding: 2,
                            backgroundColor: "white",
                            borderRadius: 2,
                            boxShadow: 1,
                        }}
                    >
                        <Box
                            sx={{
                                padding: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <Box sx={{ boxShadow: 1, padding: 4 }}>
                                <SelectForm
                                    formName={formName}
                                    setFormName={setFormName}
                                    formType={formType}
                                    setFormType={setFormType}
                                    fileSize={fileSize}
                                    setFileSize={setFileSize}
                                    readOnly={false}
                                />
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "end",
                                    }}
                                >
                                    <Button
                                        onClick={handleAddForm}
                                        variant="contained"
                                        sx={{
                                            display: "flex",
                                            gap: 1,
                                            alignSelf: "end",
                                        }}
                                    >
                                        New form{" "}
                                        <i className="fa fa-plus pr-2"></i>
                                    </Button>
                                </Box>
                            </Box>
                            {/* INITIAL FORM */}
                            {initialForms.map((form, index) => (
                                <Box
                                    key={form.tempId}
                                    sx={{
                                        backgroundColor: "#fafafa",
                                        padding: 4,
                                        boxShadow: 1,
                                    }}
                                >
                                    <SelectForm
                                        formName={form.question}
                                        setFormName={setFormName}
                                        formType={form.input_types.map((item) =>
                                            typeof item === "string"
                                                ? item
                                                : item.input_type
                                        )}
                                        fileSize={
                                            form.input_types.find(
                                                (item) =>
                                                    (item.input_type ??
                                                        item) === "attachment"
                                            )?.file_size_limit ?? 10
                                        }
                                        setFileSize={setFileSize}
                                        readOnly={true}
                                    />
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "end",
                                            gap: 2,
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            onClick={() => handleSaveForm(form)}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                handleDeleteForm(index, true)
                                            }
                                            sx={{
                                                transition: ".3s",
                                                fontSize: "26px",
                                                color: "#7a7a7a",
                                                borderRadius: "100%",
                                                backgroundColor: "transparent",
                                                "&:hover": {
                                                    backgroundColor:
                                                        "transparent",
                                                    color: "#3d3d3d",
                                                },
                                                boxShadow: "none",
                                            }}
                                        >
                                            <i className="fa fa-trash-o" />
                                        </Button>
                                    </Box>
                                </Box>
                            ))}
                            {/* SAVED FORM */}
                            {pemeForms.questions.map((form, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        backgroundColor: "#ebebeb",
                                        padding: 4,
                                        boxShadow: 1,
                                    }}
                                >
                                    <SelectForm
                                        formName={form.question}
                                        setFormName={setFormName}
                                        formType={form.input_types.map(
                                            (item) => item.input_type
                                        )}
                                        fileSize={
                                            form.input_types.find(
                                                (item) =>
                                                    item.input_type ===
                                                    "attachment"
                                            )?.file_size_limit ?? 10
                                        }
                                        setFileSize={setFileSize}
                                        readOnly={true}
                                    />
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "end",
                                            gap: 2,
                                        }}
                                    >
                                        <Button
                                            onClick={() =>
                                                handleDeleteForm(index, false)
                                            }
                                            sx={{
                                                transition: ".3s",
                                                fontSize: "26px",
                                                color: "#7a7a7a",
                                                borderRadius: "100%",
                                                backgroundColor: "transparent",
                                                "&:hover": {
                                                    backgroundColor:
                                                        "transparent",
                                                    color: "#3d3d3d",
                                                },
                                                boxShadow: "none",
                                            }}
                                        >
                                            <i className="fa fa-trash-o" />
                                        </Button>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                width: "100%",
                                padding: 2,
                            }}
                        ></Box>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "end",
                                padding: 2,
                            }}
                        ></Box>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default PemeRecordsForm;
