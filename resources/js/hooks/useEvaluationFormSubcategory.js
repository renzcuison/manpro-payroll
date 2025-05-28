import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import { getSubcategorySelectValue } from "../utils/performance-evaluation-utils";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export function useEvaluationFormSubcategory(subcategory) {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [subcategoryId, setSubcategoryId] = useState();
    const [subcategoryName, setSubcategoryName] = useState();
    const [subcategoryType, setSubcategoryType] = useState();
    const [subcategoryDescription, setSubcategoryDescription] = useState();
    const [required, setRequired] = useState();
    const [allowOtherOption, setAllowOtherOption] = useState();
    const [linearScaleStart, setLinearScaleStart] = useState();
    const [linearScaleEnd, setLinearScaleEnd] = useState();
    const [order, setOrder] = useState();
    const [options, setOptions] = useState([]);

    useEffect(() => {
        setSubcategoryId(subcategory.id);
        setSubcategoryName(subcategory.name);
        setSubcategoryType(subcategory.subcategory_type);
        setSubcategoryDescription(subcategory.description);
        setRequired(subcategory.required);
        setAllowOtherOption(subcategory.allow_other_option);
        setLinearScaleStart(subcategory.linear_scale_start);
        setLinearScaleEnd(subcategory.linear_scale_end);
        setOrder(subcategory.order);
        setOptions(subcategory.options);
    }, [subcategory.id]);

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

    function saveOption({ name }) {
        axiosInstance
            .post('/saveEvaluationFormSubcategoryOption', {
                subcategory_id: subcategoryId, name
            }, { headers })
            .then((response) => {
                const { evaluationFormSubcategoryOptionID } = response.data;
                if(!evaluationFormSubcategoryOptionID ) return;
                getOption(evaluationFormSubcategoryOptionID);
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

    function toggleRequired() {

        // edit later + saving in database

    }

    return {
        responseType: getSubcategorySelectValue(subcategoryType),
        subcategoryId, subcategoryName, subcategoryDescription, required,
        allowOtherOption, linearScaleStart, linearScaleEnd, order, options,
        saveOption, toggleRequired
    };

}
