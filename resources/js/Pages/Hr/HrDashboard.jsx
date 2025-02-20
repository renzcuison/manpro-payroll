import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../utils/axiosConfig";
import "../../../../resources/css/calendar.css";
import { Table, TableBody, TableCell, TableContainer, TableRow, Select, MenuItem, InputLabel, Box, FormControl, Typography, TablePagination, Accordion, AccordionSummary, AccordionDetails, } from "@mui/material";
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

const headCells = [
    {
        id: "firstname",
        label: "Name",
        sorable: true,
    },
    {
        id: " ",
        label: "Time Arrived",
        sortable: false,
    },
    {
        id: " ",
        label: "Time Out",
        sortable: false,
    },
];

const years = () => {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 20))
        .fill("")
        .map((v, idx) => now - idx);
};

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
    const [absentCount, setAbsentCount] = useState(0);
    const [onLeaveCount, setOnLeaveCount] = useState(0);

    const [branchNames, setBranchNames] = useState([]);
    const [branchCount, setBranchCount] = useState([]);

    const [salaryRange, setSalaryRange] = useState([]);

    useEffect(() => {
        axiosInstance
            .get(`adminDashboard/getDashboardCounters`, { headers })
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
                    brCount[branchId] = branch.count || 0;
                }
                setBranchNames(brNames);
                setBranchCount(brCount);
                setSalaryRange(response.data.salary_range);
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
                backgroundColor: ['#177604', '#E9AB13', '#1E90FF', '#D84C6E', '#6A3F9B'],
                hoverBackgroundColor: ['#1A8F07', '#F0B63D', '#56A9FF', '#ff6384', '#8A5AC4']
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

    //PRE-UPDATE STATES AND FUNCTIONS - DO NOT REMOVE UNTIL ALL IS UPDATED
    const oldFunctions = () => {
        /*
    const queryParameters = new URLSearchParams(window.location.search);
    const [searchParams, setSearchParams] = useSearchParams();
    const [absencesChart, setAbsencesChart] = useState([]);
    const [applicationsChart, setApplicationsChart] = useState([]);
    const [tardinessChart, setTardinessChart] = useState([]);
    const [underTimeChart, setUnderTimeChart] = useState([]);
    const [workDayChart, setWorkDayChart] = useState([]);
    const [salariesChart, setSalariesChart] = useState([]);
    const [deductionChart, setDeductionChart] = useState([]);
    const [benefitsChart, setBenefitsChart] = useState([]);
    const [netpayChart, setNetpayChart] = useState([]);
    const [totalUsersChart, setTotalUsersChart] = useState([]);
    const [headCount, setHeadCount] = useState();
    const [totalPresent, setTotalPresent] = useState();
    const [totalAbsent, setTotalAbsent] = useState();
    const [totalOnLeave, setTotalOnLeave] = useState();
    const [totalTrainings, setTotalTrainings] = useState();
    const [totalAnnouncements, setTotalAnnouncements] = useState();
    const [totalApplications, setTotalApplications] = useState();
    const [averageAge, setAverageAge] = useState();
    const [averageTenure, setAverageTenure] = useState();
    const [workExist, setWorkExist] = useState();
    const [range, setRange] = useState();
    const [branchNames, setBranchNames] = useState();
    const [branchEmployees, setBranchEmployees] = useState();
    const [recentAttendances, setRecentAttendances] = useState([]);
    const [filterAttendance, setFilterAttendance] = useState([]);
    const [recentApplication, setRecentApplication] = useState([]);
    const [selectYear, setSelectYear] = useState(
        searchParams.get("year")
            ? searchParams.get("year")
            : moment().format("YYYY")
    );
    const [selectMonth, setSelectMonth] = useState(
        searchParams.get("month")
            ? searchParams.get("month")
            : moment().format("M")
    );
    const allYears = years();
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("calories");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const dateToday = moment().format("YYYY-MM-D 00:00:00");
    const applicationDates = moment().format("YYYY-MM-D 00:00:00");
    const [expandedAttendance, setExpandedAttendance] = useState(true);
    const [expandedWorkdays, setExpandedWorkdays] = useState(true);
    const [expandedHistory, setExpandedHistory] = useState(true);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();
    const colors = ["#2a800f", "#e9ab13"];
    
    useEffect(() => {
        getAnalaytics(selectMonth, selectYear);
    
        axiosInstance
            .get(`/dashboard_employees/${dateToday}`, { headers })
            .then((response) => {
                setHeadCount(response.data.headCount);
                setTotalPresent(response.data.present);
                setTotalAbsent(response.data.absent);
                setTotalOnLeave(response.data.onLeave);
                setTotalApplications(response.data.totalApplications);
                setTotalTrainings(response.data.totalTrainings);
                setTotalAnnouncements(response.data.totalAnnouncements);
                setAverageAge(response.data.averageAge);
                setAverageTenure(response.data.averageTenure);
                setWorkExist(response.data.workExist);
                setRange(response.data.range);
                setBranchNames(response.data.branchNames);
                setBranchEmployees(response.data.branchEmployees);
            });
        axiosInstance
            .get(`/dashboard_recentAttendance/${dateToday}`, { headers })
            .then((response) => {
                setRecentAttendances(response.data.attendances);
                setFilterAttendance(response.data.attendances);
            });
        axiosInstance
            .get(`/dashboard_recentApplication/${dateToday}`, { headers })
            .then((response) => {
                setRecentApplication(response.data.applications);
            });
    }, [selectMonth, selectYear]);
    
    const getAnalaytics = (month, year) => {
        let dates = [];
        dates = [month, year];
    
        axiosInstance
            .get(`/dashboard_Analytics/${dates}`, { headers })
            .then((response) => {
                setApplicationsChart(response.data.totalApplications);
                setAbsencesChart(response.data.totalAbsences);
                setTardinessChart(response.data.totalTardiness);
                setUnderTimeChart(response.data.totalUndertime);
                setWorkDayChart(response.data.totalWorkdays);
                setSalariesChart(response.data.totalSalaries);
                setDeductionChart(response.data.totalDeduction);
                setNetpayChart(response.data.totalNetpay);
                setBenefitsChart(response.data.totalBenefits);
                setTotalUsersChart(response.data.totalUsers);
            });
    };
    
    const handleNavigateAttendance = (user_id) => {
        const month = moment().month() + 1;
        const year = moment().year();
        navigate(`/hr/attendance?month=${month != 10 && month != 11 && month != 12 ? "0" + month : month}&year=${year}&user_id=${user_id}`);
    };
    
    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };
    
    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };
    
    const handleFilter = (event) => {
        const filtered = recentAttendances.filter((attdn) =>
            `${attdn?.fname} ${attdn?.lname}`.toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase())
        );
        if (event.target.value != "") {
            setRecentAttendances(filtered);
        } else {
            setRecentAttendances(filterAttendance);
        }
    };
    
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - recentAttendances.length) : 0;
    
    const handleChangeYear = (e) => {
        const newYear = e.target.value;
        setSelectYear(newYear);
        setSearchParams({
            ["year"]: newYear,
        });
    };
    
    const handleChangeExpandAttendance = () => {
        if (expandedAttendance === true) {
            setExpandedAttendance(false);
        } else {
            setExpandedAttendance(true);
        }
    };
    
    const handleChangeExpandWorkdays = () => {
        if (expandedWorkdays === true) {
            setExpandedWorkdays(false);
        } else {
            setExpandedWorkdays(true);
        }
    };
    
    const handleChangeExpandHistory = () => {
        if (expandedHistory === true) {
            setExpandedHistory(false);
        } else {
            setExpandedHistory(true);
        }
    };
    
    const handleChangeMonth = (e) => {
        const newMonth = e.target.value;
        setSelectMonth(newMonth);
    };
    
    const handleChangeCutoff = (e) => {
        const newCutoff = e.target.value;
        setSelectCutoff(newCutoff);
    };
    
    const usersProfile = (user_id) => {
        navigate(`hr/profile?employeeID=` + user_id);
    };
    
    const salaryPieChart = {
        labels: ['10,001 - 15,000', '15,001 - 20,000', '20,001 - 25,000', '25,001 - 30,000'],
        datasets: [
            {
                label: 'Employees',
                data: range,
                backgroundColor: ['#2a800f', '#e9ab13', '#1e90ff', '#ff6384'],
                hoverBackgroundColor: ['#2a800f', '#e9ab13', '#1e90ff', '#ff6384']
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
    */
    }

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
                {/* Temporary Div Wrap for Attendance*/}
                <div>
                    {/* Attendance */}
                    {/* 
                    <div className="row">
                    <div className="col-lg-12 col-sm-12" style={{ marginBottom: 30 }} >
                        <div className="block" style={{ backgroundColor: "white" }}>
                            <div className="block-content block-content-full">
                                <div style={{ marginLeft: 10 }}>
                                    <Box component={"div"} className="d-flex justify-content-between" >
                                        <div className="font-size-h5 font-w600" style={{ marginTop: 12, marginBottom: 10 }} >
                                            Attendance Today
                                        </div>
                                        <PageToolbar handleSearch={handleFilter} />
                                    </Box>
                                    <div style={{ height: "560px", overflow: "auto", }} >
                                        <TableContainer>
                                            <Table className="table table-md table-striped table-vcenter">
                                                <PageHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} headCells={headCells} />

                                                <TableBody sx={{ cursor: "pointer" }} >
                                                    {recentAttendances.length !=
                                                        0 ? (
                                                        stableSort(
                                                            recentAttendances, getComparator(order, orderBy)
                                                        )
                                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                            .map(
                                                                (attendance, index) => {
                                                                    return (
                                                                        <TableRow key={index} hover role="checkbox" tabIndex={-1} onClick={() => handleNavigateAttendance(attendance.user_id)} >
                                                                            <TableCell className="text-left">
                                                                                {attendance.profile_pic ? (
                                                                                    <img src={location.origin + "/storage/" + attendance.profile_pic} style={{ height: 35, width: 35, borderRadius: 50, objectFit: "cover", marginRight: 30, }} />) : (
                                                                                    <img src={HomeLogo} style={{ height: 35, width: 35, borderRadius: 50, objectFit: "cover", marginRight: 30, }} />
                                                                                )}

                                                                                {" "}
                                                                                {attendance.lname + ", " + attendance.fname + " " + (attendance.mname ? (attendance.mname[0] + ".") : "")}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className="d-flex justify-content-end">
                                                                                    <Typography variant="subtitle2" className="p-1 ml-2 text-center text-white rounded-lg" style={{ backgroundColor: "#2a800f", }} >
                                                                                        {moment(attendance.morning_in).format("hh:mm a")}
                                                                                    </Typography>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className="d-flex justify-content-start">
                                                                                    <Typography variant="subtitle2" className="p-1 ml-2 text-center text-white rounded-lg" style={{ backgroundColor: attendance.afternoon_out ? "#e24e45" : "#e9ab13", }} >
                                                                                        {" "}
                                                                                        {attendance.afternoon_out ? moment(attendance.afternoon_out).format("hh:mm a") : "Ongoing.."}
                                                                                    </Typography>
                                                                                </div>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    );
                                                                }
                                                            )
                                                    ) : (
                                                        <TableRow hover role="checkbox" tabIndex={-1} onClick={() => handleNavigateAttendance(attendance.user_id)} >
                                                            <TableCell colSpan={4}>
                                                                {" "}
                                                                {"No Data Found"}
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                    {emptyRows > 0 && (
                                                        <TableRow style={{ height: 53 * emptyRows, }} >
                                                            <TableCell colSpan={6} />
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={recentAttendances.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ ".MuiTablePagination-actions": { marginBottom: "20px", }, ".MuiInputBase-root": { marginBottom: "20px", }, }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                */}
                </div>
            </Box>
        </Layout>
    );
};

export default HrDashboard;
