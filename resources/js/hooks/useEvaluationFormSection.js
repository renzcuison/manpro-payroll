import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export function useEvaluationFormSection(section) {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [sectionId, setSectionId] = useState();
    const [sectionName, setSectionName] = useState();
    const [expanded, setExpanded] = useState(false);
    const [order, setOrder] = useState();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        setSectionId(section.id);
        setSectionName(section.name);
        setOrder(section.order);
        setCategories(section.categories);
    }, [section]);

    function getCategory(categoryId) {
        axiosInstance
            .get(`/getEvaluationFormCategory`, {
                headers, params: { id: categoryId }
            })
            .then((response) => {
                const { evaluationFormCategory } = response.data;
                console.log( evaluationFormCategory )
                if(!evaluationFormCategory ) return;
                setCategories([...categories, evaluationFormCategory]);
            })
            .catch(error => {
                console.error('Error fetching category data:', error);
            })
    }

    function saveCategory(categoryName) {
        axiosInstance
            .post('/saveEvaluationFormCategory', {
                section_id: sectionId,
                name: categoryName
            }, { headers })
            .then((response) => {
                const { evaluationFormCategoryID } = response.data;
                if(!evaluationFormCategoryID ) return;
                getCategory(evaluationFormCategoryID);
            })
            .catch(error => {
                console.error('Error saving category:', error);
                Swal.fire({
                    text: "Error saving category",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
            })
        ;
    }

    function toggle() {
        setExpanded(!expanded);
    }

    return {
        sectionId, sectionName, expanded, order, categories,
        saveCategory, toggle
    };

}
