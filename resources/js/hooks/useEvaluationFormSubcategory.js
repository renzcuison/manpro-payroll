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
    const [subcategoryName, setSubcategoryName] = useState();
    const [sectionId, setSectionId] = useState();
    const [subcategoryType, setSubcategoryType] = useState();
    const [subcategoryDescription, setSubcategoryDescription] = useState();
    const [required, setRequired] = useState(true);
    const [allowOtherOption, setAllowOtherOption] = useState(false);
    const [linearScaleStart, setLinearScaleStart] = useState(1);
    const [linearScaleEnd, setLinearScaleEnd] = useState(5);
    const [linearScaleStartLabel, setLinearScaleStartLabel] = useState('Not at all');
    const [linearScaleEndLabel, setLinearScaleEndLabel] = useState('Extremely');
    const [order, setOrder] = useState();
    const [options, setOptions] = useState([]);

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
    }, [subcategory?.id]);

    // subcategory operations

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
                            popup: 'swal-popup-overlay' // Custom class to ensure overlay
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

    function saveSubcategory() {
        axiosInstance
            .post('/saveEvaluationFormSubcategory', {
                section_id: sectionId,
                name: subcategoryName,
                subcategory_type: getSubcategoryDbValue(subcategoryType),
                description: subcategoryDescription,
                required,
                allow_other_option: allowOtherOption,
                linear_scale_start: linearScaleStart,
                linear_scale_end: linearScaleEnd,
                linear_scale_start_label: linearScaleStartLabel,
                linear_scale_end_label: linearScaleEndLabel,
                options
            }, { headers })
            .then((response) => {
                if (response.data.status.toString().startsWith(2)) {
                    const { evaluationFormSubcategoryID } = response.data;
                    if(!evaluationFormSubcategoryID) return;
                    setIsNew(false);
                    setSubcategoryId(evaluationFormSubcategoryID);
                } else if (response.data.status.toString().startsWith(4)) {
                    Swal.fire({
                        text: response.data.message,
                        icon: "error",
                        confirmButtonColor: '#177604',
                        customClass: {
                            popup: 'swal-popup-overlay' // Custom class to ensure overlay
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

    // option operations

    function deleteOption(optionIndex) {

        if(isNew) {
            options.splice(optionIndex, 1);
            setOptions([ ...options ]);
        } else
            undefined; // edit later

    }

    function editOption(optionIndex, label) {

        if(isNew) {
            options[ optionIndex ].label = label;
            setOptions([ ...options ]);
        } else
            undefined; // edit later

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

    function moveOption(oldOrder, newOrder) {
        if(oldOrder === newOrder) return;
        axiosInstance
            .post('/moveEvaluationFormSubcategoryOption', {
                id: options[oldOrder - 1].id,
                order: newOrder
            }, { headers })
            .catch(error => {
                console.error('Error moving subcategory option: ', error);
                setOptions([...options]);
            })
        ;
        const moveUp = oldOrder < newOrder;
        for(
            let order = moveUp ? oldOrder + 1 : oldOrder - 1;
            moveUp ? (order <= newOrder) : (order >= newOrder);
            order += (moveUp ? 1 : -1) * 1
        ) options[order - 1].order = order + (moveUp ? -1 : 1);
        const removed = options.splice(oldOrder - 1, 1)[0];
        removed.order = newOrder;
        options.splice(newOrder - 1, 0, removed);
        setOptions([...options]);
    }

    function saveOption(label) {
        if(isNew)
            setOptions([ ...options, { label } ]);
        else axiosInstance
            .post('/saveEvaluationFormSubcategoryOption', {
                subcategory_id: subcategoryId, label
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
                            popup: 'swal-popup-overlay' // Custom class to ensure overlay
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
            })
        ;
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
        }, editSubcategory, saveSubcategory,
        subcategoryId,
        subcategoryName, setSubcategoryName,
        responseType: getSubcategorySelectValue(subcategoryType), switchResponseType,
        subcategoryDescription, setSubcategoryDescription,
        required, toggleRequired,
        allowOtherOption, toggleAllowOtherOption,
        linearScaleStart, setLinearScaleStart,
        linearScaleEnd, setLinearScaleEnd,
        linearScaleStartLabel, setLinearScaleStartLabel,
        linearScaleEndLabel, setLinearScaleEndLabel,
        order,
        options, deleteOption, editOption, moveOption, saveOption
    };

}
