import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export function useEvaluationForm(form) {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [formId, setFormId] = useState();
    const [formName, setFormName] = useState();
    const [creatorName, setCreatorName] = useState();
    const [createdDate, setCreatedDate] = useState();  
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        axiosInstance.get(`/getEvaluationForm`, { headers, params: form })
            .then((response) => {
                const { evaluationForm } = response.data;
                if(!evaluationForm) {
                    setNotFound(true);
                    return;
                };
                setFormId(evaluationForm.id);
                setFormName(evaluationForm.name);
                setCreatorName(evaluationForm.creator_user_name);
                setCreatedDate(evaluationForm.created_at);
                setSections(evaluationForm.sections);
            })
            .catch(error => {
                console.error('Error fetching form data:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [form.id, form.name]);

    function getSection(sectionId) {
        axiosInstance
            .get(`/getEvaluationFormSection`, {
                headers, params: { id: sectionId }
            })
            .then((response) => {
                const { evaluationFormSection } = response.data;
                if(!evaluationFormSection) return;
                setSections([...sections, evaluationFormSection]);
            })
            .catch(error => {
                console.error('Error fetching section data:', error);
            })
        ;
    }

    function moveSection(sectionId, order) {
        
    }

    function saveSection(section) {
        axiosInstance
            .post('/saveEvaluationFormSection', {
                ...section,
                form_id: formId
            }, { headers })
            .then((response) => {
                const { evaluationFormSectionID } = response.data;
                if(!evaluationFormSectionID ) return;
                getSection(evaluationFormSectionID);
            })
            .catch(error => {
                console.error('Error saving section:', error);
                Swal.fire({
                    text: "Error saving section",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
            })
        ;
    }

    function toggleDragging() {
        setDragging(!dragging);
    }

    return {
        creatorName, createdDate, dragging, formId, formName, loading, notFound,
        sections,
        moveSection, saveSection, toggleDragging
    };

}
