import avatar from '../../../images/admin.png';
import manpro_logo from '../../../images/ManPro.png'
import { useUser } from '../../hooks/useUser';
import { capitalize, styled, Box, Avatar } from '@mui/material';
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

const useIsActive = (path) => {
    const location = useLocation();
    return location.pathname.startsWith(path);
};

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
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    const navigate = useNavigate();
    const dayToday = moment().format('DD');
    const handleNavigate = (link) => {
        navigate(link);
    }

    const isAttendanceActive = useIsActive('/hr/attendance');
    const isAttendanceEmployeeActive = useIsActive('/hr/attendance-employee');

    const isReportsActive = useIsActive('/reports');
    const isReportEditActive = useIsActive('/report-edit');
    const isReportCreateActive = useIsActive('/report-create');

    const [workshifts, setWorkshifts] = useState([]);
    const [workgroups, setWorkgroups] = useState([]);
    const [imagePath, setImagePath] = useState('');

    useEffect(() => {
        axiosInstance.get(`/workshedule/getWorkShiftLinks`, { headers })
            .then((response) => {
                setWorkshifts(response.data.workShifts);
            })
            .catch((error) => {
                console.error('Error fetching work shifts:', error);
            });

        axiosInstance.get(`/workshedule/getWorkGroups`, { headers })
            .then((response) => {
                setWorkgroups(response.data.workGroups);
            })
            .catch((error) => {
                console.error('Error fetching work groups:', error);
            });

        const storedAvatar = sessionStorage.getItem('avatar');
        if (storedAvatar) {
            setImagePath(storedAvatar);
        } else {
            getMyAvatar();
        }
    }, []);

    const getMyAvatar = () => {
        axiosInstance.get(`/employee/getMyAvatar`, { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    const avatarData = response.data.avatar
                    if (avatarData.image && avatarData.mime) {
                        const byteCharacters = window.atob(avatarData.image);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: avatarData.mime });

                        const newBlob = URL.createObjectURL(blob)
                        setImagePath(newBlob);
                        sessionStorage.setItem('avatar', newBlob);
                    } else {
                        setImagePath(null);
                    }
                }
            })
            .catch((error) => {
                console.error('Error fetching avatar:', error);
            });
    }

    const employeesItems = [{
        id: 1,
        text: 'Employees',
        icon: 'si si-users',
        children: [
            {
                href: `/admin/employees?`,
                text: 'List of Employees',
            },
            {
                href: `/admin/employees/benefits?`,
                text: 'List of Benefits',
            },
            // {
            // href: `/hr/employees-deductions?`,
            // text: 'List of Deductions',
            // icon: 'si si-user',
            // },
        ]
    }];

    const attendanceLogs = [{
        id: 2,
        text: 'Attendance',
        icon: 'fa fa-calendar-check-o',
        children: [
            {
                href: `/admin/attendance/summary?`,
                text: 'Summary',
                icon: 'fa fa-cogs',
            }, {
                href: `/admin/attendance/logs?`,
                text: 'Logs',
                icon: 'fa fa-cogs',
            },
        ]
    }]

    const payrollItems = [{
        id: 3,
        text: 'Payroll',
        icon: 'fa fa-money',
        children: [
            {
                href: `/admin/payroll/process?`,
                text: 'Process',
                icon: 'fa fa-cogs',
            },
            // {
            //     href: `/hr/payroll-process?`,
            //     text: 'Process Old',
            //     icon: 'fa fa-cogs',
            // }, {
            //     href: `/hr/payroll-records?month=${moment().format('M')}&cutoff=${1}&year=${moment().year()}&`,
            //     text: 'Records',
            //     icon: 'fa fa-cogs',
            // }, {
            //     href: `/hr/payroll-summary?month=${moment().format('M')}&cutoff=${1}&year=${moment().year()}&`,
            //     text: 'Summary',
            //     icon: 'fa fa-cogs',
            // }
        ]
    }]

    const applicationsItems = [{
        id: 4,
        text: 'Applications',
        icon: 'fa fa-pencil-square-o',
        children: [
            {
                href: `/admin/applications?`,
                text: 'Application Request',
                icon: 'fa fa-cogs',
            },
            // {
            //     href: `/hr/applications-list?`,
            //     text: 'List',
            //     icon: 'fa fa-cogs',
            // },
            // {
            //     href: `/hr/applications-leave?`,
            //     text: 'Leave Credit',
            //     icon: 'fa fa-cogs',
            // },
            // {
            //     href: `/hr/applications-overtime?`,
            //     text: 'Overtime',
            //     icon: 'fa fa-cogs',
            // }
        ]
    }];

    const workShifts = [{
        id: 5,
        text: 'Work Shifts',
        icon: 'fa fa-calendar',
        children: workshifts.map(shift => ({
            id: shift.id,
            href: `/admin/workshift/${shift.link}`,
            text: shift.name,
        })).concat({
            id: 'add-shift',
            href: '/admin/workshifts/add',
            text: '+ Add Shift',
        }),
    }];

    const workGroups = [{
        id: 6,
        text: 'Work Groups',
        icon: 'fa fa-calendar',
        children: workgroups.map(group => ({
            id: group.id,
            href: `/admin/workgroup/${group.client_id}/${group.id}`,
            text: group.name,
        })).concat({
            id: 'add-group',
            href: '/admin/workgroups/add',
            text: '+ Add Group',
        }),
    }];

    const settingsItems = [{
        id: 7,
        text: 'Settings',
        icon: 'fa fa-gear',
        children: [
            {
                href: `/admin/settings/general?`,
                text: 'General',
                icon: 'fa fa-cogs',
            },
        ]
    }]

    const evaluationItems = [{
        id: 8,
        text: 'Performance Evaluation',
        icon: 'fa fa-check',
        children: [
            {
                href: `/member/evaluate`,
                text: 'Evaluate',
            }, {
                href: `/member/evaluation`,
                text: 'My Evaluation',
            }
        ]
    }]


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
                        <div className="sidebar-mini-hidden-b text-center">
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Avatar
                                    src={imagePath ? imagePath : HomeLogo}
                                    alt={`${user.first_name} ${user.last_name}`}
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        objectFit: 'contain',
                                        bgcolor: 'grey.300',
                                        '& .MuiAvatar-img': {
                                            objectFit: 'cover',
                                        },
                                    }}
                                />
                                <ul className="list-inline mt-10">
                                    <li className="list-inline-item">
                                        <a className="link-effect text-white font-size-xs font-w600">{capitalize(user.first_name)} {capitalize(user.last_name)}</a>
                                    </li>
                                </ul>
                            </Box>
                        </div>
                    </div>
                    <div className="content-side content-side-full">
                        <ul className="nav-main">
                            {user.user_type === 'Admin' ? <>

                                <li className="nav-main-heading">
                                    <span className="sidebar-mini-hidden" style={{ color: '#3d3d3f' }}>ADMIN</span>
                                </li>

                                <StyledNav to={`/hr/dashboard?year=${moment().year()}`} >
                                    <i className="si si-grid" style={{ color: '#2a800f' }}></i><span id="navName" className="sidebar-mini-hide">Dashboard</span>
                                </StyledNav>

                                <li className="nav-main-heading">
                                    <span className="sidebar-mini-hidden text-dark">Management</span>
                                </li>

                                {employeesItems.map((items, index) => {
                                    return <SideItem key={index} items={items} />
                                })}

                                {attendanceLogs.map((items, index) => {
                                    return <SideItem key={index} items={items} />
                                })}

                                {payrollItems.map((items, index) => {
                                    return <SideItem key={index} items={items} />
                                })}

                                {applicationsItems.map((items, index) => {
                                    return <SideItem key={index} items={items} />
                                })}

                                <StyledNav to={`/admin/announcements`} >
                                    <i className="fa fa-bullhorn" style={{ color: '#2a800f' }}></i><span id="navName" className="sidebar-mini-hide">Announcements</span>
                                </StyledNav>

                                <StyledNav to={`/admin/trainings`} >
                                    <i className="si si-grid" style={{ color: '#2a800f' }}></i><span id="navName" className="sidebar-mini-hide">Trainings</span>
                                </StyledNav>

                                {/*<StyledNav to={`/admin/performance-evaluation`} >
                                    <i className="fa fa-check" style={{ color: '#2a800f' }}></i><span id="navName" className="sidebar-mini-hide">Performance Evaluation</span>
                                </StyledNav> */}





                                {/* <StyledNav to={`/hr/attendance?month=${moment().format('MM')}&year=${moment().year()}`} className={isAttendanceActive || isAttendanceEmployeeActive ? 'active' : ''} >
                                    <i className="fa fa-calendar-check-o" style={{ color: '#2a800f' }}></i> <span id="navName" className="sidebar-mini-hide">Attendance</span>
                                </StyledNav>

                                <StyledNav to={`/hr/summary-reports?month=${moment().format('MM')}&year=${moment().year()}`} >
                                    <i className="fa fa-file" style={{ color: '#2a800f' }} ></i> <span id="navName" className="sidebar-mini-hide">Summary Reports</span>
                                </StyledNav>
                                <StyledNav to={`/hr/announcements`} >
                                    <i className="fa fa-file-text-o" style={{ color: '#2a800f' }} ></i><span id="navName" className="sidebar-mini-hide">Announcements</span>
                                </StyledNav>
                                <StyledNav to={`/hr/trainings`} >
                                    <i><Iconify icon="healthicons:i-training-class-outline" style={{ color: '#2a800f' }} /></i> <span id="navName" className="sidebar-mini-hide">Trainings</span>
                                </StyledNav>
                                <StyledNav to={`/hr/performance-evaluation`} >
                                    <i className="fa fa-check" style={{ color: '#2a800f' }} ></i><span id="navName" className="sidebar-mini-hide">Performance Evaluation</span>
                                </StyledNav>
                                <StyledNav to={`/reports`} className={isReportsActive || isReportCreateActive ? 'active' : ''} >
                                    <i className="fa fa-file-text" style={{ color: '#2a800f' }} ></i> <span id="navName" className="sidebar-mini-hide">Documents</span>
                                </StyledNav> */}


                                <li className="nav-main-heading">
                                    <span className="sidebar-mini-hidden text-dark">Schedules</span>
                                </li>

                                {workShifts.map((items, index) => {
                                    return <SideItem key={index} items={items} />
                                })}

                                {workGroups.map((items, index) => {
                                    return <SideItem key={index} items={items} />
                                })}

                                <li className="nav-main-heading">
                                    <span className="sidebar-mini-hidden text-dark">Settings</span>
                                </li>

                                {settingsItems.map((items, index) => {
                                    return <SideItem key={index} items={items} />
                                })}

                            </> : <> </>}
                        </ul>
                    </div>
                </div>
            </PerfectScrollbar>
        </nav >
    )
}

export default Sidebar
