import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import React from "react";
import { useClients } from "../hooks/useClients";
import { error } from "jquery";

function AssignPackage({ company, setCompanyData, packages }) {
    const [selectedPackage, setSelectedPackage] = React.useState(null);
    const { assignPackageToCompany } = useClients();

    console.log(company);

    const handleChange = (event) => {
        const pkg_id = event.target.value;
        assignPackageToCompany(pkg_id, company.id)
            .then((res) => {
                console.log(res);
                if (res.isSuccess) {
                    setCompanyData(res.company);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };
    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Package</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={company.package?.id}
                    label="Package"
                    onChange={handleChange}
                    defaultValue={company.package?.id}
                >
                    {packages.map((pkg) => (
                        <MenuItem
                            key={pkg.id}
                            value={pkg.id}
                            selected={company?.package?.id === pkg.id}
                        >
                            {pkg.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default AssignPackage;
