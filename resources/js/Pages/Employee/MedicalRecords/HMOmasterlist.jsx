import React from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import Layout from "../../../components/Layout/Layout";

const HMOmasterlist = () => {
    return (
                <Layout title={"Pre-Employment Medical Exam Records"}>
                    <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                        <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >
        
                            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}> HMO Masterlists </Typography>
                                    <></>
        
                                    <Button
                                        onClick={() => setOpenAddPemeRecordsModal(true)}
                                        variant="contained"
                                        style={{ color: "#e8f1e6" }}
                                    >
                                        <i className="fa fa-plus pr-2"></i> Add
                                    </Button>
                            </Box>
                        </Box>
                    </Box>
                </Layout>
    );
};

export default HMOmasterlist;
