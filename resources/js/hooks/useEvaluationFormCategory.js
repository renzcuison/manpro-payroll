import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import { getSubcategoryDbValue } from "../utils/performance-evaluation-utils";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export function useEvaluationFormCategory(category) {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [categoryId, setCategoryId] = useState();
    const [categoryName, setCategoryName] = useState();
    const [order, setOrder] = useState();
    const [subcategories, setSubcategories] = useState([]);

    useEffect(() => {
        setCategoryId(category.id);
        setCategoryName(category.name);
        setOrder(category.order);
        setSubcategories(category.subcategories);
    }, [category.id]);

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

    function saveSubcategory( {
        name, description, subcategoryType, linearScaleStart, linearScaleEnd,
        required
    } ) {
        axiosInstance
            .post('/saveEvaluationFormSubcategory', {
                category_id: categoryId,
                name, description,
                subcategory_type: getSubcategoryDbValue(subcategoryType),
                linear_scale_start: linearScaleStart,
                linear_scale_end: linearScaleEnd,
                required
            }, { headers })
            .then((response) => {
                const { evaluationFormSubcategoryID } = response.data;
                if(!evaluationFormSubcategoryID ) return;
                getSubcategory(evaluationFormSubcategoryID);
            })
            .catch(error => {
                console.error('Error saving subcategory:', error);
                Swal.fire({
                    text: "Error saving category",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
            })
        ;
    }

    return {
        categoryId, categoryName, order, subcategories,
        saveSubcategory
    };

}
