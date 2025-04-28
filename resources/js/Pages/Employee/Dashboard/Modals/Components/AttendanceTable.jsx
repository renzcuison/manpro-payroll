import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import AccessTime from "@mui/icons-material/AccessTime";

const AttendanceTable = ({ title, logs }) => {
    if (!logs || logs.length === 0) return null;

    return (
        <>
            <TableContainer sx={{ maxHeight: "350px", overflowY: "auto", border: "solid 1px #e0e0e0" }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={2} sx={{ pl: 1 }}>
                                <Box >
                                    <AccessTime sx={{ color: "text.secondary" }} />
                                    <Typography variant="caption" sx={{ ml: 1, fontWeight: "bold", color: "text.secondary" }}>
                                        {title}
                                    </Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log, index) => (
                            <TableRow key={index}>
                                <TableCell align="left" sx={{ pl: 1, width: "40%" }} >
                                    {log.action}
                                </TableCell>
                                <TableCell align="left" sx={{ pl: 0, width: "60%" }}>
                                    {log.timestamp}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default AttendanceTable;