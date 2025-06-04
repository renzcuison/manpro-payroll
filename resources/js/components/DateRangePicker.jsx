import React, { useState, useEffect } from "react"; //added useEffect
import { TextField, Menu, MenuItem, Box, Paper, Typography, Divider } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const ranges = [
    { label: "All", range: [null, null] },
    { label: "Today", range: [dayjs(), dayjs()] },
    { label: "Yesterday", range: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")] },
    { label: "Last 7 Days", range: [dayjs().subtract(6, "day"), dayjs()] },
    { label: "Last 30 Days", range: [dayjs().subtract(29, "day"), dayjs()] },
    { label: "This Month", range: [dayjs().startOf("month"), dayjs().endOf("month")] },
    { label: "Last Month", range: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
    { label: "This Year", range: [dayjs().startOf("year"), dayjs().endOf("year")] },
    { label: "Last Year", range: [dayjs().subtract(1, "year").startOf("year"), dayjs().subtract(1, "year").endOf("year")] },
    { label: "Custom Range", custom: true }
];

export default function DateRangePicker({onRangeChange}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());
    const [showCustom, setShowCustom] = useState(false);

    const formatDisplay = () => `${startDate ? startDate.format("MM/DD/YYYY") : "Start"} - ${endDate ? endDate.format("MM/DD/YYYY") : "End"}`;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (item) => {
        if (item.custom) {
            setShowCustom(true);
        } else {
            setStartDate(item.range[0]);
            setEndDate(item.range[1]);
            onRangeChange?.(item.range[0], item.range[1]); // call existing onRangeChange prop function from another file and pass the selected start and end dates
            handleClose();
        }
    };

    // set from user input in a controlled component
    useEffect(() => {                       
            if (showCustom && startDate && endDate) {
                onRangeChange?.(startDate, endDate);
            }
        }, 
    [startDate, endDate, showCustom]);

    const handleClose = () => {
        setAnchorEl(null);
        setShowCustom(false);
    };
    

    return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TextField label="Select Date Requested" value={formatDisplay()} onClick={handleClick} fullWidth readOnly />

        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            MenuListProps={{ dense: true }}
            PaperProps={{ sx: { p: 0, overflow: "visible", background: "transparent", boxShadow: "none" } }}
        >
            <Paper sx={{ display: "flex", flexDirection: "row", minWidth: 200, backgroundColor: "background.paper", boxShadow: 3, p: 0, }} >
                {/* Left: Predefined Ranges */}
                <Box sx={{ width: 200, borderRight: "1px solid #e0e0e0" }}>
                    {ranges.map((item) => (
                        <MenuItem key={item.label} onClick={() => handleMenuItemClick(item)} selected={item.custom && showCustom} >
                            {item.label}
                        </MenuItem>
                    ))}
                </Box>

                {/* Right: Custom Range Calendars */}
                {showCustom && (
                    <Box sx={{ display: "flex", flexDirection: "row", p: 2, gap: 2, }} >
                        <Box>
                            <Typography variant="caption">Start Date</Typography>
                            <DateCalendar value={startDate} onChange={(newValue) => setStartDate(newValue)} />
                        </Box>

                        <Box>
                            <Typography variant="caption">End Date</Typography>
                            <DateCalendar value={endDate} onChange={(newValue) => setEndDate(newValue)} />
                        </Box>
                    </Box>
                )}
            </Paper>
        </Menu>
    </LocalizationProvider>
    );
}
