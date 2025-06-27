import React, { useState, useMemo } from "react";
import Layout from "../../../components/Layout/Layout";
import "../../../../../resources/css/calendar.css";
import {
    Avatar,
    Typography,
    Divider,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tabs,
    Tab,
    Chip,
    Skeleton,
    Stack,
    CircularProgress,
    Box,
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
import { useMilestones } from "../Milestones/hook/useMilestones";
import { useUser } from "../../../hooks/useUser";
import OverviewStatistics from "./OverviewStatistics";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const { user, isFetched: userIsFetched } = useUser();
    const { data, isFetched } = useUsers();
    const {
        data: dashboard,
        isFetched: isFetchedDashboard,
        isLoading,
    } = useDashboard();

    console.log(dashboard);

    // const {
    //     data: milestones,
    //     isLoading: isLoadingMilestones,
    // } = useMilestones();

    const milestonesToday = useMemo(() => {
        if (dashboard) {
            return dashboard.milestones?.filter((milestone) => {
                const milestoneDate = moment(milestone.date).format(
                    "YYYY-MM-DD"
                );
                const today = moment().format("YYYY-MM-DD");
                return milestoneDate === today;
            });
        }
    }, [dashboard, isFetchedDashboard]);

    const [value, setValue] = useState("one");
    const [selectedDate, setSelectedDate] = useState(
        moment().format("YYYY-MM-DD")
    );

    const [adminName, setAdminName] = useState("Admin");

    const presentUsers = useMemo(() => {
        if (!dashboard || !isFetched) return [];
        return dashboard?.employees?.filter((user) => {
            if (!user.attendance_logs[0]) {
                return false;
            }
            const attendanceDate = moment(
                user.attendance_logs[0]?.timestamp
            ).format("YYYY-MM-DD");

            return attendanceDate === selectedDate;
        });
    }, [dashboard, selectedDate]);

    const lateUsers = useMemo(() => {
        if (!presentUsers || presentUsers.length === 0) return [];

        return presentUsers.filter((user) => {
            const dutyInLogs = user.attendance_logs?.filter(
                (log) => log.action === "Duty In"
            );

            if (!dutyInLogs || dutyInLogs.length === 0) return false;

            // Get the earliest "Duty In" log
            const firstDutyIn = dutyInLogs.sort((a, b) =>
                moment(a.timestamp).diff(moment(b.timestamp))
            )[0];

            const timeIn = moment(firstDutyIn.timestamp);

            // Get the scheduled time-in from work_hours (format: "08:30:00")
            const scheduledTimeStr = user.work_hours?.first_time_in;
            if (!scheduledTimeStr) return false;

            const [hour, minute, second] = scheduledTimeStr
                .split(":")
                .map(Number);

            // Set threshold time to the same day as timeIn but with scheduled time
            const threshold = moment(timeIn).set({
                hour,
                minute,
                second,
                millisecond: 0,
            });

            return timeIn.isAfter(threshold);
        });
    }, [presentUsers]);

    const latestEmployees = useMemo(() => {
        if (data) {
            return data
                ?.filter((user) => user.department_id !== null)
                ?.slice(0, 3);
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

    function normalizeDate(date) {
        return new Date(date.toISOString().split("T")[0]);
    }
    const onLeave = useMemo(() => {
        if (dashboard) {
            return dashboard.requests.filter((leave) => {
                const checkDate = normalizeDate(new Date());
                const startDate = normalizeDate(new Date(leave.duration_start));
                const endDate = normalizeDate(new Date(leave.duration_end));

                return (
                    leave.status === "approved" &&
                    checkDate >= startDate &&
                    checkDate <= endDate
                );
            });
        }
    }, [dashboard]);

    const infoCardsData = [
        {
            title: "Total Employees",
            slug: "employees",
            value: dashboard?.employees?.length,
            icon: <Users size={42} />,
            link: "/admin/employees",
        },
        {
            title: "Present",
            slug: "present",
            value: presentUsers?.length,
            icon: <Check size={42} />,
            link: "/admin/attendance/today",
        },
        {
            title: "Late",
            slug: "late",
            value: lateUsers?.length,
            icon: <Clock size={42} />,
            link: "/admin/attendance/today",
        },
        {
            title: "On Leave",
            slug: "leave",
            value: onLeave?.length,
            icon: <CalendarCheck size={42} />,
            link: "/admin/attendance/today",
        },
        {
            title: "Absent",
            slug: "absent",
            value:
                dashboard?.employees?.length -
                presentUsers?.length -
                onLeave?.length,
            icon: <CalendarMinus size={42} />,
            link: "/admin/attendance/today",
        },
    ];

    return (
        <Layout>
            <Grid container spacing={3} sx={{ mb: 5 }}>
                {/* MAIN DASHBOARD CARD */}
                <Grid size={{ xs: 12, lg: 9 }}>
                    {!isLoading && userIsFetched ? (
                        <MainSection
                            infoCardsData={infoCardsData}
                            latestEmployees={latestEmployees}
                            adminName={adminName}
                            departments={departments}
                            branches={branches}
                            dashboardData={dashboard}
                            user={user}
                        />
                    ) : (
                        <Stack spacing={3}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={3}
                            >
                                <Typography variant="subtitle1">
                                    Loading Dashboard..
                                </Typography>
                                <CircularProgress />
                            </Stack>
                            <Skeleton variant="rounded" height={200} />
                            <Skeleton variant="rounded" height={140} />
                            <Skeleton variant="rounded" height={300} />
                        </Stack>
                    )}
                </Grid>

                {/* SCHEDULES & HOLIDAYS CARD */}
                <Grid
                    size={{ xs: 12, lg: 3 }}
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                    {!isLoading ? (
                        <SchedulesHolidays setSelectedDate={setSelectedDate} />
                    ) : (
                        <Skeleton variant="rounded" height="100%" />
                    )}
                </Grid>

                {/* OVERVIEW SUMMARY CARD */}
                <Grid
                    size={{ xs: 12, lg: 8 }}
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <OverviewStatistics />
                </Grid>
                {/* BIRTHDAYS AND MILESTONES CARD */}
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
                            {milestonesToday ? (
                                milestonesToday?.map((emp, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem
                                            alignItems="flex-start"
                                            secondaryAction={
                                                <>
                                                    <Chip
                                                        label={
                                                            emp.type
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            emp.type.slice(1)
                                                        }
                                                    />
                                                </>
                                            }
                                            sx={{ px: 0 }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    alt="Remy Sharp"
                                                    src={
                                                        emp.user?.media
                                                            ? emp.user
                                                                  ?.media?.[0]
                                                                  ?.original_url
                                                            : ""
                                                    }
                                                    component={Link}
                                                    to={`/admin/employee/${emp.user?.user_name}`}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="body1"
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        {emp.user?.first_name}{" "}
                                                        {emp.user?.last_name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            sx={{
                                                                color:
                                                                    "text.primary",
                                                                display:
                                                                    "inline",
                                                            }}
                                                        >
                                                            {emp.description}
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
                                ))
                            ) : (
                                <Stack spacing={3}>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={3}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 400 }}
                                        >
                                            No upcoming birthdays or milestones
                                        </Typography>
                                    </Stack>
                                    <Skeleton variant="rounded" height={100} />
                                </Stack>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Layout>
    );
};

export default Dashboard;
