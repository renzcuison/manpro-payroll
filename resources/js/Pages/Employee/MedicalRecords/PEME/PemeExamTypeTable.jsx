import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

const PemeExamTypeTable = ({ records, onRowClick }) => {
    return (
        <TableContainer sx={{ marginTop: 2, overflowY:"scroll", minHeight: 400, maxHeight: 500 }} style={{ overflowX: 'auto' }} >
            <Table stickyHeader aria-label="simple table">
                <TableHead>
                    <TableRow >
                        <TableCell align="center"> 
                            Date
                        </TableCell>
                        <TableCell align="center">
                            Exam
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
                                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)" },
                            }}
                        >
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
