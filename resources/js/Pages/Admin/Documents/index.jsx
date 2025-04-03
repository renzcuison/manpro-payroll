import React, { useState } from "react";
import Layout from "../../../components/Layout/Layout";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import CreateDocumentDialog from "./Modals/Create";
import { useDocuments } from "./hook/useDocuments";
import DocumentCard from "./DocumentCard";
import EditDocumentDialog from "./Modals/Edit";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";

function Documents() {
    const { documents, isFetching, deleteDoc } = useDocuments();
    const [openAdd, setOpenAdd] = useState(false);
    const [openDoc, setOpenDoc] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const queryClient = useQueryClient();

    const handleClick = (doc) => {
        setSelectedDoc(doc);
        setOpenDoc(true);
    };

    const handleDeleteDoc = (id) => {
        console.log(id);

        setOpenDoc(false);
        // Show loading Swal
        Swal.fire({
            title: "Are you sure you want to delete this document?",
            text: "You won't be able to recover it",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, keep it",
        }).then(async (result) => {
            if (result.value) {
                // Delete the document

                Swal.fire({
                    title: "Please wait...",
                    text: "Uploading your document...",
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                });
                // TODO: Delete the document from the server
                try {
                    const deleteResponse = await deleteDoc(selectedDoc.id);
                    if (deleteResponse.success) {
                        Swal.fire(
                            "Deleted!",
                            "Your document has been deleted.",
                            "success"
                        );
                        queryClient.invalidateQueries("documents");
                    }
                    console.log(deleteResponse);
                } catch (error) {
                    console.error(error);
                    Swal.fire("Error!", "Failed to delete document.", "error");
                }
            } else {
                close(false);
            }
        });
    };

    console.log(selectedDoc);

    return (
        <Layout title={"Documents"}>
            <Stack spacing={2}>
                <Stack>
                    <Typography variant="h2">Documents</Typography>
                    <Typography variant="body1">
                        This is a list of documents
                    </Typography>
                </Stack>
                <Box>
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={() => {
                            setOpenAdd(true);
                        }}
                    >
                        Add New Document
                    </Button>
                </Box>
                <Divider sx={{ borderStyle: "dashed" }} />
                <Box sx={{ pt: 5 }}>
                    {isFetching ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 400,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {documents?.data?.map((doc) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    xl={3}
                                    key={doc.id}
                                >
                                    <DocumentCard
                                        document={doc}
                                        handleClick={() => handleClick(doc)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
                <Box>
                    {/* Add Document Modal */}
                    {openAdd && (
                        <CreateDocumentDialog
                            open={openAdd}
                            close={() => {
                                setOpenAdd(false);
                            }}
                        />
                    )}
                    {/* Document Detail Modal */}
                    {openDoc && (
                        <EditDocumentDialog
                            open={openDoc}
                            close={() => {
                                setOpenDoc(false);
                            }}
                            handleDelete={() => handleDeleteDoc(document.id)}
                            document={selectedDoc}
                        />
                    )}
                </Box>
            </Stack>
        </Layout>
    );
}

export default Documents;
