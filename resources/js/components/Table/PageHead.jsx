import { TableCell, TableHead, TableRow, TableSortLabel, Typography, } from "@mui/material";

const PageHead = ({ headCells, order, orderBy, onRequestSort }) => {
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };
    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell, index) => (
                    <TableCell key={index} sortDirection={orderBy === headCell.id ? order : false} style={{ whiteSpace: "nowrap", overflow: "hidden", textAlign: headCell.label === "Time Arrived" ? "end" : "" }} >
                        {headCell.sortable ? (
                            <TableSortLabel active={orderBy === headCell.id} direction={ orderBy === headCell.id ? order : "asc" } onClick={createSortHandler(headCell.id)} >
                                {headCell.label === "Application Type" || headCell.label === "Date of Application" || headCell.label === "Date of Effectivity" || headCell.label === "Number of Hours" || headCell.label === "File Uploaded" ? (
                                    <Typography variant="p" style={{ width: "130px" }}> {headCell.label} </Typography>
                                ) : (
                                    headCell.label
                                )}
                            </TableSortLabel>
                        ) : (
                            headCell.label
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
};

export default PageHead;
