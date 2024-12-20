import { isHostComponent } from '@mui/base';
import React from 'react'
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const SideItem = ({ items }) => {
    const { title, links, open } = items;
    const [navOpen, setNavOpen] = useState(open);
    const navigate = useNavigate();

    const handleNavigate = (link) => {
        navigate(link)
    }
    const openSideNav = () => {
        setNavOpen(!navOpen);
    }
    return (
        <div onClick={() => openSideNav()} >
            <a data-toggle="nav-submenu" href="#">
                <i className={items.icon} style={{ color: '#fc1414' }}></i><span className="sidebar-mini-hide">{items.title}
                </span>
                <span style={{ float: 'right' }}><i className="fa fa-angle-left" style={(!navOpen) ? {} : { transform: ' rotate(-90deg)' }}></i></span>
            </a>
            {navOpen && items.children.map((link, index) => {
                return (
                        <NavLink
							to={link.href}
							// style={({ isActive }) =>
							// 	(isActive ? { backgroundColor: 'green', color: 'white' } : {})}
                                key={index}
						>
							<i style={{ color: '#fc1414' }}></i><span className="sidebar-mini-hide">{link.title}</span>
						</NavLink>
                )
            })}
        </div>
    )
}

export default SideItem