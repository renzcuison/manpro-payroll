import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const PemeExamTypeTable = ({ records }) => {
    return (
        <TableContainer component={Paper} elevation={0} sx={{ marginTop: 2, borderRadius: 0, dropShadow: "none" }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: "#F5F5F5"}} >
                        <TableCell align="center"><strong>Date</strong></TableCell>
                        <TableCell align="center"><strong>Exam</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.map((record) => (
                        <TableRow sx={{ backgroundColor: "#FAFAFA"}} key={record.id}>
                        <TableCell align="center">{record.date}</TableCell>
                        <TableCell align="center">{record.exam}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PemeExamTypeTable;