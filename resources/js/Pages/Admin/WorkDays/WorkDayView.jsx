import React, { useEffect, useState } from 'react'
import Layout from '../../../components/Layout/Layout'
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import Swal from 'sweetalert2';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import '../../../../../resources/css/calendar.css'
import moment from 'moment';
import { useSearchParams } from 'react-router-dom'
import HrWorkhoursModal from '../../../components/Modals/HrWorkhoursModal';

const WorkDayView = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const empID = searchParams.get('employeeID')
    const [workDays, setWorkDays] = useState([]);
    const [workHours, setWorkHours] = useState();

    const [currentEvents, setCurrentEvents] = useState([]);
    const [workshifts, setWorkshifts] = useState([]);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [currentDate, setCurrentDate] = useState(new Date());
    const [openWorkhoursData, setOpenWorkhoursData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [workGroups, setWorkGroups] = useState([]);
    const [selectedWorkGroup, setSelectedWorkGroup] = useState('0');

    useEffect(() => {  
        axiosInstance.get('/workshedule/getWorkGroups', { headers })
            .then((response) => {
                setWorkGroups(response.data.workGroups);
            }).catch((error) => {
                console.error('Error fetching branches:', error);
            });
    }, []);

    const handleDateSelect = (selectInfo) => {
        let startDate = selectInfo.startStr;
        let endDate = selectInfo.endStr;
        let start_dates = []
        let end_dates = []
        const color = 'rgb(0, 128, 24)';

        let exist = false;

        workDays.map((item) => {
            const formattedStartDate = moment(item.start).format('YYYY-MM-DD');
            const formattedSelectDate = moment(selectInfo.startStr).format('YYYY-MM-DD');

            if (formattedStartDate === formattedSelectDate) {
                exist = true;
            }

        });

        if (exist) {
            Swal.fire({
                icon: 'warning',
                title: 'Error',
                text: 'Work day already existed',
            });
        } else {
            while (moment(startDate) < moment(endDate)) {
                start_dates.push(startDate);
                startDate = moment(startDate).add(1, 'days').format("YYYY-MM-DD");
            }

            start_dates.forEach(endDates => {
                end_dates.push(moment(endDates).add(1, 'days').format("YYYY-MM-DD"));
            });

            if (moment(selectInfo.startStr).format('YYYY-MM-DD') >= moment(currentDate).format('YYYY-MM-DD')) {
                Swal.fire({
                    title: 'Are you sure?',
                    text: 'Confirm to Add this to Work Day?',
                    icon: 'warning',
                    allowOutsideClick: false,
                    showCancelButton: true,
                }).then((res) => {
                    if (res.isConfirmed) {
                        axiosInstance
                            .post(`/add_event`, {
                                title: 'Work Day',
                                start: start_dates,
                                end: end_dates,
                                color: color,
                                shiftId: shiftId,
                            }, { headers })
                            .then((response) => {
                                if (response.data.message === 'Success') {
                                    // location.reload();
                                    handleGroupChange({ target: { value: shiftId } });
                                } else {
                                    alert('Please Try Again');
                                    // location.reload();
                                }
                            })
                            .catch((error) => {
                                console.error('Error:', error);
                            });
                    }
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error',
                    text: 'Can\'t add work day in past date',
                });
            }
        }
    }

    const handleEventClick = (clickInfo) => {
        const selectedDate = clickInfo.event.start;

        const today = new Date();
        if (moment(selectedDate).format('L') > moment(today).format('L')) {
            new Swal({
                title: "Are you sure?",
                text: "Confirm to Delete this Work day?",
                icon: "warning",
                allowOutsideClick: false,
                showCancelButton: true,
            }).then(res => {
                if (res.isConfirmed) {
                    axiosInstance.post(`/delete_events`, { eventID: clickInfo.event.id }, { headers }).then(function (response) {
                        if (response.data.deleteData = 'Success') {
                            location.reload();
                        } else {
                            alert('Please Try Again');
                            location.reload();
                        }
                    })
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Error',
                text: 'Past and today\'s work day can\'t be deleted.',
            });
            return;
        }

    }

    const handleEvents = (events) => {
        setCurrentEvents(events)
    }

    const handleOpenEditWorkhours = () => {
        setOpenWorkhoursData(true)
    }

    const handleCloseEditWorkhours = () => {
        setOpenWorkhoursData(false)
    }

    const handleGroupChange = (groupId) => {
        setIsLoading(true);
        setSelectedWorkGroup(groupId);
    
        const data = { workGroupId: groupId };

        axiosInstance.get('/workshedule/getWorkDays', { params: data, headers })
            .then((response) => {
                // setRoles(response.data.roles);
                // setSelectedRole(employee.role_id);

                setIsLoading(false);
            }).catch((error) => {
                console.error('Error fetching work days:', error);
            });
    };
    

    return (
        <Layout title={"WorkDayView"}>
            <Box sx={{ overflowX: 'scroll', width: '100%', whiteSpace: 'nowrap' }}>
                <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' }}}>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }} > Work Days </Typography>

                        <FormGroup row={true} className="d-flex justify-content-between" sx={{
                            '& label.Mui-focused': {color: '#97a5ba'},
                            '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': {borderColor: '#97a5ba'}},
                        }}>                        
                            <FormControl sx={{ width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                                '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                            }}>
                                <TextField
                                    select
                                    id="workGroup"
                                    label="Work Group"
                                    value={selectedWorkGroup}
                                    onChange={(event) => handleGroupChange(event.target.value)}
                                    sx={{ minWidth: '150px' }}
                                >
                                    <MenuItem key={0} value={0}> Select Work Group </MenuItem>
                                    {workGroups.map((workGroup) => (
                                        <MenuItem key={workGroup.id} value={workGroup.id}> {workGroup.name} </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        </FormGroup>
                    </Box>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
                    
                        {selectedWorkGroup === '0' ? (
                            <Box sx={{ my: 5, py: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Select Work Group </Typography>
                            </Box>
                        ) : (
                            <>
                                {isLoading ? (
                                    <Box sx={{ my: 5, py: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <CircularProgress />
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}> Loading </Typography>
                                    </Box>
                                ) : (
                                    <FullCalendar
                                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                        headerToolbar={{ left: 'title', right: 'prev,next today' }}
                                        // dayGridMonth ,timeGridWeek,timeGridDay
                                        initialView='dayGridMonth'
                                        selectable={true}
                                        selectMirror={true}
                                        dayMaxEvents={true}
                                        editable={false}
                                        contentHeight={700}
                                        displayEventTime={false}
                                        // selectAllow={function (select) {
                                        //     return moment().diff(select.start, 'days') <= 0
                                        // }}
                                        events={workDays}
                                        select={handleDateSelect}
                                        eventClick={handleEventClick}
                                        eventsSet={handleEvents}
                                        showNonCurrentDates={false}
                                    />
                                )}
                            </>
                        )}

                    </Box>

                    { openWorkhoursData && <HrWorkhoursModal open={openWorkhoursData} close={handleCloseEditWorkhours} /> }

                </Box>
            </Box>
        </Layout >
    )
}

export default WorkDayView
