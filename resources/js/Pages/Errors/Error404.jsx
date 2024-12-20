import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import manpro_logo from '../../../images/ManPro.png'

const CheckUser = () => {
    return (
        <div 
            id="page-container" 
            className="main-container" 
            style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh', 
                backgroundColor: '#ffffff' 
            }}
        >
            <img src={manpro_logo} alt="ManPro Logo" style={{ width: '20%', height: 'auto', marginBottom: '50px' }} />

            <div 
                className='px-4 block-content' 
                style={{ 
                    backgroundColor: '#ffffff', 
                    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', 
                    borderRadius: '20px', 
                    minWidth: '600px', 
                    maxWidth: '900px', 
                    padding: '40px', 
                    textAlign: 'center', 
                }}
            >
                <Typography variant="h2" sx={{ mt: 3, mb: 2, fontWeight: 'bold', color: '#177604' }}>
                    Oops! Page Not Found.
                </Typography>

                <Typography variant="h6" sx={{ mb: 4, color: '#666' }}>
                    We're sorry, but the page you are looking for doesn't exist or has been moved.
                </Typography>

                <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
                    You can try searching for what you need or go back to the homepage.
                </Typography>

                <Box sx={{ border: '1px dashed #e9ae20', borderRadius: '10px', padding: '20px', m: 4 }}>
                    <Typography variant="body2" sx={{ color: '#e9ae20', mt: 2 }}>
                        If you need assistance, please contact support.
                    </Typography>
                </Box>

                <Button 
                    variant="contained" 
                    color="primary" 
                    component={Link} 
                    to="/"
                    sx={{ 
                        backgroundColor: '#177604', 
                        '&:hover': { backgroundColor: '#145a03', color: '#ffffff'}, 
                        padding: '10px 20px', 
                        fontSize: '16px' 
                    }}
                >
                    Home
                </Button>
            </div>
        </div>
    );
};

export default CheckUser;
