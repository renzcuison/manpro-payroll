// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   Box, Typography, Button, CircularProgress, Divider, Grid,
//   FormControlLabel, Radio, RadioGroup, Checkbox, TextField, IconButton, Accordion, AccordionSummary, AccordionDetails
// } from '@mui/material';
// import Layout from '../../../components/Layout/Layout';
// import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// const PerformanceEvaluationAnswerPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const storedUser = localStorage.getItem("nasya_user");
//   const user = JSON.parse(storedUser || '{}');
//   const headers = getJWTHeader(user);

//   const [responseMeta, setResponseMeta] = useState(null);
//   const [form, setForm] = useState(null);
//   const [categories, setCategories] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const resResponse = await axiosInstance.get('/getEvaluationResponse', { headers, params: { id } });
//         if (resResponse.data.status === 200 && resResponse.data.evaluationResponse) {
//           setResponseMeta(resResponse.data.evaluationResponse);

//           const formData = resResponse.data.evaluationResponse.evaluationForm;
//           setForm(formData);

//           // Build a categories state: { [subCategoryId]: { ...subcat, selectedValue, selectedValues, userResponse } }
//           const newCategories = {};
//           if (formData && formData.sections) {
//             formData.sections.forEach(section => {
//               (section.subcategories || []).forEach(sub => {
//                 newCategories[sub.id] = {
//                   ...sub,
//                   selectedValue: '',
//                   selectedValues: [],
//                   userResponse: '',
//                 };
//               });
//             });
//           }
//           setCategories(newCategories);
//         } else {
//           setResponseMeta(null);
//           setForm(null);
//           setCategories({});
//         }
//       } catch (e) {
//         setResponseMeta(null);
//         setForm(null);
//         setCategories({});
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (id) fetchData();
//   }, [id]);

//   // Input handlers
//   const handleLinearScaleChange = (subCategoryId, value) => {
//     setCategories(prev => ({
//       ...prev,
//       [subCategoryId]: { ...prev[subCategoryId], selectedValue: value }
//     }));
//   };
//   const handleMultipleChoiceChange = (subCategoryId, value) => {
//     setCategories(prev => ({
//       ...prev,
//       [subCategoryId]: { ...prev[subCategoryId], selectedValue: value }
//     }));
//   };
//   const handleCheckboxChange = (subCategoryId, option) => {
//     setCategories(prev => {
//       const selectedValues = Array.isArray(prev[subCategoryId].selectedValues)
//         ? prev[subCategoryId].selectedValues
//         : [];
//       const newValues = selectedValues.includes(option)
//         ? selectedValues.filter(v => v !== option)
//         : [...selectedValues, option];
//       return {
//         ...prev,
//         [subCategoryId]: { ...prev[subCategoryId], selectedValues: newValues }
//       };
//     });
//   };
//   const handleShortAnswerChange = (subCategoryId, value) => {
//     setCategories(prev => ({
//       ...prev,
//       [subCategoryId]: { ...prev[subCategoryId], userResponse: value }
//     }));
//   };
//   const handleLongAnswerChange = (subCategoryId, value) => {
//     setCategories(prev => ({
//       ...prev,
//       [subCategoryId]: { ...prev[subCategoryId], userResponse: value }
//     }));
//   };

//   const responseTypeMap = {
//     'linear_scale': 'Linear Scale',
//     'multiple_choice': 'Multiple Choice',
//     'checkbox': 'Checkbox',
//     'short_answer': 'Short Answer',
//     'long_answer': 'Long Answer',
//     };

//   const handleSubmit = async () => {
//     setSubmitting(true);
//     let hasError = false;
//     let errorMsg = '';

