import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import {
    getSubcategoryDbValue, getSubcategorySelectValue
} from "../utils/performance-evaluation-utils";
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

    function switchResponseType(responseType) {

        editSubcategory({ subcategory_type: getSubcategoryDbValue(responseType) });

    }

    function toggleRequired() {

        editSubcategory({ required: !required });

    }

    // option operations

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
        responseType: getSubcategorySelectValue(subcategoryType),
        subcategoryId, subcategoryName, subcategoryDescription, required,
        allowOtherOption, linearScaleStart, linearScaleEnd, order, options,
        editSubcategory, saveOption, switchResponseType, toggleRequired
    };

}
