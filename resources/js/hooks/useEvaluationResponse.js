import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export function useEvaluationResponse(responseId) {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [evaluationResponse, setEvaluationResponse] = useState({});
    const subcategories = evaluationResponse.form?.sections.reduce((subcategories, section) => {
        for(let subcategory of section.subcategories) subcategories[subcategory.id] = subcategory;
        return subcategories;
    }, {}) ?? {};
    const options = Object.keys(subcategories).reduce((options, subcategoryId) => {
        const subcategory = subcategories[subcategoryId];
        for(let option of subcategory.options) options[option.id] = option;
        return options;
    }, {});

    useEffect(() => {
        getEvaluationResponse();
    }, [responseId]);

    // response operations

    async function deleteEvaluationResponse() {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "This will permanently delete the evaluation response.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#aaa",
                confirmButtonText: "Yes, delete it!"
            });

            if (!result.isConfirmed) return;

            const response = await axiosInstance.post(
                '/deleteEvaluationResponse',
                { id: responseId },
                { headers }
            );
            if (response.data.status && response.data.status.toString().startsWith("2")) {
                Swal.fire("Deleted!", "Evaluation response has been deleted.", "success");
                return true;
            } else {
                Swal.fire("Error", response.data.message || "Error deleting evaluation response", "error");
                return false;
            }
        } catch (error) {
            Swal.fire("Error", "Error deleting evaluation response", "error");
            return false;
        }
    }

    function getEvaluationResponse() {
        axiosInstance
            .get(`/getEvaluationResponse`, {
                headers, params: { id: responseId }
            })
            .then((response) => {
                const { evaluationResponse } = response.data;
                if(!evaluationResponse) return;
                setEvaluationResponse(evaluationResponse);
            })
            .catch(error => {
                console.error('Error fetching response data:', error);
            });
    }

    function reloadEvaluationResponse() {
        setEvaluationResponse({...evaluationResponse});
    }

    async function saveEvaluationResponse() {
        try {
            for(let subcategory_id in subcategories) {
                const subcategory = subcategories[subcategory_id];
                switch(subcategory.subcategory_type) {
                    case 'checkbox':
                    case 'multiple_choice':
                        for(let { option_answer } of subcategory.options) {
                            if(!option_answer) continue;
                            await saveOptionAnswer( option_answer );
                        }
                        break;
                    case 'long_answer':
                    case 'short_answer':
                        const { text_answer } = subcategory;
                        if(!text_answer) break;
                        await saveTextAnswer(text_answer);
                        break;
                    case 'linear_scale':
                        const { percentage_answer } = subcategory;
                        if(!percentage_answer) break;
                        await savePercentageAnswer(percentage_answer);
                        break;
                }
            }
            reloadEvaluationResponse();
        } catch(e) {
            Swal.fire({
                text: e.data.message,
                icon: "error",
                confirmButtonColor: '#177604',
                customClass: {
                    popup: 'swal-popup-overlay'
                }
            });
        }
    }

    // option answer operations

    function deleteOptionAnswers(subcategoryId) {
        const subcategory = subcategories[subcategoryId];
        for(let { id: optionId } of subcategory.options)
            deleteOptionAnswer(optionId);
    }

    function deleteOptionAnswer(optionId) {
        const option = options[optionId];
        switch(option.option_answer.action) {
            case 'create':
                delete option.option_answer;
                break;
            default:
                option.option_answer.action = 'delete';
        }
    }

    function findActiveOptionId(subcategoryId) {
        const subcategory = subcategories[subcategoryId];
        for(let { id: optionId, option_answer } of subcategory.options)
            if(option_answer) return optionId;
        return undefined;
    }

    function findDeletedOptionId(subcategoryId) {
        const subcategory = subcategories[subcategoryId];
        for(let { id: optionId, option_answer: { action } } of subcategory.options)
            if(action === 'delete') return optionId;
        return undefined;
    }

    async function saveOptionAnswer(option_answer) {
        let response;
        switch(option_answer.action) {
            case 'create':
                response = await axiosInstance.post(
                    '/saveEvaluationOptionAnswer', option_answer, { headers }
                );
                if(!response.data.status.toString().startsWith(2)) throw response;
                break;
            case 'update':
                response = await axiosInstance.post(
                    '/editEvaluationOptionAnswer', option_answer, { headers }
                );
                if(!response.data.status.toString().startsWith(2)) throw response;
                break;
            case 'delete':
                response = await axiosInstance.post(
                    '/deleteEvaluationOptionAnswer', option_answer, { headers }
                );
                if(!response.data.status.toString().startsWith(2)) throw response;
                break;
        }
    }

    function setOptionAnswer(optionId) {
        const option = options[optionId];
        const subcategoryId = option.subcategory_id;
        const subcategory = subcategories[subcategoryId];
        switch(subcategory.subcategory_type) {
            case 'checkbox':
                // if(optionId === undefined) return;
                // const deletedOptionId = findDeletedOptionId(subcategoryId);
                // if(deletedOptionId == undefined)
                //     option.option_answer = {
                //         response_id: evaluationResponse.id,
                //         option_id: optionId,
                //         action: 'create'
                //     }
                // else if(options[optionId].option_answer.action === 'create') {
                //     const optionAnswer = options[activeOptionId].option_answer;
                //     optionAnswer.option_id = optionId;
                // }
                break;
            case 'multiple_choice':
                const activeOptionId = findActiveOptionId(subcategoryId);
                if(optionId == undefined) {
                    if(activeOptionId == undefined) deleteOptionAnswer(activeOptionId);
                } else if(activeOptionId === undefined)
                    option.option_answer = {
                        response_id: evaluationResponse.id,
                        option_id: optionId,
                        action: 'create'
                    }
                else if(options[activeOptionId].option_answer.action === 'create') {
                    const optionAnswer = options[activeOptionId].option_answer;
                    optionAnswer.option_id = optionId;
                    options[optionId].option_answer = optionAnswer;
                    delete options[activeOptionId].option_answer;
                } else {
                    const optionAnswer = options[activeOptionId].option_answer;
                    optionAnswer.option_id = optionId;
                    options[optionId].option_answer = optionAnswer;
                    delete options[activeOptionId].option_answer;
                    if(optionId != optionAnswer.old_option_id) {
                        optionAnswer.action = 'update';
                        optionAnswer.old_option_id = activeOptionId;
                    } else {
                        delete optionAnswer.action;
                        delete optionAnswer.old_option_id;
                    }
                }
        }
        reloadEvaluationResponse();
    }

    // percentage answer operations

    async function savePercentageAnswer(percentage_answer) {
        let response;
        delete percentage_answer.percentage;
        switch(percentage_answer.action) {
            case 'create':
                response = await axiosInstance.post(
                    '/saveEvaluationPercentageAnswer', percentage_answer, { headers }
                );
                if(!response.data.status.toString().startsWith(2)) throw response;
                break;
            case 'update':
                response = await axiosInstance.post(
                    '/editEvaluationPercentageAnswer', percentage_answer, { headers }
                );
                if(!response.data.status.toString().startsWith(2)) throw response;
                break;
            case 'delete':
                response = await axiosInstance.post(
                    '/deleteEvaluationPercentageAnswer', percentage_answer, { headers }
                );
                if(!response.data.status.toString().startsWith(2)) throw response;
                break;
        }
    }

    function setPercentageAnswer(subcategoryId, value) {
        const subcategory = subcategories[subcategoryId];
        if(!subcategory.percentage_answer && value != null) subcategory.percentage_answer = {
                response_id: evaluationResponse.id,
                subcategory_id: subcategoryId,
                value,
                action: 'create'
            }
        else if(subcategory.percentage_answer?.action === 'create' && value != null)
            subcategory.percentage_answer.value = value;
        else if(subcategory.percentage_answer?.action === 'create' && value == null)
            subcategory.percentage_answer = null;
        else if(subcategory.percentage_answer && value != null) {
            subcategory.percentage_answer.value = value;
            subcategory.percentage_answer.action = 'update';
        }
        else if(subcategory.percentage_answer && value == null) {
            subcategory.percentage_answer.value = null;
            subcategory.percentage_answer.action = 'delete';
        }
        reloadEvaluationResponse();
    }

    // text answer operations

    async function saveTextAnswer(text_answer) {
        let response;
        switch(text_answer.action) {
            case 'create':
                response = await axiosInstance.post(
                    '/saveEvaluationTextAnswer', text_answer, { headers }
                );
                if(!response.data.status.toString().startsWith(2)) throw response;
                break;
            case 'update':
                response = await axiosInstance.post(
                    '/editEvaluationTextAnswer', text_answer, { headers }
                );
                if(!response.data.status.toString().startsWith(2)) throw response;
                break;
            case 'delete':
                response = await axiosInstance.post(
                    '/deleteEvaluationTextAnswer', text_answer, { headers }
                );
                if(!response.data.status.toString().startsWith(2)) throw response;
                break;
        }
    }

    function setTextAnswer(subcategoryId, answer) {
        const subcategory = subcategories[subcategoryId];
        if(!subcategory.text_answer && answer) subcategory.text_answer = {
                response_id: evaluationResponse.id,
                subcategory_id: subcategoryId,
                answer,
                action: 'create'
            }
        else if(subcategory.text_answer?.action === 'create' && answer)
            subcategory.text_answer.answer = answer;
        else if(subcategory.text_answer?.action === 'create' && !answer)
            subcategory.text_answer = null;
        else if(subcategory.text_answer && answer) {
            subcategory.text_answer.answer = answer;
            subcategory.text_answer.action = 'update';
        }
        else if(subcategory.text_answer && !answer) {
            subcategory.text_answer.answer = null;
            subcategory.text_answer.action = 'delete';
        }
        reloadEvaluationResponse();
    }

    return {
        evaluationResponse, options, subcategories,
        deleteEvaluationResponse, saveEvaluationResponse,
        setPercentageAnswer, setTextAnswer,
        deleteOptionAnswer, deleteOptionAnswers, setOptionAnswer
    };

}
