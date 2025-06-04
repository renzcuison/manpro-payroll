import {
    Box,
    Typography,
    Button,
    TextField,
    Checkbox,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
  } from "@mui/material";
  import React from "react";
  
  const PositionAddMiniModal = ({ newPosition, setNewPosition, addNewPosition, disableSaveButton }) => {
    //Note: the disableSaveButton disables the 'Add' button built in here if set to true
    const {
      name = "",
      can_review_request = false,
      can_approve_request = false,
      can_note_request = false,
      can_accept_request = false,
    } = newPosition || {};
  
    const handleCheckboxChange = (key) => (e) => {
      setNewPosition({ ...newPosition, [key]: e.target.checked });
    };
  
    return (
        <>
            <TableContainer>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>New Position Name</TableCell>
                            <TableCell colSpan={4} align="center">Request Permissions</TableCell>
                            {!disableSaveButton && 
                            (<TableCell align="center">Actions</TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell width='70%'>
                                <TextField
                                    label="Position Name"
                                    value={name}
                                    onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                                    fullWidth
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="body2">Review</Typography>
                                <Checkbox checked={can_review_request} onChange={handleCheckboxChange("can_review_request")} />  
                            </TableCell>

                            <TableCell align="center">
                                <Typography variant="body2">Approve</Typography>
                                <Checkbox checked={can_approve_request} onChange={handleCheckboxChange("can_approve_request")} />  
                            </TableCell>

                            <TableCell align="center">
                                <Typography variant="body2">Note</Typography>
                                <Checkbox checked={can_note_request} onChange={handleCheckboxChange("can_note_request")} />  
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="body2">Accept</Typography>
                                <Checkbox checked={can_accept_request} onChange={handleCheckboxChange("can_accept_request")} />  
                            </TableCell>

                            {!disableSaveButton && 
                            (<TableCell align="center">
                                <Button
                                    variant="contained"
                                    onClick={addNewPosition}
                                    sx={{ backgroundColor: "#177604", color: "white" }}
                                >
                                    Add
                                </Button>
                            </TableCell>
                            )}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
  };
  
  export default PositionAddMiniModal;