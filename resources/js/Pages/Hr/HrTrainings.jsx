import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import { Grid, Typography, Card, CardContent, CardMedia, Button, } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import AddIcon from '@mui/icons-material/Add';
import HrTrainingsAddModal from '../../components/Modals/HrTrainingsAddModal';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';

export default function HrTrainings() {
    const { user } = useUser();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [trainingsList, setTrainingsList] = useState([]);
    const [questionsList, setQuestionsList] = useState([]);
    const [readBy, setReadBy] = useState([]);
    const [openAddTrainings, setOpenAddTrainings] = useState(false)

    useEffect(() => {
        axiosInstance.get('/trainings_list', { headers }).then((response) => {
            setTrainingsList(response.data.listData);
        });

        axiosInstance.get('/questions_list', { headers }).then((response) => {
            setQuestionsList(response.data.listData);
        });

        axiosInstance.get('/read_by_list', { headers }).then((response) => {
            setReadBy(response.data.listData);
        });
    }, [])

    const handleOpenAddTrainings = () => {
        setOpenAddTrainings(true)
    }
    const handleCloseAddTrainings = () => {
        setOpenAddTrainings(false)
    }

    const handleReadBy = (data) => {

        axiosInstance.post('/add_viewers', { category_id: data.category_id }, { headers }).then(function (response) {
            // console.log(response);
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

    const Thumbnail = ({ Category, Title, Course, Duration, Start, End, Cover, Posted, Author }) => {
        return (
            <Card sx={{ background: 'none', border: 'none', boxShadow: 'none' }}>
                <CardMedia sx={{ backgroundImage: `url(${location.origin}/storage/${Cover})`, height: '250px', width: '100%', backgroundRepeat: 'no-repeat', borderRadius: '20px' }} > </CardMedia>
                <CardContent>
                    <div style={{ textAlign: 'left' }}>
                        <Typography variant='h6'>{Title}</Typography>
                        <Typography sx={{ marginBottom: 2 }} >{Course}</Typography>
                        {/* <Typography>Training Duration: {Duration}</Typography> */}
                        {/* <Typography>Start date: {Start}</Typography> */}
                        {/* <Typography>End date: {End}</Typography> */}
                        {/* <Typography>Posted at: {Posted}</Typography> */}
                    </div>
                    <Grid item sx={{ marginRight: 4 }}>
                        <Typography><i className="si si-users"></i>
                            {readBy
                                .filter(viewer => viewer.category_id === Category && viewer.user_id !== Author)
                                .map((viewer, i, filteredViewers) => (
                                    <span key={i}>
                                        {` ${viewer.fname} ${viewer.lname}${i < filteredViewers.length - 1 ? ',' : ''}`}
                                    </span>
                                ))}
                        </Typography>
                    </Grid>
                </CardContent>
            </Card >
        );
    };

    return (
        <Layout>
            <Grid item sx={{ marginBottom: 2 }}>
                <div className="d-flex justify-content-between align-items-center p-0">
                    <Grid container spacing={2}>
                        <Grid item xs={10.5}>
                            <h5 className='pt-3' style={{ fontWeight: 'bold' }}>TRAININGS</h5>
                        </Grid>
                        <Grid item xs={1} sx={{ marginTop: '11px' }}>
                            <Button variant="contained" sx={{ height: '75%', width: '100%', background: 'linear-gradient(190deg, rgb(42, 128, 15,0.8), rgb(233, 171, 19,1))', color: 'white', }} onClick={handleOpenAddTrainings} >
                                Add
                            </Button>
                        </Grid>
                    </Grid>
                </div>

                <Grid style={{ marginLeft: 50 }}>
                    <Typography style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        Elevate your professional journey by transforming your mindset: Embrace continuous learning, adaptability, and collaborative growth to turn challenges into opportunities and reshape your reality.
                    </Typography>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                {data.map((item) => (
                    <Grid item xs={12} sm={6} md={6} lg={4} key={item.id} onClick={() => handleReadBy(item)}>
                        <NavLink to={`/hr/trainings-view?categoryID=${item.category_id}`} >
                            <Thumbnail
                                Category={item.category_id}
                                Title={item.title}
                                Course={item.course}
                                Duration={item.duration}
                                Start={new Date(item.start).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                End={new Date(item.end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                Cover={item.cover_file}
                                Posted={new Date(item.posted).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                Author={item.author_id}
                            />
                        </NavLink>
                    </Grid>
                ))}
            </Grid>

            <HrTrainingsAddModal open={openAddTrainings} close={handleCloseAddTrainings} />
        </Layout >
    )
}
