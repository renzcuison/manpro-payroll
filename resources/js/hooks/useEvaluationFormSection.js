import axiosInstance, { getJWTHeader } from "../utils/axiosConfig";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export function useEvaluationFormSection(section) {

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [isNew, setIsNew] = useState(true);
    const [sectionId, setSectionId] = useState();
    const [sectionName, setSectionName] = useState('');
    const [editableSectionName, setEditableSectionName] = useState(false);
    const [sectionCategory, setSectionCategory] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [order, setOrder] = useState();
    const [draggedSubcategoryId, setDraggedSubcategoryId] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [expandedSubcategoryId, setExpandedSubcategoryId] = useState();

    useEffect(() => {
        if(!section) return;
        setIsNew(false);
        setSectionId(section.id);
        setSectionName(section.name);
        setSectionCategory(section.category);
        setOrder(section.order);
        setSubcategories(section.subcategories || []);
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
                            popup: 'swal-popup-overlay'
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

    function toggleEditableSection() {
        setEditableSectionName(!editableSectionName);
    }

    function toggleExpand() {
        setExpanded(!expanded);
    }

    // subcategory operations

    function upsertSubcategory(subcategory) {
        setSubcategories(prev => {
            const exists = prev.some(sc => sc.id === subcategory.id);
            if (exists) {
                return prev.map(sc => sc.id === subcategory.id ? subcategory : sc);
            } else {
                return [...prev, subcategory];
            }
        });
    }

    function getSubcategory(subcategoryId) {
        axiosInstance
            .get(`/getEvaluationFormSubcategory`, {
                headers, params: { id: subcategoryId }
            })
            .then((response) => {
                const { evaluationFormSubcategory } = response.data;
                if(!evaluationFormSubcategory) return;
                upsertSubcategory(evaluationFormSubcategory);
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
        if(!sectionCategory) {
            Swal.fire({
                text: "A category must first be made in this section",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        axiosInstance
            .post('/saveEvaluationFormSubcategory', {
                ...subcategory,
                section_id: sectionId,
                subcategory_type: subcategory.subcategory_type
            }, { headers })
            .then((response) => {
                if (response.data.status.toString().startsWith(2)) {
                    const subcat = response.data.evaluationFormSubcategory;
                    if(!subcat) {
                        // fallback: old style, fetch by ID
                        const { evaluationFormSubcategoryID } = response.data;
                        if(evaluationFormSubcategoryID) getSubcategory(evaluationFormSubcategoryID);
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
                console.error('Error saving subcategory:', error);
                Swal.fire({
                    text: "Error saving subcategory",
                    icon: "error",
                    confirmButtonColor: '#177604',
                });
            })
        ;
    }

    function deleteSubcategory(subcategoryId) {
        if (!subcategoryId) {
            Swal.fire("Error", "Invalid subcategory ID", "error");
            return;
        }
        Swal.fire({
            title: "Are you sure?",
            text: "This will delete the subcategory.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#aaa",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                axiosInstance.post('/deleteEvaluationFormSubcategory', { id: subcategoryId }, { headers })
                    .then(response => {
                        if (response.data.status && response.data.status.toString().startsWith("2")) {
                            setSubcategories(prev => prev.filter(sc => sc.id !== subcategoryId));
                            Swal.fire("Deleted!", "Subcategory has been deleted.", "success");
                        } else {
                            Swal.fire("Error", response.data.message || "Error deleting subcategory", "error");
                        }
                    })
                    .catch(error => {
                        Swal.fire("Error", "Error deleting subcategory", "error");
                    });
            }
        });
    }

    return {
        section: {
            id: sectionId,
            name: sectionName,
            category: sectionCategory,
            order,
            subcategories
        },
        sectionId,
        editSection,
        sectionName, setSectionName,
        editableSectionName, toggleEditableSection,
        sectionCategory, setSectionCategory,
        expanded, toggleExpand,
        order,
        subcategories, saveSubcategory, moveSubcategory, deleteSubcategory,
        expandedSubcategoryId, setExpandedSubcategoryId,
        draggedSubcategoryId, setDraggedSubcategoryId,
    };
}