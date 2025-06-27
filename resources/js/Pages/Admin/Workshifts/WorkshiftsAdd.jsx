import React from 'react'
import { Box, Button, Typography, FormGroup, TextField, FormControl, Menu, MenuItem, InputLabel,
TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Checkbox } from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import { useManageWorkshift } from '../../../hooks/useWorkShifts';
import WorkDaySelector from '../Workshifts/WorkDaySelector';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';


const WorkshiftAdd = () => {
    const {
        //values
        shiftName,shiftType,firstLabel,secondLabel, 
        regularTimeIn, regularTimeOut,splitFirstTimeIn, splitFirstTimeOut,
        splitSecondTimeIn, splitSecondTimeOut,
        breakStart, breakEnd, overTimeIn,overTimeOut, workDays,
        //error object
        errors,
        //functions
        setShiftName, handleShiftTypeChange, setFirstLabel,
        setSecondLabel, setRegularTimeIn, setRegularTimeOut, setSplitFirstTimeIn,
        setSplitSecondTimeOut,
        setBreakStart, setBreakEnd, setOverTimeIn, setOverTimeOut, checkInput,
        handleSplitFirstTimeOutChange, handleSplitSecondTimeInChange, handleWorkDaysChanges,

    } = useManageWorkshift();

    const setFieldColor = () => {
        return null
    }

    return (
        <Layout title={"AddWorkShift"}>
            <Box sx={{ mx: 10, pt: 12 }}>
                <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '800px', maxWidth: '1000px', marginBottom: '5%' }}>
                    <Box component="form" sx={{ mx: 6, mt: 3, mb: 6 }} onSubmit={checkInput} noValidate autoComplete="off" encType="multipart/form-data" >

                        <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }}>Add Work Shift</Typography>

                        <FormGroup row={true} className="d-flex justify-content-between">
                            <FormControl sx={{ marginBottom: 3, width: {lg:'50%', md:'100%', xs:'100%'},
                                marginRight: {md:0, lg: 3},
                            }}>
                                <TextField
                                    required
                                    id="shiftName"
                                    label="Shift Name"
                                    variant="outlined"
                                    value={shiftName}
                                    error={!!errors.shiftName}
                                    onChange={(e) => setShiftName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl sx={{ marginBottom: 3, width: {lg:'45.5%', md:'100%', xs:'100%'}}}>
                                <TextField
                                    select
                                    required
                                    id="shiftType"
                                    label="Shift Type"
                                    value={shiftType}
                                    onChange={(e) => handleShiftTypeChange(e.target.value)}
                                >
                                    <MenuItem key="regular" value="regular"> Regular Hours </MenuItem>
                                    <MenuItem key="split" value="split"> Split Hours </MenuItem>
                                </TextField>
                            </FormControl>
                        </FormGroup>

                        {shiftType === "regular" && (
                            <>
                                <Typography>Work Hours</Typography>
                                <FormGroup row={true} className="d-flex justify-content-between">
                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%'}}>
                                        <TextField
                                            required
                                            id="firstLabel"
                                            label="First Label"
                                            variant="outlined"
                                            value="Attendance"
                                        />
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <TimePicker
                                                required
                                                label="Time In"
                                                views={['hours', 'minutes']}
                                                value={regularTimeIn}
                                                onChange={(val) => setRegularTimeIn(val)}
                                                slotProps={{ textField: { error: !!errors.regularTimeIn, required: true } }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                                <TimePicker
                                                    required
                                                    label="Time Out"
                                                    views={['hours', 'minutes']}
                                                    value={regularTimeOut}
                                                    onChange={(val) => setRegularTimeOut(val)}
                                                    slotProps={{ textField: { error: !!errors.regularTimeOut , required: true } }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </FormGroup>

                                <FormGroup row={true} className="d-flex justify-content-between">
                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%'}}>
                                        <TextField
                                            required
                                            id="breakTimeLabel"
                                            label="Break Time"
                                            variant="outlined"
                                            value="Break Time"
                                        />
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <TimePicker
                                                required
                                                label="Break Start"
                                                views={['hours', 'minutes']}
                                                value={breakStart}
                                                onChange={(value) => setBreakStart(value)}
                                                slotProps={{ textField: { error: !!errors.breakStart, required: true } }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <TimePicker
                                                requireds
                                                label="Break End"
                                                views={['hours', 'minutes']}
                                                value={breakEnd}
                                                onChange={(val) => setBreakEnd(val)}
                                                slotProps={{ textField: { error: !!errors.breakEnd , required: true } }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>
                                </FormGroup>
                            </>
                        )}

                        {shiftType === "split" && (
                            <>
                                <Typography>Work Hours</Typography>
                                <FormGroup row={true} className="d-flex justify-content-between">
                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%'}}>
                                        <TextField
                                            required
                                            id="firstLabel"
                                            label="First Label"
                                            variant="outlined"
                                            value={firstLabel}
                                            error={!!errors.firstLabel}
                                            onChange={(e) => setFirstLabel(e.target.value)}
                                        />
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <TimePicker
                                                required
                                                label="Time In"
                                                views={['hours', 'minutes']}
                                                value={splitFirstTimeIn}
                                                onChange={(val) => setSplitFirstTimeIn(val)}
                                                slotProps={{ textField: { error: !!errors.splitFirstTimeIn, required: true } }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <TimePicker
                                                required
                                                label="Time Out"
                                                views={['hours', 'minutes']}
                                                value={splitFirstTimeOut}
                                                onChange={handleSplitFirstTimeOutChange}
                                                slotProps={{ textField: { error: !!errors.splitFirstTimeOut, required: true } }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>
                                </FormGroup>

                                <FormGroup row={true} className="d-flex justify-content-between">
                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%'}}>
                                        <TextField
                                            required
                                            id="secondLabel"
                                            label="Second Label"
                                            variant="outlined"
                                            value={secondLabel}
                                            error={!!errors.secondLabel}
                                            onChange={(e) => setSecondLabel(e.target.value)}
                                        />
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <TimePicker
                                                required
                                                label="Time In"
                                                views={['hours', 'minutes']}
                                                value={splitSecondTimeIn}
                                                onChange={handleSplitSecondTimeInChange}
                                                slotProps={{ textField: { error: !!errors.splitSecondTimeIn, required: true } }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <TimePicker
                                                required
                                                label="Time Out"
                                                views={['hours', 'minutes']}
                                                value={splitSecondTimeOut}
                                                onChange={(val) => setSplitSecondTimeOut(val)}
                                                slotProps={{ textField: { error: !!errors.splitSecondTimeOut, required: true } }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>
                                </FormGroup>
                            </>
                        )}

                        {shiftType && (
                            <>
                                <FormGroup row={true} className="d-flex justify-content-between">
                                    <FormControl sx={{ paddingTop: 1, marginBottom: 3, marginRight: {md:0, lg: 3}, width: '50%'}}>
                                        <TextField
                                            required
                                            id="overTimeLabel"
                                            label="Over Time"
                                            variant="outlined"
                                            value="Over Time"
                                        />
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <TimePicker
                                                label="Time In"
                                                views={['hours', 'minutes']}
                                                value={overTimeIn}
                                                onChange={(val) => setOverTimeIn(val)}
                                                slotProps={{ textField: { error: !!errors.overTimeIn, required: true } }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>

                                    <FormControl sx={{ marginBottom: 3, width: '22%', alignSelf:'flex-end'}}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ paddingLeft: '0 !important' }}>
                                            <TimePicker
                                                label="Time Out"
                                                views={['hours', 'minutes']}
                                                value={overTimeOut}
                                                onChange={(val) => setOverTimeOut(val)}
                                                slotProps={{ textField: { error: !!errors.overTimeOut, required: true } }}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>
                                </FormGroup>

                                <WorkDaySelector workDays={workDays} isEdit={true} onChange={handleWorkDaysChanges}/>
            
            
                                <div className="d-flex justify-content-center" id="buttons" style={{ marginTop: '20px' }}>
                                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                                        <p className='m-0'><i className="fa fa-plus mr-2 mt-1"></i>Save Shift</p>
                                    </Button>
                                </div>
                            </>
                        )}

                    </Box>
                </div> 

            </Box>
        </Layout >
    )
}

export default WorkshiftAdd