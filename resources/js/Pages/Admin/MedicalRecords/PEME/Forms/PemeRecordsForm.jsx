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
import { useState } from "react";

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
        <FormGroup inputProps={{ readOnly: readOnly }}>
            <FormControl>
                <TextField
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    label="Form Name"
                />
            </FormControl>
            <FormControl>
                <Box sx={{ display: "flex", marginTop: 2 }}>
                    <FormControlLabel
                        value="Attachment"
                        control={
                            <Checkbox
                                checked={
                                    Array.isArray(formType) &&
                                    formType.includes("Attachment")
                                }
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormType((prev) => [
                                            ...prev,
                                            "Attachment",
                                        ]);
                                    } else {
                                        setFormType((prev) =>
                                            prev.filter(
                                                (type) => type !== "Attachment"
                                            )
                                        );
                                    }
                                }}
                            />
                        }
                        label="Attachment"
                    />
                    <FormControlLabel
                        value="Pass/Fail"
                        control={
                            <Checkbox
                                checked={
                                    Array.isArray(formType) &&
                                    formType.includes("Pass/Fail")
                                }
                                disabled={
                                    Array.isArray(formType) &&
                                    formType.includes("Positive/Negative")
                                }
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormType((prev) => [
                                            ...prev,
                                            "Pass/Fail",
                                        ]);
                                    } else {
                                        setFormType((prev) =>
                                            prev.filter(
                                                (type) => type !== "Pass/Fail"
                                            )
                                        );
                                    }
                                }}
                            />
                        }
                        label="Pass/Fail"
                    />
                    <FormControlLabel
                        value="Positive/Negative"
                        control={
                            <Checkbox
                                checked={
                                    Array.isArray(formType) &&
                                    formType.includes("Positive/Negative")
                                }
                                disabled={
                                    Array.isArray(formType) &&
                                    formType.includes("Pass/Fail")
                                }
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormType((prev) => [
                                            ...prev,
                                            "Positive/Negative",
                                        ]);
                                    } else {
                                        setFormType((prev) =>
                                            prev.filter(
                                                (type) =>
                                                    type !== "Positive/Negative"
                                            )
                                        );
                                    }
                                }}
                            />
                        }
                        label="Positive/Negative"
                    />
                    <FormControlLabel
                        value="Remarks"
                        control={
                            <Checkbox
                                checked={
                                    Array.isArray(formType) &&
                                    formType.includes("Remarks")
                                }
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormType((prev) => [
                                            ...prev,
                                            "Remarks",
                                        ]);
                                    } else {
                                        setFormType((prev) =>
                                            prev.filter(
                                                (type) => type !== "Remarks"
                                            )
                                        );
                                    }
                                }}
                            />
                        }
                        label="Remarks"
                    />{" "}
                    <FormControlLabel
                        value="Text Box"
                        control={
                            <Checkbox
                                checked={
                                    Array.isArray(formType) &&
                                    formType.includes("Text Box")
                                }
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormType((prev) => [
                                            ...prev,
                                            "Text Box",
                                        ]);
                                    } else {
                                        setFormType((prev) =>
                                            prev.filter(
                                                (type) => type !== "Text Box"
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
            {formType.includes("Attachment") && (
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
                                inputProps={{
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
    const [questionnaireForms, setQuestionnaireForms] = useState([]); // Collection of forms
    const [questionnaireConfirm, setQuestionnaireConfirm] = useState([]); // Saves Entire Questionnaire
    const [formName, setFormName] = useState("");
    const [formType, setFormType] = useState([]);
    const [fileSize, setFileSize] = useState("");
    const handleAddForm = () => {
        // IF MISSING FIELDS
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

        // Save current form
        else {
            // Set fileSize to 10 if empty or 0
            let size =
                fileSize === "" || Number(fileSize) === 0
                    ? 10
                    : Number(fileSize);
            setQuestionnaireForms((prev) => [
                ...prev,
                {
                    formName,
                    formType,
                    fileSize: size,
                },
            ]);
            console.log(questionnaireForms);
        }

        // PUSH QUESTIONNAIRE FORM IN BACKEND

        // Reset form fields
        setFormName("");
        setFormType([]);
        setFileSize("");
    };

    const handleConfirmQuestionnaire = () => {
        setQuestionnaireConfirm((p) => [...p, questionnaireForms]);
        console.log("confirm", questionnaireConfirm);
    };

    const handleDeleteForm = (index) => {
        new Swal({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: "You want to delete this form?",
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Save",
            confirmButtonColor: "#177604",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then((res) => {
            if (res.isConfirmed) {
                setQuestionnaireForms((prev) =>
                    prev.filter((_, i) => i !== index)
                );
            }
        });
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
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        Record Name
                    </Typography>
                    {/* FORM */}
                    <Box
                        sx={{
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
                            {questionnaireForms.map((form, index) => {
                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            backgroundColor: "#f5f5f5",
                                            padding: 4,
                                            boxShadow: 1,
                                        }}
                                    >
                                        <SelectForm
                                            formName={form.formName}
                                            formType={form.formType}
                                            fileSize={form.fileSize}
                                            readOnly={true}
                                        />
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "end",
                                            }}
                                        >
                                            <Button
                                                onClick={() =>
                                                    handleDeleteForm(index)
                                                }
                                                sx={{
                                                    padding: 2,
                                                    transition: ".3s",
                                                    fontSize: "26px",
                                                    color: "#7a7a7a",
                                                    borderRadius: "100%",
                                                    backgroundColor:
                                                        "transparent",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "transparent",
                                                        color: "#3d3d3d",
                                                    },
                                                    boxShadow: "none",
                                                }}
                                            >
                                                <i
                                                    className="fa fa-trash-o"
                                                    aria-hidden="true"
                                                ></i>
                                            </Button>
                                        </Box>
                                    </Box>
                                );
                            })}
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
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                width: "100%",
                                padding: 2,
                            }}
                        >
                            <Button
                                onClick={handleAddForm}
                                variant="contained"
                                sx={{ display: "flex", gap: 1 }}
                            >
                                New form <i className="fa fa-plus pr-2"></i>
                            </Button>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "end",
                                padding: 2,
                            }}
                        >
                            <Button
                                onClick={handleConfirmQuestionnaire}
                                variant="contained"
                            >
                                Confirm Questionnaire
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default PemeRecordsForm;
