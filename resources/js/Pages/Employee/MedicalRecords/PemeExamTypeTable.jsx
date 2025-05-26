import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const PemeExamTypeTable = ({ records }) => {
    return (
        <TableContainer component={Paper} elevation={0} sx={{ marginTop: 2, borderRadius: 0, dropShadow: "none" }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: "#F5F5F5"}} >
                        <TableCell align="center"><strong>Date</strong></TableCell>
                        <TableCell align="center"><strong>Exam</strong></TableCell>
                        <TableCell align="center"><strong>Due Date</strong></TableCell>
                        <TableCell align="center"><strong>Progress</strong></TableCell>
                        <TableCell align="center"><strong>Status</strong></TableCell>        
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.map((record) => (
                        <TableRow sx={{ backgroundColor: "#FAFAFA"}} key={record.id}>
                        <TableCell align="center">{record.date}</TableCell>
                        <TableCell align="center">{record.exam}</TableCell>
                        <TableCell align="center">{record.dueDate}</TableCell>
                        <TableCell align="center">{record.progress}</TableCell>
                        <TableCell align="center">{record.status}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PemeExamTypeTable;