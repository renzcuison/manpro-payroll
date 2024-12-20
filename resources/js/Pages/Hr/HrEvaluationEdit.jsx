import React, { useEffect, useState } from 'react'
import { Box, Button, Typography, CircularProgress, Card, CardContent, Menu, MenuItem, Accordion, AccordionSummary, AccordionDetails, } from '@mui/material';
import Layout from '../../components/Layout/Layout'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import moment from 'moment';
import { useLocation, useNavigate, Link, useSearchParams, useParams } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import Swal from "sweetalert2";
import EvaluationCategoryAddModal from '../../components/Modals/EvaluationCategoryAddModal';
import EvaluationSetRatingsModal from '../../components/Modals/EvaluationSetRatingsModal';
import EvaluationEditModal from '../../components/Modals/EvaluationEditModal';

import EvaluationIndicatorAddModal from '../../components/Modals/EvaluationIndicatorAddModal';
import EvaluationIndicatorEditModal from '../../components/Modals/EvaluationIndicatorEditModal';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const HrEvaluationEdit = () => {
    const { id } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [evaluationCategoryAddModalOpen, setEvaluationCategoryAddModalOpen] = useState(false)
    const [evaluationSetRatingsModal, setEvaluationSetRatingsModal] = useState(false)
    const [evaluationIndicatorAddModal, setEvaluationIndicatorAddModal] = useState(false)
    const [evaluationIndicatorEditModal, setEvaluationIndicatorEditModal] = useState(false)
    const [evaluationEditModal, setEvaluationEditModal] = useState(false)
    const [loading, setLoading] = useState(true);

    const [creator, setCreator] = useState(''); 
    const [evaluation, setEvaluation] = useState(''); 
    const [categoryID, setCategoryID] = useState(''); 
    const [categories, setCategories] = useState([]); 
    const [indicator, setIndicator] = useState(''); 
    const [ratings, setRatings] = useState([]);

    useEffect(() => {
        if (id) {
            const data = { evaluation: id };

            axiosInstance.get(`/getEvaluation`, { params: data, headers })
                .then((response) => {
                    setEvaluation(response.data.evaluation);
                    setCreator(response.data.creator);

                    if ( response.data.status === 200 ) {
                        setLoading(false);
                    }
                    
                }).catch((error) => {
                    console.error('Error fetching evaluation:', error);
                    setLoading(false);
                });

            axiosInstance.get(`/getCategories`, { params: data, headers })
                .then((response) => {
                    setCategories(response.data.categories);

                    if ( response.data.status === 200 ) {
                        setLoading(false);
                    }

                }).catch((error) => {
                    console.error('Error fetching categories:', error);
                    setLoading(false);
                });

            axiosInstance.get(`/getRatings`, { params: data, headers })
                .then((response) => {

                    setRatings(response.data.ratings);
                    
                }).catch((error) => {
                    console.error('Error fetching ratings:', error);
                });
        }
    }, []);


    // Evaluation Category Modal
    const openEvaluationCategoryAddModal = () => {
        setEvaluationCategoryAddModalOpen(true)
    };

    const closeEvaluationCategoryAddModal = () => {
        setEvaluationCategoryAddModalOpen(false)
    }


    // Evalualtion Ratings Modal
    const openEvaluationSetRatingsModal = () => {
        setEvaluationSetRatingsModal(true)
    };

    const closeEvaluationSetRatingsModal = () => {
        setEvaluationSetRatingsModal(false)
    };


    // Edit Evaluation Modal
    const openEvaluationEditModal = () => {
        setEvaluationEditModal(true)
    };

    const closeEvaluationEditModal = () => {
        setEvaluationEditModal(false)
    };


    // Add Evaluation Indicator Modal
    const openEvaluationIndicatorAddModal = (id) => {
        setCategoryID(id);
        setEvaluationIndicatorAddModal(true)
    };

    const closeEvaluationIndicatorAddModal = () => {
        setEvaluationIndicatorAddModal(false)
    };


    // Edit Evaliation Category Modal
    const openEvaluationIndicatorEditModal = (indicator) => {
        setIndicator(indicator);
        setEvaluationIndicatorEditModal(true)
    };

    const closeEvaluationIndicatorEditModal = () => {
        setEvaluationIndicatorEditModal(false)
    };

    
    // Settings Dropdown
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Layout title={"EvaluationEdit"}>
            <Box sx={{ mx: 12, pt: 12 }}>
                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px' }}>
                    {loading && !evaluation ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>

                            <Box>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mx: 6, my: 2}} >
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }} > {evaluation.name} </Typography>
                                    </Box>
                                    <Box>
                                        <Button variant="contained" onClick={handleClick} sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1" >
                                            Settings
                                        </Button>
                                        <Menu anchorEl={anchorEl} open={open} onClose={handleClose} sx={{ '& .MuiMenuItem-root': { color: '#000' } }} >
                                            <MenuItem onClick={() => { handleClose(); openEvaluationCategoryAddModal(); }}>
                                                <i className="fa fa-plus mr-2"></i> Add Category
                                            </MenuItem>
                                            <MenuItem onClick={() => { handleClose(); openEvaluationSetRatingsModal(); }}>
                                                <i className="fa fa-star-o mr-2"></i> Set Ratings
                                            </MenuItem>
                                            <MenuItem onClick={() => { handleClose(); openEvaluationEditModal(); }}>
                                                <i className="fa fa-pencil-square-o mr-2"></i> Edit Form Name
                                            </MenuItem>
                                        </Menu>
                                    </Box>
                                </Box>

                                <Box sx={{mx: 6}} >
                                    <Typography sx={{ fontSize: '12px', whiteSpace: 'pre-line' }} >
                                        {`Created By: ${creator.fname} ${creator.mname} ${creator.lname}
                                        Date Created: ${moment(evaluation.created_at).format('MMMM D, YYYY - h:mm A')}`}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ m: 6 }}>
                                {categories.map((category) => (
                                    <Accordion sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', mb: 2, borderRadius: '20px 20px 0 0' }} key={category.id} >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel${category.id}-content`} id={`panel${category.id}-header`} sx={{ backgroundColor: '#e9ae20', borderRadius: '10px 10px 0 0' }}>
                                            <Typography sx={{ ml: 2 }} variant="h6"> {category.name} ({category.indicators.length}) </Typography>
                                        </AccordionSummary>

                                        <AccordionDetails sx={{ borderRadius: '0 0 10px 10px', overflow: 'hidden', p: 2 }}>
                                            {category.indicators.map(indicator => (
                                                <Card key={indicator.id} sx={{ minWidth: 275, backgroundColor: '#f8f9fa', m: 2 }}>
                                                    <CardContent style={{ cursor: 'pointer' }} onClick={() => openEvaluationIndicatorEditModal(indicator)}>
                                                        <Typography id={`indicator-${indicator.id}`} variant="h5" sx={{ fontWeight: 'bold' }}> {indicator.indicator} </Typography>
                                                        <Typography id={`response-type-${indicator.id}`} variant="subtitle1"> Response Type: {indicator.type} </Typography>

                                                        {/* <Typography id={`indicator-${indicator.id}`} sx={{ mx: 2, fontWeight: 'bold' }} variant="h5"> {indicator.indicator} </Typography> */}
                                                        {/* <Typography id={`response-type-${indicator.id}`} sx={{ mx: 2 }}> {indicator.type} </Typography> */}
                                                    </CardContent>
                                                </Card>
                                            ))}

                                            <Box display="flex" justifyContent="center" sx={{ my: '20px' }}>
                                                <Button variant="contained" onClick={() => openEvaluationIndicatorAddModal(category.id)} sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                                    <p className='m-0'><i className="fa fa-pencil-squar0e-o"></i> Add Indicator </p>
                                                </Button>
                                            </Box>

                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        </>
                    )} 
                </div > 
            </Box>

            <EvaluationCategoryAddModal open={evaluationCategoryAddModalOpen} close={closeEvaluationCategoryAddModal} evaluationID={evaluation.id} />
            <EvaluationSetRatingsModal open={evaluationSetRatingsModal} close={closeEvaluationSetRatingsModal} evaluationID={evaluation.id} ratings={ratings} />

            <EvaluationEditModal open={evaluationEditModal} close={closeEvaluationEditModal} evaluation={evaluation} />
            
            <EvaluationIndicatorAddModal open={evaluationIndicatorAddModal} close={closeEvaluationIndicatorAddModal} categoryID={categoryID} />
            <EvaluationIndicatorEditModal open={evaluationIndicatorEditModal} close={closeEvaluationIndicatorEditModal} indicator={indicator} />
        </Layout >
    )
}

export default HrEvaluationEdit
