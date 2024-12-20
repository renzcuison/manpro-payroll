import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { Box, Typography } from '@mui/material';

const Dashboard = () => {

    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user.user_type === 'Admin') {
            navigate("/hr/dashboard");
        } else if (user.user_type === 'Member') {
            navigate("/member/dashboard");
        }
    }, [user, navigate]);

    return (
        <></>
        // <div id="page-container" className="main-container">
        //     <div className='px-4 block-content bg-light' style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', borderRadius: '20px', minWidth: '400px', maxWidth: '500px', marginTop: '20%' }}>
        //         <Box component="form" noValidate autoComplete="off">
        //             <Typography variant="h4" sx={{ mt: 3, mb: 6, fontWeight: 'bold' }}> Checking User </Typography>
        //         </Box>
        //     </div>
        // </div>
    );
};

export default Dashboard;
