import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const PemeExamTypeTable = ({ records }) => {
    return (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Exam</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.exam}</TableCell>

                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PemeExamTypeTable;