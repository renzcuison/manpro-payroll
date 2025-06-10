import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export function useEvaluationResponse(responseId) {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [evaluationResponse, setEvaluationResponse] = useState({});
    const subcategories = evaluationResponse.form?.sections.reduce((subcategories, section) => {
        for(let subcategory of section.subcategories)
            subcategories[subcategory.id] = subcategory;
        return subcategories;
    }, {}) ?? [];

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
                    // put other subcategory type handling here
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

    // response percentage answer operations

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

    // response text answer operations

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
        evaluationResponse, subcategories,
        deleteEvaluationResponse, saveEvaluationResponse,
        savePercentageAnswer, setPercentageAnswer, setTextAnswer
    };

}
