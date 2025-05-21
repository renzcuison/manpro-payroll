import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import "../../../../../resources/css/calendar.css";
import {
    Avatar,
    CircularProgress,
    Typography,
    Divider,
    FormControl,
    TextField,
    Stack,
    Grid,
    useMediaQuery,
    useTheme,
    Paper,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tabs,
    Tab,
    Chip,
} from "@mui/material";

import { Chart as ChartJS } from "chart.js/auto";
import { Doughnut } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import {
    CalendarCheck,
    CalendarMinus,
    Check,
    Clock,
    Users,
} from "lucide-react";
import { CloseRounded } from "@mui/icons-material";
import { useUsers } from "../../SuperAdmin/hooks/useUsers";
import moment from "moment";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
import MainSection from "./MainSection";
import SchedulesHolidays from "./SchedulesHolidays";
import { useDashboard } from "./useDashboard";
import GoogleCalendar from "./GoogleCalendar";

const Dashboard = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const [value, setValue] = useState("one");

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const chartRef = useRef(null);

    const [adminName, setAdminName] = useState("Admin");

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
    const [searchName, setSearchName] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [attendanceLoading, setAttendanceLoading] = useState(true);

    const { data, isFetched } = useUsers();
    const { data: dashboard, isFetched: isFetchedDashboard } = useDashboard();

    const presentUsers = useMemo(() => {
        if (!dashboard || !isFetched) return [];
        const today = new Date();
        const todayDate = today.toISOString().split("T")[0];
        return dashboard.employees.filter((user) => {
            if (!user.latest_attendance_log) {
                return false;
            }
            const attendanceDate = new Date(
                user.latest_attendance_log?.timestamp
            )
                .toISOString()
                .split("T")[0];
            return attendanceDate === todayDate;
        });
    }, [dashboard, isFetched]);

    const lateUsers = useMemo(() => {
        if (!presentUsers || presentUsers.length === 0) return [];

        return presentUsers.filter((user) => {
            const timeIn = new Date(user.latest_attendance_log?.timestamp);
            const lateThreshold = new Date(timeIn);
            lateThreshold.setHours(8, 0, 0, 0); // Set to 8:00:00 AM

            return timeIn > lateThreshold;
        });
    }, [presentUsers]);

    const absentUsers = useMemo(() => {
        if (!dashboard || !isFetched) return [];
        const today = new Date();
        const todayDate = today.toISOString().split("T")[0];
        return dashboard.employees.filter((user) => {
            if (!user.latest_attendance_log) {
                return false;
            }
            const attendanceDate = new Date(
                user.latest_attendance_log?.timestamp
            )
                .toISOString()
                .split("T")[0];
            return attendanceDate !== todayDate;
        });
    }, [dashboard, isFetched]);

    console.log("employees: ", dashboard);
    console.log("Present: ", presentUsers);
    console.log("Absent: ", absentUsers);
    console.log("Lates: ", lateUsers);

    const latestEmployees = useMemo(() => {
        if (data) {
            return data
                ?.filter((user) => user.department_id !== null)
                .slice(0, 3);
        }
    }, [data, isFetched]);

    const branches = useMemo(() => {
        if (data) {
            const groupedData = data
                ?.filter(
                    (user) =>
                        user.department_id !== null && user.branch !== null
                )
                .reduce((group, user) => {
                    const branch = user.branch;
                    if (!group[branch.name]) {
                        group[branch.name] = [];
                    }
                    group[branch.name].push(user);
                    return group;
                }, {});

            return Object.entries(groupedData).map(([branch, users]) => ({
                branch,
                users,
            }));
        }
    }, [data, isFetched]);

    const departments = useMemo(() => {
        if (data) {
            const groupedData = data
                .filter(
                    (user) =>
                        user.department_id !== null && user.branch !== null
                )
                .reduce((group, user) => {
                    const department = user.department;
                    if (!group[department.name]) {
                        group[department.name] = [];
                    }
                    group[department.name].push(user);
                    return group;
                }, {});

            return Object.entries(groupedData).map(([department, users]) => ({
                department,
                users,
            }));
        }
    }, [data, isFetched]);

    const theme = useTheme();

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
                setAdminName(response.data.admin_name);

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

    const getAttendance = (type) => {
        /* types: 1 - Present, 2 - Late, 3 - Absent, 4 - On Leave */
        setAttendanceLoading(true);
        axiosInstance
            .get(`adminDashboard/getAttendanceToday`, {
                headers,
                params: { type: type },
            })
            .then((response) => {
                const attendanceData = response.data.attendance || [];
                setAttendance(attendanceData);
                setAttendanceLoading(false);
                getAvatar(attendanceData);
            })
            .catch((error) => {
                console.error("Error fetching attendance:", error);
                setAttendance([]);
                setAttendanceLoading(false);
            });
    };

    // "../../../images/avatarpic.jpg"
    const [blobMap, setBlobMap] = useState({});

    const getAvatar = (attendanceData) => {
        const userIds = attendanceData.map((attend) => attend.id);
        if (userIds.length === 0) return;

        axiosInstance
            .post(
                `adminDashboard/getEmployeeAvatars`,
                { user_list: userIds, type: 1 },
                { headers }
            )
            .then((avatarResponse) => {
                const avatars = avatarResponse.data.avatars || {};
                setBlobMap((prev) => {
                    // Old blob cleanup
                    Object.values(prev).forEach((url) => {
                        if (url.startsWith("blob:")) {
                            URL.revokeObjectURL(url);
                        }
                    });

                    // New blobs
                    const newBlobMap = {};
                    Object.entries(avatars).forEach(([id, data]) => {
                        if (data.avatar && data.avatar_mime) {
                            const byteCharacters = atob(data.avatar);
                            const byteNumbers = new Array(
                                byteCharacters.length
                            );
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], {
                                type: data.avatar_mime,
                            });
                            newBlobMap[id] = URL.createObjectURL(blob);
                        }
                    });
                    return newBlobMap;
                });
            })
            .catch((error) => {
                console.error("Error fetching avatars:", error);
            });
    };

    useEffect(() => {
        return () => {
            Object.values(blobMap).forEach((url) => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                }
            });
            setBlobMap({});
        };
    }, []);

    const infoCardsData = [
        {
            title: "Total Employees",
            value: dashboard?.employees?.length,
            icon: <Users size={42} />,
        },
        {
            title: "Present",
            value: presentUsers.length,
            icon: <Check size={42} />,
        },
        {
            title: "Late",
            value: lateUsers.length,
            icon: <Clock size={42} />,
        },
        {
            title: "On Leave",
            value: 0,
            icon: <CalendarCheck size={42} />,
        },
        {
            title: "Absent",
            value: absentUsers.length,
            icon: <CalendarMinus size={42} />,
        },
    ];

    return (
        <Layout>
            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid size={{ xs: 12, lg: 9 }}>
                    <MainSection
                        infoCardsData={infoCardsData}
                        latestEmployees={latestEmployees}
                        adminName={adminName}
                        departments={departments}
                        branches={branches}
                    />
                </Grid>
                <Grid
                    size={{ xs: 12, lg: 3 }}
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <SchedulesHolidays />
                </Grid>

                <Grid
                    size={{ xs: 12, lg: 8 }}
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <Paper sx={{ p: 3, borderRadius: 5 }}>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, color: "#4d4d4d" }}
                        >
                            Overview Summary
                        </Typography>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            textColor="primary"
                            indicatorColor="primary"
                            aria-label="secondary tabs example"
                        >
                            <Tab value="one" label="Item One" />
                            <Tab value="two" label="Item Two" />
                            <Tab value="three" label="Item Three" />
                        </Tabs>
                    </Paper>
                </Grid>
                <Grid
                    size={{ xs: 12, lg: 4 }}
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 5,
                            height: "100%",
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                color: "#4d4d4d",
                            }}
                        >
                            Birthdays & Milestones
                        </Typography>
                        <List
                            sx={{
                                bgcolor: "background.paper",
                            }}
                        >
                            {latestEmployees?.map((emp, index) => (
                                <React.Fragment>
                                    <ListItem
                                        alignItems="flex-start"
                                        secondaryAction={
                                            <>
                                                <Typography variant="caption">
                                                    Joined
                                                </Typography>
                                                <Typography>
                                                    {moment(
                                                        emp.created_at
                                                    ).format("MMM. DD, YYYY")}
                                                </Typography>
                                            </>
                                        }
                                        sx={{ px: 0 }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                alt="Remy Sharp"
                                                src={
                                                    emp.media
                                                        ? emp.media?.[0]
                                                              .original_url
                                                        : ""
                                                }
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="body1"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    {emp.first_name}{" "}
                                                    {emp.last_name}
                                                </Typography>
                                            }
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        sx={{
                                                            color: "text.primary",
                                                            display: "inline",
                                                        }}
                                                    >
                                                        {emp.job_title.name}
                                                    </Typography>
                                                    <Chip label="Birthday" />
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid
                    size={{ xs: 12, lg: 4 }}
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <Paper sx={{ p: 3, borderRadius: 5 }}>
                        <GoogleCalendar />
                    </Paper>
                </Grid>
            </Grid>
        </Layout>
    );
};

export default Dashboard;
