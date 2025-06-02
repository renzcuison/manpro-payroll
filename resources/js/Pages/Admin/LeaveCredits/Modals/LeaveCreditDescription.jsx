import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  IconButton,
  Stack,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance from '../../../../utils/axiosConfig';

import LeaveCreditAdd from './LeaveCreditAdd';
import LeaveCreditRedo from './LeaveCreditRedo';  // <-- Import LeaveCreditRedo

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxHeight: '80vh',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
  overflowY: 'auto',
};

function getJWTHeader(user) {
  const token = user?.token || localStorage.getItem('jwt_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

const LeaveCreditDescription = ({ open, onClose, employee, refreshCredit }) => {
  const [leaveCredits, setLeaveCredits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New states for LeaveCreditRedo modal & selected leave credit row
  const [isRedoModalOpen, setIsRedoModalOpen] = useState(false);
  const [selectedLeaveCredit, setSelectedLeaveCredit] = useState(null);

  const[leaveTypeSet, setLeaveTypeSet] = useState([]);

  const user = useMemo(() => JSON.parse(localStorage.getItem('nasya_user')), []);
  const headers = useMemo(() => getJWTHeader(user), [user]);

  useEffect(() => {
    axiosInstance.get('applications/getApplicationTypes', { headers })
      .then(res => {
        setLeaveTypeSet(res.data.types || []);
      })
      .catch(err => {
        console.error('Error fetching leave types:', err);
      });
  }, [headers]);

  const fetchLeaveCredits = () => {
    if (!employee?.user_name) {
      console.warn('fetchLeaveCredits: No employee username provided.');
      return;
    }

    setLoading(true);
    axiosInstance.get(`/employee/getLeaveCreditByUser/${employee.user_name}`, { headers })
      .then((res) => {
        setLeaveCredits(res.data.leaveCredits || []);
      })
      .catch((err) => {
        console.error('fetchLeaveCredits: Error fetching leave credits:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open && employee?.user_name) {
      fetchLeaveCredits();
    } else {
      setLeaveCredits([]);
    }
  }, [open, employee?.user_name, headers]);

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    fetchLeaveCredits();
    if (refreshCredit) refreshCredit();
  };

  // New: Open LeaveCreditRedo modal when row clicked
  const handleRowClick = (leave) => {
    console.log('Clicked leave Credit: ', leave);    
    setSelectedLeaveCredit(leave);
    setIsRedoModalOpen(true);
  };

  // New: Close LeaveCreditRedo modal and refresh data
  const handleCloseRedoModal = () => {
    setIsRedoModalOpen(false);
    setSelectedLeaveCredit(null);
    fetchLeaveCredits();
    if (refreshCredit) refreshCredit();
  };

  return (
    <>
      <Modal open={open} onClose={onClose} aria-labelledby="leave-credits-title">
        <Box sx={style}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" color="black" sx={{ fontWeight: 'bold' }}>
              Leave Credits
            </Typography>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Box>

          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Employee Name:
              <Typography component="span" variant="body2" sx={{ fontWeight: 'normal', ml: 1 }}>
                {employee?.name || '-'}
              </Typography>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Branch:
              <Typography component="span" variant="body2" sx={{ fontWeight: 'normal', ml: 1 }}>
                {employee?.branch || '-'}
              </Typography>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Department:
              <Typography component="span" variant="body2" sx={{ fontWeight: 'normal', ml: 1 }}>
                {employee?.department || '-'}
              </Typography>
            </Typography>
          </Stack>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Leave Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Limit</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Used</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Remaining</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveCredits.length > 0 ? (
                  leaveCredits.map((leave) => (
                    <TableRow 
                      key={leave.leaveTypeId} 
                      hover 
                      onClick={() => handleRowClick(leave)}  // <-- row click handler here
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{leave.leaveType}</TableCell>
                      <TableCell align="right">{Number(leave.limit).toFixed(2)}</TableCell>
                      <TableCell align="right">{Number(leave.used).toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ color: Number(leave.remaining) < 0 ? 'red' : 'inherit' }}>
                          {Number(leave.remaining).toFixed(2)}
                          {Number(leave.remaining) < 0 && (
                            <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                              Warning: Remaining leave cannot be less than 0!
                            </Typography>
  )}
</TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No leave credits found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleOpenAddModal}>
              <p className="m-0"><i className="fa fa-plus"></i>&nbsp;&nbsp;&nbsp;Add Leave Credit </p>
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* LeaveCreditAdd modal */}
      {isAddModalOpen && (
        <LeaveCreditAdd 
          open={isAddModalOpen} 
          close={handleCloseAddModal} 
          empId={employee.user_name} 
          employee={employee}
        />
      )}

      {/* LeaveCreditRedo modal, opened on row click, with selected leave credit */}
      {isRedoModalOpen && selectedLeaveCredit && (
        <LeaveCreditRedo
          open={isRedoModalOpen}
          close={handleCloseRedoModal}
          leaveCredit={selectedLeaveCredit}  // <-- pass selected leave credit row here
          empId={employee.user_name}
          employee={employee}
          leaveTypeId={selectedLeaveCredit.leaveTypeId}
          leaveTypeName={selectedLeaveCredit.leaveType}
          currentCredits={selectedLeaveCredit.remaining}

        />
      )}
    </>
  );
};

export default LeaveCreditDescription;
