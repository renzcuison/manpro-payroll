import React, { useEffect, useState, useRef, useMemo } from "react";
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
import Typewriter from "../../../components/Typewriter";
import {
    Calendar,
    CalendarCheck,
    CalendarCheck2Icon,
    CalendarMinus,
    CalendarPlus,
    Check,
    Clock,
    MoreVertical,
    Users,
    UsersIcon,
} from "lucide-react";
import { CloseRounded } from "@mui/icons-material";
import { useUsers } from "../../SuperAdmin/hooks/useUsers";
import moment from "moment";
import {
    PiCalendar,
    PiCalendarFill,
    PiCalendarHeart,
    PiCalendarStar,
} from "react-icons/pi";
dayjs.extend(utc);
dayjs.extend(localizedFormat);

const events = [
    {
        title: "Labor Day",
        type: "holiday",
        description: "Happy New Year!",
        startTime: "2022-01-01T00:00:00.000Z",
        endTime: "2022-01-01T23:59:59.999Z",
        color: "#FF69B4",
    },

    {
        title: "Monthly Business Review",
        type: "schedule",
        description: "This is event 1",
        startTime: "2022-01-02T10:00:00.000Z",
        endTime: "2022-01-02T11:00:00.000Z",
        color: "#FF69B4",
    },
    {
        title: "Department Reporting",
        type: "schedule",
        description: "This is event 2",
        startTime: "2022-01-02T12:00:00.000Z",
        endTime: "2022-01-02T13:00:00.000Z",
        color: "#FF69B4",
    },
    {
        title: "Election Day",
        type: "holiday",
        description: "Happy New Year!",
        startTime: "2025-05-12T00:00:00.000Z",
        endTime: "2025-05-12T23:59:59.999Z",
        color: "#FF69B4",
    },
];

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

    const latestEmployees = useMemo(() => {
        if (data) {
            return data
                .filter((user) => user.department_id !== null)
                .slice(0, 3);
        }
    }, [data, isFetched]);

    const branches = useMemo(() => {
        if (data) {
            const groupedData = data
                .filter(
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

    console.log("latestEmployees: ", latestEmployees);

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

    // Attendance Pie Chart
    const attendancePieChart = {
        labels: ["Present", "Absent", "On Leave"],
        datasets: [
            {
                data: [
                    presentCount,
                    headCount ? headCount - presentCount - onLeaveCount : 0,
                    onLeaveCount,
                ],
                backgroundColor: ["#177604", "#E9AB13", "#1E90FF"],
                hoverBackgroundColor: ["#1A8F07", "#F0B63D", "#56A9FF"],
            },
        ],
    };

    const attendancePieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true } },
        },
    };

    // Branch Bar Chart
    const branchBarChart = {
        labels: Object.values(branchNames),
        datasets: [
            {
                label: "Employees",
                backgroundColor: "#177604",
                hoverBackgroundColor: "#1A8F07",
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
        labels: [
            "10,000 - 20,000",
            "20,001 - 30,000",
            "30,001 - 40,000",
            "40,001 - 50,000",
            "50,000+",
        ],
        datasets: [
            {
                label: "Employees",
                data: salaryRange,
                backgroundColor: [
                    "#E9AB13",
                    "#177604",
                    "#1E90FF",
                    "#6A3F9B",
                    "#D84C6E",
                ],
                hoverBackgroundColor: [
                    "#F0B63D",
                    "#1A8F07",
                    "#56A9FF",
                    "#8A5AC4",
                    "#ff6384",
                ],
            },
        ],
    };

    const salaryPieOptions = {
        maintainAspectRatio: false,
        width: 500,
        height: 500,
        plugins: {
            legend: { position: "right", labels: { fontColor: "black" } },
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

    const filteredAttendance = attendance.filter((attend) => {
        const fullName = `${attend.first_name} ${attend.middle_name || ""} ${
            attend.last_name
        } ${attend.suffix || ""}`.toLowerCase();
        return fullName.includes(searchName.toLowerCase());
    });

    const paginatedAttendance = filteredAttendance.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

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

    const renderProfile = (id) => {
        if (blobMap[id]) {
            return blobMap[id];
        }
        return "../../../images/avatarpic.jpg";
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
            value: 143,
            icon: <Users size={42} />,
        },
        {
            title: "Present",
            value: 90,
            icon: <Check size={42} />,
        },
        {
            title: "Late",
            value: 13,
            icon: <Clock size={42} />,
        },
        {
            title: "On Leave",
            value: 13,
            icon: <CalendarCheck size={42} />,
        },
        {
            title: "Absent",
            value: 53,
            icon: <CalendarMinus size={42} />,
        },
    ];

    const medScreen = useMediaQuery(theme.breakpoints.up("md"));
    const xlScreen = useMediaQuery(theme.breakpoints.up("xl"));

    return (
        <Layout>
            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid
                    size={{ xs: 12, lg: 9 }}
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <Box
                        component={Stack}
                        sx={{
                            background:
                                "linear-gradient(to right bottom, #2e7d32, #e9ab13b3)",
                            p: 5,
                            borderRadius: 5,
                        }}
                        spacing={2}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                color: "primary.contrastText",
                            }}
                        >
                            Welcome{", "}
                            <Box
                                component={"span"}
                                sx={{
                                    fontWeight: "bold",
                                }}
                            >
                                <Typewriter
                                    text={adminName}
                                    delay={300}
                                    infinite
                                />
                            </Box>
                        </Typography>

                        <Stack>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: "#d1d1d1",
                                    fontStyle: "italic",
                                }}
                            >
                                Qoute of the day:
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{
                                    color: "primary.contrastText",
                                    fontWeight: 600,
                                    fontFamily: "revert",
                                }}
                            >
                                "Focus on being productive instead of busy."
                            </Typography>
                        </Stack>
                        {/* <Box
                        display="flex"
                        sx={{ flexDirection: "column", alignItems: "center" }}
                    >
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: "bold", color: "#177604" }}
                        >
                            {dayjs().format("dddd")}
                        </Typography>
                        <Typography
                            sx={{ fontWeight: "bold", color: "#177604" }}
                        >
                            {dayjs().format("MMMM DD, YYYY")}
                        </Typography>
                    </Box> */}
                    </Box>
                    <Stack direction={medScreen ? "row" : "column"} spacing={2}>
                        {infoCardsData.map((info, index) => (
                            <Paper
                                sx={{
                                    p: 2,
                                    width: "100%",
                                    borderRadius: 3,
                                    textDecoration: "none",
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "#d1d1d1",
                                        color: "primary.contrastText",
                                    },
                                }}
                                key={index}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{ color: "#8a8a8a", fontWeight: 600 }}
                                >
                                    {info.title}
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            color: "#4d4d4d",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {info.value}
                                    </Typography>

                                    <Typography
                                        variant="h3"
                                        sx={{
                                            color: "primary.light",
                                        }}
                                    >
                                        {info.icon}
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}
                    </Stack>

                    <Stack direction={xlScreen ? "row" : "column"} spacing={2}>
                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{ color: "#4d4d4d", fontWeight: 600 }}
                                >
                                    New Employees
                                </Typography>
                                <IconButton>
                                    <MoreVertical />
                                </IconButton>
                            </Box>
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
                                                        ).format(
                                                            "MMM. DD, YYYY"
                                                        )}
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
                                                                display:
                                                                    "inline",
                                                            }}
                                                        >
                                                            {emp.job_title.name}
                                                        </Typography>
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                        <Divider
                                            variant="inset"
                                            component="li"
                                        />
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{ color: "#4d4d4d", fontWeight: 600 }}
                                >
                                    Departments
                                </Typography>
                                <IconButton>
                                    <MoreVertical />
                                </IconButton>
                            </Box>
                            <List
                                sx={{
                                    bgcolor: "background.paper",
                                }}
                            >
                                {departments?.map((item, index) => (
                                    <React.Fragment>
                                        <ListItem
                                            alignItems="flex-start"
                                            secondaryAction={
                                                !xlScreen ? (
                                                    <>
                                                        <Typography variant="caption">
                                                            Joined
                                                        </Typography>
                                                        <Typography>
                                                            {moment(
                                                                item.created_at
                                                            ).format(
                                                                "MMM. DD, YYYY"
                                                            )}
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <></>
                                                )
                                            }
                                            sx={{ px: 0 }}
                                        >
                                            <ListItemText
                                                primary={`${item.department} `}
                                                secondary={
                                                    <React.Fragment></React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{ color: "#4d4d4d", fontWeight: 600 }}
                                >
                                    Branches
                                </Typography>
                                <IconButton>
                                    <MoreVertical />
                                </IconButton>
                            </Box>

                            <List
                                sx={{
                                    bgcolor: "background.paper",
                                }}
                            >
                                {branches?.map((emp, index) => (
                                    <React.Fragment>
                                        <ListItem
                                            alignItems="flex-start"
                                            secondaryAction={
                                                !xlScreen ? (
                                                    <>
                                                        <Typography variant="caption">
                                                            Joined
                                                        </Typography>
                                                        <Typography>
                                                            {moment(
                                                                emp.created_at
                                                            ).format(
                                                                "MMM. DD, YYYY"
                                                            )}
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <></>
                                                )
                                            }
                                            sx={{ px: 0 }}
                                        >
                                            <ListItemText
                                                primary={`${emp.branch} `}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            sx={{
                                                                color: "text.primary",
                                                                display:
                                                                    "inline",
                                                            }}
                                                        >
                                                            {emp.user_type}
                                                        </Typography>
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                    </Stack>
                </Grid>
                <Grid
                    size={{ xs: 12, lg: 3 }}
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
                            Schedules & Holidays
                        </Typography>

                        <List
                            sx={{
                                bgcolor: "background.paper",
                            }}
                        >
                            {events?.map((item, index) => (
                                <React.Fragment>
                                    <ListItem
                                        alignItems="flex-start"
                                        secondaryAction={
                                            <>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: "#8a8a8a" }}
                                                >
                                                    {moment(
                                                        item.startTime
                                                    ).format("MMM. DD, YYYY")}
                                                </Typography>
                                            </>
                                        }
                                        sx={{ px: 0 }}
                                    >
                                        <ListItemAvatar>
                                            <Typography
                                                sx={{
                                                    color: "primary.main",
                                                }}
                                            >
                                                {item.type == "schedule" ? (
                                                    <PiCalendarHeart
                                                        size={32}
                                                    />
                                                ) : (
                                                    <PiCalendarStar size={32} />
                                                )}
                                            </Typography>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="body1"
                                                    sx={{ fontWeight: "bold" }}
                                                >
                                                    {item.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="caption">
                                                    {item.description}
                                                </Typography>
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
            </Grid>
        </Layout>
    );
};

export default Dashboard;
