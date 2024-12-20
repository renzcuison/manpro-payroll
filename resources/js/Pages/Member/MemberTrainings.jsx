import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import { Grid, Typography, Card, CardContent, CardMedia, Box } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { NavLink } from 'react-router-dom';

export default function MemberTrainings() {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [trainingsList, setTrainingsList] = useState([]);
    const [questionsList, setQuestionsList] = useState([]);

    useEffect(() => {
        axiosInstance.get('/trainings_list', { headers }).then((response) => {
            setTrainingsList(response.data.listData);
        });

        axiosInstance.get('/questions_list', { headers }).then((response) => {
            setQuestionsList(response.data.listData);
        });
    }, [])

    const handleReadBy = (data) => {

        axiosInstance.post('/add_viewers', { category_id: data.category_id }, { headers }).then(function (response) {
            console.log(response);
            // location.reload();
        })
            .catch((error) => {
                console.log(error)
                // location.reload();
            })

    }

    const data = trainingsList.map((item, index) => ({
        id: index,
        category_id: item.category_id,
        title: item.title,
        description: item.description,
        course: item.course_type,
        duration: item.duration,
        start: item.date_from_val,
        end: item.date_to_val,
        cover_file: item.attached_file,
        author_id: item.author_id,
        posted: item.created_at,
        questions: questionsList ? questionsList.filter((question) => question.category_id === item.category_id).map((q, qIndex) => ({
            id: qIndex,
            question_text: q.question_text,
            choice_text: q.choice_text,
        })) : [],
    }));

    const Thumbnail = ({ Title, Course, Duration, Start, End, Cover, Posted }) => {
        return (
            <Card sx={{ borderRadius: '20px' }}>
                <CardMedia sx={{ backgroundImage: `url(${location.origin}/storage/${Cover})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: 250, }} > </CardMedia>
                <CardContent>
                    <div style={{ textAlign: 'left' }}>
                        <Typography sx={{ marginBottom: 2 }} >{Course}</Typography>
                        <Typography sx={{ marginBottom: 4 }} variant='h3'>{Title}</Typography>
                        <Typography>Training Duration: {Duration}</Typography>
                        <Typography>Start date: {Start}</Typography>
                        <Typography>End date: {End}</Typography>
                        <Typography>Posted at: {Posted}</Typography>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <Layout>
            <Box sx={{ mx: 12, mt: 4 }}>
                <Grid item sx={{ marginBottom: 2 }}>
                    <div className="d-flex justify-content-between align-items-center p-0">
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item> <h5 className='pt-3'>Trainings</h5> </Grid>
                        </Grid>
                    </div>
                </Grid>

                <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                    {data.map((item) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id} onClick={() => handleReadBy(item)}>
                            <NavLink to={`/hr/trainings-view?categoryID=${item.category_id}`} >
                                <Thumbnail
                                    Title={item.title}
                                    Course={item.course}
                                    Duration={item.duration}
                                    Start={new Date(item.start).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    End={new Date(item.end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    Cover={item.cover_file}
                                    Posted={new Date(item.posted).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                />
                            </NavLink>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Layout >
    )
}
