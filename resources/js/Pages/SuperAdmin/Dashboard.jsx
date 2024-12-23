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

const Dashboard = () => {
    const queryParameters = new URLSearchParams(window.location.search);

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

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();


    const chartData = {
        labels: ['Present', 'Absent', 'On Leave'],
        datasets: [
            {
                data: [
                    totalPresent ? totalPresent : 0,
                    totalAbsent ? totalAbsent : 0,
                    totalOnLeave ? totalOnLeave : 0
                ],
                backgroundColor: ['#2a800f', '#e9ab13', '#1e90ff'],
                hoverBackgroundColor: ['#2a800f', '#e9ab13', '#1e90ff'],
            },
        ],
    };
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { usePointStyle: true },
            },
        },
    };
    
    return (
        <Layout>
            <Box sx={{ mx: 12 }}>
                <div className="content-heading  d-flex justify-content-between p-0">
                    <h5 className="pt-3">Overview</h5>
                </div>

                <div className="row g-2" style={{ marginTop: 25 }} >
                    <div className="col-lg-9 col-sm-12">
                        <div className="row g-2" >
                            <div className="col-lg-4 col-sm-12">
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px" }} >
                                    <div className="block-content block-content-full">
                                        <Link to="/hr/employees" style={{ color: "#777777" }} >
                                            <div className="font-size-h1 font-w600" style={{ paddingTop: 13 }}> { headCount ? headCount : 0 } </div>
                                            <div className="font-size-h5 font-w600"> Head Count </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 col-sm-12">
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px"  }} >
                                    <div className="block-content block-content-full">
                                        <Link to={"/hr/applications"} style={{ color: "#777777" }} >
                                            <div className="font-size-h1 font-w600" style={{ paddingTop: 13 }}> {totalApplications ? totalApplications : 0} </div>
                                            <div className="font-size-h5 font-w600"> Applications </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 col-sm-12">
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px"  }} >
                                    <div className="block-content block-content-full">
                                        <Link to={"/hr/announcements"} style={{ color: "#777777" }} >
                                            <div className="font-size-h1 font-w600" style={{ paddingTop: 13 }}> {totalAnnouncements ? totalAnnouncements : 0} </div>
                                            <div className="font-size-h5 font-w600"> Announcements </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-2" style={{ marginTop: 25 }} >
                            <div className="col-lg-4 col-sm-12">
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px"  }} >
                                    <div className="block-content block-content-full">
                                        <Link to={"/hr/trainings"} style={{ color: "#777777" }} >
                                            <div className="font-size-h1 font-w600" style={{ paddingTop: 13 }}> {totalTrainings ? totalTrainings : 0} </div>
                                            <div className="font-size-h5 font-w600" > Tranings </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 col-sm-12">
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px"  }} >
                                    <div className="block-content block-content-full">
                                        <Link to={`/hr/employees`} style={{ color: "#777777" }} >
                                            <div className="font-size-h1 font-w600" style={{ paddingTop: 13 }}> {averageAge ? averageAge : 0} years </div>
                                            <div className="font-size-h5 font-w600" > Average Employee Age </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 col-sm-12">
                                <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px", height: "165px", borderLeft: "4px solid #2a800f", paddingLeft: "12px"  }} >
                                    <div className="block-content block-content-full">
                                        <Link to={`/hr/employees`} style={{ color: "#777777" }} >
                                            <div className="font-size-h1 font-w600" style={{ paddingTop: 13 }}> {workExist === true ? (averageTenure ? averageTenure : 0) : 0} year(s) </div>
                                            <div className="font-size-h5 font-w600"> Average Employee Tenure </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-sm-12">
                        <div className="block" style={{ backgroundColor: "white", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px" }}>
                            <div className="block-header">
                                <h5 className="block-title">Employee Attendance</h5>
                            </div>
                            <div className="block-content block-content-full" style={{ minHeight: '300px', overflowY: 'auto' }}>
                                <Doughnut data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>
                
            </Box>
        </Layout>
    );
};

export default Dashboard;