//     for (const subCategoryId in categories) {
//       const sc = categories[subCategoryId];
//       try {
//         if (sc.subcategory_type === 'linear_scale') {
//           if (!sc.selectedValue) continue;
//           const percentage = (
//             (parseInt(sc.selectedValue, 10) - sc.linear_scale_start) /
//             (sc.linear_scale_end - sc.linear_scale_start)
//           );
//           await axiosInstance.post('/saveEvaluationPercentageAnswer', {
//             response_id: responseMeta.id,
//             subcategory_id: sc.id,
//             percentage,
//           }, { headers });
//         } else if (sc.subcategory_type === 'multiple_choice') {
//           if (!sc.selectedValue) continue;
//           const selectedOption = (sc.options || []).find(opt => opt.label === sc.selectedValue);
//           if (selectedOption) {
//             await axiosInstance.post('/saveEvaluationOptionAnswer', {
//               response_id: responseMeta.id,
//               option_id: selectedOption.id,
//             }, { headers });
//           }
//         } else if (sc.subcategory_type === 'checkbox') {
//           if (!Array.isArray(sc.selectedValues)) continue;
//           for (const value of sc.selectedValues) {
//             const selectedOption = (sc.options || []).find(opt => opt.label === value);
//             if (selectedOption) {
//               await axiosInstance.post('/saveEvaluationOptionAnswer', {
//                 response_id: responseMeta.id,
//                 option_id: selectedOption.id,
//               }, { headers });
//             }
//           }
//         } else if (sc.subcategory_type === 'short_answer' || sc.subcategory_type === 'long_answer') {
//           if (!sc.userResponse) continue;
//           await axiosInstance.post('/saveEvaluationTextAnswer', {
//             response_id: responseMeta.id,
//             subcategory_id: sc.id,
//             answer: sc.userResponse,
//           }, { headers });
//         }
//       } catch (e) {
//         hasError = true;
//         errorMsg = e?.response?.data?.message || 'Failed to submit some answers.';
//         break;
//       }
//     }

//     setSubmitting(false);

//     if (hasError) {
//       alert(errorMsg);
//     } else {
//       alert('Evaluation submitted!');
//     }
//   };

//   if (loading) {
//     return (
//       <Layout title="Performance Evaluation Form">
//         <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
//           <CircularProgress />
//         </Box>
//       </Layout>
//     );
//   }

//   if (!form || !responseMeta) {
//     return (
//       <Layout title="Performance Evaluation Form">
//         <Box sx={{ textAlign: 'center', mt: 6 }}>
//           <Typography variant="h6" color="error">Evaluation Form or Response Not Found</Typography>
//         </Box>
//       </Layout>
//     );
//   }

//   return (
//     <Layout title="Performance Evaluation Form">
//       <Box
//         sx={{
//           mt: 5,
//           p: 3,
//           bgcolor: 'white',
//           borderRadius: '8px',
//           maxWidth: '1000px',
//           mx: 'auto',
//           boxShadow: 3,
//         }}
//       >
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//           <IconButton onClick={() => navigate(-1)} size="large" sx={{ mr: 1 }}>
//             <ArrowBackIcon />
//           </IconButton>
//           <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
//             Performance Evaluation Answer Form
//           </Typography>
//         </Box>
//         <Typography variant="body1" sx={{ color: '#777', mb: 1 }}>
//           Evaluatee: {responseMeta.evaluatee_last_name}, {responseMeta.evaluatee_first_name} {responseMeta.evaluatee_middle_name || ""}
//         </Typography>
//         <Typography variant="body1" sx={{ color: '#777', mb: 2 }}>
//           Evaluator: {responseMeta.evaluator_last_name}, {responseMeta.evaluator_first_name} {responseMeta.evaluator_middle_name || ""}
//         </Typography>
//         <Typography variant="body1" sx={{ color: '#777', mb: 2 }}>
//           Period Availability: {responseMeta.period_start_date} to {responseMeta.period_end_date}
//         </Typography>
//         <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
//           {form.name}
//         </Typography>

