import {
    Box,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PerformanceEvaluationFormAddCategory from '../Modals/PerformanceEvaluationFormAddCategory';
import PerformanceEvaluationRating from './PerformanceEvaluationRating';
import PerformanceEvaludationAddSubcategory from '../Modals/PerformanceEvaludationAddSubcategory';
import Swal from 'sweetalert2';
import { useClickHandler } from '../../../../hooks/useClickHandler';
import { useEvaluationFormSection } from '../../../../hooks/useEvaluationFormSection';
import { useState } from 'react';

const PerformanceEvaluationFormSection = ({ section }) => {
    const {
        sectionId,
        sectionName, setSectionName,
        sectionCategory, setSectionCategory,
        expanded, toggleExpand,
        editable, toggleEditable,
        order,
        subcategories, saveSubcategory,
        editSection
    } = useEvaluationFormSection( section );
    const hasSubcategories = subcategories.length > 0;

    // Section handlers

    const [onSectionClick] = useClickHandler({
        onSingleClick: toggleExpand,
        onDoubleClick: toggleEditable
    });

    // Category modal state
    const [addCategoryOpen, setAddCategoryOpen] = useState(false);

    // Category modal handlers
    const handleOpenAddCategoryModal = () => {
        setAddCategoryOpen(true);
    };

    const handleCloseAddCategoryModal = () => {
        setAddCategoryOpen(false);
    };

    // Save category
    const handleSaveCategory = (sectionCategory) => {
        if (!sectionId || !sectionCategory) {
            Swal.fire({
                text: "Category Name are required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        editSection({ category: sectionCategory });
    };

    // Subcategory modal state
    const [addSubcategoryOpen, setAddSubcategoryOpen] = useState(false);

    // Subcategory modal handlers
    const handleOpenAddPerformanceEvaludationAddSubcategory = () => {
        setAddSubcategoryOpen(true);
    };

    const handleCloseAddPerformanceEvaludationAddSubcategory = () => {
        setAddSubcategoryOpen(false);
    };

    // Save Subcategory
    const handleSaveSubcategory = (subcategory) => {
        if (!subcategory.name) {
            Swal.fire({
                text: "Subcategory Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        saveSubcategory(subcategory);
    };
    
    return <>
        <Accordion
            expanded={expanded}
            onChange={onSectionClick}
            sx={{
                my: 2,
                boxShadow: 3,
                borderRadius: 2,
                '&:before': { display: 'none' },
                bgcolor: expanded === sectionId ? '#eab31a' : 'white',
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: expanded === sectionId ? 'white' : '#eab31a' }} />}
                aria-controls={`section-content-${sectionId}`}
                id={`section-header-${sectionId}`}
                sx={{
                    bgcolor: '#eab31a',
                    color: 'white',
                    borderRadius: 2,
                    fontWeight: 'bold',
                    fontSize: 18,
                    minHeight: 64,
                    '& .MuiAccordionSummary-content': { my: 1 },
                }}
            >
                {/* {sectionName} */}
                {
                    editable ? <TextField
                        autoFocus
                        label="Section Name"
                        fullWidth
                        variant="standard"
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                        onBlur={toggleEditable}
                        required
                        style={{
                            bgcolor: '#eab31a',
                            color: 'white',
                            borderRadius: 2,
                            fontWeight: 'bold',
                            fontSize: 18,
                            '& .MuiAccordionSummary-content': { my: 1 },
                        }}
                    /> : sectionName
                }
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: '#fafafa', borderRadius: 2 }}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 2 }}>

                    <Typography variant="h6" sx={{
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        color: '#444',
                        fontWeight: 'bold',
                        borderLeft: '8px solid #eab31a',
                        pl: 2,
                        bgcolor: '#f4f4f4',
                        borderRadius: 1,
                        minHeight: 48,
                    }}>
                        Categories
                    </Typography>
                    {
                        sectionCategory ? <>
                            <Paper
                                sx={{
                                    mb: 1,
                                    p: 2,
                                    bgcolor: "#fff8e1",
                                    borderLeft: "5px solid #eab31a",
                                    fontWeight: "bold"
                                }}
                                elevation={1}
                            >{ sectionCategory }</Paper>
                        </> : <>
                            <Typography variant="body2" sx={{ color: "#aaa", mb: 2 }}>
                                No category yet.
                            </Typography>
                        </>
                    }
                    {
                        hasSubcategories ? (
                            subcategories.map(subcategory=><PerformanceEvaluationRating
                                key={ subcategory.id }
                                subcategory={ subcategory }
                            />)
                        ) : undefined
                    }
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: '#177604',
                                color: 'white',
                                fontWeight: 'bold',
                                borderRadius: 1,
                                px: 4,
                                py: 1.5,
                                '&:hover': { bgcolor: '#0d5c27' }
                            }}
                            onClick={sectionCategory ? handleOpenAddPerformanceEvaludationAddSubcategory : handleOpenAddCategoryModal}
                        >{
                            sectionCategory ? <>ADD SUB-CATEGORY</> : <>ADD CATEGORY</>
                        }</Button>
                    </Box>
                </Paper>
            </AccordionDetails>
        </Accordion>
        <PerformanceEvaluationFormAddCategory
            open={addCategoryOpen}
            onClose={handleCloseAddCategoryModal}
            onSave={handleSaveCategory}
        />
        <PerformanceEvaludationAddSubcategory
            open={addSubcategoryOpen}
            onClose={handleCloseAddPerformanceEvaludationAddSubcategory}
            onSave={handleSaveSubcategory}
        />
    </>;
};

export default PerformanceEvaluationFormSection;
