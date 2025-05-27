import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";

const PemeExamTypeTable = ({ records, onRowClick }) => {
    return (
        <TableContainer component={Paper} sx={{ marginTop: 2, overflowY:"scroll", maxHeight: 500 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <strong>Date</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Exam</strong>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.map((record) => (
                        <TableRow
                            key={record.id}
                            onClick={onRowClick}
                            sx={{
                                cursor: "pointer",
                                transition: ".15s",
                                "&:hover": { backgroundColor: "#e0e0e0" },
                            }}
                        >
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PemeExamTypeTable;
