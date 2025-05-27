import {
    Avatar,
    Box,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import React, { useMemo } from "react";
import Typewriter from "../../../components/Typewriter";
import { MoreVertical } from "lucide-react";
import moment from "moment";
import AttendanceProgressBar from "../../../components/AttendanceProgressBar";
import EmployeeBarChart from "./EmployeeBarChart";
import { useUsers } from "../../SuperAdmin/hooks/useUsers";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";
import BranchesChart from "./BranchesBarChart";
import { useTodaysAttendance } from "./useDashboard";
import { Link } from "react-router-dom";

function MainSection({ infoCardsData, adminName, dashboardData }) {
    const theme = useTheme();
    const { data, isFetched, isLoading } = useUsers();
    const { data: attendance } = useTodaysAttendance();
    // console.log(data);
    // console.log(dashboardData);

    const latestEmployees = useMemo(() => {
        if (dashboardData) {
            return dashboardData.employees
                ?.filter((user) => user.department_id !== null)
                .slice(0, 3);
        }
    }, [dashboardData, isFetched]);

    const branches = useMemo(() => {
        if (dashboardData) {
            const groupedData = dashboardData.employees
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
    }, [dashboardData, isFetched]);

    const departments = useMemo(() => {
        if (dashboardData) {
            const groupedData = dashboardData.employees
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
    }, [dashboardData, isFetched]);

    const present = 34;
    const absent = 4;
    const late = 13;

    const medScreen = useMediaQuery(theme.breakpoints.up("md"));
    const xlScreen = useMediaQuery(theme.breakpoints.up("xl"));
    return isLoading ? (
        <>
            <LoadingSpinner />
        </>
    ) : (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
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
                        <Typewriter text={adminName} delay={300} infinite />
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
                        component={Link}
                        to={info.link}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: "#8a8a8a",
                                fontWeight: 600,
                            }}
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
                            sx={{
                                color: "#4d4d4d",
                                fontWeight: 600,
                            }}
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
                            <React.Fragment key={index}>
                                <ListItem
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <>
                                            <Typography variant="caption">
                                                Joined
                                            </Typography>
                                            <Typography>
                                                {moment(emp.created_at).format(
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
                                                sx={{
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {emp.first_name} {emp.last_name}
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
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                                <Divider variant="inset" component="li" />
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
                            sx={{
                                color: "#4d4d4d",
                                fontWeight: 600,
                            }}
                        >
                            Departments
                        </Typography>
                        <IconButton>
                            <MoreVertical />
                        </IconButton>
                    </Box>
                    {departments && <EmployeeBarChart data={departments} />}
                    {/* <List
                        sx={{
                            bgcolor: "background.paper",
                        }}
                    >
                        {departments?.map((item, index) => (
                            <React.Fragment>
                                <ListItem
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <AttendanceProgressBar
                                            present={present}
                                            late={late}
                                            absent={absent}
                                        />
                                    }
                                    sx={{ px: 0 }}
                                >
                                    <ListItemText
                                        primary={`${item.department} `}
                                        secondary={<></>}
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                    </List> */}
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
                            sx={{
                                color: "#4d4d4d",
                                fontWeight: 600,
                            }}
                        >
                            Branches
                        </Typography>
                        <IconButton>
                            <MoreVertical />
                        </IconButton>
                    </Box>
                    {branches && <BranchesChart data={branches} />}
                    {/* <List
                        sx={{
                            bgcolor: "background.paper",
                        }}
                    >
                        {branches?.map((emp, index) => (
                            <React.Fragment>
                                <ListItem
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <AttendanceProgressBar
                                            present={present}
                                            late={late}
                                            absent={absent}
                                        />
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
                                                        display: "inline",
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
                    </List> */}
                </Paper>
            </Stack>
        </Box>
    );
}

export default MainSection;
