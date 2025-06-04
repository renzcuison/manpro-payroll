import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import { getSubcategoryDbValue } from "../utils/performance-evaluation-utils";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { result } from "lodash";

export function useEvaluationFormSection(section) {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [isNew, setIsNew] = useState(true);
    const [sectionId, setSectionId] = useState();
    const [sectionName, setSectionName] = useState();
    const [editableSectionName, setEditableSectionName] = useState(false);
    const [sectionCategory, setSectionCategory] = useState();
    const [editableCategory, setEditableCategory] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [order, setOrder] = useState();
    const [subcategories, setSubcategories] = useState([]);

    useEffect(() => {
        if(!section) return;
        setIsNew(false);
        setSectionId(section.id);
        setSectionName(section.name);
        setSectionCategory(section.category);
        setOrder(section.order);
        setSubcategories(section.subcategories);
    }, [section?.id]);

    // section operations

    async function editSection(section, inputRef) {
        return axiosInstance
            .post('/editEvaluationFormSection', {
                ...section,
                id: sectionId
            }, { headers })
            .then((response) => {
                if (response.data.status.toString().startsWith(2)) {
                    const { evaluationFormSection } = response.data;
                    if(!evaluationFormSection) return;
                    setSectionName(evaluationFormSection.name);
                    setSectionCategory(evaluationFormSection.category);
                    setOrder(evaluationFormSection.order);
                } else if (response.data.status.toString().startsWith(4)) {
                    Swal.fire({
                        text: response.data.message,
                        icon: "error",
                        confirmButtonColor: '#177604',
                        customClass: {
                            popup: 'swal-popup-overlay' // Custom class to ensure overlay
                        }
                    }).then(result => {
                        if(!result.isConfirmed) return;
                        if(!inputRef || !inputRef.current) return;
                        inputRef.current.querySelector('input').focus();
                    });
                }
                return response;
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

    function toggleEditableCategory() {
        setEditableCategory(!editableCategory);
    }

    function toggleEditableSection() {
        setEditableSectionName(!editableSectionName);
    }

    function toggleExpand() {
        setExpanded(!expanded);
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

    function moveSubcategory(oldOrder, newOrder) {
        if(oldOrder === newOrder) return;
        axiosInstance
            .post('/moveEvaluationFormSubcategory', {
                id: subcategories[oldOrder - 1].id,
                order: newOrder
            }, { headers })
            .catch(error => {
                console.error('Error moving subcategory: ', error);
                setSubcategories([...subcategories]);
            })
        ;
        const moveUp = oldOrder < newOrder;
        for(
            let order = moveUp ? oldOrder + 1 : oldOrder - 1;
            moveUp ? (order <= newOrder) : (order >= newOrder);
            order += (moveUp ? 1 : -1) * 1
        ) subcategories[order - 1].order = order + (moveUp ? -1 : 1);
        const removed = subcategories.splice(oldOrder - 1, 1)[0];
        removed.order = newOrder;
        subcategories.splice(newOrder - 1, 0, removed);
        setSubcategories([...subcategories]);
    }

    function saveSubcategory(subcategory) {
        if(!sectionCategory) Swal.fire({
            text: "A category must first be made in this section",
            icon: "error",
            confirmButtonColor: '#177604',
        });
        axiosInstance
            .post('/saveEvaluationFormSubcategory', {
                ...subcategory,
                section_id: sectionId,
                subcategory_type: getSubcategoryDbValue(subcategory.subcategory_type)
            }, { headers })
            .then((response) => {
                if (response.data.status.toString().startsWith(2)) {
                    const { evaluationFormSubcategoryID } = response.data;
                    if(!evaluationFormSubcategoryID) return;
                    getSubcategory(evaluationFormSubcategoryID);
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

    return {
        section: {
            id: sectionId,
            name: sectionName,
            category: sectionCategory,
            order,
            subcategories
        }, editSection,
        sectionId,
        sectionName, setSectionName,
        editableSectionName, toggleEditableSection,
        sectionCategory, setSectionCategory,
        editableCategory, toggleEditableCategory,
        expanded, toggleExpand,
        order,
        subcategories, moveSubcategory, saveSubcategory
    };

}
