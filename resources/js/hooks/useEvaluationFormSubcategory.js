import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import {
    getSubcategoryDbValue, getSubcategorySelectValue
} from "../utils/performance-evaluation-utils";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export function useEvaluationFormSubcategory(subcategory) {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [isNew, setIsNew] = useState(true);
    const [subcategoryId, setSubcategoryId] = useState();
    const [subcategoryName, setSubcategoryName] = useState('');
    const [sectionId, setSectionId] = useState();
    const [subcategoryType, setSubcategoryType] = useState();
    const [subcategoryDescription, setSubcategoryDescription] = useState('');
    const [required, setRequired] = useState(true);
    const [allowOtherOption, setAllowOtherOption] = useState(false);
    const [linearScaleStart, setLinearScaleStart] = useState(1);
    const [linearScaleEnd, setLinearScaleEnd] = useState(5);
    const [linearScaleStartLabel, setLinearScaleStartLabel] = useState('Not at all');
    const [linearScaleEndLabel, setLinearScaleEndLabel] = useState('Extremely');
    const [order, setOrder] = useState();
    const [options, setOptions] = useState([]);
    // --- Linear scale options state ---
    const [linearScaleOptions, setLinearScaleOptions] = useState([
        { label: '', description: '' },
        { label: '', description: '' }
    ]);

    useEffect(() => {
        if(!subcategory) return;
        setIsNew(false);
        setSubcategoryId(subcategory.id);
        setSubcategoryName(subcategory.name);
        setSectionId(subcategory.section_id);
        setSubcategoryType(subcategory.subcategory_type);
        setSubcategoryDescription(subcategory.description);
        setRequired(subcategory.required);
        setAllowOtherOption(subcategory.allow_other_option);
        setLinearScaleStart(subcategory.linear_scale_start);
        setLinearScaleEnd(subcategory.linear_scale_end);
        setLinearScaleStartLabel(subcategory.linear_scale_start_label);
        setLinearScaleEndLabel(subcategory.linear_scale_end_label);
        setOrder(subcategory.order);
        setOptions(subcategory.options);
        // --- Set linear scale options if type is linearScale ---
        if (getSubcategorySelectValue(subcategory.subcategory_type) === 'linearScale') {
            setLinearScaleOptions(
                Array.isArray(subcategory.options) && subcategory.options.length
                    ? subcategory.options.map(opt => ({
                        label: opt.label || '',
                        description: opt.description || ''
                    }))
                    : [{ label: '', description: '' }, { label: '', description: '' }]
            );
        }
    }, [subcategory?.id]);

    // --- Linear Scale Option Handlers ---
    function addLinearScaleOption() {
        if (linearScaleOptions.length < 10) {
            setLinearScaleOptions([...linearScaleOptions, { label: '', description: '' }]);
        }
    }
    function removeLinearScaleOption(idx) {
        if (linearScaleOptions.length > 2) { // keep at least 2
            setLinearScaleOptions(linearScaleOptions.filter((_, i) => i !== idx));
        }
    }
    function editLinearScaleOption(idx, field, value) {
        setLinearScaleOptions(
            linearScaleOptions.map((opt, i) =>
                i === idx ? { ...opt, [field]: value } : opt
            )
        );
    }

    // --- Subcategory CRUD ---
    function editSubcategory(subcategory) {
        axiosInstance
            .post('/editEvaluationFormSubcategory', {
                id: subcategoryId,
                ...subcategory                
            }, { headers })
            .then((response) => {
                if (response.data.status.toString().startsWith(2)) {
                    const { evaluationFormSubcategory } = response.data;
                    if(!evaluationFormSubcategory) return;
                    setSubcategoryName(evaluationFormSubcategory.name);
                    setSubcategoryType(evaluationFormSubcategory.subcategory_type);
                    setSubcategoryDescription(evaluationFormSubcategory.description);
                    setRequired(evaluationFormSubcategory.required);
                    setAllowOtherOption(evaluationFormSubcategory.allow_other_option);
                    setLinearScaleStart(evaluationFormSubcategory.linear_scale_start);
                    setLinearScaleEnd(evaluationFormSubcategory.linear_scale_end);
                    setOrder(evaluationFormSubcategory.order);
                } else if (response.data.status.toString().startsWith(4)) {
                    Swal.fire({
                        text: response.data.message,
                        icon: "error",
                        confirmButtonColor: '#177604',
                        customClass: {
                            popup: 'swal-popup-overlay'
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error saving subcategory:', error);
                Swal.fire({
                    text: "Error saving subcategory",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
            })
        ;
    }

const saveSubcategory = () => {
    // Prepare linear scale options with automatically assigned scores
    const transformedLinearScaleOptions = linearScaleOptions.map((opt, idx) => ({
        label: opt.label,
        description: opt.description,
        score: idx + 1, // Automatically assign score based on index
        order: idx + 1 // Ensure the order is correct
    }));

    // Now send the data, including the transformed options
    axiosInstance
        .post('/saveEvaluationFormSubcategory', {
            section_id: sectionId,
            name: subcategoryName,
            subcategory_type: 'linear_scale',
            description: subcategoryDescription,
            required,
            allow_other_option: allowOtherOption,
            linear_scale_start: linearScaleStart,
            linear_scale_end: linearScaleEnd,
            linear_scale_start_label: linearScaleStartLabel,
            linear_scale_end_label: linearScaleEndLabel,
            options: transformedLinearScaleOptions, // Use the transformed options
        }, { headers })
        .then((response) => {
            if (response.data.status.toString().startsWith(2)) {
                // Optionally update UI or trigger another action
                alert("Subcategory saved successfully!");
            } else {
                alert("Error saving subcategory");
            }
        })
        .catch((error) => {
            console.error('Error saving subcategory:', error);
            alert("Error saving subcategory");
        });
};



    function switchResponseType(responseType) {
        const subcategoryDbValue = getSubcategoryDbValue(responseType);
        if(isNew)
            setSubcategoryType(subcategoryDbValue);
        else
            editSubcategory({ subcategory_type: subcategoryDbValue });
    }

    function toggleAllowOtherOption() {
        if(isNew)
            setAllowOtherOption(!allowOtherOption);
        else
            editSubcategory({ allow_other_option: !allowOtherOption });
    }

    function toggleRequired() {
        if(isNew)
            setRequired(!required);
        else
            editSubcategory({ required: !required });
    }

    // --- Option operations for multipleChoice/checkbox ---
    function deleteOption(optionIndex) {
        if(isNew) {
            options.splice(optionIndex, 1);
            setOptions([ ...options ]);
        } else {
            /* edit on server if needed */
        }
    }
    function editOption(optionIndex, label, score, description) {
        if(isNew) {
            options[ optionIndex ].label = label;
            options[ optionIndex ].score = score;
            options[ optionIndex ].description = description;
            setOptions([ ...options ]);
        } else axiosInstance
            .post('/editEvaluationFormSubcategoryOption', {
                id: subcategoryId,
                ...options[optionIndex]
            }, { headers })
            .then((response) => {
                if (response.data.status.toString().startsWith(4)) {
                    Swal.fire({
                        text: response.data.message,
                        icon: "error",
                        confirmButtonColor: '#177604',
                        customClass: {
                            popup: 'swal-popup-overlay'
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error saving subcategory option:', error);
                Swal.fire({
                    text: "Error saving subcategory option",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
            });
    }

    function getOption(optionId) {
        axiosInstance
            .get(`/getEvaluationFormSubcategoryOption`, {
                headers, params: { id: optionId }
            })
            .then((response) => {
                const { evaluationFormSubcategoryOption } = response.data;
                if(!evaluationFormSubcategoryOption) return;
                setOptions([...options, evaluationFormSubcategoryOption]);
            })
            .catch(error => {
                console.error('Error fetching subcategory option data:', error);
            })
    }

    function saveOption(label, score, description) {
        if(isNew)
            setOptions([ ...options, { label, score, description } ]);
        else axiosInstance
            .post('/saveEvaluationFormSubcategoryOption', {
                subcategory_id: subcategoryId, label, score, description
            }, { headers })
            .then((response) => {
                if (response.data.status.toString().startsWith(2)) {
                    const { evaluationFormSubcategoryOptionID } = response.data;
                    if(!evaluationFormSubcategoryOptionID ) return;
                    getOption(evaluationFormSubcategoryOptionID);
                } else if (response.data.status.toString().startsWith(4)) {
                    Swal.fire({
                        text: response.data.message,
                        icon: "error",
                        confirmButtonColor: '#177604',
                        customClass: {
                            popup: 'swal-popup-overlay'
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error saving subcategory option:', error);
                Swal.fire({
                    text: "Error saving subcategory option",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
            });
    }

    return {
        subcategory: {
            id: subcategoryId,
            section_id: sectionId,
            name: subcategoryName,
            subcategory_type: subcategoryType,
            description: subcategoryDescription,
            required,
            allow_other_option: allowOtherOption,
            linear_scale_start: linearScaleStart,
            linear_scale_end: linearScaleEnd,
            linear_scale_start_label: linearScaleStartLabel,
            linear_scale_end_label: linearScaleEndLabel,
            options
        },
        subcategoryId,
        subcategoryName, setSubcategoryName, editSubcategory, saveSubcategory,
        responseType: getSubcategorySelectValue(subcategoryType), switchResponseType,
        subcategoryDescription, setSubcategoryDescription,
        required, toggleRequired,
        allowOtherOption, toggleAllowOtherOption,
        linearScaleStart, setLinearScaleStart,
        linearScaleEnd, setLinearScaleEnd,
        linearScaleStartLabel, setLinearScaleStartLabel,
        linearScaleEndLabel, setLinearScaleEndLabel,
        order,
        options, deleteOption, editOption, saveOption,
        // --- Linear scale handlers exposed! ---
        linearScaleOptions, addLinearScaleOption, removeLinearScaleOption, editLinearScaleOption
    };

}