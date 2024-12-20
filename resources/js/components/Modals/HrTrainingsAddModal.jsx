import { Box, Button, FormControl, IconButton, InputLabel, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, Grid, Select, MenuItem, TextField, Container, RadioGroup, FormControlLabel, Radio, Input, Paper } from '@mui/material';
import React, { useState, useEffect } from 'react'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';

const HrTrainingsAddModal = ({ open, close }) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [trainingData, setTrainingData] = useState({
        title: '',
        description: '',
        cover_file: null,
        course_type: '',
        duration: '',
        date_from_val: '',
        date_to_val: '',
        videoLink: '',
    });
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [newChoice, setNewChoice] = useState('');
    const [isAddingChoices, setIsAddingChoices] = useState(false);
    const [selectedCover, setSelectedCover] = useState('photo');
    const [coverData, setCoverData] = useState('');

    useEffect(() => {
        axiosInstance.get('/cover', { headers }).then((response) => {
            setCoverData(response.data.coverData);
        });
    }, [])

    const handleChange = (event) => {
        const { name, value, type, files } = event.target;

        if (name === 'cover') {
            setSelectedCover(value);
        } else if (name === 'cover_file') {
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
                    formattedValue = `${hours}:${minutes} Hour/s`;
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

    const handleAddCategory = (event) => {
        event.preventDefault();

        const formData = new FormData();

        formData.append('title', trainingData.title);
        formData.append('description', trainingData.description);
        formData.append('attached_file', trainingData.cover_file);
        formData.append('cover_type', selectedCover);
        formData.append('category', "training");
        formData.append('course_type', trainingData.course_type);
        formData.append('duration', trainingData.duration);
        formData.append('date_from_val', trainingData.date_from_val);
        formData.append('date_to_val', trainingData.date_to_val);
        formData.append('videoLink', trainingData.videoLink);

        if (trainingData.course_type === "Assessment-based training") {
            formData.append('questions', JSON.stringify(questions));
        }

        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to add this training?",
            icon: "warning",
            dangerMode: true,
            showCancelButton: true,
        }).then(res => {
            if (res.isConfirmed) {
                axiosInstance.post('/add_category', formData, { headers }).then(function (response) {
                    Swal.fire({
                        customClass: {
                            container: 'my-swal'
                        },
                        text: "Training has been added successfully",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: false
                    }).then(function (res) {
                        console.log(res);
                        location.reload();
                    });
                })
            } else {
                location.reload();
            }
        });
    };

    const courseTypeOptions = ["Assessment-based training", "E-learning through videos"];

    const addQuestion = () => {
        if (newQuestion.trim() !== '') {
            setQuestions((prevQuestions) => [
                ...prevQuestions,
                {
                    text: newQuestion,
                    choices: [],
                    selectedChoice: '',
                },
            ]);
            setNewQuestion('');
            setIsAddingChoices(true);
        }
    };

    const addChoice = () => {
        if (newChoice.trim() !== '' && isAddingChoices) {
            const updatedQuestions = [...questions];
            const currentQuestionIndex = updatedQuestions.length - 1;
            updatedQuestions[currentQuestionIndex].choices.push(newChoice);
            setQuestions(updatedQuestions);
            setNewChoice('');
        }
    };

    const removeQuestion = (questionIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions.splice(questionIndex, 1);
        setQuestions(updatedQuestions);
    };
    console.log(selectedCover);
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
                    <form id="add_trainings" onSubmit={handleAddCategory} encType="multipart/form-data">
                        <DialogContentText>
                            <Typography className="text-center" sx={{ fontSize: 20 }}>Add Training Courses</Typography>
                        </DialogContentText>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={8} sx={{ marginTop: 2 }}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel htmlFor="leave_type">Type of Course</InputLabel>
                                    <Select
                                        label="Type of Application"
                                        name="course_type"
                                        id="course_type"
                                        value={trainingData.course_type}
                                        onChange={handleChange}
                                    >
                                        <MenuItem disabled value="">
                                        </MenuItem>
                                        {courseTypeOptions.map((option, index) => (
                                            <MenuItem key={index} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    id='title'
                                    name='title'
                                    label="Title"
                                    variant="outlined"
                                    fullWidth
                                    onChange={handleChange}
                                    sx={{ marginTop: 2 }}
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
                                    sx={{ marginTop: 2, marginBottom: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} sx={{ marginTop: 2 }}>
                                <FormControl fullWidth variant="outlined">
                                    <FormControl component="fieldset" sx={{ display: 'flex', alignItems: 'left', marginTop: 1, marginBottom: .75 }}>
                                        <RadioGroup
                                            aria-label="cover"
                                            name="cover"
                                            value={selectedCover}
                                            onChange={handleChange}
                                            row
                                            sx={{
                                                '& .MuiSvgIcon-root': {
                                                    width: '16px',
                                                    height: '16px',
                                                },
                                                '& .MuiTypography-body1': {
                                                    fontSize: '12px',
                                                },
                                            }}
                                        >
                                            {coverData !== 'Yes' ? <>
                                                <FormControlLabel
                                                    value="default"
                                                    control={<Radio />}
                                                    label="Add Default Cover"
                                                />
                                                <FormControlLabel
                                                    value="photo"
                                                    control={<Radio />}
                                                    label="Add Photo Cover"
                                                /></>
                                                : <>
                                                    <FormControlLabel
                                                        value="photo"
                                                        control={<Radio />}
                                                        label="Add Photo Cover"
                                                    />
                                                    <FormControlLabel
                                                        value="template"
                                                        control={<Radio />}
                                                        label="Use Default Cover"
                                                    /></>
                                            }
                                        </RadioGroup>
                                    </FormControl>
                                    {selectedCover !== 'template' ? <>
                                        <Grid item sx={{ marginTop: 3.25, marginBottom: 1.75 }}>
                                            <Input type="file" inputProps={{ accept: 'image/*' }} name="cover_file"
                                                id="cover_file" onChange={handleChange} />
                                        </Grid>
                                    </> : <></>}
                                </FormControl>
                                <TextField
                                    id="duration"
                                    name="duration"
                                    fullWidth
                                    label="Training Duration"
                                    value={trainingData.duration}
                                    variant="outlined"
                                    onChange={handleChange}
                                    sx={{ marginTop: 2 }}
                                />
                                <TextField id="date_from_val" label="Start Date" type="date" fullWidth variant="outlined" name="date_from_val"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    onChange={handleChange}
                                    sx={{ marginTop: 2 }} />
                                <TextField id="date_to_val" label="End Date" type="date" fullWidth variant="outlined" name="date_to_val"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    onChange={handleChange}
                                    sx={{ marginTop: 2 }} />
                            </Grid>
                            {trainingData.course_type === 'Assessment-based training' ? <>
                                <Container sx={{ marginTop: 2 }}>
                                    <form onSubmit={handleAddCategory}>
                                        {questions.map((question, questionIndex) => (
                                            <div key={questionIndex}>
                                                <Grid container alignItems="left" spacing={4}>
                                                    <Grid item xs={12} sx={{ marginTop: 2 }}>
                                                        <Typography variant="h6" gutterBottom>
                                                            {`Question ${questionIndex + 1}: ${question.text}`}
                                                            <Button
                                                                onClick={() => removeQuestion(questionIndex)}
                                                            >
                                                                <i className="fa fa-trash-o" style={{ color: '#f70000' }} ></i>
                                                            </Button>
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                                <FormControl component="fieldset" sx={{ marginTop: 2, marginLeft: 4 }}>
                                                    <RadioGroup
                                                        name={`question_${questionIndex}`}
                                                        value={question.selectedChoice}
                                                        onChange={(e) => {
                                                            const updatedQuestions = [...questions];
                                                            updatedQuestions[questionIndex].selectedChoice = e.target.value;
                                                            setQuestions(updatedQuestions);
                                                        }}
                                                    >
                                                        {question.choices.map((choice, choiceIndex) => (
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
                                                {isAddingChoices && questionIndex === questions.length - 1 && (
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
                                            </div>
                                        ))}
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
                                        {isAddingChoices && (
                                            <Grid item xs={12} sx={{ marginTop: 2 }}>
                                                <Button type="submit" variant="contained" color="primary" fullWidth
                                                    onClick={handleAddCategory}>
                                                    Submit
                                                </Button>
                                            </Grid>
                                        )}
                                    </form>
                                </Container>
                            </> : <>
                                <Container sx={{ marginTop: 2 }}>
                                    <Paper elevation={3} style={{ padding: 16 }}>
                                        <form onSubmit={handleAddCategory}>
                                            <TextField
                                                id='videoLink'
                                                name='videoLink'
                                                label="Video Link"
                                                variant="outlined"
                                                fullWidth
                                                value={trainingData.videoLink}
                                                onChange={handleChange}
                                            />
                                            <Grid item xs={12} sx={{ marginTop: 2 }}>
                                                <Button type="submit" variant="contained" color="primary" fullWidth
                                                    onClick={handleAddCategory}>
                                                    Submit
                                                </Button>
                                            </Grid>
                                        </form>
                                    </Paper>
                                </Container>
                            </>}
                        </Grid>
                    </form>
                </DialogContent>
            </Dialog >
        </>
    )
}

export default HrTrainingsAddModal
