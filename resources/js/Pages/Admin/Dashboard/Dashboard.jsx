import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import "../../../../../resources/css/calendar.css";
import { Table, TableBody, TableCell, TableContainer, TableRow, Box, TablePagination, TableHead, Avatar, CircularProgress } from "@mui/material";

import { Chart as ChartJS } from 'chart.js/auto';
import { Doughnut } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const Dashboard = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const chartRef = useRef(null);

    const [headCount, setHeadCount] = useState(0);
    const [applicationCount, setApplicationCount] = useState();
    const [announcementCount, setAnnouncementCount] = useState();
    const [trainingCount, setTrainingCount] = useState();
    const [averageAge, setAverageAge] = useState();
    const [averageTenure, setAverageTenure] = useState();

    const [presentCount, setPresentCount] = useState(0);
    const [onLeaveCount, setOnLeaveCount] = useState(0);

    const [branchNames, setBranchNames] = useState([]);
    const [branchCount, setBranchCount] = useState([]);

    const [salaryRange, setSalaryRange] = useState([]);

    const [attendance, setAttendance] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [attendanceLoading, setAttendanceLoading] = useState(true);

    useEffect(() => {
        getDashboardData();
        getAttendance(1);

        return () => {
            if (chartRef.current) {
              chartRef.current.destroy();
            }
        };
    }, []);

    const getDashboardData = () => {
        axiosInstance
            .get(`adminDashboard/getDashboardData`, { headers })
            .then((response) => {
                setHeadCount(response.data.counter.head_count);
                setApplicationCount(response.data.counter.application_count);
                setAnnouncementCount(response.data.counter.announcement_count);
                setTrainingCount(response.data.counter.training_count);

                setAverageAge(response.data.average.age);
                setAverageTenure(response.data.average.tenure);

                setPresentCount(response.data.attendance.present_count);
                setOnLeaveCount(response.data.attendance.onleave_count);

                const brNames = {};
                const brCount = {};
                for (const [branchId, branch] of Object.entries(response.data.branches)) {
                    brNames[branchId] = branch.name;
                    brCount[branchId] = branch.employees || 0;
                }
                setBranchNames(brNames);
                setBranchCount(brCount);

                setSalaryRange(response.data.salary_range);
            });
    }

    const getAttendance = (type) => {
        /* types: 1 - Present, 2 - Late, 3 - Absent, 4 - On Leave */
        setAttendanceLoading(true);
        axiosInstance.get(`adminDashboard/getAttendanceToday`, { headers, params: { type: type } })
            .then((response) => {
                const attendanceData = response.data.attendance || [];
                setAttendance(attendanceData);
                setAttendanceLoading(false);
                getAvatar(attendanceData);
            })
            .catch((error) => {
                console.error('Error fetching attendance:', error);
                setAttendance([]);
                setAttendanceLoading(false);
            });
    };

    // Attendance Pie Chart
    const attendancePieChart = {
        labels: ['Present', 'Absent', 'On Leave'],
        datasets: [
            {
                data: [ presentCount, headCount ? headCount - presentCount - onLeaveCount : 0, onLeaveCount ],
                backgroundColor: ['#177604', '#E9AB13', '#1E90FF'],
                hoverBackgroundColor: ['#1A8F07', '#F0B63D', '#56A9FF'],
            },
        ],
    };
    
    const attendancePieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true }}},
    };

    // Branch Bar Chart
    const branchBarChart = {
        labels: Object.values(branchNames),
        datasets: [
            {
                label: 'Employees',
                backgroundColor: '#177604',
                hoverBackgroundColor: '#1A8F07',
                data: Object.values(branchCount),
            },
        ],
    };
    const branchBarOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { stacked: true },
            y: { stacked: true, suggestedMin: 0 },
        },
    };

    // Salary Pie Chart
    const salaryPieChart = {
        labels: ['10,000 - 20,000', '20,001 - 30,000', '30,001 - 40,000', '40,001 - 50,000', '50,000+'],
        datasets: [
            {
                label: 'Employees',
                data: salaryRange,
                backgroundColor: ['#E9AB13', '#177604', '#1E90FF', '#6A3F9B', '#D84C6E'],
                hoverBackgroundColor: ['#F0B63D', '#1A8F07', '#56A9FF', '#8A5AC4', '#ff6384']
            },
        ],
    };

    const salaryPieOptions = {
        maintainAspectRatio: false,
        width: 500,
        height: 500,
        plugins: {
            legend: { position: 'right', labels: { fontColor: 'black' }}
        },
    };

    // Attendance Pagination Controls
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const paginatedAttendance = attendance.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // "../../../images/avatarpic.jpg"
    const [blobMap, setBlobMap] = useState({});

    const getAvatar = (attendanceData) => {
        const userIds = attendanceData.map((attend) => attend.id);
        if (userIds.length === 0) return;

        axiosInstance.post(`adminDashboard/getEmployeeAvatars`, { user_ids: userIds }, { headers })
            .then((avatarResponse) => {
                const avatars = avatarResponse.data.avatars || {};
                setBlobMap((prev) => {
                    // Old blob cleanup
                    Object.values(prev).forEach((url) => {
                        if (url.startsWith('blob:')) {
                            URL.revokeObjectURL(url);
                        }
                    });

                    // New blobs
                    const newBlobMap = {};
                    Object.entries(avatars).forEach(([id, data]) => {
                        if (data.avatar && data.avatar_mime) {
                            const byteCharacters = atob(data.avatar);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: data.avatar_mime });
                            newBlobMap[id] = URL.createObjectURL(blob);
                        }
                    });
                    return newBlobMap;
                });
            })
            .catch((error) => {
                console.error('Error fetching avatars:', error);
            });
    };

    const renderProfile = (id) => {
        if (blobMap[id]) {
            return blobMap[id];
        }
        return "../../../images/avatarpic.jpg";
    };

    useEffect(() => {
        return () => {
            Object.values(blobMap).forEach((url) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            setBlobMap({});
        };
    }, []);

    return (
        <Layout>
            <Box sx={{ mx: 12 }}>
                <div className="content-heading  d-flex justify-content-between p-0">
                    <h5 className="pt-3">Dashboard</h5>
                </div>

                <div className="row g-2" style={{ marginTop: 25 }}>
                    {/* Data Counts */}
                    <div className="col-lg-9 col-sm-12">
                        {/* First Data Row */}
                        <div className="row g-2" >
                            {/* Head Count */}
                            <div className="col-lg-4 col-sm-12">
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px" }} >
                                    <div className="block-content block-content-full">
                                        <Link to="/admin/employees" style={{ color: "#777777" }} >
                                            <div className="font-size-h2 font-w600" style={{ paddingTop: 13 }}> {headCount ? headCount : 0} </div>
                                            <div className="font-size-h5 font-w600"> Head Count </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {/* Application Count*/}
                            <div className="col-lg-4 col-sm-12">
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px" }}>
                                    <div className="block-content block-content-full">
                                        <Link to={"/admin/applications"} style={{ color: "#777777" }} >
                                            <div className="font-size-h2 font-w600" style={{ paddingTop: 13 }}> {applicationCount ? applicationCount : 0} </div>
                                            <div className="font-size-h5 font-w600"> Applications </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {/* Announcement Count */}
                            <div className="col-lg-4 col-sm-12">
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px" }}>
                                    <div className="block-content block-content-full">
                                        <Link to={"/admin/announcements"} style={{ color: "#777777" }} >
                                            <div className="font-size-h2 font-w600" style={{ paddingTop: 13 }}> {announcementCount ? announcementCount : 0} </div>
                                            <div className="font-size-h5 font-w600"> Announcements </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Second Data Row*/}
                        <div className="row g-2" style={{ marginTop: 25 }} >
                            {/* Trainings */}
                            <div className="col-lg-4 col-sm-12">
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px" }}>
                                    <div className="block-content block-content-full">
                                        <Link to={"/hr/trainings"} style={{ color: "#777777" }} >
                                            <div className="font-size-h2 font-w600" style={{ paddingTop: 13 }}> {trainingCount ? trainingCount : 0} </div>
                                            <div className="font-size-h5 font-w600" > Trainings </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {/* Average Age */}
                            <div className="col-lg-4 col-sm-12">
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px" }}>
                                    <div className="block-content block-content-full">
                                        <Link to={`/hr/employees`} style={{ color: "#777777" }} >
                                            <div className="font-size-h2 font-w600" style={{ paddingTop: 13 }}> {averageAge ? averageAge : 0} years </div>
                                            <div className="font-size-h5 font-w600" > Average Employee Age </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {/* Average Tenureship */}
                            <div className="col-lg-4 col-sm-12">
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px" }}>
                                    <div className="block-content block-content-full">
                                        <Link to={`/hr/employees`} style={{ color: "#777777" }} >
                                            <div className="font-size-h2 font-w600" style={{ paddingTop: 13 }}> {averageTenure ? averageTenure : 0} years </div>
                                            <div className="font-size-h5 font-w600"> Average Employee Tenure </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Attendance Pie */}
                    <div className="col-lg-3 col-sm-12">
                        <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px" }}>
                            <div className="block-header">
                                <h5 className="block-title">Employee Attendance</h5>
                            </div>
                            <div className="block-content block-content-full" style={{ minHeight: '300px', overflowY: 'auto' }}>
                                <Doughnut key={`attendance-${presentCount}-${onLeaveCount}-${headCount}`} data={attendancePieChart} options={attendancePieOptions} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Chart Row */}
                <div className="row" style={{ marginTop: 25 }}>
                    {/* Branch Chart */}
                    <div className="col-lg-7 col-sm-12" style={{ marginBottom: 30 }}>
                        <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px" }}>
                            <div className="block-header">
                                <h5 className="block-title">Employee Count by Branch</h5>
                            </div>
                            <div className="block-content block-content-full" style={{ minHeight: '300px', overflowY: 'auto' }}>
                                <Bar key={`branch-${Object.values(branchCount).join(",")}`} data={branchBarChart} options={branchBarOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Salary Chart */}
                    <div className="col-lg-5 col-sm-12" style={{ marginBottom: 30 }} >
                        <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px" }}>
                            <div className="block-header">
                                <h5 className="block-title">Employee Count by Salary Range</h5>
                            </div>
                            <div className="block-content block-content-full" style={{ minHeight: '300px', overflowY: 'auto' }}>
                                <Pie key={`salary-${salaryRange.join(",")}`} data={salaryPieChart} options={salaryPieOptions} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Attendance */}
                <div className="row">
                    <div className="col-lg-12 col-sm-12" style={{ marginBottom: 10 }}>
                        <Box sx={{ p: 3, backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", borderRadius: "10px" }}>
                            <h5 className="block-title">Today</h5>
                            <TableContainer sx={{ mt: 2, maxHeight: "450px" }}>
                                <Table stickyHeader className="table table-md table-striped table-vcenter">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ width: "40%" }}>Name</TableCell>
                                            <TableCell align="center" sx={{ width: "15%" }}>First Time In</TableCell>
                                            <TableCell align="center" sx={{ width: "15%" }}>First Time Out</TableCell>
                                            <TableCell align="center" sx={{ width: "15%" }}>Second Time In</TableCell>
                                            <TableCell align="center" sx={{ width: "15%" }}>Second Time Out</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {attendanceLoading ? (
                                        <TableBody>
                                            <TableRow>
                                                <TableCell colSpan={5}>
                                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }} >
                                                        <CircularProgress />
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    ) : (
                                        <TableBody>
                                            {paginatedAttendance.length > 0 ? (
                                                paginatedAttendance.map((attend, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell align="left">
                                                            <Box display="flex" sx={{ alignItems: "center" }}>
                                                                <Avatar alt={`${attend.first_name}_Avatar`} src={renderProfile(attend.id)} sx={{ mr: 1, height: "36px", width: "36px" }} />
                                                                {attend.first_name} {attend.middle_name || ''} {attend.last_name} {attend.suffix || ''}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {attend.first_time_in ? dayjs(attend.first_time_in).format("hh:mm:ss A") : "-"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {attend.first_time_out ? dayjs(attend.first_time_out).format("hh:mm:ss A") : attend.first_time_in ? "Ongoing" : "-"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {attend.shift_type == "Regular" ? "-" : attend.second_time_in ? dayjs(attend.first_time_in).format("hh:mm:ss A") : "-"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {attend.shift_type == "Regular" ? "-" : attend.second_time_out ? dayjs(attend.first_time_out).format("hh:mm:ss A") : "Ongoing"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", p: 1 }}>
                                                        No Attendance Found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    )}
                                </Table>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 20]}
                                    component="div"
                                    count={attendance.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    sx={{ alignItems: "center" }}
                                />
                            </TableContainer>
                        </Box>
                    </div>
                </div>

            </Box >
        </Layout >
    );
};

export default Dashboard;
