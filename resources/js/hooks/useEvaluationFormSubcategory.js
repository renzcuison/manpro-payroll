import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export function useEvaluationFormSubcategory(subcategoryInit) {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [isNew, setIsNew] = useState(true);
    const [savedSubcategory, setSavedSubcategory] = useState();
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
    const [newOptionId, setNewOptionId] = useState(0);
    const [draggedOptionId, setDraggedOptionId] = useState();
    const [saved, setSaved] = useState(true);
    const subcategory = {
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
    };
    const subcategoryTypeDisplay = {
        short_answer: "Short Text",
        long_answer: "Long Text",
        checkbox: "Checkbox",
        linear_scale: "Linear Scale",
        multiple_choice: "Multiple Choice"
    }[subcategoryType] ?? 'Unknown';

    useEffect(() => {
        if(!subcategoryInit) return;
        setIsNew(false);
        setSubcategoryId(subcategoryInit.id);
        setSubcategoryName(subcategoryInit.name);
        setSectionId(subcategoryInit.section_id);
        setSubcategoryType(subcategoryInit.subcategory_type);
        setSubcategoryDescription(subcategoryInit.description);
        setRequired(subcategoryInit.required);
        setAllowOtherOption(subcategoryInit.allow_other_option);
        setLinearScaleStart(subcategoryInit.linear_scale_start);
        setLinearScaleEnd(subcategoryInit.linear_scale_end);
        setLinearScaleStartLabel(subcategoryInit.linear_scale_start_label);
        setLinearScaleEndLabel(subcategoryInit.linear_scale_end_label);
        setOrder(subcategoryInit.order);
        const options = [];
        for(let option of subcategoryInit.options) options.push({ ...option });
        setOptions(options);
        setSavedSubcategory({ ...subcategoryInit });
    }, [subcategoryInit?.id]);

    // --- Subcategory CRUD ---
    function cancelEditSubcategory() {
        setSubcategoryName(savedSubcategory?.name);
        setSubcategoryType(savedSubcategory?.subcategory_type);
        setSubcategoryDescription(savedSubcategory?.description);
        setRequired(savedSubcategory?.required);
        setAllowOtherOption(savedSubcategory?.allow_other_option);
        setLinearScaleStart(savedSubcategory?.linear_scale_start);
        setLinearScaleEnd(savedSubcategory?.linear_scale_end);
        setLinearScaleStartLabel(savedSubcategory?.linear_scale_start_label);
        setLinearScaleEndLabel(savedSubcategory?.linear_scale_end_label);
        setOptions([]);
        if(savedSubcategory) for(let option of savedSubcategory.options) options.push({ ...option });
    }

    async function editSubcategory() {
        try {
            // update subcategory
            const response = await axiosInstance.post('/editEvaluationFormSubcategory', {
                id: subcategoryId,
                ...subcategory
            }, { headers });
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
                const options = [];
                for(let option of subcategory.options) options.push({ ...option });
                setSavedSubcategory({ ...evaluationFormSubcategory, options });
            } else if (response.data.status.toString().startsWith(4)) throw response;
            // create, delete, update options
            const isLinearScale = subcategoryType === 'linear_scale';
            for(let index = 0; index < options.length; index++) {
                const option = options[index];
                if(isLinearScale && option.score !== option.order)
                    editOption(option, { score: option.order });
                let response;
                switch(option.action) {
                    case 'create':
                        response = await axiosInstance.post(
                            '/saveEvaluationFormSubcategoryOption', { ...option }, { headers }
                        );
                        if(response.data.status.toString().startsWith(4)) throw response;
                        option.id = response.data.evaluationSubcategoryOptionID;
                        delete option.action;
                        break;
                    case 'delete':
                        response = await axiosInstance.post(
                            '/deleteEvaluationFormSubcategoryOption', { id: option.id }, { headers }
                        );
                        if(response.data.status.toString().startsWith(4)) throw response;
                        options.splice(index, 1);
                        index--;
                        break;
                    case 'update':
                        response = await axiosInstance.post(
                            '/editEvaluationFormSubcategoryOption', { ...option }, { headers }
                        );
                        if(response.data.status.toString().startsWith(4)) throw response;
                        delete option.action;
                }
            }
            // move options
            let moving = false;
            for(let option of options) {
                if(!option.move && moving) break;
                if(!option.move) continue;
                if(option.move) moving = true;
                const response = await axiosInstance.post('/moveEvaluationFormSubcategoryOption', {
                    id: option.id,
                    order: option.order
                }, { headers });
                if(response.data.status.toString().startsWith(4)) throw response;
            }
            reloadOptions();
        } catch(error) {
            console.error('Error saving subcategory:', error);
            Swal.fire({
                text: error.data?.message ?? 'Error saving subcategory',
                icon: "error",
                confirmButtonColor: '#177604',
                customClass: {
                    popup: 'swal-popup-overlay'
                }
            });
        }
    }

    function resetSubcategory() {
        setSubcategoryId();
        setSubcategoryName('');
        setSubcategoryDescription('');
        setSubcategoryType('');
        setOptions([]);
    }

    function saveSubcategory () {

        if(subcategoryType == 'linear_scale') for(let option of options)
            option.score = option.order;
        axiosInstance
            .post('/saveEvaluationFormSubcategory', {
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
            }, { headers })
            .then((response) => {
                if (response.data.status.toString().startsWith(2)) {
                    // Optionally update UI or trigger another action
                    const { evaluationFormSubcategoryID } = response.data;
                    if(!evaluationFormSubcategoryID) return;
                    setSubcategoryId(evaluationFormSubcategoryID);
                    const options = [];
                    for(let option of subcategory.options) options.push({ ...option });
                    setSavedSubcategory({ ...subcategory, options });
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

    function switchSubcategoryType(subcategoryType) {
        setSubcategoryType(subcategoryType);
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
    
    function deleteOption(option) {
        let index = options.indexOf(option);
        if(option.action === 'create') {
            options.splice(index, 1);
            index--;
        } else option.action = 'delete';
        index++;
        for(; index < options.length; index++) {
            option = options[index];
            option.order--;
            option.move = true;
        }
        setOptions([ ...options ]);
    }

    function editOption(option, params) {
        if('label' in params) option.label = params.label;
        if('description' in params) option.description = params.description;
        if('score' in params) option.score = params.score;
        if(option.action != 'create') option.action = 'update';
        reloadOptions();
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
        const moveUp = oldOrder < newOrder;
        for(
            let order = moveUp ? oldOrder + 1 : oldOrder - 1;
            moveUp ? (order <= newOrder) : (order >= newOrder);
            order += (moveUp ? 1 : -1) * 1
        ) {
            const option = options[order - 1];
            const newOrder = order + (moveUp ? -1 : 1);
            option.order = newOrder;
            option.move = true;
        }
        const option = options.splice(oldOrder - 1, 1)[0];
        option.order = newOrder;
        option.move = true;
        options.splice(newOrder - 1, 0, option);
        setOptions([...options]);
    }

    function reloadOptions() {
        setOptions([...options]);
    }

    function saveOption(label = '', score = '', description = '') {
        setOptions([
            ...options,
            {
                id: newOptionId,
                subcategory_id: subcategoryId,
                label, score, description,
                order: options.length + 1,
                action: 'create'
            }
        ]);
        setNewOptionId(newOptionId - 1);
    }

    return {
        subcategory, savedSubcategory,
        subcategoryId,
        subcategoryName, setSubcategoryName,
        subcategoryType, switchSubcategoryType,
        subcategoryTypeDisplay,
        subcategoryDescription, setSubcategoryDescription,
        cancelEditSubcategory, editSubcategory, resetSubcategory, saveSubcategory,
        required, toggleRequired,
        allowOtherOption, toggleAllowOtherOption,
        linearScaleStart, setLinearScaleStart,
        linearScaleEnd, setLinearScaleEnd,
        linearScaleStartLabel, setLinearScaleStartLabel,
        linearScaleEndLabel, setLinearScaleEndLabel,
        saved, setSaved,
        order,
        options, deleteOption, editOption, moveOption, reloadOptions, saveOption, setOptions,
        draggedOptionId, setDraggedOptionId
    };

}