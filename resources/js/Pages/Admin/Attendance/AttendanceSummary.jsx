import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    TextField,
    Stack,
    Grid,
    CircularProgress,
    InputLabel,
    Select,
    FormControl,
} from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import PageHead from "../../../components/Table/PageHead";
import PageToolbar from "../../../components/Table/PageToolbar";
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import {
    getComparator,
    stableSort,
} from "../../../components/utils/tableUtils";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const AttendanceSummary = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [attendanceSummary, setAttendanceSummary] = useState([]);
    const [month, setMonth] = useState(dayjs().month());
    const [year, setYear] = useState(dayjs());

    const [searchName, setSearchName] = useState("");

    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(0);
    const [selectedDepartment, setSelectedDepartment] = useState(0);

    // Attendance Summary List
    useEffect(() => {
        setIsLoading(true);
        axiosInstance
            .get("/attendance/getAttendanceSummary", {
                headers,
                params: {
                    month: month + 1,
                    year: dayjs(year).year(),
                    branch: selectedBranch,
                    department: selectedDepartment,
                },
            })
            .then((response) => {
                setAttendanceSummary(response.data.summary || []);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching summary:", error);
                setIsLoading(false);
            });
    }, [month, selectedBranch, selectedDepartment]);

    // Branch, Department For Filters
    useEffect(() => {
        axiosInstance
            .get("/settings/getBranches", { headers })
            .then((response) => {
                setBranches(response.data.branches || []);
            })
            .catch((error) => {
                console.error("Error fetching branches:", error);
                setIsLoading(false);
            });
        axiosInstance
            .get("/settings/getDepartments", { headers })
            .then((response) => {
                setDepartments(response.data.departments || []);
            })
            .catch((error) => {
                console.error("Error fetching departments:", error);
                setIsLoading(false);
            });
    }, []);

    // ---------------- Summary Details
    const formatTime = (time) => {
        if (!time) return "-";

        const absTime = Math.abs(time);

        const hours = Math.floor(absTime / 60);
        const minutes = absTime % 60;

        if (hours > 0) {
            return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
        } else {
            return `${minutes}m`;
        }
    };

    // Filtering the attendance summary by search name
    const filteredAttendance = attendanceSummary.filter((attendance) => {
        const fullName = `${attendance.emp_first_name} ${
            attendance.emp_middle_name || ""
        } ${attendance.emp_last_name} ${
            attendance.emp_suffix || ""
        }`.toLowerCase();
        return fullName.includes(searchName.toLowerCase());
    });

    return (
        <Layout title={"AttendanceLogs"}>
            <Box
                sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}
            >
                <Box>
                    <Box
                        sx={{
                            mt: 5,
                            display: "flex",
                            justifyContent: "space-between",
                            px: 1,
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {" "}
                            Attendance Summary{" "}
                        </Typography>
                        <></>
                    </Box>

                    <Box
                        sx={{
                            mt: 6,
                            p: 3,
                            bgcolor: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        {/* Filters */}
                        <Grid
                            container
                            direction="row"
                            justifyContent="space-between"
                            sx={{ pb: 4, borderBottom: "1px solid #e0e0e0" }}
                        >
                            <Grid
                                container
                                direction="row"
                                justifyContent="flex-start"
                                xs={4}
                                spacing={2}
                            >
                                <Grid>
                                    <FormControl
                                        sx={{
                                            width: "100%",
                                            "& label.Mui-focused": {
                                                color: "#97a5ba",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#97a5ba",
                                                },
                                            },
                                        }}
                                    >
                                        <TextField
                                            id="searchName"
                                            label="Search Employee Name"
                                            variant="outlined"
                                            value={searchName}
                                            onChange={(e) =>
                                                setSearchName(e.target.value)
                                            }
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid
                                container
                                direction="row"
                                justifyContent="flex-end"
                                xs={4}
                                spacing={2}
                            >
                                <Grid>
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}
                                    >
                                        <FormControl fullWidth>
                                            <TextField
                                                select
                                                id="month-select"
                                                label="Month"
                                                value={month}
                                                onChange={(event) =>
                                                    setMonth(event.target.value)
                                                }
                                            >
                                                {[
                                                    {
                                                        value: 0,
                                                        label: "January",
                                                    },
                                                    {
                                                        value: 1,
                                                        label: "February",
                                                    },
                                                    {
                                                        value: 2,
                                                        label: "March",
                                                    },
                                                    {
                                                        value: 3,
                                                        label: "April",
                                                    },
                                                    { value: 4, label: "May" },
                                                    { value: 5, label: "June" },
                                                    { value: 6, label: "July" },
                                                    {
                                                        value: 7,
                                                        label: "August",
                                                    },
                                                    {
                                                        value: 8,
                                                        label: "September",
                                                    },
                                                    {
                                                        value: 9,
                                                        label: "October",
                                                    },
                                                    {
                                                        value: 10,
                                                        label: "November",
                                                    },
                                                    {
                                                        value: 11,
                                                        label: "December",
                                                    },
                                                ].map((monthOption) => {
                                                    const currentYear =
                                                        dayjs().year();
                                                    const currentMonth =
                                                        dayjs().month();
                                                    const isCurrentYearSelected =
                                                        year
                                                            ? dayjs(
                                                                  year
                                                              ).year() ===
                                                              currentYear
                                                            : false;
                                                    const isMonthDisabled =
                                                        isCurrentYearSelected &&
                                                        monthOption.value >
                                                            currentMonth;

                                                    return (
                                                        <MenuItem
                                                            key={
                                                                monthOption.value
                                                            }
                                                            value={
                                                                monthOption.value
                                                            }
                                                            disabled={
                                                                isMonthDisabled
                                                            }
                                                        >
                                                            {monthOption.label}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </TextField>
                                        </FormControl>
                                    </LocalizationProvider>
                                </Grid>
                                <Grid>
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}
                                    >
                                        <DatePicker
                                            label="Year"
                                            value={year}
                                            views={["year"]}
                                            maxDate={dayjs()}
                                            onChange={(newValue) => {
                                                setYear(newValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField {...params} />
                                            )}
                                            slotProps={{
                                                textField: {
                                                    readOnly: true,
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid sx={{ maxWidth: 250, minWidth: 250 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id="branch-select-label">
                                            Branch
                                        </InputLabel>
                                        <Select
                                            labelId="branch-select-label"
                                            id="branch-select"
                                            value={selectedBranch}
                                            label="Branch"
                                            onChange={(event) =>
                                                setSelectedBranch(
                                                    Number(event.target.value)
                                                )
                                            }
                                        >
                                            <MenuItem value={0}>
                                                All Branches
                                            </MenuItem>
                                            {branches.map((branch) => (
                                                <MenuItem
                                                    key={branch.id}
                                                    value={branch.id}
                                                >
                                                    {branch.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid sx={{ maxWidth: 250, minWidth: 250 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id="department-select-label">
                                            Department
                                        </InputLabel>
                                        <Select
                                            labelId="department-select-label"
                                            id="department-select"
                                            value={selectedDepartment}
                                            label="Department"
                                            onChange={(event) =>
                                                setSelectedDepartment(
                                                    Number(event.target.value)
                                                )
                                            }
                                        >
                                            <MenuItem value={0}>
                                                All Departments
                                            </MenuItem>
                                            {departments.map((department) => (
                                                <MenuItem
                                                    key={department.id}
                                                    value={department.id}
                                                >
                                                    {department.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                        {/* Table */}
                        {isLoading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    minHeight: 200,
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer
                                style={{ overflowX: "auto" }}
                                sx={{ minHeight: 400, maxHeight: 500 }}
                            >
                                <Table stickyHeader aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">
                                                Name
                                            </TableCell>
                                            <TableCell align="center">
                                                Branch
                                            </TableCell>
                                            <TableCell align="center">
                                                Department
                                            </TableCell>
                                            <TableCell align="center">
                                                Role
                                            </TableCell>
                                            <TableCell align="center">
                                                Hours
                                            </TableCell>
                                            <TableCell align="center">
                                                Tardiness
                                            </TableCell>
                                            <TableCell align="center">
                                                Absences
                                            </TableCell>
                                            <TableCell align="center">
                                                Overtime
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {!Array.isArray(filteredAttendance) ||
                                        filteredAttendance.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={8}
                                                    align="center"
                                                >
                                                    No attendance records found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAttendance.map(
                                                (attendance) => (
                                                    <TableRow
                                                        key={attendance.emp_id}
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/attendance/${attendance.emp_user_name}`
                                                            )
                                                        }
                                                        sx={{
                                                            "&:last-child td, &:last-child th":
                                                                { border: 0 },
                                                            textDecoration:
                                                                "none",
                                                            color: "inherit",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "rgba(0, 0, 0, 0.1)",
                                                                cursor: "pointer",
                                                            },
                                                        }}
                                                    >
                                                        <TableCell align="left">
                                                            {" "}
                                                            {
                                                                attendance.emp_first_name
                                                            }{" "}
                                                            {attendance.emp_middle_name ||
                                                                ""}{" "}
                                                            {
                                                                attendance.emp_last_name
                                                            }{" "}
                                                            {attendance.emp_suffix ||
                                                                ""}{" "}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {attendance.emp_branch ||
                                                                "-"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {attendance.emp_department ||
                                                                "-"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {attendance.emp_role ||
                                                                "-"}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {formatTime(
                                                                attendance.total_rendered
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {formatTime(
                                                                attendance.total_late
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="center">{`${attendance.total_absences} days`}</TableCell>
                                                        <TableCell align="center">
                                                            {formatTime(
                                                                attendance.total_overtime
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default AttendanceSummary;
