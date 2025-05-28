import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../../components/Layout/Layout";
import {
    Box,
    Divider,
    Stack,
    Typography,
    Table as MuiTable,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    TablePagination,
} from "@mui/material";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";
import GlobalFilter from "../../../components/GlobalFilter";
import { useUsers } from "../hooks/useUsers";
import LoadingSpinner from "../../../components/LoadingStates/LoadingSpinner";

function AllUsers() {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    const { data: users, isLoading } = useUsers();
    if (isLoading) {
        return (
            <>
                <LoadingSpinner />
            </>
        );
    }
    console.log("Users: ", users);

    const data = useMemo(() => users, [users, isLoading]);
    const columns = useMemo(
        () => [
            {
                accessorKey: "first_name",
                header: "Name",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "age",
                header: "Age",
                cell: (info) => info.getValue(),
            },
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
            pagination: {
                pageIndex,
                pageSize,
            },
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: "includesString",
    });

    console.log(table.getRowModel().rows[0].getVisibleCells()[0].getContext());

    return (
        <Layout>
            <Stack
                spacing={2}
                divider={<Divider sx={{ borderStyle: "dashed" }} />}
            >
                <Box>
                    <Typography variant="h4">Manage Users</Typography>
                </Box>
                <Box sx={{}}>
                    <GlobalFilter
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                    />
                    <TableContainer component={Paper} sx={{ borderRadius: 5 }}>
                        <MuiTable>
                            <TableHead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow
                                        key={headerGroup.id}
                                        sx={{
                                            backgroundColor:
                                                "background.default",
                                        }}
                                    >
                                        {headerGroup.headers.map((header) => (
                                            <TableCell
                                                key={header.id}
                                                sx={{
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <TableSortLabel
                                                        active={
                                                            !!header.column.getIsSorted()
                                                        }
                                                        direction={
                                                            header.column.getIsSorted() ===
                                                            "desc"
                                                                ? "desc"
                                                                : "asc"
                                                        }
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {flexRender(
                                                            header.column
                                                                .columnDef
                                                                .header,
                                                            header.getContext()
                                                        )}
                                                    </TableSortLabel>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHead>
                            <TableBody>
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </MuiTable>

                        <TablePagination
                            component="div"
                            count={data.length}
                            page={pageIndex}
                            onPageChange={(e, newPage) => setPageIndex(newPage)}
                            rowsPerPage={pageSize}
                            onRowsPerPageChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPageIndex(0);
                            }}
                            rowsPerPageOptions={[5, 10, 25]}
                        />
                    </TableContainer>
                </Box>
            </Stack>
        </Layout>
    );
}

export default AllUsers;
