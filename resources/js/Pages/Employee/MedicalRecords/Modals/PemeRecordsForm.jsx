import {
    Typography,
    Box,
    Button,
    FormControl,
    FormGroup,
    TextField,
    FormControlLabel,
    RadioGroup,
    FormLabel,
    Radio,
    Select,
} from "@mui/material";
import Layout from "../../../../components/Layout/Layout";
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
        <FormGroup>
            <FormControl>
                <TextField
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    label="Form Name"
                    inputprops={{ readOnly: readOnly }}
                />
            </FormControl>
            <FormControl>
                <RadioGroup
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                >
                    <Box
                        sx={{
                            display: "flex",
                            marginTop: 2,
                        }}
                    >
                        <FormControlLabel
                            value="Attachment"
                            control={<Radio />}
                            label="Attachment"
                        />
                        <FormControlLabel
                            value="Pass/Fail"
                            control={<Radio />}
                            label="Pass/Fail"
                        />
                        <FormControlLabel
                            value="Positive/Negative"
                            control={<Radio />}
                            label="Positive/Negative"
                        />
                        <FormControlLabel
                            value="Remarks"
                            control={<Radio />}
                            label="Remarks"
                        />
                        <FormControlLabel
                            value="TextBox"
                            control={<Radio />}
                            label="Text Box"
                        />
                    </Box>
                </RadioGroup>
            </FormControl>
            {formType === "Attachment" && (
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
                                label="Size"
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
                        </Box>
                    </FormControl>
                </Box>
            )}
        </FormGroup>
    );
};

const PemeRecordsForm = () => {
    const [questionnaireForms, setQuestionnaireForms] = useState([]); // Entire form
    const [formName, setFormName] = useState("");
    const [formType, setFormType] = useState("");
    const [fileSize, setFileSize] = useState("");
    const handleAddForm = () => {
        // Save current form
        setQuestionnaireForms((prev) => [
            ...prev,
            {
                formName,
                formType,
                fileSize,
            },
        ]);
        console.log(questionnaireForms);
        // Reset form fields
        setFormName("");
        setFormType("");
    };

    const handleDeleteForm = (index) => {
        setQuestionnaireForms((prev) => prev.filter((_, i) => i !== index));
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
                                                    boxShadow: "none", // optional: removes any shadow on hover
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
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default PemeRecordsForm;
