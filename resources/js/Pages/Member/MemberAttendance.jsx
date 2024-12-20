import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import { Typography, Box, CircularProgress } from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import '../../../../resources/css/calendar.css'
import moment from 'moment';
import MemberAttendanceTime from '../../components/Modals/MemberAttendanceTime'

const MemberAttendance = () => {
    const [getWorkdaysCalendar, setGetWorkdaysCalendar] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openTime, setOpenTime] = useState(false)
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get('/get_attendance', { headers }).then((response) => {
            setGetWorkdaysCalendar(response.data.events);
            setIsLoading(false);
        }).catch((error) => {
            console.error("Error fetching attendance data: ", error);
            setIsLoading(false);
        });
    }, []);

    const handleOpenTime = (arg) => {
        const selectedDate = arg.event.start;

        const today = new Date();
        if (moment(selectedDate).format('L') == moment(today).format('L')) {
            setOpenTime(true)
        } else {
            Swal.fire({ icon: 'warning', title: 'Error', text: 'Please Select Todays Date.', });
            return;
        }
    }
    const handleCloseTime = () => {
        setOpenTime(false)
    }

    return (
        <Layout title={"Employees Calendar"}>
            <Box sx={{ mx: 12, mt: 4 }}>
                <div className="content-heading d-flex justify-content-between p-0">
                    <Typography variant="h5">Attendance</Typography>
                </div>

                <div className="block" >
                    <div className="block-content">
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                <CircularProgress />
                            </div>
                        ) : (
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                headerToolbar={{ left: 'title', right: 'prev,next today' }}
                                initialView='dayGridMonth'
                                selectable={true}
                                selectMirror={true}
                                dayMaxEvents={true}
                                editable={false}
                                contentHeight={700}
                                displayEventTime={false}

                                events={getWorkdaysCalendar}
                                eventClick={handleOpenTime}
                                showNonCurrentDates={false}
                            />
                        )}
                    </div>
                </div>
                <MemberAttendanceTime open={openTime} close={handleCloseTime} />
            </Box>
        </Layout>
    )
}

export default MemberAttendance
