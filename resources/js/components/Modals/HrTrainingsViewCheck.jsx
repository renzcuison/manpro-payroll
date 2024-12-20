import { Box, Button, FormControl, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, Grid, TextField, Container, RadioGroup, FormControlLabel, Radio, Input, Stack, } from '@mui/material';
import React, { useEffect, useState } from 'react'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import moment from 'moment';
import { useNavigate } from "react-router-dom";

const HrTrainingsViewCheck = ({ open, close, data, userID }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [trainingData, setTrainingData] = useState({
        title: data.title || '',
        description: data.description || '',
        cover_file: data.cover_file || null,
        duration: data.duration || '',
        date_from_val: data.start ? moment(data.start).format('YYYY-MM-DD') : '',
        date_to_val: data.end ? moment(data.end).format('YYYY-MM-DD') : '',
    });
    const [takeBy, setTakeBy] = useState([]);
    const [questions, setQuestions] = useState(data.questions || []);
    const [newQuestion, setNewQuestion] = useState('');
    const [newChoice, setNewChoice] = useState('');
    const [isAddingChoices, setIsAddingChoices] = useState(false);
    const [questionsToAdd, setQuestionsToAdd] = useState([]);
    const [showChoices, setShowChoices] = useState(false);
    let questionNumber = 0;
    const navigate = useNavigate()
    let firstCharacter = '';
    let checkingResult = '';
    let questionResult = null;

    useEffect(() => {
        axiosInstance.get('/questions_list', { headers }).then((response) => {
            setQuestions(response.data.listData);
        });

        axiosInstance.get('/take_by_list', { headers }).then((response) => {
            setTakeBy(response.data.listData);
        });
    }, [])

    const handleChange = (event) => {
        const { name, value, type, files } = event.target;

        if (name === 'cover_file') {
            setTrainingData({
                ...trainingData,
                cover_file: files[0],
            });
        } else if (name === 'duration') {
            let formattedValue = value.replace(/\D/g, '');

            if (formattedValue.length === 4) {
                const hours = formattedValue.slice(0, 2);
                const minutes = formattedValue.slice(2);

                if (parseInt(hours, 10) <= 24 && parseInt(minutes, 10) <= 59) {
                    formattedValue = `${hours}:${minutes}`;
                } else {
                    formattedValue = 'Invalid time format';
                }
            } else if (formattedValue.length > 4) {
                formattedValue = 'Invalid time format';
            }

            setTrainingData({
                ...trainingData,
                duration: formattedValue,
            });

        } else {
            setTrainingData({
                ...trainingData,
                [name]: type === 'checkbox' ? event.target.checked : value,
            });
        }
    };

    const handleEditCategory = (event) => {
        event.preventDefault();

        const formData = new FormData();

        formData.append('category_id', data.category_id);
        formData.append('title', trainingData.title || data.title)
        formData.append('description', trainingData.description || data.description);
        formData.append('attached_file', trainingData.cover_file);
        formData.append('category', "training");
        formData.append('duration', trainingData.duration || data.duration);
        formData.append('date_from_val', trainingData.date_from_val || data.start);
        formData.append('date_to_val', trainingData.date_to_val || data.end);

        formData.append('prevQuestions', JSON.stringify(questions));
        formData.append('newQuestions', JSON.stringify(questionsToAdd));

        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to update this training?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/edit_category', formData, { headers }).then(function (response) {
                    console.log(response);
                    location.reload();
                })
                    .catch((error) => {
                        console.log(error)
                        location.reload();
                    })
            } else {
                location.reload();
            }
        });

    };

    const handleQuestionChange = (questionIndex, updatedQuestionText) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].question_text = updatedQuestionText;
        setQuestions(updatedQuestions);
    };

    const handleChoiceChange = (questionIndex, choiceIndex, updatedChoiceText) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].choice_text[choiceIndex] = updatedChoiceText;
        setQuestions(updatedQuestions);
    };

    const addQuestion = () => {
        if (newQuestion.trim() !== '') {
            setQuestionsToAdd((prevQuestionsToAdd) => [
                ...prevQuestionsToAdd,
                {
                    category_id: data.category_id,
                    question_text: newQuestion,
                    choice_text: [],
                },
            ]);
            setNewQuestion('');
            setIsAddingChoices(true);
        }
    };

    const addChoice = () => {
        if (newChoice.trim() !== '' && isAddingChoices) {
            const updatedQuestionsToAdd = [...questionsToAdd];
            const lastQuestionIndex = updatedQuestionsToAdd.length - 1;

            if (lastQuestionIndex >= 0) {
                const currentChoices = updatedQuestionsToAdd[lastQuestionIndex].choice_text;
                const newChoices = [...currentChoices, newChoice];
                updatedQuestionsToAdd[lastQuestionIndex].choice_text = newChoices;

                setQuestionsToAdd(updatedQuestionsToAdd);
                setNewChoice('');
                setShowChoices(true);
            }
        }
    };

    const removeQuestion = (questionIndex, isAddedQuestion) => {
        if (isAddedQuestion) {
            const updatedQuestionsToAdd = [...questionsToAdd];
            updatedQuestionsToAdd.splice(questionIndex, 1);
            setQuestionsToAdd(updatedQuestionsToAdd);
        } else {
            const updatedQuestions = [...questions];
            updatedQuestions.splice(questionIndex, 1);
            setQuestions(updatedQuestions);
        }
    };

    const handleDeleteCategory = (event) => {
        event.preventDefault();

        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to delete this training?",
            icon: "warning",
            dangerMode: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/delete_category', { category_id: data.category_id }, { headers }).then((response) => {
                    if (response.data.message === 'Success') {
                        Swal.fire({
                            customClass: {
                                container: "my-swal",
                            },
                            title: "Success!",
                            text: 'Training has been deleted successfully',
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: false
                        }).then(function (response) {
                            location.reload();
                        });
                        navigate('/hr/trainings');
                    } else {
                        alert("Error! try again");
                    }
                })
            }
        });
    }

    return (
        <>
            <Dialog sx={{
                "& .MuiDialog-container": {
                    justifyContent: "flex-center",
                    alignItems: "flex-start"
                }
            }}
                open={open} fullWidth maxWidth="md">
                <Box className="d-flex justify-content-between" >
                    <DialogTitle />
                    <IconButton sx={{ float: 'right', marginRight: 2, marginTop: 2, color: 'red' }} data-dismiss="modal" aria-label="Close" onClick={close}><i className="si si-close"></i></IconButton>
                </Box>
                <DialogContent>
                    <Stack>
                        <Grid container justifyContent="center" alignItems="center">
                            <Grid item xs={12}>
                                <Typography className="text-center" variant="h3">{data.title.toUpperCase()}</Typography>
                                <Typography className="text-center" variant="h6">{data.description}</Typography>
                            </Grid>
                        </Grid>

                        {data.course === 'Assessment-based training' ? <>
                            <Stack sx={{ marginTop: 2, marginInline: 2 }}>
                                <form>
                                    {questions.map((question, questionIndex) => {
                                        if (question.category_id === data.category_id) {

                                            const answerTexts = takeBy
                                                .filter(take => take.category_id === data.category_id && take.user_id === userID)
                                                .map(take => take.answer_text);
                                            const answerTextArrays = answerTexts.map(answerText => answerText.split(','));
                                            const firstElement = answerTextArrays[0];
                                            if (firstElement && firstElement.length > 0) {
                                                firstCharacter = firstElement[questionNumber];
                                            }
                                            const checking = takeBy
                                                .filter(take => take.category_id === data.category_id && take.user_id === userID)
                                                .map(take => take.checking_result);
                                            const checkingArrays = checking.map(checkings => checkings.split(','));
                                            const firstchecking = checkingArrays[0];
                                            if (firstchecking && firstchecking.length > 0) {
                                                checkingResult = firstchecking[questionNumber];
                                            }
                                            const questionID = takeBy
                                                .filter(take => take.category_id === data.category_id && take.user_id === userID)
                                                .map(take => take.question_id);
                                            const questionArrays = questionID.map(questions => questions.split(','));
                                            const firstquestion = questionArrays[0];
                                            if (firstquestion && firstquestion.length > 0) {
                                                questionResult = firstquestion[questionNumber];
                                            }

                                            return (
                                                <div key={questionIndex}>
                                                    <Grid item xs={12} sx={{ marginTop: 2 }}>
                                                        <Typography variant="h4" gutterBottom>
                                                            {`Question ${++questionNumber}: `}
                                                            <span>{question.question_text}</span>
                                                        </Typography>
                                                    </Grid>
                                                    <FormControl component="fieldset" sx={{ marginTop: 2, marginLeft: 4 }}>
                                                        {question.choice_text.map((choice, choiceIndex) => {
                                                            const shouldCheck = firstCharacter === choice;

                                                            return (
                                                                <div key={choiceIndex}>
                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <FormControlLabel
                                                                            control={<Radio checked={shouldCheck} />}
                                                                            label={<Typography variant="h6">{choice}</Typography>}
                                                                        />
                                                                        {shouldCheck ? (
                                                                            checkingResult === '1' ?
                                                                                <><Typography variant='h5' style={{ marginRight: '4px', color: 'green' }}><i className="si si-check"></i></Typography></>
                                                                                : <><Typography variant='h5' style={{ marginRight: '4px', color: 'red' }}><i className="si si-close"></i></Typography></>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </FormControl>
                                                    {checkingResult !== '1' ? <>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <Typography variant='h6' style={{ marginRight: '4px' }}>Correct Answer: </Typography>
                                                            <Typography variant='h6' style={{ marginRight: '4px' }}>
                                                                {questions.filter(question => question.question_id === parseInt(questionResult, 10))
                                                                    .map(take => take.answer_key)}
                                                            </Typography>
                                                        </div>
                                                    </> : null}
                                                </div>
                                            );
                                        }

                                        return null;
                                    })}

                                </form>
                            </Stack>
                        </> : data.course_type === 'E-learning through videos' ? <>

                        </> : <></>}
                    </Stack>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default HrTrainingsViewCheck