//         <Box component="form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
//           {(!form.sections || form.sections.length === 0) && (
//             <Typography>No sections available for this form.</Typography>
//           )}
//           {form.sections && form.sections.map(section => (
//             <Accordion
//               key={section.id}
//               expanded
//               disableGutters
//               elevation={0}
//               sx={{
//                 bgcolor: '#ffff',
//                 borderRadius: '8px',
//                 boxShadow: 3,
//                 mb: 2,
//                 '&:before': { display: 'none' }
//               }}
//             >
//               <AccordionSummary
//                 sx={{
//                     bgcolor: '#E9AE20',
//                     borderBottom: '1px solid #ffe082',
//                     cursor: 'default',
//                     minHeight: 0,
//                     borderTopLeftRadius: '8px',
//                     borderTopRightRadius: '8px', // Rounded corners for section header
//                     '& .MuiAccordionSummary-content': {
//                         margin: 0,
//                         alignItems: "center"
//                     }
//                     }}
//                 >
//                 <Box sx={{my: 1}}>
//                   <Typography variant="h6" sx={{ fontWeight: 'bold', color: "white" }}>
//                     {section.name}
//                   </Typography>
//                   <Typography variant="body2" sx={{ color: "white" }}>
//                     Category: {section.category}
//                   </Typography>
//                 </Box>
//               </AccordionSummary>
//               <AccordionDetails sx={{ pt: 2 }}>
//                 {(section.subcategories || []).length === 0 ? (
//                   <Typography color="text.secondary" sx={{ mb: 2 }}>No subcategories in this section.</Typography>
//                 ) : (
//                   section.subcategories.map((subCategory) => (
//                     <Box
//                       key={subCategory.id}
//                       sx={{ mb: 3, border: '1px solid #ddd', borderRadius: 2, p: 2, bgcolor: 'white' }}
//                     >
//                       <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
//                         Subcategory: {subCategory.name}
//                       </Typography>
//                         <Typography variant="body1">Type: {responseTypeMap[subCategory.subcategory_type] || 'Unknown'}</Typography>
//                         <Typography variant="body2">Description: {subCategory.description}</Typography>

//                       {subCategory.subcategory_type === 'linear_scale' && (
//                         <Box sx={{ mb: 2 }}>
//                           <Grid container alignItems="center" spacing={2} justifyContent='center'>
//                             <Grid item>
//                               <Typography variant="body1">{subCategory.linear_scale_start_label}</Typography>
//                             </Grid>
//                             <Grid item xs>
//                               <Grid container justifyContent="center" spacing={1}>
//                                 {[...Array(subCategory.linear_scale_end - subCategory.linear_scale_start + 1)].map((_, index) => {
//                                   const value = subCategory.linear_scale_start + index;
//                                   return (
//                                     <Grid item key={value}>
//                                       <FormControlLabel
//                                         control={
//                                           <Radio
//                                             checked={categories[subCategory.id]?.selectedValue === value.toString()}
//                                             onChange={() => handleLinearScaleChange(subCategory.id, value.toString())}
//                                             value={value.toString()}
//                                           />
//                                         }
//                                         label={value}
//                                         labelPlacement="top"
//                                       />
//                                     </Grid>
//                                   );
//                                 })}
//                               </Grid>
//                             </Grid>
//                             <Grid item>
//                               <Typography variant="body1">{subCategory.linear_scale_end_label}</Typography>
//                             </Grid>
//                           </Grid>
//                         </Box>
//                       )}

//                       {subCategory.subcategory_type === 'multiple_choice' && (
//                         <Box sx={{ mb: 2 }}>
//                           <RadioGroup
//                             value={categories[subCategory.id]?.selectedValue || ''}
//                             onChange={(e) => handleMultipleChoiceChange(subCategory.id, e.target.value)}
//                           >
//                             {Array.isArray(subCategory.options) && subCategory.options.map((option, index) => (
//                               <FormControlLabel
//                                 key={option.id || index}
//                                 value={option.label}
//                                 control={<Radio />}
//                                 label={option.label}
//                               />
//                             ))}
//                           </RadioGroup>
//                         </Box>
//                       )}

//                       {subCategory.subcategory_type === 'checkbox' && (
//                         <Box sx={{ mb: 2 }}>
//                           {Array.isArray(subCategory.options) && subCategory.options.map((option, index) => (
//                             <FormControlLabel
//                               key={option.id || index}
//                               control={
//                                 <Checkbox
//                                   checked={Array.isArray(categories[subCategory.id]?.selectedValues) ? categories[subCategory.id].selectedValues.includes(option.label) : false}
//                                   onChange={() => handleCheckboxChange(subCategory.id, option.label)}
//                                 />
//                               }
//                               label={option.label}
//                             />
//                           ))}
//                         </Box>
//                       )}

//                       {subCategory.subcategory_type === 'short_answer' && (
//                         <Box sx={{ mb: 2 }}>
//                           <TextField
//                             label="Short Text"
//                             variant="outlined"
//                             fullWidth
//                             multiline
//                             rows={2}
//                             value={categories[subCategory.id]?.userResponse || ''}
//                             onChange={(e) => handleShortAnswerChange(subCategory.id, e.target.value)}
//                           />
//                         </Box>
//                       )}

