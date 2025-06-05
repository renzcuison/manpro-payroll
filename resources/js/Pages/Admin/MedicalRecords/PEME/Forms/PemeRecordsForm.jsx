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
                    sx={{ backgroundColor: "#f5f5f5" }}
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

    // For backend
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

                    setFormName("");
                    setFormType([]);
                    setFileSize(10); // reset to default value
                }
            });
        } catch (error) {
            console.error("Error posting form:", error);
        }
    };

    // For frontend
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

    const handleDeleteForm = (form, index, isInitial = false) => {
        console.log(form.question);
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: `You want to delete ${form.question}?`,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33",
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

    const [isEdit, setIsEdit] = useState(false);
    // DECONSTRUCT THE INITIAL FORM
    const [editingInitialId, setEditingInitialId] = useState(null);
    const [editFormName, setEditFormName] = useState("");
    const [editFormType, setEditFormType] = useState([]);
    const [editFileSize, setEditFileSize] = useState(10);

    //EDIT INITIAL FORM
    const handleEditInitialForm = (form) => {
        setEditingInitialId(form.tempId);
        setEditFormName(form.question);
        setEditFormType(
            form.input_types.map((item) =>
                typeof item === "string" ? item : item.input_type
            )
        );
        setEditFileSize(
            form.input_types.find(
                (item) => (item.input_type ?? item) === "attachment"
            )?.file_size_limit ?? 10
        );
    };

    //SAVE EDITS IN INITIAL FORM
    const handleSaveInitialEditedForm = (form) => {
        setIsEdit(true);
        setInitialForms((prev) =>
            prev.map((f) =>
                f.tempId === form.tempId
                    ? {
                          ...f,
                          question: editFormName,
                          input_types: editFormType,
                          file_size_limit: editFileSize,
                      }
                    : f
            )
        );
        setEditingInitialId(null);
        setEditFormName("");
        setEditFormType([]);
        setEditFileSize(10);
    };

    //DECONSTRUCT THE SAVED FORM
    const [editingSavedId, setEditingSavedId] = useState(null);
    const [editSavedFormName, setEditSavedFormName] = useState("");
    const [editSavedFormType, setEditSavedFormType] = useState([]);
    const [editSavedFileSize, setEditSavedFileSize] = useState(10);

    //EDIT SAVED FORMS FROM DB
    const handleEditSavedForm = (form) => {
        setIsEdit(false);

        setEditingSavedId(form.id);
        setEditSavedFormName(form.question);
        setEditSavedFormType(form.input_types.map((item) => item.input_type));
        setEditSavedFileSize(
            form.input_types.find((item) => item.input_type === "attachment")
                ?.file_size_limit ?? 10
        );
    };

    //SAVE EDITS TO DB
    const handleSaveSavedForm = async (form) => {
        Swal.fire({
            customClass: { container: "my-swal" },
            title: "Are you sure?",
            text: `You want to save edits for ${form.question}?`,
            icon: "warning",
            showConfirmButton: true,
            confirmButtonText: "Save",
            confirmButtonColor: "#2b8a3e",
            showCancelButton: true,
            cancelButtonText: "Cancel",
        }).then(async (res) => {
            if (res.isConfirmed) {
                const storedUser = localStorage.getItem("nasya_user");
                const headers = getJWTHeader(JSON.parse(storedUser));
                console.log("FINAL SAVED FORM", form);
                try {
                    const payload = {
                        question: editSavedFormName,
                        input_types: editSavedFormType,
                        file_size_limit: editSavedFileSize,
                    };
                    await axiosInstance.put(
                        `/peme/${PemeID}/question/${form.id}`,
                        payload,
                        { headers }
                    );

                    // Update local state
                    setPemeForms((prev) => ({
                        ...prev,
                        questions: prev.questions.map((f) =>
                            f.id === form.id ? { ...f, ...payload } : f
                        ),
                    }));

                    setEditingSavedId(null);
                    setEditSavedFormName("");
                    setEditSavedFormType([]);
                    setEditSavedFileSize(10);

                    Swal.fire({
                        icon: "success",
                        text: "Form updated successfully.",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "Failed to update form. Please try again.",
                        icon: "error",
                        confirmButtonText: "Okay",
                        confirmButtonColor: "#177604",
                    });
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
                            Confirm
                        </Button>
                    </Box>

                    {/* FORM */}
                    <Box
                        sx={{
                            boxShadow: 1,
                            padding: 4,
                            backgroundColor: "white",
                            marginTop: 4,
                        }}
                    >
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
                                New form <i className="fa fa-plus pr-2"></i>
                            </Button>
                        </Box>
                    </Box>
                    {/* INITIAL FORM */}
                    <Box
                        sx={{
                            maxHeight: 500,
                            overflowY: "scroll",
                            padding: 2,
                            backgroundColor: "white",
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
                            {initialForms.map((form, index) => {
                                //Track ID being edited
                                const isEditing =
                                    editingInitialId === form.tempId;
                                return (
                                    <Box
                                        key={form.tempId}
                                        sx={{
                                            transition: "all",
                                            transitionDuration: ".3s",
                                            border: 2,
                                            borderColor: `${
                                                isEditing
                                                    ? "green"
                                                    : "transparent"
                                            }`,
                                            backgroundColor: "#fafafa",

                                            padding: 4,
                                            boxShadow: 1,
                                        }}
                                    >
                                        <SelectForm
                                            formName={
                                                isEditing
                                                    ? editFormName
                                                    : form.question
                                            }
                                            setFormName={
                                                isEditing
                                                    ? setEditFormName
                                                    : () => {}
                                            }
                                            formType={
                                                isEditing
                                                    ? editFormType
                                                    : form.input_types.map(
                                                          (item) =>
                                                              typeof item ===
                                                              "string"
                                                                  ? item
                                                                  : item.input_type
                                                      )
                                            }
                                            setFormType={
                                                isEditing
                                                    ? setEditFormType
                                                    : () => {}
                                            }
                                            fileSize={
                                                isEditing
                                                    ? editFileSize
                                                    : form.input_types.find(
                                                          (item) =>
                                                              (item.input_type ??
                                                                  item) ===
                                                              "attachment"
                                                      )?.file_size_limit ?? 10
                                            }
                                            setFileSize={
                                                isEditing
                                                    ? setEditFileSize
                                                    : () => {}
                                            }
                                            readOnly={!isEditing}
                                        />
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "end",
                                                gap: 2,
                                            }}
                                        >
                                            {isEditing ? (
                                                <Button
                                                    variant="contained"
                                                    onClick={() =>
                                                        handleSaveInitialEditedForm(
                                                            form
                                                        )
                                                    }
                                                >
                                                    Save Edit
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    onClick={() =>
                                                        handleEditInitialForm(
                                                            form
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                            <Button
                                                variant="contained"
                                                onClick={() =>
                                                    handleSaveForm(form)
                                                }
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    handleDeleteForm(
                                                        form,
                                                        index,
                                                        true
                                                    )
                                                }
                                                sx={{
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
                                                <i className="fa fa-trash-o" />
                                            </Button>
                                        </Box>
                                    </Box>
                                );
                            })}
                            {/* SAVED FORM */}
                            {pemeForms.questions.map((form, index) => {
                                const isEditing = editingSavedId === form.id;
                                return (
                                    <Box
                                        key={form.id}
                                        sx={{
                                            transition: "all",
                                            transitionDuration: ".3s",
                                            border: 2,
                                            borderColor: `${
                                                isEditing
                                                    ? "green"
                                                    : "transparent"
                                            }`,
                                            backgroundColor: "#f0f0f0",

                                            padding: 4,
                                            boxShadow: 1,
                                        }}
                                    >
                                        <SelectForm
                                            formName={
                                                isEditing
                                                    ? editSavedFormName
                                                    : form.question
                                            }
                                            setFormName={
                                                isEditing
                                                    ? setEditSavedFormName
                                                    : () => {}
                                            }
                                            formType={
                                                isEditing
                                                    ? editSavedFormType
                                                    : form.input_types.map(
                                                          (item) =>
                                                              item.input_type
                                                      )
                                            }
                                            setFormType={
                                                isEditing
                                                    ? setEditSavedFormType
                                                    : () => {}
                                            }
                                            fileSize={
                                                isEditing
                                                    ? editSavedFileSize
                                                    : form.input_types.find(
                                                          (item) =>
                                                              item.input_type ===
                                                              "attachment"
                                                      )?.file_size_limit ?? 10
                                            }
                                            setFileSize={
                                                isEditing
                                                    ? setEditSavedFileSize
                                                    : () => {}
                                            }
                                            readOnly={!isEditing}
                                        />
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "end",
                                                gap: 2,
                                            }}
                                        >
                                            {isEditing ? (
                                                <Button
                                                    variant="contained"
                                                    onClick={() =>
                                                        handleSaveSavedForm(
                                                            form
                                                        )
                                                    }
                                                >
                                                    Save
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    onClick={() =>
                                                        handleEditSavedForm(
                                                            form
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() =>
                                                    handleDeleteForm(
                                                        form,
                                                        index,
                                                        false
                                                    )
                                                }
                                                sx={{
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
                                                <i className="fa fa-trash-o" />
                                            </Button>
                                        </Box>
                                    </Box>
                                );
                            })}
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
