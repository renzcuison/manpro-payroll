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
                                        console.log(formType);
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
                                        console.log(formType);
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
                                        console.log(formType);
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
                                        console.log(formType);
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
                                defaultValue={10}
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
    const getJWTHeader = (user) => {
        return {
            Authorization: `Bearer ${user.token}`,
        };
    };
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const { PemeID } = useParams();
    const pemeId = Number(PemeID);
    const [questionnaireForms, setQuestionnaireForms] = useState([]);
    const [questionnaireConfirm, setQuestionnaireConfirm] = useState([]);
    const [formName, setFormName] = useState("");
    const [formType, setFormType] = useState([]);
    const [fileSize, setFileSize] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [pemeForms, setPemeForms] = useState({ peme: "", questions: [] });
    let size;

    useEffect(() => {
        axiosInstance
            .get(`/peme/${pemeId}/questionnaire`, { headers })
            .then((response) => {
                setPemeForms(response.data);
                console.log("PEME Records:", response.data);
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

    const handleAddForm = async () => {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));
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
            try {
                size =
                    fileSize === "" || Number(fileSize) === 0
                        ? 10
                        : Number(fileSize);

                const payload = {
                    peme_id: pemeId,
                    question: formName,
                    input_types: formType,
                    file_size_limit: size,
                };

                console.log("Payload to send:", payload);
                console.log("formType save:", formType);

                const response = await axiosInstance.post(
                    "/peme/questionnaire",
                    payload,
                    { headers }
                );

                console.log("Successfully created form:", response.data);

                setQuestionnaireForms((prev) => [...prev, response.data]);
            } catch (error) {
                console.error("Error posting form:", error); // ✅ Always log the error
            }
        }
        size = 0;
        setFormName("");
        setFormType([]);
        setFileSize("");

        axiosInstance
            .get(`/peme/${pemeId}/questionnaire`, { headers })
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
    };

    const handleConfirmQuestionnaire = () => {
        // setQuestionnaireConfirm((p) => [...p, questionnaireForms]);
        // console.log("confirm", questionnaireConfirm);
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
                        {pemeForms.peme}
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
                            {pemeForms.questions.map((form, index) => {
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
