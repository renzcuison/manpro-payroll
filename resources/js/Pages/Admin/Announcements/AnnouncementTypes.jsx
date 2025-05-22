import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';

import Layout from "../../../components/Layout/Layout";
import LoadingSpinner from '../../../components/LoadingStates/LoadingSpinner';
import axiosInstance, { getJWTHeader } from "../../../utils/axiosConfig";
import AnnouncementTypeAdd from './Modals/AnnouncementTypeAdd';
import AnnouncementTypeEdit from './Modals/AnnouncementTypeEdit';

const AnnouncementTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editType, setEditType] = useState(null);

  const fetchTypes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/getAnnouncementType', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.status === 200) {
        setTypes(data.types || []);
      } else {
        setError(data.message || 'Failed to fetch announcement types.');
      }
    } catch (err) {
      setError('Server error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleEditSuccess = () => {
    fetchTypes();
    setEditType(null);
  };

  return (
    <Layout title="Announcement Types">
      <Box sx={{ overflowX: "auto", width: "100%", whiteSpace: "nowrap" }}>
        <Box sx={{ mx: "auto", width: { xs: "100%", md: "1400px" } }}>
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 1, alignItems: 'left' }}>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}> Announcement Types </Typography>

              {/* <Button variant="contained" color="primary">
                  <p className="m-0"><i className="fa fa-plus"></i> Add </p>
              </Button> */}
          </Box>
          <Box sx={{ mt: 6, p: 3, bgcolor: '#ffffff', borderRadius: '8px' }}>
        {loading ? (
            <LoadingSpinner />
        ) : (
            <>
              <TableContainer style={{ overflowX: 'auto' }} sx={{ minHeight: 400 }}>
                  <Table aria-label="simple table">
                      <TableHead>
                          <TableRow>
                              <TableCell align="left" sx={{fontWeight: 'bold', fontSize: 16}}>Type Name</TableCell>
                          </TableRow>
                      </TableHead>

                      <TableBody>
                          {types.map((type) => (
                              <TableRow key={type.id} sx={{ p: 1, "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)", cursor: "pointer" }}} onClick={() => setEditType(type)}>
                                  <TableCell align="left">{type.name || '-'}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </TableContainer>
          </>
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