//                       {subCategory.subcategory_type === 'long_answer' && (
//                         <Box sx={{ mb: 2 }}>
//                           <TextField
//                             label="Long Text"
//                             variant="outlined"
//                             fullWidth
//                             multiline
//                             rows={4}
//                             value={categories[subCategory.id]?.userResponse || ''}
//                             onChange={(e) => handleLongAnswerChange(subCategory.id, e.target.value)}
//                           />
//                         </Box>
//                       )}
//                     </Box>
//                   ))
//                 )}
//               </AccordionDetails>
//             </Accordion>
//           ))}
//           <Divider sx={{ my: 3 }} />
//           <Box sx={{ display: 'flex', justifyContent: 'center' }}>
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               disabled={submitting || !form}
//               sx={{ mt: 2, px: 4, py: 1.5, fontWeight: 'bold', bgcolor: '#177604', '&:hover': { bgcolor: '#0d5c27' } }}
//             >
//               {submitting ? "Submitting..." : "Submit Evaluation"}
//             </Button>
//           </Box>
//         </Box>
//       </Box>
//     </Layout>
//   );
// };

// export default PerformanceEvaluationAnswerPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Divider, Grid,
  FormControlLabel, Radio, RadioGroup, Checkbox, TextField, IconButton, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PerformanceEvaluationAnswerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("nasya_user");
  const user = JSON.parse(storedUser || '{}');
  const headers = getJWTHeader(user);

  const [responseMeta, setResponseMeta] = useState(null);
  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resResponse = await axiosInstance.get('/getEvaluationResponse', { headers, params: { id } });
        if (resResponse.data.status === 200 && resResponse.data.evaluationResponse) {
          setResponseMeta(resResponse.data.evaluationResponse);

          const formData = resResponse.data.evaluationResponse.evaluationForm;
          setForm(formData);

          // Build a categories state: { [subCategoryId]: { ...subcat, selectedValue, selectedValues, userResponse } }
          const newCategories = {};
          if (formData && formData.sections) {
            formData.sections.forEach(section => {
              (section.subcategories || []).forEach(sub => {
                newCategories[sub.id] = {
                  ...sub,
                  selectedValue: '',
                  selectedValues: [],
                  userResponse: '',
                };
              });
            });
          }
          setCategories(newCategories);
        } else {
          setResponseMeta(null);
          setForm(null);
          setCategories({});
        }
      } catch (e) {
        setResponseMeta(null);
        setForm(null);
        setCategories({});
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Input handlers
  const handleLinearScaleChange = (subCategoryId, value) => {
    setCategories(prev => ({
      ...prev,
      [subCategoryId]: { ...prev[subCategoryId], selectedValue: value }
    }));
  };
  const handleMultipleChoiceChange = (subCategoryId, value) => {
    setCategories(prev => ({
      ...prev,
      [subCategoryId]: { ...prev[subCategoryId], selectedValue: value }
    }));
  };
  const handleCheckboxChange = (subCategoryId, option) => {
    setCategories(prev => {
      const selectedValues = Array.isArray(prev[subCategoryId].selectedValues)
        ? prev[subCategoryId].selectedValues
        : [];
      const newValues = selectedValues.includes(option)
        ? selectedValues.filter(v => v !== option)
        : [...selectedValues, option];
      return {
        ...prev,
        [subCategoryId]: { ...prev[subCategoryId], selectedValues: newValues }
      };
    });
  };
  const handleShortAnswerChange = (subCategoryId, value) => {
    setCategories(prev => ({
      ...prev,
      [subCategoryId]: { ...prev[subCategoryId], userResponse: value }
    }));
  };
  const handleLongAnswerChange = (subCategoryId, value) => {
    setCategories(prev => ({
      ...prev,
      [subCategoryId]: { ...prev[subCategoryId], userResponse: value }
    }));
  };

  const responseTypeMap = {
    'linear_scale': 'Linear Scale',
    'multiple_choice': 'Multiple Choice',
    'checkbox': 'Checkbox',
    'short_answer': 'Short Answer',
    'long_answer': 'Long Answer',
  };

  // NEW: Handle workflow advancement after submit
  const advanceWorkflow = async () => {
    try {
      const res = await axiosInstance.post(
        `/advanceEvaluationWorkflow/${responseMeta.id}`,
        {},
        { headers }
      );
      if (res.data.status === 200) {
        alert('Evaluation workflow advanced to next step.');
        navigate(-1); // Or redirect to a dashboard/list page
      } else {
        alert(res.data.message || 'Failed to advance workflow.');
      }
    } catch (err) {
      alert('Failed to advance workflow: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let hasError = false;
    let errorMsg = '';

    for (const subCategoryId in categories) {
      const sc = categories[subCategoryId];
      try {
        if (sc.subcategory_type === 'linear_scale') {
          if (!sc.selectedValue) continue;
          const percentage = (
            (parseInt(sc.selectedValue, 10) - sc.linear_scale_start) /
            (sc.linear_scale_end - sc.linear_scale_start)
          );
          await axiosInstance.post('/saveEvaluationPercentageAnswer', {
            response_id: responseMeta.id,
            subcategory_id: sc.id,
            percentage,
          }, { headers });
        } else if (sc.subcategory_type === 'multiple_choice') {
          if (!sc.selectedValue) continue;
          const selectedOption = (sc.options || []).find(opt => opt.label === sc.selectedValue);
          if (selectedOption) {
            await axiosInstance.post('/saveEvaluationOptionAnswer', {
              response_id: responseMeta.id,
              option_id: selectedOption.id,
            }, { headers });
          }
        } else if (sc.subcategory_type === 'checkbox') {
          if (!Array.isArray(sc.selectedValues)) continue;
          for (const value of sc.selectedValues) {
            const selectedOption = (sc.options || []).find(opt => opt.label === value);
            if (selectedOption) {
              await axiosInstance.post('/saveEvaluationOptionAnswer', {
                response_id: responseMeta.id,
                option_id: selectedOption.id,
              }, { headers });
            }
          }
        } else if (sc.subcategory_type === 'short_answer' || sc.subcategory_type === 'long_answer') {
          if (!sc.userResponse) continue;
          await axiosInstance.post('/saveEvaluationTextAnswer', {
            response_id: responseMeta.id,
            subcategory_id: sc.id,
            answer: sc.userResponse,
          }, { headers });
        }
      } catch (e) {
        hasError = true;
        errorMsg = e?.response?.data?.message || 'Failed to submit some answers.';
        break;
      }
    }

    setSubmitting(false);

    if (hasError) {
      alert(errorMsg);
    } else {
      // Advance to next workflow step after successful submit
      await advanceWorkflow();
    }
  };

  if (loading) {
    return (
      <Layout title="Performance Evaluation Form">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!form || !responseMeta) {
    return (
      <Layout title="Performance Evaluation Form">
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="error">Evaluation Form or Response Not Found</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Performance Evaluation Form">
      <Box
        sx={{
          mt: 5,
          p: 3,
          bgcolor: 'white',
          borderRadius: '8px',
          maxWidth: '1000px',
          mx: 'auto',
          boxShadow: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="large" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Performance Evaluation Answer Form
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#777', mb: 1 }}>
          Evaluatee: {responseMeta.evaluatee_last_name}, {responseMeta.evaluatee_first_name} {responseMeta.evaluatee_middle_name || ""}
        </Typography>
        <Typography variant="body1" sx={{ color: '#777', mb: 2 }}>
          Evaluator: {responseMeta.evaluator_last_name}, {responseMeta.evaluator_first_name} {responseMeta.evaluator_middle_name || ""}
        </Typography>
        <Typography variant="body1" sx={{ color: '#777', mb: 2 }}>
          Period Availability: {responseMeta.period_start_date} to {responseMeta.period_end_date}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          {form.name}
        </Typography>

        <Box component="form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          {(!form.sections || form.sections.length === 0) && (
            <Typography>No sections available for this form.</Typography>
          )}
          {form.sections && form.sections.map(section => (
            <Accordion
              key={section.id}
              expanded
              disableGutters
              elevation={0}
              sx={{
                bgcolor: '#ffff',
                borderRadius: '8px',
                boxShadow: 3,
                mb: 2,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                sx={{
                    bgcolor: '#E9AE20',
                    borderBottom: '1px solid #ffe082',
                    cursor: 'default',
                    minHeight: 0,
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px', // Rounded corners for section header
                    '& .MuiAccordionSummary-content': {
                        margin: 0,
                        alignItems: "center"
                    }
                    }}
                >
                <Box sx={{my: 1}}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: "white" }}>
                    {section.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Category: {section.category}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 2 }}>
                {(section.subcategories || []).length === 0 ? (
                  <Typography color="text.secondary" sx={{ mb: 2 }}>No subcategories in this section.</Typography>
                ) : (
                  section.subcategories.map((subCategory) => (
                    <Box
                      key={subCategory.id}
                      sx={{ mb: 3, border: '1px solid #ddd', borderRadius: 2, p: 2, bgcolor: 'white' }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Subcategory: {subCategory.name}
                      </Typography>
                        <Typography variant="body1">Type: {responseTypeMap[subCategory.subcategory_type] || 'Unknown'}</Typography>
                        <Typography variant="body2">Description: {subCategory.description}</Typography>

                      {subCategory.subcategory_type === 'linear_scale' && (
                        <Box sx={{ mb: 2 }}>
                          <Grid container alignItems="center" spacing={2} justifyContent='center'>
                            <Grid item>
                              <Typography variant="body1">{subCategory.linear_scale_start_label}</Typography>
                            </Grid>
                            <Grid item xs>
                              <Grid container justifyContent="center" spacing={1}>
                                {[...Array(subCategory.linear_scale_end - subCategory.linear_scale_start + 1)].map((_, index) => {
                                  const value = subCategory.linear_scale_start + index;
                                  return (
                                    <Grid item key={value}>
                                      <FormControlLabel
                                        control={
                                          <Radio
                                            checked={categories[subCategory.id]?.selectedValue === value.toString()}
                                            onChange={() => handleLinearScaleChange(subCategory.id, value.toString())}
                                            value={value.toString()}
                                          />
                                        }
                                        label={value}
                                        labelPlacement="top"
                                      />
                                    </Grid>
                                  );
                                })}
                              </Grid>
                            </Grid>
                            <Grid item>
                              <Typography variant="body1">{subCategory.linear_scale_end_label}</Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {subCategory.subcategory_type === 'multiple_choice' && (
                        <Box sx={{ mb: 2 }}>
                          <RadioGroup
                            value={categories[subCategory.id]?.selectedValue || ''}
                            onChange={(e) => handleMultipleChoiceChange(subCategory.id, e.target.value)}
                          >
                            {Array.isArray(subCategory.options) && subCategory.options.map((option, index) => (
                              <FormControlLabel
                                key={option.id || index}
                                value={option.label}
                                control={<Radio />}
                                label={option.label}
                              />
                            ))}
                          </RadioGroup>
                        </Box>
                      )}

                      {subCategory.subcategory_type === 'checkbox' && (
                        <Box sx={{ mb: 2 }}>
                          {Array.isArray(subCategory.options) && subCategory.options.map((option, index) => (
                            <FormControlLabel
                              key={option.id || index}
                              control={
                                <Checkbox
                                  checked={Array.isArray(categories[subCategory.id]?.selectedValues) ? categories[subCategory.id].selectedValues.includes(option.label) : false}
                                  onChange={() => handleCheckboxChange(subCategory.id, option.label)}
                                />
                              }
                              label={option.label}
                            />
                          ))}
                        </Box>
                      )}

                      {subCategory.subcategory_type === 'short_answer' && (
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            label="Short Text"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={2}
                            value={categories[subCategory.id]?.userResponse || ''}
                            onChange={(e) => handleShortAnswerChange(subCategory.id, e.target.value)}
                          />
                        </Box>
                      )}

                      {subCategory.subcategory_type === 'long_answer' && (
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            label="Long Text"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            value={categories[subCategory.id]?.userResponse || ''}
                            onChange={(e) => handleLongAnswerChange(subCategory.id, e.target.value)}
                          />
                        </Box>
                      )}
                    </Box>
                  ))
                )}
              </AccordionDetails>
            </Accordion>
          ))}
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting || !form}
              sx={{ mt: 2, px: 4, py: 1.5, fontWeight: 'bold', bgcolor: '#177604', '&:hover': { bgcolor: '#0d5c27' } }}
            >
              {submitting ? "Submitting..." : "Submit Evaluation"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default PerformanceEvaluationAnswerPage;