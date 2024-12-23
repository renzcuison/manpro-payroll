import avatar from '../../../images/admin.png';
import manpro_logo from '../../../images/ManPro.png'
import { useUser } from '../../hooks/useUser';
import { capitalize, styled } from '@mui/material';
import { useLocation } from 'react-router-dom';
import SideItem from '../LayoutComponents/SideItem';
import moment from 'moment/moment';
import { NavLink, useNavigate } from 'react-router-dom';
import Iconify from '../iconify/iconify/Iconify'
import HomeLogo from "../../../images/ManProTab.png";
import React, { useEffect, useState } from 'react'
import axiosInstance, { getJWTHeader } from '../../utils/axiosConfig';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

const StyledNav = styled(NavLink)(({ isActive }) => ({
    backgroundColor: 'transparent',
    ':hover': {
        backgroundColor: 'rgb(233, 171, 19,0.7)',
        '& #navName': { color: 'white' }
    },
    '&.active': {
        backgroundColor: 'rgb(233, 171, 19,0.7)',
        '& #navName': { color: 'white' }
    },
}));

const Sidebar = ({ children, closeMini }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const dayToday = moment().format('DD');
    const handleNavigate = (link) => {
        navigate(link);
    }

    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));

    return (
        <nav id="sidebar" style={{ zIndex: 1, height: '100vh', overflow: 'hidden' }}>
            <PerfectScrollbar style={{ height: '100%' }}>
                <div className="sidebar-content" style={{ height: '100%' }}>
                    <div className='content-header content-header-fullrow px-15'>
                        <div className="content-header-section sidebar-mini-visible-b">
                            <span className="content-header-item font-w700 font-size-xl float-left animated fadeIn">
                                <span className="text-dual-primary-dark">c</span><span className="text-primary">b</span>
                            </span>
                        </div>
                        <div className='content-header-section text-center align-parent sidebar-mini-hidden'>
                            <button type="button" className="btn btn-circle btn-dual-secondary d-lg-none align-v-r" data-toggle="layout" data-action="sidebar_close" onClick={closeMini}>
                                <i className="fa fa-times text-danger"></i>
                            </button>
                            <div className="content-header-item">
                                <img src={manpro_logo} style={{ height: '30px', marginBottom: '20px' }} />
                            </div>
                        </div>
                    </div>
                    <div className="content-side content-side-full content-side-user px-10 align-parent" style={{ backgroundImage: 'linear-gradient(190deg, rgb(42, 128, 15,0.8), rgb(233, 171, 19,1))' }}>
                        <div className="sidebar-mini-visible-b align-v animated fadeIn">
                            <img className="img-avatar img-avatar32" src={avatar} alt="" />
                        </div>
                        <div className="sidebar-mini-hidden-b text-center" >
                            <a className="img-link">
                                {user.profile_pic ? (<img className="img-avatar" src={location.origin + "/storage/" + user.profile_pic} alt="" />) : (<img className="img-avatar" src={HomeLogo} alt="" />)}
                            </a>
                            <ul className="list-inline mt-10">
                                <li className="list-inline-item">
                                    <a className="link-effect text-white font-size-xs font-w600">{capitalize(user.first_name)} {capitalize(user.middle_name ? user.middle_name : "")} {capitalize(user.last_name)} {capitalize(user.suffix ? user.suffix : "")}</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="content-side content-side-full">
                        <ul className="nav-main">
                            <li className="nav-main-heading">
                                <span className="sidebar-mini-hidden" style={{ color: '#3d3d3f' }}>ADMIN</span>
                            </li>
                            <StyledNav to={`/dashboard`}>
                                <i className="si si-grid" style={{ color: '#2a800f' }}></i><span id="navName" className="sidebar-mini-hide">Dashboard</span>
                            </StyledNav>
                            <li className="nav-main-heading">
                                <span className="sidebar-mini-hidden text-dark">Management</span>
                            </li>
                            <StyledNav to={`/super-admin/clients`}>
                                <i className="fa fa-address-card-o" style={{ color: '#2a800f' }}></i><span id="navName" className="sidebar-mini-hide">Clients</span>
                            </StyledNav>
                        </ul>
                    </div>
                </div>
            </PerfectScrollbar>
        </nav >
    )
}

export default Sidebar
