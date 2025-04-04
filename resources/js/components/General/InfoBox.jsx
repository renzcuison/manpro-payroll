import { Box, Typography } from '@mui/material';

const InfoBox = ({ title, info }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                backgroundColor: '#fafafa',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                    backgroundColor: '#f3f5fa',
                },
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary', fontWeight: 500,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }} >
                {title}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: 'text.primary', fontWeight: 600,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }} >
                {info ?? '—'}
            </Typography>
        </Box>
    );
};

export default InfoBox;