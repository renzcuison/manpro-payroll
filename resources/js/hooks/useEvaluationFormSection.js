import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import { getSubcategoryDbValue } from "../utils/performance-evaluation-utils";
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
    const [subcategories, setSubcategories] = useState([]);

    useEffect(() => {
        setSectionId(section.id);
        setSectionName(section.name);
        setOrder(section.order);
        setCategories(section.categories);
        setSubcategories(
            section.categories.reduce(
                (array, category) => [...array, ...category.subcategories],
                []
            )
        );
    }, [section.id]);

    // category operations

    function getCategory(categoryId) {
        axiosInstance
            .get(`/getEvaluationFormCategory`, {
                headers, params: { id: categoryId }
            })
            .then((response) => {
                const { evaluationFormCategory } = response.data;
                if(!evaluationFormCategory) return;
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
                if(!evaluationFormCategoryID) return;
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

    // subcategory operations

    function getSubcategory(subcategoryId) {
        axiosInstance
            .get(`/getEvaluationFormSubcategory`, {
                headers, params: { id: subcategoryId }
            })
            .then((response) => {
                const { evaluationFormSubcategory } = response.data;
                if(!evaluationFormSubcategory) return;
                setSubcategories([...subcategories, evaluationFormSubcategory]);
            })
            .catch(error => {
                console.error('Error fetching subcategory data:', error);
            })
    }

    function saveSubcategory(subcategory) {
        if(!categories[0]) Swal.fire({
            text: "A category must first be made in this section",
            icon: "error",
            confirmButtonColor: '#177604',
        });
        axiosInstance
            .post('/saveEvaluationFormSubcategory', {
                ...subcategory,
                subcategory_type: getSubcategoryDbValue(subcategory.subcategoryType),
                category_id: categories[0].id,
            }, { headers })
            .then((response) => {
                const { evaluationFormSubcategoryID } = response.data;
                if(!evaluationFormSubcategoryID) return;
                getSubcategory(evaluationFormSubcategoryID);
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

    // showing and hiding section

    function toggle() {
        setExpanded(!expanded);
    }

    return {
        sectionId, sectionName, expanded, order, categories, subcategories,
        saveCategory, saveSubcategory, toggle
    };

}
