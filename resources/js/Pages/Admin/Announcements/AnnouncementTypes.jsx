import React, { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import Layout from "../../../components/Layout/Layout";
import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import AnnouncementTypeEdit from './Modals/AnnouncementTypeEdit';

const AnnouncementTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editType, setEditType] = useState(null);

  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true);
      setError('');
      try {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));
        const res = await axiosInstance.get('/getAnnouncementType', { headers });
        if (res.data.status === 200) {
          setTypes(res.data.types || []);
        } else {
          setError(res.data.message || 'Failed to fetch announcement types.');
        }
      } catch (err) {
        setError('Server error.');
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  const handleEditSuccess = () => {
    // Refetch types after editing
    const fetchTypes = async () => {
      setLoading(true);
      setError('');
      try {
        const storedUser = localStorage.getItem("nasya_user");
        const headers = getJWTHeader(JSON.parse(storedUser));
        const res = await axiosInstance.get('/getAnnouncementType', { headers });
        if (res.data.status === 200) {
          setTypes(res.data.types || []);
        } else {
          setError(res.data.message || 'Failed to fetch announcement types.');
        }
      } catch (err) {
        setError('Server error.');
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
    setEditType(null);
  };

  return (
    <Layout title="Announcement Types">
      <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
        <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}> Announcement Types </Typography>
          </Box>
          <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left" sx={{ fontWeight: 'bold', fontSize: 16, width: "60%" }}>Type Name</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: 16, width: "20%" }}>Created On</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: 16, width: "20%" }}>Updated On</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {types.map((type) => (
                      <TableRow
                        key={type.id}
                        sx={{ p: 1, "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer" } }}
                        onClick={() => setEditType(type)}
                      >
                        <TableCell align="left">{type.name || '-'}</TableCell>
                        <TableCell align="center">
                          {type.created_at
                            ? new Date(type.created_at).toLocaleString('sv-SE', { hour12: false }).replace('T', ' ')
                            : '-'}
                        </TableCell>
                        <TableCell align="center">
                          {type.updated_at
                            ? new Date(type.updated_at).toLocaleString('sv-SE', { hour12: false }).replace('T', ' ')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </Box>
      {editType && (
        <AnnouncementTypeEdit
          type={editType}
          onClose={() => setEditType(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </Layout>
  );
};

export default AnnouncementTypes;