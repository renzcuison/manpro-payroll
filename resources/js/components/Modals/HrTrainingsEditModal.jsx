import { Box, Button, FormControl, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, Grid, TextField, Container, RadioGroup, FormControlLabel, Radio, Input, Stack, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import moment from 'moment';
import { useNavigate } from "react-router-dom";

const HrTrainingsEditModal = ({ open, close, data }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [trainingData, setTrainingData] = useState({
        title: data.title || '',
        description: data.description || '',
        cover_file: data.cover_file || null,
        course_type: data.course || '',
        duration: data.duration || '',
        date_from_val: data.start ? moment(data.start).format('YYYY-MM-DD') : '',
        date_to_val: data.end ? moment(data.end).format('YYYY-MM-DD') : '',
        videoLink: data.videoLink || '',
    });
    const [questions, setQuestions] = useState(data.questions || []);
    const [newQuestion, setNewQuestion] = useState('');
    const [newChoice, setNewChoice] = useState('');
    const [isAddingChoices, setIsAddingChoices] = useState(false);
    const [questionsToAdd, setQuestionsToAdd] = useState([]);
    const [showChoices, setShowChoices] = useState(false);
    let questionNumber = 1;
    const navigate = useNavigate()

    useEffect(() => {
        axiosInstance.get('/questions_list', { headers }).then((response) => {
            setQuestions(response.data.listData);
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
        formData.append('course_type', data.course);
        formData.append('category', "training");
        formData.append('duration', trainingData.duration || data.duration);
        formData.append('date_from_val', trainingData.date_from_val || data.start);
        formData.append('date_to_val', trainingData.date_to_val || data.end);
        formData.append('videoLink', trainingData.videoLink || data.videoLink);

        if (data.course === "Assessment-based training") {
            formData.append('prevQuestions', JSON.stringify(questions));
            formData.append('newQuestions', JSON.stringify(questionsToAdd));
        }

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
                open={open} fullWidth maxWidth="lg">
                <Box className="d-flex justify-content-between" >
                    <DialogTitle />
                    <IconButton sx={{ float: 'right', marginRight: 2, marginTop: 2, color: 'red' }} data-dismiss="modal" aria-label="Close" onClick={close}><i className="si si-close"></i></IconButton>
                </Box>
                <DialogContent>
                    <Stack>
                        <DialogContentText>
                            <Typography className="text-center" sx={{ fontSize: 20 }}>Edit Training Courses</Typography>
                        </DialogContentText>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={8} sx={{ marginTop: 2 }}>
                                <TextField
                                    label="Type of Application"
                                    variant="outlined"
                                    fullWidth
                                    defaultValue={data.course}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                                <TextField
                                    id='title'
                                    name='title'
                                    label="Title"
                                    variant="outlined"
                                    fullWidth
                                    onChange={handleChange}
                                    sx={{ marginTop: 2 }}
                                    defaultValue={data.title}
                                />
                                <TextField
                                    id='description'
                                    name='description'
                                    label="Description"
                                    multiline
                                    rows={10}
                                    variant="outlined"
                                    fullWidth
                                    onChange={handleChange}
                                    sx={{ marginTop: 2 }}
                                    defaultValue={data.description}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} sx={{ marginTop: 2 }}>
                                <TextField
                                    label="Cover Photo File Name"
                                    variant="outlined"
                                    fullWidth
                                    defaultValue={data.cover_file}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                                <Grid item sx={{ marginTop: 3.25, marginBottom: 1.75 }}>
                                    <Input type="file" inputProps={{ accept: 'image/*' }} name="cover_file"
                                        id="cover_file" onChange={handleChange} />
                                </Grid>
                                <TextField
                                    id="duration"
                                    name="duration"
                                    fullWidth
                                    label="Training Duration"
                                    placeholder={data.duration + " Hour/s"}
                                    value={trainingData.duration}
                                    variant="outlined"
                                    onChange={handleChange}
                                    sx={{ marginTop: 2 }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                                <TextField id="date_from_val" label="Start Date" type="date" fullWidth variant="outlined" name="date_from_val"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    onChange={handleChange}
                                    sx={{ marginTop: 2 }}
                                    defaultValue={data.start ? moment(data.start).format('YYYY-MM-DD') : ''} />
                                <TextField id="date_to_val" label="End Date" type="date" fullWidth variant="outlined" name="date_to_val"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    onChange={handleChange}
                                    sx={{ marginTop: 2 }}
                                    defaultValue={data.end ? moment(data.end).format('YYYY-MM-DD') : ''} />
                            </Grid>
                            {data.course === 'Assessment-based training' ? <>
                                <Container sx={{ marginTop: 2 }}>
                                    <form onSubmit={handleEditCategory}>
                                        {questions.map((question, questionIndex) => (
                                            question.category_id === data.category_id ? (
                                                <div key={questionIndex}>
                                                    <Grid container alignItems="left" spacing={2} sx={{ marginTop: 2 }}>
                                                        <Grid item xs={11}>
                                                            <TextField
                                                                label={`Question ${questionNumber++}: `}
                                                                variant="outlined"
                                                                fullWidth
                                                                value={question.question_text}
                                                                onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                                                            /></Grid>
                                                        <Grid item xs={1} sx={{ marginTop: 2 }}>
                                                            <Button
                                                                onClick={() => removeQuestion(questionIndex)}
                                                            >
                                                                <i className="fa fa-trash-o" style={{ color: '#f70000' }} ></i>
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                    <FormControl component="fieldset" sx={{ marginTop: 2, marginLeft: 4 }}>
                                                        <RadioGroup value="">
                                                            {question.choice_text.map((choice, choiceIndex) => (
                                                                <div key={choiceIndex}>
                                                                    <FormControlLabel
                                                                        control={<Radio />}
                                                                        label={
                                                                            <input
                                                                                type="text"
                                                                                value={choice}
                                                                                onChange={(e) => handleChoiceChange(questionIndex, choiceIndex, e.target.value)}
                                                                            />
                                                                        }
                                                                    />
                                                                </div>
                                                            ))}
                                                        </RadioGroup>
                                                    </FormControl>
                                                </div>
                                            ) : null
                                        ))}
                                        {questionsToAdd.map((question, questionIndex) => (
                                            question.category_id === data.category_id ? (
                                                <div key={questionIndex}>
                                                    <Grid container alignItems="left" spacing={4}>
                                                        <Grid item xs={12} sx={{ marginTop: 2 }}>
                                                            <Typography variant="h6" gutterBottom>
                                                                {`Question ${questionNumber++}: ${question.question_text}`}
                                                                <Button
                                                                    onClick={() => removeQuestion(questionIndex, true)}
                                                                >
                                                                    <i className="fa fa-trash-o" style={{ color: '#f70000' }} ></i>
                                                                </Button>
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                    {showChoices && (
                                                        <FormControl component="fieldset" sx={{ marginTop: 2, marginLeft: 4 }}>
                                                            <RadioGroup
                                                                value={question.selectedChoice}
                                                                onChange={(e) => {
                                                                    const updatedQuestions = [...questionsToAdd];
                                                                    updatedQuestions[questionIndex].selectedChoice = e.target.value;
                                                                    setQuestionsToAdd(updatedQuestions);
                                                                }}
                                                            >
                                                                {question.choice_text.map((choice, choiceIndex) => (
                                                                    <div key={choiceIndex}>
                                                                        <FormControlLabel
                                                                            value={choice}
                                                                            control={<Radio />}
                                                                            label={choice}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </RadioGroup>
                                                        </FormControl>
                                                    )}
                                                </div>
                                            ) : null
                                        ))}
                                        {isAddingChoices && (
                                            <div>
                                                <TextField
                                                    label="Add Choices"
                                                    variant="outlined"
                                                    fullWidth
                                                    value={newChoice}
                                                    onChange={(e) => setNewChoice(e.target.value)}
                                                />
                                                <Button
                                                    variant="outlined"
                                                    onClick={addChoice}
                                                >
                                                    Add Choice
                                                </Button>
                                            </div>
                                        )}
                                        <div style={{ marginTop: '20px' }}>
                                            <TextField
                                                label="Add Question"
                                                variant="outlined"
                                                fullWidth
                                                value={newQuestion}
                                                onChange={(e) => setNewQuestion(e.target.value)}
                                            />
                                            <Button variant="outlined" onClick={addQuestion}>
                                                Add Question
                                            </Button>
                                        </div>

                                        <Grid container item xs={12} sx={{ marginTop: 2 }} spacing={2}>
                                            <Grid item sm={6}>
                                                <Button type="submit" variant="contained" color="secondary" fullWidth onClick={handleEditCategory}>
                                                    Update
                                                </Button>
                                            </Grid>
                                            <Grid item sm={6}>
                                                <Button type="submit" variant="contained" color="error" fullWidth onClick={handleDeleteCategory}>
                                                    Delete
                                                </Button>
                                            </Grid>
                                        </Grid>


                                    </form>
                                </Container>
                            </> : <>
                                <Container sx={{ marginTop: 2 }}>
                                    <Paper elevation={3} style={{ padding: 16 }}>
                                        <form onSubmit={handleEditCategory}>
                                            <TextField
                                                id='videoLink'
                                                name='videoLink'
                                                label="Video Link"
                                                variant="outlined"
                                                fullWidth
                                                defaultValue={data.videoLink}
                                                onChange={handleChange}
                                            />
                                            <Grid container item xs={12} sx={{ marginTop: 2 }} spacing={2}>
                                                <Grid item sm={6}>
                                                    <Button type="submit" variant="contained" color="secondary" fullWidth onClick={handleEditCategory}>
                                                        Update
                                                    </Button>
                                                </Grid>
                                                <Grid item sm={6}>
                                                    <Button type="submit" variant="contained" color="error" fullWidth onClick={handleDeleteCategory}>
                                                        Delete
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </form>
                                    </Paper>
                                </Container>
                            </>}
                        </Grid>
                    </Stack>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default HrTrainingsEditModal
