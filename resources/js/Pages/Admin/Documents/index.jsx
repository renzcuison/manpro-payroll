import React, { useState } from "react";
import Layout from "../../../components/Layout/Layout";
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import CreateDocumentDialog from "./Modals/Create";
import { useDocuments } from "./hook/useDocuments";
import DocumentCard from "./DocumentCard";

function Documents() {
    const { documents, isFetching } = useDocuments();
    const [openAdd, setOpenAdd] = useState(false);

    console.log(documents);

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
                    <Grid container spacing={2}>
                        {documents?.data?.map((doc) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                xl={3}
                                key={doc.id}
                            >
                                <DocumentCard document={doc} />
                            </Grid>
                        ))}
                    </Grid>
                )}
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
                </Box>
            </Stack>
        </Layout>
    );
}

export default Documents;
