import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TablePagination,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    TextField,
    Stack,
    Grid,
    CircularProgress,
} from "@mui/material";
import Layout from "../../../components/Layout/Layout";
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import PageHead from "../../../components/Table/PageHead";
import PageToolbar from "../../../components/Table/PageToolbar";
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import {
    getComparator,
    stableSort,
} from "../../../components/utils/tableUtils";

import ClientEditModal from "../Clients/Modals/ClientEditModal";
import { usePackages } from "../hooks/usePackages";

const headCells = [
    {
        id: "id",
        label: "ID",
        sortable: true,
    },
    {
        id: "name",
        label: "Name",
        sortable: true,
    },
    {
        id: "package",
        label: "Package",
        sortable: true,
    },
    {
        id: "status",
        label: "Status",
        sortable: true,
    },
];

const ClientsList = () => {
    const { packages } = usePackages();

    console.log(packages);
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    const queryParameters = new URLSearchParams(window.location.search);
    const [searchParams, setSearchParams] = useSearchParams();
    const [totalAttendance, setTotalAttendance] = useState([]);
    const [filterAttendance, setFilterAttendance] = useState([]);

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("calories");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [isLoading, setIsLoading] = useState(true);
    const [clients, setClients] = useState([]);

    const [openClientModal, setOpenClientModal] = useState(false);
    const [client, setClient] = useState([]);

    const handleRequestSort = (_event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const handleFilter = (event) => {
        const filtered = totalAttendance.filter((client) =>
            `${client?.id} ${client?.id}`
                .toLocaleLowerCase()
                .includes(event.target.value.toLocaleLowerCase())
        );
        if (event.target.value != "") {
            setTotalAttendance(filtered);
        } else {
            setTotalAttendance(filterAttendance);
        }
    };

    useEffect(() => {
        axiosInstance
            .get("/clients/getClients", { headers })
            .then((response) => {
                setClients(response.data.clients);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching clients:", error);
                setIsLoading(false);
            });
    }, []);

    const handleOpenClient = (data) => {
        console.log("Open client");
        console.log(data);

        setOpenClientModal(true);
        setClient(data);
    };

    const handleCloseClient = (data) => {
        setOpenClientModal(false);
        setClient([]);
    };

    return (
        <Layout title={"Clients"}>
            <Box sx={{ mx: 12 }}>
                <Box
                    sx={{
                        mt: 5,
                        display: "flex",
                        justifyContent: "space-between",
                        px: 3,
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h5" sx={{ pt: 3 }}>
                        {" "}
                        Clients{" "}
                    </Typography>

                    <Link to="/super-admin/clients-add">
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: "#177604", color: "white" }}
                            className="m-1"
                        >
                            <p className="m-0">
                                <i className="fa fa-plus"></i> Add{" "}
                            </p>
                        </Button>
                    </Link>
                </Box>

                <Box
                    sx={{
                        mt: 6,
                        p: 3,
                        bgcolor: "#ffffff",
                        borderRadius: "8px",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mb: 2,
                        }}
                    >
                        <PageToolbar handleSearch={handleFilter} />
                    </Box>

                    {isLoading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 200,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TableContainer style={{ overflowX: "auto" }}>
                                <Table
                                    className="table table-md  table-striped  table-vcenter"
                                    style={{ minWidth: "auto" }}
                                >
                                    <PageHead
                                        style={{ whiteSpace: "nowrap" }}
                                        order={order}
                                        orderBy={orderBy}
                                        onRequestSort={handleRequestSort}
                                        headCells={headCells}
                                    />
                                    <TableBody>
                                        {clients.length != 0 ? (
                                            stableSort(
                                                clients,
                                                getComparator(order, orderBy)
                                            )
                                                .slice(
                                                    page * rowsPerPage,
                                                    page * rowsPerPage +
                                                        rowsPerPage
                                                )
                                                .map((client, index) => {
                                                    return (
                                                        <TableRow
                                                            key={client.id}
                                                            hover
                                                            role="checkbox"
                                                            tabIndex={-1}
                                                            sx={{
                                                                "&:hover": {
                                                                    cursor: "pointer",
                                                                },
                                                            }}
                                                            onClick={() =>
                                                                handleOpenClient(
                                                                    client
                                                                )
                                                            }
                                                        >
                                                            <TableCell>
                                                                {client.id}
                                                            </TableCell>
                                                            <TableCell>
                                                                {client.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                {client.package}
                                                            </TableCell>
                                                            <TableCell>
                                                                {client.status}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                        ) : (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                tabIndex={-1}
                                            >
                                                <TableCell
                                                    colSpan={4}
                                                    className="text-center"
                                                >
                                                    No data Found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={clients.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{
                                    ".MuiTablePagination-actions": { mb: 2 },
                                    ".MuiInputBase-root": { mb: 2 },
                                    bgcolor: "#ffffff",
                                    borderRadius: "8px",
                                }}
                            />
                        </>
                    )}
                </Box>

                {openClientModal && (
                    <ClientEditModal
                        open={openClientModal}
                        close={handleCloseClient}
                        client={client}
                        type={2}
                        packages={packages}
                    />
                )}
            </Box>
        </Layout>
    );
};

export default ClientsList;
