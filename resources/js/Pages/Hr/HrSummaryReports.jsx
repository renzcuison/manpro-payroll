import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';

import PropTypes from 'prop-types';
import SalaryIncrease from '../../components/Table/Report/SalaryIncrease';
import BenefitHistory from '../../components/Table/Report/BenefitHistory';
import PayrollHistory from '../../components/Table/Report/PayrollHistory';
import EmployeeHistory from '../../components/Table/Report/EmployeeHistory';
import AllowedApplication from '../../components/Table/Report/AllowedApplication';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other} >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <div>{children}</div>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return { id: `simple-tab-${index}`, 'aria-controls': `simple-tabpanel-${index}` };
}

function useSessionStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        const item = window.sessionStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
    });

    const setValue = (value) => {
        setStoredValue(value);
        window.sessionStorage.setItem(key, JSON.stringify(value));
    };

    return [storedValue, setValue];
}

const HrReports = () => {
    const [value, setValue] = useSessionStorage('selectedTab', 0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Layout title={"Reports"}>
            <Box sx={{ mt: 6, mx: 12 }}>
                <Grid item sx={{ marginBottom: 2 }}>
                    <div className="d-flex justify-content-between align-items-center p-0">
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <h5 className='pt-3'>Summary Reports</h5>
                            </Grid>
                        </Grid>
                    </div>
                </Grid>

                <div className="block">
                    <div className="block-content">
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab label="Employee History" {...a11yProps(0)} />
                                    <Tab label="Salary Increase" {...a11yProps(1)} />
                                    <Tab label="Application" {...a11yProps(2)} />
                                    <Tab label="Benefits History" {...a11yProps(3)} />
                                    <Tab label="Payroll History" {...a11yProps(4)} />
                                </Tabs>
                            </Box>
                            <TabPanel value={value} index={0}> <EmployeeHistory /> </TabPanel>
                            <TabPanel value={value} index={1}> <SalaryIncrease /> </TabPanel>
                            <TabPanel value={value} index={2}> <AllowedApplication /> </TabPanel>
                            <TabPanel value={value} index={3}> <BenefitHistory /> </TabPanel>
                            <TabPanel value={value} index={4}> <PayrollHistory /> </TabPanel>
                        </Box>
                    </div>
                </div>
            </Box>
        </Layout>
    );
}

export default HrReports;
