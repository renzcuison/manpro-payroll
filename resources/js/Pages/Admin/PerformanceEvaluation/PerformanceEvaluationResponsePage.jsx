import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import { Box, Typography, CircularProgress, Divider } from "@mui/material";

// Flattens subcategories for easier rendering
const flattenSubcategories = (form) => {
    if (!form || !form.sections) return [];
    let subcategories = [];
    form.sections.forEach(section => {
        if (section.subcategories && Array.isArray(section.subcategories)) {
            section.subcategories.forEach(sub => {
                subcategories.push({
                    ...sub,
                    sectionName: section.name,
                });
            });
        }
    });
    return subcategories;
};

const PerformanceEvaluationResponsePage = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState(null);
    const [form, setForm] = useState(null);
    const [previewCategories, setPreviewCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const storedUser = localStorage.getItem("nasya_user");
            const user = JSON.parse(storedUser || '{}');
            const headers = getJWTHeader(user);

            setLoading(true);
            try {
                // Fetch the evaluation response
                const res = await axiosInstance.get('/getEvaluationResponse', {
                    headers,
                    params: { id }
                });
                if (res.data.status === 200 && res.data.evaluationResponse) {
                    setResponse(res.data.evaluationResponse);

                    // Fetch the evaluation form (like in the Preview)
                    const formId = res.data.evaluationResponse.evaluationForm?.id;
                    if (formId) {
                        const formRes = await axiosInstance.get('/getEvaluationForm', {
                            headers,
                            params: { id: formId }
                        });
                        if (formRes.data.status === 200 && formRes.data.evaluationForm) {
                            setForm(formRes.data.evaluationForm);
                            setPreviewCategories(flattenSubcategories(formRes.data.evaluationForm));
                        } else {
                            setForm(null);
                            setPreviewCategories([]);
                        }
                    } else {
                        setForm(null);
                        setPreviewCategories([]);
                    }
                } else {
                    setResponse(null);
                    setForm(null);
                    setPreviewCategories([]);
                }
            } catch (error) {
                setResponse(null);
                setForm(null);
                setPreviewCategories([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return <Box sx={{ textAlign: "center", mt: 6 }}><CircularProgress /></Box>;
    }
    if (!response) {
        return <Box sx={{ textAlign: "center", mt: 6 }}>
            <Typography variant="h6" color="error">Evaluation Response Not Found</Typography>
        </Box>;
    }

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 5, p: 3, bgcolor: "white", borderRadius: "8px" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
                Performance Evaluation Preview
            </Typography>
            <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
                {form?.name || "Evaluation Form"}
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Evaluatee: {response.evaluatee_last_name}, {response.evaluatee_first_name} {response.evaluatee_middle_name || ""}
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Evaluator: {response.evaluator_last_name}, {response.evaluator_first_name} {response.evaluator_middle_name || ""}
            </Typography>

            {/* Preview area showing subcategories grouped by section */}
            {form?.sections && form.sections.length > 0 ? (
                form.sections.map(section => (
                    <Box key={section.id} sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>{section.name}</Typography>
                        {section.subcategories && section.subcategories.length > 0 ?
                            section.subcategories.map(sub => (
                                <Box
                                    key={sub.id}
                                    sx={{
                                        border: "1px solid #ddd",
                                        borderRadius: 2,
                                        p: 2,
                                        mb: 2
                                    }}
                                >
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        {sub.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>{sub.description}</Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>Type: {sub.subcategory_type}</Typography>
                                    {/* Show answer depending on subcategory type */}
                                    {sub.subcategory_type === "linear_scale" && (
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                Scale: {sub.linear_scale_start} - {sub.linear_scale_end}
                                            </Typography>
                                            <Divider sx={{ my: 1 }}/>
                                            <Typography variant="body1">
                                                Answer: {
                                                    sub.percentage_answer
                                                    ? Math.round(
                                                        (sub.percentage_answer.percentage ?? 0) * (sub.linear_scale_end - sub.linear_scale_start) + sub.linear_scale_start
                                                    )
                                                    : <i style={{ color: "#bbb" }}>Not answered</i>
                                                }
                                            </Typography>
                                        </Box>
                                    )}
                                    {(sub.subcategory_type === "multiple_choice") && (
                                        <Box>
                                            <Divider sx={{ my: 1 }}/>
                                            <Typography variant="body1">
                                                Answer: {
                                                    sub.options && sub.options.find(opt => opt.option_answer)
                                                        ? sub.options.find(opt => opt.option_answer)?.label
                                                        : <i style={{ color: "#bbb" }}>Not answered</i>
                                                }
                                            </Typography>
                                        </Box>
                                    )}
                                    {(sub.subcategory_type === "checkbox") && (
                                        <Box>
                                            <Divider sx={{ my: 1 }}/>
                                            <Typography variant="body1">
                                                Answers: {
                                                    sub.options && sub.options.filter(opt => opt.option_answer).length > 0
                                                        ? sub.options.filter(opt => opt.option_answer).map(opt => opt.label).join(", ")
                                                        : <i style={{ color: "#bbb" }}>Not answered</i>
                                                }
                                            </Typography>
                                        </Box>
                                    )}
                                    {(sub.subcategory_type === "short_answer" || sub.subcategory_type === "long_answer") && (
                                        <Box>
                                            <Divider sx={{ my: 1 }}/>
                                            <Typography variant="body1">
                                                Answer: {
                                                    sub.text_answer && sub.text_answer.answer
                                                        ? sub.text_answer.answer
                                                        : <i style={{ color: "#bbb" }}>Not answered</i>
                                                }
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            ))
                            : <Typography sx={{ color: "#aaa" }}>No subcategories in this section.</Typography>
                        }
                    </Box>
                ))
            ) : (
                <Typography>No sections found for this evaluation form.</Typography>
            )}
        </Box>
    );
};

export default PerformanceEvaluationResponsePage;