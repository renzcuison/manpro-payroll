import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import React from "react";

function AssignPackage({ company, packages }) {
    const [selectedPackage, setSelectedPackage] = React.useState(null);

    const handleChange = (event) => {
        setSelectedPackage(event.target.value);
    };
    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Package</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedPackage}
                    label="Package"
                    onChange={handleChange}
                >
                    {packages.map((pkg) => (
                        <MenuItem key={pkg.id} value={pkg.id}>
                            {pkg.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default AssignPackage;
