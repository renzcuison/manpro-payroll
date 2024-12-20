import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import { Grid, Typography, Button, FormControl, FormControlLabel, Radio, RadioGroup, Stack, TableContainer, Table, TableBody, TableRow, TableCell, TablePagination, Paper } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import { useUser } from '../../hooks/useUser';
import HrTrainingsEditModal from '../../components/Modals/HrTrainingsEditModal';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import PageHead from '../../components/Table/PageHead'
import { getComparator, stableSort } from '../../components/utils/tableUtils';
import HrTrainingsViewCheck from '../../components/Modals/HrTrainingsViewCheck';
import YouTube from 'react-youtube';

function extractVideoIdFromLink(link) {
    if (typeof link !== 'string' || !link) {
        return null;
    }

    const videoIdIndex = link.indexOf('v=');

    if (videoIdIndex !== -1) {
        const videoId = link.slice(videoIdIndex + 2);
        const ampersandIndex = videoId.indexOf('&');
        if (ampersandIndex !== -1) {
            return videoId.substring(0, ampersandIndex);
        }
        return videoId;
    }

    return null;
}

export default function HrTrainingsView() {
    const { user } = useUser();
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [trainingsList, setTrainingsList] = useState([]);
    const [questionsList, setQuestionsList] = useState([]);
    const [takeBy, setTakeBy] = useState([]);
    const [openEditTrainings, setOpenEditTrainings] = useState(false)
    const [openViewCheck, setOpenViewCheck] = useState(false)
    const [selectedChoices, setSelectedChoices] = useState(new Array(questionsList.length).fill(''));
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [page, setPage] = useState(0);
    const [userID, setUserID] = useState();
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const categoryID = parseInt(searchParams.get('categoryID'), 10);
    const [categoryData, setCategoryData] = useState({
        title: '',
        description: '',
        attached_file: null,
    });
    let questionNumber = 0;

    useEffect(() => {
        axiosInstance.get('/trainings_list', { headers }).then((response) => {
            setTrainingsList(response.data.listData);
        });

        axiosInstance.get('/questions_list', { headers }).then((response) => {
            setQuestionsList(response.data.listData);
        });

        axiosInstance.get('/take_by_list', { headers }).then((response) => {
            setTakeBy(response.data.listData);
        });

    }, [])

    const headCells = [];

    if (user.user_type === 'Member') {
        headCells.push(
            {
                id: '',
                label: '',
                sortable: true,
            }
        );
    } else {
        headCells.push(
            {
                id: 'fname',
                label: 'Name',
                sortable: true,
            }
        );
    }

    headCells.push(
        {
            id: 'score',
            label: 'Score',
            sortable: true,
        },
        {
            id: 'items',
            label: 'Items',
            sortable: true,
        },
        {
            id: 'percentage',
            label: 'Percentage',
            sortable: true,
        }
    );

    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - takeBy.length) : 0;

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const handleOpenEditTrainings = (data) => {
        setOpenEditTrainings(true)
        setCategoryData(data)
    }
    const handleCloseEditTrainings = () => {
        setOpenEditTrainings(false)
    }

    const handleOpenViewCheck = (data, take) => {
        setOpenViewCheck(true)
        setCategoryData(data)
        setUserID(take)
    }
    const handleCloseViewCheck = () => {
        setOpenViewCheck(false)
    }

    const handleAddAnswer = (event) => {
        event.preventDefault();
        const hasUnansweredQuestions = selectedChoices.length < questionNumber;

        if (hasUnansweredQuestions) {
            new Swal({
                customClass: {
                    container: "my-swal",
                },
                title: "Invalid!",
                text: "Please answer all the questions.",
                icon: "warning",
                showOkayButton: true,
            });
            return;
        }

        const formData = new FormData();

        formData.append('category_id', categoryID);
        formData.append('selectedChoices', JSON.stringify(selectedChoices));

        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to submit this answers?",
            icon: "warning",
            showCancelButton: true,
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance
                    .post('/add_answers', formData, { headers })
                    .then(function (response) {
                        console.log(response);
                        window.location.reload();
                    })
                    .catch((error) => {
                        console.log(error);
                        window.location.reload();
                    });
            } else {
                window.location.reload();
            }
        });
    };

    const handleAddAnswerKey = (event) => {
        event.preventDefault();
        const hasUnansweredQuestions = selectedChoices.length < questionNumber;

        if (hasUnansweredQuestions) {
            new Swal({
                customClass: {
                    container: "my-swal",
                },
                title: "Invalid!",
                text: "Please answer all the questions.",
                icon: "warning",
                showOkayButton: true,
            });
            return;
        }

        const formData = new FormData();

        formData.append('category_id', categoryID);
        formData.append('selectedChoices', JSON.stringify(selectedChoices));

        new Swal({
            customClass: {
                container: "my-swal",
            },
            title: "Are you sure?",
            text: "You want to submit this answer key?",
            icon: "warning",
            showCancelButton: true,
        }).then((res) => {
            if (res.isConfirmed) {
                axiosInstance
                    .post('/add_answer_key', formData, { headers })
                    .then(function (response) {
                        console.log(response);
                        window.location.reload();
                    })
                    .catch((error) => {
                        console.log(error);
                        window.location.reload();
                    });
            } else {
                window.location.reload();
            }
        });
    };

    const handleRadioChange = (questionIndex, choiceLabel) => {
        setSelectedChoices((prevSelectedChoices) => {
            const updatedSelectedChoices = [...prevSelectedChoices];
            updatedSelectedChoices[questionIndex] = choiceLabel;
            return updatedSelectedChoices;
        });
    };

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
        author_fname: item.author_fname,
        author_lname: item.author_lname,
        posted: item.created_at,
        videoLink: item.videoLink,
        questions: questionsList ? questionsList.filter((question) => question.category_id === item.category_id).map((q, qIndex) => ({
            id: qIndex,
            question_text: q.question_text,
            choice_text: q.choice_text,
        })) : [],
    }));

    return (
        <Layout>
            <div className='block'>
                <div className=" block-content col-lg-12 col-sm-12 ">
                    {data.map((item) => (
                        <Stack key={item.id}>
                            {item.category_id === categoryID ? <>
                                <Grid container item xs={12} sx={{ marginTop: 2 }}>
                                    <Grid item sm={0.5}></Grid>
                                    <Grid item sm={11}>
                                        <Grid container item xs={12}>
                                            <Grid item sm={2} sx={{ paddingTop: '7.5px' }}>
                                                <Typography style={{ fontWeight: 'bold' }} variant='subtitle2'>POSTED BY: {item.author_fname.toUpperCase()} {item.author_lname.toUpperCase()}</Typography>
                                            </Grid>
                                            <Grid item sm={8}></Grid>
                                            {(user.user_id === item.author_id || user.user_type === 'Super Admin') && (
                                                <Grid item sm={2} sx={{ textAlign: 'right' }}>
                                                    <Button type="submit" variant="contained" color="secondary" onClick={() => handleOpenEditTrainings(item)}
                                                        disabled={takeBy.length === 0 ? false : true}>
                                                        Update
                                                    </Button>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Grid>
                                    <Grid item sm={0.5}></Grid>
                                </Grid>
                                {item.course === 'Assessment-based training' ? <>
                                    <Grid container item xs={12} sx={{ marginTop: 4 }} justifyContent={'center'}>
                                        <Grid item sm={8}>
                                            <Typography
                                                sx={{
                                                    overflowWrap: 'break-word',
                                                    textAlign: 'center',
                                                    fontSize: 40,
                                                    fontFamily: 'Stencil',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    marginBottom: 4
                                                }}
                                                variant="h1">
                                                {item.title}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    overflowWrap: 'break-word',
                                                    textAlign: 'justify',
                                                    fontFamily: 'Rockwell',
                                                    marginBottom: 2
                                                }}
                                                variant="h6">
                                                {item.description}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Stack sx={{ marginTop: 2, marginInline: 12 }}>
                                        <form onSubmit={handleAddAnswer}>
                                            {questionsList.map((question, questionIndex) => (
                                                question.category_id === item.category_id ? (
                                                    <Grid container item xs={12} justifyContent={'center'} sx={{ marginBottom: 4 }}>
                                                        <Grid item
                                                            sx={{
                                                                position: 'relative',
                                                                width: '80%',
                                                                height: 'auto',
                                                                backgroundColor: '#f5f5f5',
                                                                borderRadius: '20px',
                                                                overflow: 'hidden',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                minHeight: '200px',
                                                            }}>
                                                            <div key={questionIndex}>
                                                                <Grid item xs={12} sx={{ padding: 2, backgroundColor: '#c9e5ce', borderRadius: '20px 20px 0 0' }}>
                                                                    <Typography variant="h4"
                                                                        sx={{
                                                                            overflowWrap: 'break-word',
                                                                            textAlign: 'justify',
                                                                            fontFamily: 'Constantia',
                                                                            fontWeight: 'bold'
                                                                        }}>
                                                                        {`${++questionNumber}. `}
                                                                        <span>{question.question_text}</span>
                                                                    </Typography>
                                                                </Grid>
                                                                <FormControl component="fieldset" sx={{ marginTop: 2, marginLeft: 4 }}>
                                                                    {question.choice_text.map((choice, choiceIndex) => (
                                                                        <div key={choiceIndex}>
                                                                            <FormControlLabel
                                                                                control={<Radio
                                                                                    checked={selectedChoices[questionIndex] === choice}
                                                                                    onChange={() => handleRadioChange(questionIndex, choice)}
                                                                                />}
                                                                                label={
                                                                                    <Typography variant="h6">{choice}</Typography>
                                                                                }
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </FormControl>
                                                            </div>
                                                        </Grid>
                                                    </Grid>
                                                ) : null
                                            ))}
                                            {user.user_type === 'Member' ? (
                                                <>
                                                    <Grid container item xs={12} sx={{ marginTop: 2 }} justifyContent={'center'}>
                                                        <Grid item sm={8}>
                                                            {takeBy.length === 0 ? <>
                                                                <Grid item xs={12} sx={{ marginBlock: 2 }} >
                                                                    <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleAddAnswer}>
                                                                        Submit
                                                                    </Button>
                                                                </Grid>
                                                            </> : <>
                                                                {!takeBy.some((take) => take.category_id === item.category_id && user.user_id === take.user_id) && (
                                                                    <Grid item xs={12} sx={{ marginBlock: 2 }}>
                                                                        <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleAddAnswer}>
                                                                            Submit
                                                                        </Button>
                                                                    </Grid>
                                                                )}

                                                            </>}
                                                        </Grid>
                                                    </Grid>
                                                    <TableContainer sx={{ marginTop: 4 }}>
                                                        <Table className="table table-md  table-striped  table-vcenter">
                                                            <PageHead
                                                                order={order}
                                                                orderBy={orderBy}
                                                                onRequestSort={handleRequestSort}
                                                                headCells={headCells}
                                                            />
                                                            <TableBody>
                                                                {takeBy.filter(take => take.category_id === item.category_id).length != 0 ? stableSort(takeBy, getComparator(order, orderBy))
                                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                                    .map((take, index) => {
                                                                        return (
                                                                            take.user_id === user.user_id ?
                                                                                <TableRow
                                                                                    key={index}
                                                                                    hover
                                                                                    role="checkbox"
                                                                                    tabIndex={-1}
                                                                                    onClick={() => handleOpenViewCheck(item, take.user_id)}>

                                                                                    <TableCell></TableCell>
                                                                                    <TableCell>{take.checking}</TableCell>
                                                                                    <TableCell>{questionNumber}</TableCell>
                                                                                    <TableCell>{(take.checking / questionNumber * 100).toFixed(0)}%</TableCell>
                                                                                </TableRow>
                                                                                : null
                                                                        )
                                                                    }) :

                                                                    <TableRow hover
                                                                        role="checkbox"
                                                                        tabIndex={-1}>
                                                                        <TableCell colSpan={8} className="text-center">No data Found</TableCell>
                                                                    </TableRow>

                                                                }

                                                                {emptyRows > 0 && (
                                                                    <TableRow
                                                                        style={{
                                                                            height: 53 * emptyRows,
                                                                        }}
                                                                    >
                                                                        <TableCell colSpan={6} >No data Found</TableCell>
                                                                    </TableRow>
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </>
                                            ) : <>
                                                <Grid container item xs={12} sx={{ marginTop: 2 }} justifyContent={'center'}>
                                                    <Grid item sm={8}>
                                                        {questionsList.some((answerKey) => answerKey.category_id === item.category_id && answerKey.author_id === user.user_id && answerKey.answer_key === null) && (
                                                            <Grid item xs={12} sx={{ marginBlock: 2 }}>
                                                                <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleAddAnswerKey}>
                                                                    Submit Answer Key
                                                                </Button>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </Grid>
                                                <TableContainer sx={{ marginTop: 4 }}>
                                                    <Table className="table table-md  table-striped  table-vcenter">
                                                        <PageHead
                                                            order={order}
                                                            orderBy={orderBy}
                                                            onRequestSort={handleRequestSort}
                                                            headCells={headCells}
                                                        />
                                                        <TableBody>
                                                            {takeBy.filter(take => take.category_id === item.category_id).length != 0 ? stableSort(takeBy, getComparator(order, orderBy))
                                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                                .map((take, index) => {
                                                                    return (
                                                                        <TableRow
                                                                            key={index}
                                                                            hover
                                                                            role="checkbox"
                                                                            tabIndex={-1}
                                                                            onClick={() => handleOpenViewCheck(item, take.user_id)}>

                                                                            <TableCell>{take.fname} {take.lname}</TableCell>
                                                                            <TableCell>{take.checking}</TableCell>
                                                                            <TableCell>{questionNumber}</TableCell>
                                                                            <TableCell>{(take.checking / questionNumber * 100).toFixed(0)}%</TableCell>
                                                                        </TableRow>
                                                                    )
                                                                }) :

                                                                <TableRow hover
                                                                    role="checkbox"
                                                                    tabIndex={-1}>
                                                                    <TableCell colSpan={8} className="text-center">No data Found</TableCell>
                                                                </TableRow>

                                                            }

                                                            {emptyRows > 0 && (
                                                                <TableRow
                                                                    style={{
                                                                        height: 53 * emptyRows,
                                                                    }}
                                                                >
                                                                    <TableCell colSpan={6} >No data Found</TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                                <TablePagination
                                                    rowsPerPageOptions={[5, 10, 25]}
                                                    component="div"
                                                    count={takeBy.filter(take => take.category_id === item.category_id).length}
                                                    rowsPerPage={rowsPerPage}
                                                    page={page}
                                                    onPageChange={handleChangePage}
                                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                                    sx={{
                                                        '.MuiTablePagination-actions': {
                                                            marginBottom: '20px'
                                                        },
                                                        '.MuiInputBase-root': {
                                                            marginBottom: '20px'
                                                        }
                                                    }}
                                                />
                                            </>
                                            }
                                            <Grid container item xs={12} sx={{ marginTop: 2 }} justifyContent={'center'}>
                                                <Grid item sm={8}>
                                                    <Grid container item xs={12} sx={{ marginTop: 2 }}>
                                                        <Grid item sm={4}><Typography sx={{ textAlign: 'left' }}>Training Duration: {item.duration} Hour/s</Typography></Grid>
                                                        <Grid item sm={4}><Typography sx={{ textAlign: 'center' }}>Start date: {new Date(item.start).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography>                                            </Grid>
                                                        <Grid item sm={4}><Typography sx={{ textAlign: 'right' }}>End date: {new Date(item.end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography></Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </form>
                                    </Stack>
                                </> : <>
                                    <Grid container item xs={12} sx={{ marginTop: 4 }} justifyContent={'center'}>
                                        <Grid item sm={8}>
                                            <Typography
                                                sx={{
                                                    overflowWrap: 'break-word',
                                                    textAlign: 'center',
                                                    fontSize: 40,
                                                    fontFamily: 'Stencil',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    marginBottom: 4
                                                }}
                                                variant="h1"
                                            >
                                                {item.title}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Grid container item xs={12} justifyContent={'center'}>
                                        <Grid item
                                            sx={{
                                                position: 'relative',
                                                width: '640px',
                                                height: '360px',
                                                borderRadius: '20px',
                                                overflow: 'hidden'
                                            }}

                                        >
                                            <YouTube
                                                sx={{
                                                    height: 'auto',
                                                    width: 'auto',
                                                    position: 'relative',
                                                    zIndex: 1
                                                }}
                                                videoId={extractVideoIdFromLink(item.videoLink)}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid container item xs={12} sx={{ marginTop: 4 }} justifyContent={'center'}>
                                        <Grid item sm={8}>
                                            <Typography variant="h4"
                                                sx={{
                                                    overflowWrap: 'break-word',
                                                    textAlign: 'justify',
                                                    fontFamily: 'Rockwell',
                                                    marginBottom: 2
                                                }}>{item.description}</Typography>
                                        </Grid>
                                    </Grid>
                                    <Grid container item xs={12} sx={{ marginTop: 2 }} justifyContent={'center'}>
                                        <Grid item sm={8}>
                                            <Grid container item xs={12} sx={{ marginTop: 2 }}>
                                                <Grid item sm={4}><Typography sx={{ textAlign: 'left' }}>Training Duration: {item.duration} Hour/s</Typography></Grid>
                                                <Grid item sm={4}><Typography sx={{ textAlign: 'center' }}>Start date: {new Date(item.start).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography>                                            </Grid>
                                                <Grid item sm={4}><Typography sx={{ textAlign: 'right' }}>End date: {new Date(item.end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography></Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </>}
                            </> : null}

                        </Stack>
                    ))}
                </div>
            </div>

            <HrTrainingsEditModal open={openEditTrainings} close={handleCloseEditTrainings} data={categoryData} />
            <HrTrainingsViewCheck open={openViewCheck} close={handleCloseViewCheck} data={categoryData} userID={userID} />

        </Layout >
    )
}
