import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import { Select, InputLabel, FormControl, Box, Menu, MenuItem, CircularProgress  } from '@mui/material'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import '../../../../resources/css/calendar.css'
import moment from 'moment';
import { useSearchParams } from 'react-router-dom'
import Iconify from '../../components/iconify/iconify/Iconify';
import HrWorkhoursModal from '../../components/Modals/HrWorkhoursModal';

const HrEmployeesCalendar = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const empID = searchParams.get('employeeID')
    const [getEvents, setGetEvents] = useState([]);
    const [getHours, setGetHours] = useState();
    const [shiftType , setShiftType ] = useState();
    const [currentEvents, setCurrentEvents] = useState([]);
    const [workshifts, setWorkshifts] = useState([]);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [currentDate, setCurrentDate] = useState(new Date());
    const [openWorkhoursData, setOpenWorkhoursData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedShiftType, setSelectedShiftType] = useState('0');
    const [shiftId, setShiftId] = useState('0');

    useEffect(() => {  
        axiosInstance.get(`/getWorkshifts`, { headers })
            .then((response) => {
                console.log(response);
                setWorkshifts(response.data.workShifts);
            })
            .catch((error) => {
                console.error('Error fetching work shifts:', error);
            });
    }, []);

    const handleDateSelect = (selectInfo) => {
        let startDate = selectInfo.startStr;
        let endDate = selectInfo.endStr;
        let start_dates = []
        let end_dates = []
        const color = 'rgb(0, 128, 24)';

        // let calendarApi = selectInfo.view.calendar
        // calendarApi.addEvent({
        //     id: createEventId(),
        //     title: 'On Duty',
        //     start: selectInfo.startStr,
        //     end: selectInfo.endStr,
        //     allDay: selectInfo.allDay
        // })
        // calendarApi.unselect()

        let exist = false;

        getEvents.map((item) => {
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
                                    handleShiftChange({ target: { value: shiftId } });
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

    const handleShiftChange = (event) => {
        setIsLoading(true);   
        const shiftId = event.target.value;
    
        setShiftId(shiftId);
        setSelectedShiftType(shiftId);
    
        console.log("shiftId:", shiftId);
    
        setCurrentDate(new Date());
        axiosInstance.get(`/get_events/${empID}/` + shiftId, { headers }).then((response) => {
            setGetEvents(response.data.events);
            setGetHours(response.data.hours);
            setIsLoading(false);
        });
    };
    

    return (
        <Layout title={"Employees Calendar"}>
            <Box sx={{ mx: 12 }}>

                <div className="content-heading d-flex justify-content-between px-4">
                    <h5 className='pt-3'>Work Days</h5>

                    <div>
                        {/* <Iconify icon='bx:edit' onClick={handleOpenEditWorkhours} sx={{ position: 'absolute', top: 8, right: '20px', transition: 'all .2s ease-in-out', '&:hover': { color: 'blue', cursor: 'pointer', transform: 'scale(1.1)', } }} /> */}

                        <FormControl sx={{
                            marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: '#97a5ba' },
                            },
                        }}>
                            <InputLabel id="shiftTypeLabel" shrink={true} sx={{ backgroundColor: '#f0f2f5', paddingLeft: 1, paddingRight: 1, borderColor: '#97a5ba', }}> Work Shift </InputLabel>
                            <Select
                                labelId="shiftTypeLabel"
                                id="shiftType"
                                onChange={handleShiftChange}
                                value={selectedShiftType}
                                label="Shift Type"
                                style={{ width: '200px', height: '40px' }}
                            >
                                <MenuItem value="0">Select Shift</MenuItem>  {/* Default placeholder */}
                                {workshifts.map(workshift => (
                                    <MenuItem key={workshift.id} value={workshift.id}>{workshift.description}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </div>
                
                <div className="block" >
                    <div className="block-content" >

                        {shiftId === '0' ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                <h5 className='pt-3'>Select Work Shift</h5>
                            </div>
                        ) : (
                            <>
                                {isLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                        <CircularProgress />
                                        <h5 className='pt-3'>Loading...</h5>
                                    </div>
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
                                        events={getEvents} // alternatively, use the `events` setting to fetch from a feed
                                        select={handleDateSelect}
                                        eventClick={handleEventClick}
                                        eventsSet={handleEvents}
                                        showNonCurrentDates={false}
                                        // called after events are initialized/added/changed/removed
                                        /* you can update a remote database when these fire:
                                        eventAdd={function(){}}
                                        eventChange={function(){}}
                                        eventRemove={function(){}}
                                        */
                                    />
                                )}
                            </>
                        )}

                    </div>
                </div>

                { openWorkhoursData && <HrWorkhoursModal open={openWorkhoursData} close={handleCloseEditWorkhours} /> }
            </Box>
        </Layout >
    )
}

export default HrEmployeesCalendar
