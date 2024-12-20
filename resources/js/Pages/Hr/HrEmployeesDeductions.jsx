import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { Box, Tab, Tabs, Grid } from '@mui/material';

import PropTypes from 'prop-types';
import AdditionalBenefitsTable from '../../components/Table/Employee/AdditionalBenefitsTable';
import AdditionalLoansTable from '../../components/Table/Employee/AdditionalLoansTable';
import EmployeeContribution from '../../components/Table/Employee/EmployeeContribution';
import EmployeeTaxes from '../../components/Table/Employee/EmployeeTaxes';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
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
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

// Custom hook to persist and retrieve tab index in session storage
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

const HrEmployeesDeductions = () => {
    const [value, setValue] = useSessionStorage('selectedTab', 0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Layout title={"Employees Calendar"}>
            <Box sx={{ mx: 12 }}>
                <div className="content-heading d-flex justify-content-between px-4">
                    <h5 className='pt-3'>Deductions</h5>
                    <div className="btn-group" role="group"></div>
                </div>

                <div className="block">
                    <div className="block-content">
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab label="Additional Loans" {...a11yProps(0)} />
                                    <Tab label="Employee Taxes" {...a11yProps(1)} />
                                </Tabs>
                            </Box>
                            <TabPanel value={value} index={0}>
                                <AdditionalLoansTable />
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                                <EmployeeTaxes />
                            </TabPanel>
                        </Box>
                    </div>
                </div>
            </Box>
        </Layout>
    );
}

export default HrEmployeesDeductions;
