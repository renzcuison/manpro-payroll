import React from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import Layout from "../../../components/Layout/Layout";

const GroupLifeMasterlist = () => {
    return (
                <Layout title={"Pre-Employment Medical Exam Records"}>
                    <Box sx={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
                        <Box sx={{ mx: 'auto', width: { xs: '100%', md: '1400px' } }} >
        
                            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Group Life Masterlists </Typography>
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
        // {/* // <Layout title={"Group Life Masterlist"}>
        // //     <Box>
        // //         <Box */}
        //             sx={{
        //                 padding: 2,
        //                 backgroundColor: "white",
        //                 borderRadius: 2,
        //                 boxShadow: 1,
        //             }}
        //         >
        //             {/* Header */}
        //             <Box
        //                 sx={{
        //                     display: "flex",
        //                     justifyContent: "space-between",
        //                     padding: 2,
        //                     borderBottom: "1px solid #ccc",
        //                 }}
        //             >
        //                 <Typography variant="h4" sx={{ fontWeight: "bold" }}>
        //                     Group Life Masterlists
        //                 </Typography>
        //                 <div
        //                     style={{
        //                         display: "flex",
        //                         gap: "12px",
        //                     }}
        //                 >
                            // <Button
                            //     variant="contained"
                            //     style={{ color: "#e8f1e6" }}
                            //     // onClick={() => navigate("/admin/perimeters/add")}
                            // >
                            //     <i className="fa fa-plus pr-2"></i> Add New
                            //     Record Type
                            // </Button>
                            // <Button
                            //     variant="contained"
                            //     color="secondary"
                            //     style={{
                            //         color: "#5d460d",
                            //     }}
                            //     // onClick={() => navigate("/admin/perimeters/add")}
                            // >
                            //     <i className="fa fa-plus pr-2"></i>
                            //     Add New Record
                            // </Button>
        //                 </div>
        //             </Box>
        //         </Box>
        //     </Box>
        // </Layout>
    );
};

export default GroupLifeMasterlist;
