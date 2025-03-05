import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import "../../../../resources/css/calendar.css";
import { Table, TableBody, TableCell, TableContainer, TableRow, Select, MenuItem, InputLabel, Box, FormControl, Typography, TablePagination, Accordion, AccordionSummary, AccordionDetails, TableHead, Avatar, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import PageHead from "../../components/Table/PageHead";
import PageToolbar from "../../components/Table/PageToolbar";
import { getComparator, stableSort } from "../../components/utils/tableUtils";
import LineGraph from "../../components/utils/LineGraph";
import VerticalBarGraph from "../../components/utils/VerticalBarGraph";
import HomeLogo from "../../../images/ManProTab.png";

import { Doughnut } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { forEach } from "lodash";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const HrDashboard = () => {

    const queryParameters = new URLSearchParams(window.location.search);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();
    const colors = ["#2a800f", "#e9ab13"];

    const [headCount, setHeadCount] = useState();
    const [applicationCount, setApplicationCount] = useState();
    const [announcementCount, setAnnouncementCount] = useState();
    const [trainingCount, setTrainingCount] = useState();
    const [averageAge, setAverageAge] = useState();
    const [averageTenure, setAverageTenure] = useState();

    const [presentCount, setPresentCount] = useState(0);
    const [onLeaveCount, setOnLeaveCount] = useState(0);

    const [branches, setBranches] = useState([]);

    const [branchNames, setBranchNames] = useState([]);
    const [branchCount, setBranchCount] = useState([]);

    const [salaryRange, setSalaryRange] = useState([]);

    const [attendance, setAttendance] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [attendanceTab, setAttendanceTab] = useState('1');
    const handleAttendanceTabChange = (event, newValue) => {
        event.preventDefault();
        setAttendanceTab(newValue);
    }

    useEffect(() => {
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

        axiosInstance
            .get(`adminDashboard/getAttendance`, { headers })
            .then((response) => {
                setAttendance(response.data.attendance);
            });
    }, []);

    // Attendance Pie Chart
    const attendancePieChart = {
        labels: ['Present', 'Absent', 'On Leave'],
        datasets: [
            {
                data: [
                    presentCount,
                    headCount ? headCount - presentCount - onLeaveCount : 0,
                    onLeaveCount,
                ],
                backgroundColor: ['#177604', '#E9AB13', '#1E90FF'],
                hoverBackgroundColor: ['#1A8F07', '#F0B63D', '#56A9FF'],
            },
        ],
    };
    const attendancePieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { usePointStyle: true },
            },
        },
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
            legend: {
                position: 'right',
                labels: { fontColor: 'black' },
            },
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
                                <div
                                    className="block"
                                    style={{
                                        backgroundColor: "white",
                                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                                        height: "165px",
                                        borderLeft: "4px solid #2a800f",
                                        paddingLeft: "12px"
                                    }} >
                                    <div className="block-content block-content-full">
                                        <Link to="/hr/employees" style={{ color: "#777777" }} >
                                            <div className="font-size-h2 font-w600" style={{ paddingTop: 13 }}> {headCount ? headCount : 0} </div>
                                            <div className="font-size-h5 font-w600"> Head Count </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {/* Application Count*/}
                            <div className="col-lg-4 col-sm-12">
                                <div
                                    className="block"
                                    style={{
                                        backgroundColor: "white",
                                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                                        height: "165px",
                                        borderLeft: "4px solid #2a800f",
                                        paddingLeft: "12px"
                                    }} >
                                    <div className="block-content block-content-full">
                                        <Link to={"/hr/applications"} style={{ color: "#777777" }} >
                                            <div className="font-size-h2 font-w600" style={{ paddingTop: 13 }}> {applicationCount ? applicationCount : 0} </div>
                                            <div className="font-size-h5 font-w600"> Applications </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {/* Announcement Count */}
                            <div className="col-lg-4 col-sm-12">
                                <div
                                    className="block"
                                    style={{
                                        backgroundColor: "white",
                                        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                                        height: "165px",
                                        borderLeft: "4px solid #2a800f",
                                        paddingLeft: "12px"
                                    }} >
                                    <div className="block-content block-content-full">
                                        <Link to={"/hr/announcements"} style={{ color: "#777777" }} >
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
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px" }} >
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
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px" }} >
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
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px" }} >
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
                                <Doughnut data={attendancePieChart} options={attendancePieOptions} />
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
                                <Bar data={branchBarChart} options={branchBarOptions} />
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
                                <Pie data={salaryPieChart} options={salaryPieOptions} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Attendance */}
                <div className="row">
                    <div className="col-lg-12 col-sm-12" style={{ marginBottom: 10 }}>
                        <Box sx={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", borderRadius: "10px" }}>
                            <div className="block-content block-content-full">
                                <div style={{ marginLeft: 10 }}>
                                    <TabContext value={attendanceTab}>
                                        <Box display="flex" sx={{ justifyContent: "space-between" }}>
                                            <Box component={"div"} className="d-flex justify-content-between" >
                                                <div className="font-size-h5 font-w600" style={{ marginTop: 12, marginBottom: 10 }} >
                                                    Attendance Today
                                                </div>
                                            </Box>
                                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                                <TabList onChange={handleAttendanceTabChange} aria-label="Acknowledgement Tabs">
                                                    <Tab label="Present" value="1" />
                                                    <Tab label="Late" value="2" />
                                                    <Tab label="Absent" value="3" />
                                                </TabList>
                                            </Box>
                                        </Box>
                                        <TabPanel value="1">
                                            <div style={{ height: "450px", overflow: "auto", }} >
                                                <TableContainer>
                                                    <Table className="table table-md table-striped table-vcenter">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell align="left" sx={{ width: "40%" }}>Employee</TableCell>
                                                                <TableCell align="center" sx={{ width: "30%" }}>Time In</TableCell>
                                                                <TableCell align="center" sx={{ width: "30%" }}>Time Out</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody sx={{ cursor: "pointer" }}>
                                                            {paginatedAttendance.length > 0 ? (
                                                                paginatedAttendance.map((attend, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell align="left">
                                                                            <Box display="flex" sx={{ alignItems: "center" }}>
                                                                                <Avatar alt={`${attend.first_name}_Avatar`} src={attend.profile_pic ? `../../../../storage/${attend.profile_pic}` : "../../../images/avatarpic.jpg"} sx={{ mr: 1, height: "36px", width: "36px" }} />
                                                                                {attend.first_name} {attend.middle_name || ''} {attend.last_name} {attend.suffix || ''}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            {attend.time_in ? dayjs(attend.time_in).format("hh:mm:ss A") : "-"}
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            {attend.time_out ? dayjs(attend.time_out).format("hh:mm:ss A") : "-"}
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
                                            </div>
                                        </TabPanel>
                                        <TabPanel value="2">
                                            <div style={{ height: "450px", overflow: "auto", }} >
                                                <TableContainer>
                                                    <Table className="table table-md table-striped table-vcenter">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell align="left" sx={{ width: "40%" }}>Employee</TableCell>
                                                                <TableCell align="center" sx={{ width: "30%" }}>Time In</TableCell>
                                                                <TableCell align="center" sx={{ width: "30%" }}>Time Out</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody sx={{ cursor: "pointer" }}>
                                                            {paginatedAttendance.length > 0 ? (
                                                                paginatedAttendance.map((attend, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell align="left">
                                                                            <Box display="flex" sx={{ alignItems: "center" }}>
                                                                                <Avatar alt={`${attend.first_name}_Avatar`} src={attend.profile_pic ? `../../../../storage/${attend.profile_pic}` : "../../../images/avatarpic.jpg"} sx={{ mr: 1, height: "36px", width: "36px" }} />
                                                                                {attend.first_name} {attend.middle_name || ''} {attend.last_name} {attend.suffix || ''}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            {attend.time_in ? dayjs(attend.time_in).format("hh:mm:ss A") : "-"}
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            {attend.time_out ? dayjs(attend.time_out).format("hh:mm:ss A") : "-"}
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
                                            </div>
                                        </TabPanel>
                                        <TabPanel value="3">
                                            <div style={{ height: "450px", overflow: "auto", }} >
                                                <TableContainer>
                                                    <Table className="table table-md table-striped table-vcenter">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell align="left" sx={{ width: "40%" }}>Employee</TableCell>
                                                                <TableCell align="center" sx={{ width: "30%" }}>Time In</TableCell>
                                                                <TableCell align="center" sx={{ width: "30%" }}>Time Out</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody sx={{ cursor: "pointer" }}>
                                                            {paginatedAttendance.length > 0 ? (
                                                                paginatedAttendance.map((attend, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell align="left">
                                                                            <Box display="flex" sx={{ alignItems: "center" }}>
                                                                                <Avatar alt={`${attend.first_name}_Avatar`} src={attend.profile_pic ? `../../../../storage/${attend.profile_pic}` : "../../../images/avatarpic.jpg"} sx={{ mr: 1, height: "36px", width: "36px" }} />
                                                                                {attend.first_name} {attend.middle_name || ''} {attend.last_name} {attend.suffix || ''}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            {attend.time_in ? dayjs(attend.time_in).format("hh:mm:ss A") : "-"}
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            {attend.time_out ? dayjs(attend.time_out).format("hh:mm:ss A") : "-"}
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
                                            </div>
                                        </TabPanel>
                                    </TabContext>
                                </div>
                            </div>
                        </Box>
                    </div>
                </div>
            </Box >
        </Layout >
    );
};

export default HrDashboard;
