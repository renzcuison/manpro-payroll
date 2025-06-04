import {
    Box,
    Typography,
    CardContent,
    Button,
    IconButton
} from '@mui/material';
import CheckUser from '../../Errors/Error404';
import { useParams } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import SettingsIcon from '@mui/icons-material/Settings';
import PerformanceEvaluationFormAddSection from './Modals/PerformanceEvaluationFormAddSection';
import PerformanceEvaluationFormSection from './Subsections/PerformanceEvaluationFormSection';
import Swal from 'sweetalert2';
import { useEvaluationForm } from '../../../hooks/useEvaluationForm';
import CloseIcon from '@mui/icons-material/Close'; 
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
const PerformanceEvaluationFormPage = () => {
    const { formName } = useParams();
    const {
        creatorName, createdDate, formId, loading, notFound, sections,
        moveSection, saveSection
    } = useEvaluationForm({ name: formName });
    const navigate = useNavigate();

    const [addSectionOpen, setAddSectionOpen] = useState(false);

    const handleSettings = () => {
        console.log("Settings clicked!");
    };

    const handleOpenAddSectionModal = () => {
        setAddSectionOpen(true);
    };

    const handleCloseAddSectionModal = () => {
        setAddSectionOpen(false);
    };

    const handleSaveSection = (sectionName) => {
        if (!sectionName) {
            Swal.fire({
                text: "Section Name is required!",
                icon: "error",
                confirmButtonColor: '#177604',
            });
            return;
        }
        saveSection(sectionName);
    };

    if(notFound) return <CheckUser />;

    return (
        <Layout title="Performance Evaluation Form">
            <Box sx={{ mt: 5, p: 3, bgcolor: 'white', borderRadius: '8px', position: 'relative', maxWidth: '1000px', mx: 'auto', boxShadow: 3 }}>
                <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                        position: 'absolute',
                        top: 25,
                        right: 30,
                        border: '1px solid #BEBEBE',
                        borderRadius: '50%',
                        padding: '5px',
                        color: '#BEBEBE',
                    }}
                >
                    <CloseIcon sx={{ fontSize: '1.2rem' }} /> {/* Adjust the size here */}
                </IconButton>

                {loading ? (
                    <Typography variant="h6">Loading...</Typography>
                ) : (
                    <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'left', mb: 2 }}>
                            {formName}
                        </Typography>
                        <Typography variant="body1" sx={{ textAlign: 'left', color: '#777', mb: 1 }}>
                            Created by: {creatorName || 'N/A'}
                        </Typography>
                        <Typography variant="body1" sx={{ textAlign: 'left', color: '#777' }}>
                            Date Created: {createdDate ? new Date(createdDate).toLocaleString() : 'N/A'}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {sections.map(section => <PerformanceEvaluationFormSection
                                key={ section.id }
                                section={ section }
                            />)}
                        </Box>
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenAddSectionModal}
                                sx={{
                                    bgcolor: '#177604',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    px: 4,
                                    py: 1.5,
                                    '&:hover': { bgcolor: '#0d5c27' }
                                }}
                            >
                                Add Section
                            </Button>
                        </Box>
                    </CardContent>
                )}
                <PerformanceEvaluationFormAddSection
                    open={addSectionOpen}
                    onClose={handleCloseAddSectionModal}
                    onSave={handleSaveSection}
                />
            </Box>
        </Layout>
    );
};

export default PerformanceEvaluationFormPage;
