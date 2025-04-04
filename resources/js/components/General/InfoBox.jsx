import { Box, Typography } from '@mui/material';

const InfoBox = ({ title, info, compact = false, clean = false, color = null }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
                ...(!clean && {
                    p: 1,
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    backgroundColor: '#fafafa',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                        backgroundColor: '#f3f5fa',
                    },
                }),
            }}
        >
            {/* Info Title */}
            <Typography
                sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    ...(compact && { flex: '0 0 40%' }),
                }}
            >
                {title}
            </Typography>
            {/* Info Text */}
            <Typography
                sx={{
                    color: color || 'text.primary',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    ...(compact && {
                        flex: '0 0 60%',
                        textAlign: 'left',
                    }),
                }}
            >
                {info ?? '—'}
            </Typography>
        </Box>
    );
};

export default InfoBox;