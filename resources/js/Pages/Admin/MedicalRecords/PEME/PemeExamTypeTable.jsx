import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";

const highlightMatch = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
            <mark key={index} style={{ backgroundColor: "#E9AE20" }}>
                {part}
            </mark>
        ) : (
            part
        )
    );
};

const PemeExamTypeTable = ({ records, onRowClick, search }) => {
    return (
        <TableContainer
            sx={{
                marginTop: 2,
                overflowY: "scroll",
                minHeight: 400,
                maxHeight: 500,
            }}
            style={{ overflowX: "auto" }}
        >
            <Table stickyHeader aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Date</TableCell>
                        <TableCell align="center">Exam</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                <Typography>No Result Found</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        records.map((record, index) => (
                            <TableRow
                                key={index}
                                onClick={() => onRowClick(record.id)}
                                sx={{
                                    cursor: "pointer",
                                    transition: ".15s",
                                    "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                                    },
                                }}
                            >
                                <TableCell align="center">
                                    {highlightMatch(
                                        dayjs(record.date).format(
                                            "MMMM D, YYYY"
                                        ),
                                        search
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    {highlightMatch(record.name, search)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PemeExamTypeTable;
