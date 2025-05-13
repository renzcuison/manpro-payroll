import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import "../../../../../resources/css/calendar.css";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Box,
    TablePagination,
    TableHead,
    Avatar,
    CircularProgress,
    Typography,
    Divider,
    FormControl,
    TextField,
    Grid,
} from "@mui/material";

import { Chart as ChartJS } from "chart.js/auto";
import { Doughnut } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import Typewriter from "../../../components/Typewriter";
dayjs.extend(utc);
dayjs.extend(localizedFormat);


import WelcomeBox from "./Components/WelcomeBox";
import HeadCounts from "./Components/HeadCounts";
import EmployeeInfromation from "./Components/EmployeeInfromation";
import SchedulesAndHolidays from "./Components/SchedulesAndHolidays";

const Dashboard = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const chartRef = useRef(null);

    const [adminName, setAdminName] = useState("Admin");

    const [headCount, setHeadCount] = useState(0);
    const [applicationCount, setApplicationCount] = useState();
    const [announcementCount, setAnnouncementCount] = useState();
    const [trainingCount, setTrainingCount] = useState();


    const [presentCount, setPresentCount] = useState(0);
    const [onLeaveCount, setOnLeaveCount] = useState(0);

    const [branchNames, setBranchNames] = useState([]);
    const [branchCount, setBranchCount] = useState([]);

    const [salaryRange, setSalaryRange] = useState([]);


    useEffect(() => {
        getDashboardData();
    }, []);

    const getDashboardData = () => {
        axiosInstance
            .get(`adminDashboard/getDashboardData`, { headers })
            .then((response) => {
                setAdminName(response.data.admin_name);

                setHeadCount(response.data.counter.head_count);
                setApplicationCount(response.data.counter.application_count);
                setAnnouncementCount(response.data.counter.announcement_count);
                setTrainingCount(response.data.counter.training_count);

                setPresentCount(response.data.attendance.present_count);
                setOnLeaveCount(response.data.attendance.onleave_count);

                const brNames = {};
                const brCount = {};
                for (const [branchId, branch] of Object.entries(
                    response.data.branches
                )) {
                    brNames[branchId] = branch.name;
                    brCount[branchId] = branch.employees || 0;
                }
                setBranchNames(brNames);
                setBranchCount(brCount);

                setSalaryRange(response.data.salary_range);
            });
    };

    return (
        <Layout>
            <div className="row m-2" style={{ display: 'flex', alignItems: 'stretch' }}>
                <div className="col-lg-9 col-sm-12 p-4">
                    <WelcomeBox />
                    <HeadCounts />
                    <EmployeeInfromation />
                </div>

                <div className="col-lg-3 col-sm-12 p-4" style={{ height: '100%' }}>
                    <SchedulesAndHolidays />
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
