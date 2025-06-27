import React from 'react';
import { ToggleButton, ToggleButtonGroup, Box, Typography} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const WorkDaySelector = ({workDays, isEdit, onChange}) => {
    const theme = useTheme();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const selectedDays = days.filter(day => workDays[day]);
    const handleChange = (event) => {
        if(!isEdit) return;
        const clickedDay = event.target.value;
        onChange(clickedDay);
    };
    return(
        <>
            <Typography>{!isEdit ? "Scheduled Work Days:": "Set Work Days"}</Typography>
            <ToggleButtonGroup
                value={selectedDays}
                onChange={handleChange}
                aria-label='work days'
                size='large'
                exclusive={false} //allow multiselection
                sx={{ gap: 2, justifyContent: 'center', display: 'flex', flexWrap: 'wrap' }}
                >
                    {days.map(day => (
                        <ToggleButton
                            key={day}
                            value={day}
                            disabled={!isEdit}
                            aria-label={day}
                            disableRipple
                            
                            disableFocusRipple
                            sx={{
                                boxShadow: isEdit ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                                width: 50, height: 50, minWidth: 'auto', padding: 0, fontSize: 14, textTransform: 'none', border: 'none', borderRadius: '50% !important',
                                color: workDays[day] ? '#fff' : '#333', backgroundColor: workDays[day] ? '#1976d2' : 'transparent',
                                //highlight selected even on disabled mode
                                '&.Mui-selected.Mui-disabled': { backgroundColor: '#97a5ba', color: '#fff', opacity: 1, },
                                //forces borderless radius
                                '&.MuiToggleButtonGroup-grouped': { margin: 0, border: 'none !important', borderRadius: '50% !important', },
                                '&.MuiToggleButtonGroup-grouped:not(:first-of-type)': { marginLeft: 0, },
                                '&.MuiToggleButtonGroup-grouped:not(:last-of-type)': { marginRight: 0, },
                                //highlights selected
                                '&.Mui-selected': { backgroundColor: theme.palette.primary.main, color: '#fff'},
                                //when disabled
                                '&.Mui-disabled': { color: '#6c757d', backgroundColor: '#e0e0e0', },
                            }}
                        >
                            {day.slice(0, 3).toUpperCase()}
                      </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </>
    )

}

export default WorkDaySelector;