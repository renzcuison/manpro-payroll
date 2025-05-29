import React, { useState } from "react";
import {Box, Button, Menu, MenuItem, Typography, Divider, TextField} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);

const PemeDueDatePicker = ({ dueDate, setDueDate }) => {
    const [menuOpener, setMenuOpener] = useState(null);
    const [customOpen, setCustomOpen] = useState(false);
    const [customDate, setCustomDate] = useState(dueDate || dayjs());

    const open = Boolean(menuOpener);

    const handleOpen = (event) => {
        setMenuOpener(event.currentTarget);
        setCustomOpen(false);
    };

    const handleClose = () => {
        setMenuOpener(null);
        setCustomOpen(false);
    };

    const handlePresetClick = (value) => {
        setDueDate(value);
        if (value === "today") setDueDate(dayjs());
        else if (value === "yesterday") setDueDate(dayjs().subtract(1, "day"));
        else if (value === "last7") setDueDate("last7");
        else if (value === "thisWeek") setDueDate("thisWeek"); 
        else if (value === "clear") setDueDate(null);
        handleClose();
    };

    const handleCustomDateChange = (newValue) => {
        setCustomDate(newValue);
        setDueDate(newValue);
        handleClose();
    };

    const presetLabels = {
        today: "Today",
        yesterday: "Yesterday",
        last7: "Last 7 Days",
        thisWeek: "This Week",
        lastWeek: "Last Week",
        thisMonth: "This Month",
        lastMonth: "Last Month",
        thisYear: "This Year",
        lastYear: "Last Year",
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box>
            <Button
            onClick={handleOpen}
            variant="outlined"
            sx={{ backgroundColor: "#E9AE20", color: "#000", width: 220, height: 52 }}
            >
                {dueDate && presetLabels[dueDate]
                    ? presetLabels[dueDate] : dueDate
                    ? dayjs(dueDate).format("MMM D, YYYY") : "Due Date"
            }
            </Button>

            <Menu
            anchorEl={menuOpener}
            open={open}
            onClose={handleClose}
            >

            {!customOpen ? (
                <>
                <MenuItem sx={{ width: 220 }} onClick={() => handlePresetClick("today")}>Today</MenuItem>
                <MenuItem onClick={() => handlePresetClick("yesterday")}>Yesterday</MenuItem>
                <MenuItem onClick={() => handlePresetClick("last7")}>Last 7 Days</MenuItem>
                <MenuItem onClick={() => handlePresetClick("clear")}>Clear</MenuItem>
                <Divider />
                <MenuItem onClick={() => handlePresetClick("thisWeek")}>This Week</MenuItem>
                <MenuItem onClick={() => handlePresetClick("lastWeek")}>Last Week</MenuItem>
                <MenuItem onClick={() => handlePresetClick("thisMonth")}>This Month</MenuItem>
                <MenuItem onClick={() => handlePresetClick("lastMonth")}>Last Month</MenuItem>
                <MenuItem onClick={() => handlePresetClick("thisYear")}>This Year</MenuItem>
                <MenuItem onClick={() => handlePresetClick("lastYear")}>Last Year</MenuItem>                   
                <Divider />
                <MenuItem onClick={() => setCustomOpen(true)}>Custom</MenuItem>
                </>

            ) : (

                <Box>
                <Typography variant="subtitle1" sx={{ textAlign: 'center' }}> Select A Date </Typography>
                <StaticDatePicker
                    displayStaticWrapperAs="desktop"
                    value={customDate}
                    onChange={handleCustomDateChange}
                    showToolbar={false}
                    renderInput={(params) => <TextField {...params} />}
                />
                </Box>
            )}
            </Menu>
        </Box>
        </LocalizationProvider>
  );
};

export default PemeDueDatePicker;