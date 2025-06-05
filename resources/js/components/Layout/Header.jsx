import React, { useState } from 'react'
import { useAuth } from "../../hooks/useAuth";
import { useUser } from '../../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { Button, Menu, MenuItem } from '@mui/material';

const Header = ({ toogleSidebar }) => {
	const navigate = useNavigate();
	const { user } = useUser();
	const { logout } = useAuth();
	const [isDisabled, setIsDisabled] = useState(false);

	const handlePersonalDetails = async () => {
		navigate(`/profile`);
	};

	const handleChangePassword = async () => {
		navigate(`/profile/change-password`);
	};

	const handleLogout = async () => {
		if (!isDisabled) {
			setIsDisabled(true);
			await logout();
			setIsDisabled(false);
		}
	};

	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<header id="page-header">
			<div className="content-header" style={{ backgroundColor: '#f8f9fa' }}>
				<div className="content-header-section ">
					<button type="button" className="btn btn-circle btn-dual-secondary" onClick={toogleSidebar} data-toggle="layout" data-action="sidebar_toggle">
						<i className="fa fa-navicon text-dark"></i>
					</button>
				</div>

				<div>
					{/* <h3>{user.team}</h3> */}
				</div>

				<div className="content-header-section">
					<div className="btn-group" role="group">
						<Button
							type="button"
							className="btn btn-rounded btn-dual-secondary"
							id="page-header-user-dropdown"
							data-toggle="dropdown"
							aria-haspopup="true"
							aria-expanded={open ? 'false' : undefined}
							aria-controls={open ? 'dropdown-menu' : undefined}
							onClick={handleClick}
							sx={{ fontSize: '15px' }}
						>
							<i className="fa fa-user text-dark mr-3"></i>
							<span className="d-none d-sm-inline-block text-dark" style={{ textTransform: 'none' }}>{user.first_name} {user.middle_name ? '' : user.middle_name} {user.last_name} {user.suffix ? '' : user.suffix} </span>
							<i className="fa fa-angle-down ml-5 text-dark"></i>
						</Button>
						<Menu
							id="dropdown-menu"
							anchorEl={anchorEl}
							open={open}
							onClose={handleClose}
							MenuListProps={{ 'aria-labelledby': 'basic-button' }}
						>
							<MenuItem className="dropdown-item dropdown-menu-right min-width-200" aria-labelledby="page-header-user-dropdown" sx={{ cursor: 'pointer' }} onClick={handlePersonalDetails}>
								<i className="fa fa-address-card-o mr-4"></i> Personal Details
							</MenuItem>

							<MenuItem className="dropdown-item dropdown-menu-right min-width-200" aria-labelledby="page-header-user-dropdown" sx={{ cursor: 'pointer' }} onClick={handleChangePassword}>
								<i className="fa fa-lock mr-5"></i> Change Password
							</MenuItem>

							<MenuItem className="dropdown-item dropdown-menu-right min-width-200" aria-labelledby="page-header-user-dropdown" sx={{ cursor: 'pointer' }} onClick={handleLogout} disabled={isDisabled} >
								<i className="fa fa-sign-out mr-5"></i> Sign Out
							</MenuItem>
						</Menu>
					</div>
				</div>
			</div>

			<div id="page-header-search" className="overlay-header">
				<div className="content-header content-header-fullrow">
					<form action="/dashboard" method="POST">
						<div className="input-group">
							<div className="input-group-prepend">
								<button type="button" className="btn btn-secondary" data-toggle="layout" data-action="header_search_off">
									<i className="fa fa-times"></i>
								</button>
							</div>
							<input type="text" className="form-control" placeholder="Search or hit ESC.." id="page-header-search-input" name="page-header-search-input" />
							<div className="input-group-append">
								<button type="submit" className="btn btn-secondary">
									<i className="fa fa-search"></i>
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>

			<div id="page-header-loader" className="overlay-header bg-primary">
				<div className="content-header content-header-fullrow text-center">
					<div className="content-header-item">
						<i className="fa fa-sun-o fa-spin text-white"></i>
					</div>
				</div>
			</div>
		</header >
	)
}

export default Header