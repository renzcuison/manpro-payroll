import React, { useEffect, useState, useRef, useMemo } from "react";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import "../../../../../resources/css/calendar.css";
import {
    Avatar,
    Typography,
    Divider,
    Grid,
    useTheme,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tabs,
    Tab,
    Chip,
} from "@mui/material";

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
import { useUsers } from "../../SuperAdmin/hooks/useUsers";
import moment from "moment";
dayjs.extend(utc);
dayjs.extend(localizedFormat);
import MainSection from "./MainSection";
import SchedulesHolidays from "./SchedulesHolidays";
import { useDashboard } from "./useDashboard";

const Dashboard = () => {
    const { data, isFetched } = useUsers();
    const { data: dashboard, isFetched: isFetchedDashboard } = useDashboard();
    const [value, setValue] = useState("one");
    const [selectedDate, setSelectedDate] = useState(
        moment().format("YYYY-MM-DD")
    );
    console.log("Selected Date: ", selectedDate);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [adminName, setAdminName] = useState("Admin");

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
                    {dashboard && (
                        <MainSection
                            infoCardsData={infoCardsData}
                            latestEmployees={latestEmployees}
                            adminName={adminName}
                            departments={departments}
                            branches={branches}
                            dashboardData={dashboard}
                        />
                    )}
                </Grid>
                <Grid
                    size={{ xs: 12, lg: 3 }}
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <SchedulesHolidays setSelectedDate={setSelectedDate} />
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
                                        key={index}
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
