import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export function useEvaluationResponse(responseId) {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [evaluationResponse, setEvaluationResponse] = useState({});
    const [evaluatorId, setEvaluatorId] = useState();
    const [formId, setFormId] = useState();
    const [periodStartAt, setPeriodStartAt] = useState('');
    const [periodStartEnd, setPeriodStartEnd] = useState('');
    const [signatureFilePaths, setSignatureFilePaths] = useState({});
    const subcategories = evaluationResponse.form?.sections.reduce((subcategories, section) => {
        for(let subcategory of section.subcategories) subcategories[subcategory.id] = subcategory;
        return subcategories;
    }, {}) ?? {};
    const options = Object.keys(subcategories).reduce((options, subcategoryId) => {
        const subcategory = subcategories[subcategoryId];
        for(let option of subcategory.options) options[option.id] = option;
        return options;
    }, {});
    const evaluateeSignatureFilePath = signatureFilePaths[evaluationResponse?.evaluatee_id];
    const creatorSignatureFilePath = signatureFilePaths[evaluationResponse?.creator_id];

    useEffect(() => {
        if(responseId == undefined) return;
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
                const {
                    evaluatee_id, creator_id, evaluatee_signature, creator_signature,
                    commentors, evaluators
                } = evaluationResponse;
                const userId = JSON.parse(storedUser).id;
                if(evaluatee_signature) loadSignatureFilePath(evaluatee_id, evaluatee_signature);
                if(creator_signature) loadSignatureFilePath(creator_id, creator_signature);
                for(let { commentor_id, commentor_signature } of commentors)
                    if(commentor_signature) loadSignatureFilePath(commentor_id, commentor_signature);
                for(let { evaluator_id, evaluator_signature } of evaluators) {
                    if(evaluator_signature) loadSignatureFilePath(evaluator_id, evaluator_signature);
                    if(evaluator_id === userId) setEvaluatorId(evaluator_id);
                }
                setEvaluationResponse(evaluationResponse);
            })
            .catch(error => {
                console.error('Error fetching response data:', error);
            });
    }

    function loadSignatureFilePath(userId, filePath) {
        const byteCharacters = window.atob(filePath);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++)
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        if (filePath && filePath.startsWith('blob:')) URL.revokeObjectURL(filePath);
        signatureFilePaths[userId] = URL.createObjectURL(blob);
        setSignatureFilePaths({ ...signatureFilePaths });
    }

    function reloadEvaluationResponse() {
        setEvaluationResponse({...evaluationResponse});
    }

    async function editEvaluationResponse() {
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
                text: e.data?.message || 'Error saving evaluation response',
                icon: "error",
                confirmButtonColor: '#177604',
                customClass: {
                    popup: 'swal-popup-overlay'
                }
            });
            console.error("Error saving evaluation response: ", e);
        }
    }

    async function saveEvaluationResponse() {
        axiosInstance
            .post('/saveEvaluationResponse', {
                ...evaluationResponse
            }, { headers })
            .then((response) => {
                if (response.data.status.toString().startsWith(2)) {
                    const subcat = response.data.evaluationFormSubcategory;
                    if(!subcat) {
                        // get id from here
                        return;
                    }
                    upsertSubcategory(subcat);
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
                console.error('Error saving form response:', error);
                Swal.fire({
                    text: "Error saving form response",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
            })
        ;
    }

    // option answer operations

    function deleteOptionAnswers(subcategoryId) {
        const subcategory = subcategories[subcategoryId];
        for(let { id: optionId } of subcategory.options)
            deleteOptionAnswer(optionId);
    }

    function deleteOptionAnswer(optionId) {
        const option = options[optionId];
        if(option.option_answer?.action === 'create') {
            option.option_answer = null;
            return;
        }
        const subcategoryId = option.subcategory_id;
        const subcategory = subcategories[subcategoryId];
        switch(subcategory.subcategory_type) {
            case 'checkbox': {
                const newOptionId = findNewOptionId(subcategoryId);
                if(newOptionId != null) {
                    const optionAnswer = options[newOptionId].option_answer;
                    optionAnswer.old_option_id = optionId;
                    optionAnswer.action = 'update';
                    option.option_answer = null;
                } else option.option_answer.action = 'delete';
                break;
            }
            case 'multiple_choice':
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
        for(let { id: optionId, option_answer } of subcategory.options)
            if(option_answer?.action === 'delete') return optionId;
        return undefined;
    }

    function findNewOptionId(subcategoryId) {
        const subcategory = subcategories[subcategoryId];
        for(let { id: optionId, option_answer } of subcategory.options)
            if(option_answer?.action === 'create') return optionId;
        return undefined;
    }

    function findRecordedOptionId(optionId) {
        const option = options[optionId];
        const subcategoryId = option.subcategory_id;
        const subcategory = subcategories[subcategoryId];
        for(let { id: optionIdCompare, option_answer } of subcategory.options)
            if(option_answer && option_answer.old_option_id == optionId) return optionIdCompare;
        return undefined;
    }

    function getMultipleChoiceOptionId(subcategoryId) {
        const subcategory = subcategories[subcategoryId];
        for(let { id: optionId, option_answer } of subcategory.options)
            if(option_answer && option_answer.action != 'delete') return optionId;
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
                    '/editEvaluationOptionAnswer', {
                        ...option_answer,
                        option_id: option_answer.old_option_id,
                        new_option_id: option_answer.option_id
                    }, { headers }
                );
                if(!response.data.status.toString().startsWith(2)) throw response;
                break;
            case 'delete':
                response = await axiosInstance.post(
                    '/deleteEvaluationOptionAnswer', {
                        ...option_answer,
                        option_id: option_answer.old_option_id ?? option_answer.option_id
                    }, { headers }
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
            case 'checkbox': {
                if(optionId === undefined) return;
                if(options[optionId].option_answer) {
                    const optionAnswer = options[optionId].option_answer;
                    if(optionAnswer.action == 'delete')
                        delete optionAnswer.action;
                    else
                        deleteOptionAnswer(optionId);
                    break;
                }
                const recordedOptionId = findRecordedOptionId(optionId);
                if(recordedOptionId != undefined) {
                    const optionAnswer = options[recordedOptionId].option_answer;
                    options[recordedOptionId].option_answer = {
                        response_id: evaluationResponse.id,
                        option_id: optionAnswer.option_id,
                        action: 'create'
                    }
                    optionAnswer.option_id = optionId;
                    options[optionId].option_answer = optionAnswer;
                    delete optionAnswer.old_option_id;
                    delete optionAnswer.action;
                    break;
                }
                const deletedOptionId = findDeletedOptionId(subcategoryId);
                if(deletedOptionId != undefined) {
                    const optionAnswer = options[deletedOptionId].option_answer;
                    optionAnswer.option_id = optionId;
                    options[optionId].option_answer = optionAnswer;
                    delete options[deletedOptionId].option_answer;
                    if(optionId != optionAnswer.old_option_id) {
                        optionAnswer.action = 'update';
                        optionAnswer.old_option_id = deletedOptionId;
                    } else {
                        delete optionAnswer.action;
                        delete optionAnswer.old_option_id;
                    }
                    break;
                }
                options[optionId].option_answer = {
                    response_id: evaluationResponse.id,
                    option_id: optionId,
                    action: 'create'
                };
                break;
            }
            case 'multiple_choice': {
                const activeOptionId = findActiveOptionId(subcategoryId);
                if(optionId == undefined) {
                    if(activeOptionId !== undefined) deleteOptionAnswer(activeOptionId);
                } else if(activeOptionId === undefined)
                    option.option_answer = {
                        response_id: evaluationResponse.id,
                        option_id: optionId,
                        action: 'create'
                    };
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

    // For saving comment and signature for the commentor - Khim
    async function editEvaluationCommentor({ response_id, comment, signature_filepath }) {
        try {
            const payload = new FormData();
            payload.append('response_id', response_id);
            if (comment !== undefined) payload.append('comment', comment);
            if (signature_filepath !== undefined) payload.append('signature_filepath', signature_filepath);
            const response = await axiosInstance.post(
                '/editEvaluationCommentor',
                payload,
                { headers }
            );

            if (
                (response.status && String(response.status).startsWith('2')) ||
                (response.data && response.data.status && String(response.data.status).startsWith('2'))
            ) {
                return response.data.evaluationCommentor;
            } else {
                throw new Error(response.data?.message || 'Failed to save comment.');
            }
        } catch (error) {
            throw new Error(
                error?.response?.data?.message ||
                error.message ||
                'Failed to save comment!'
            );
        }
    }

    // For saving comment and signature for the evaluator - Khim
    async function editEvaluationEvaluator({ response_id, evaluator_id, comment, signature_filepath }) {
        try {
            const payload = new FormData();
            payload.append('response_id', response_id);
            if (comment !== undefined) payload.append('comment', comment);
            if (signature_filepath !== undefined) payload.append('signature_filepath', signature_filepath);
            const response = await axiosInstance.post(
                '/editEvaluationEvaluator',
                payload,
                { headers }
            );

            if (
                (response.status && String(response.status).startsWith('2')) ||
                (response.data && response.data.status && String(response.data.status).startsWith('2'))
            ) {
                return response.data.evaluationEvaluator;
            } else {
                throw new Error(response.data?.message || 'Failed to save comment.');
            }
        } catch (error) {
            throw new Error(
                error?.response?.data?.message ||
                error.message ||
                'Failed to save comment!'
            );
        }
    }

    // For saving evaluatee/creator signature
    async function editEvaluationSignature({ response_id, creator_signature_filepath, evaluatee_signature_filepath }) {
        try {
            const payload = new FormData();
            payload.set('id', response_id);
            if (creator_signature_filepath !== undefined)
                payload.set('creator_signature_filepath', creator_signature_filepath);
            if (evaluatee_signature_filepath !== undefined)
                payload.set('evaluatee_signature_filepath', evaluatee_signature_filepath);

            const response = await axiosInstance.post(
                '/editEvaluationResponse',
                payload,
                { headers }
            );

            if (
                (response.status && String(response.status).startsWith('2')) ||
                (response.data && response.data.status && String(response.data.status).startsWith('2'))
            ) {
                getEvaluationResponse();
                return response.data.evaluationResponse;
            } else {
                throw new Error(response.data?.message || 'Failed to save signature.');
            }
        } catch (error) {
            throw new Error(
                error?.response?.data?.message ||
                error.message ||
                'Failed to save signature!'
            );
        }
    }

    return {
        creatorSignatureFilePath, evaluateeSignatureFilePath,
        evaluationResponse, evaluatorId, signatureFilePaths,
        options, subcategories,
        deleteEvaluationResponse, editEvaluationResponse,
        setPercentageAnswer, setTextAnswer,
        deleteOptionAnswer, deleteOptionAnswers, findActiveOptionId, setOptionAnswer,
        getMultipleChoiceOptionId,
        editEvaluationCommentor, editEvaluationEvaluator, editEvaluationSignature,
        reloadEvaluationResponse
    };
}