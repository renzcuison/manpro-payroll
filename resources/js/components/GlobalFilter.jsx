import React from "react";
import { TextField } from "@mui/material";

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => {
    return (
        <TextField
            variant="outlined"
            label="Search"
            size="small"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            style={{ marginBottom: "1rem" }}
        />
    );
};

export default GlobalFilter;
