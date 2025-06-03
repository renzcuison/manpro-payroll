import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { styled } from '@mui/material';

const SideItem = ({ items }) => {
    const { open } = items;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isNavItemOpen = searchParams.get('navOpen') === 'true' && searchParams.get('id') === items.id.toString();
    const [navOpen, setNavOpen] = useState(open || isNavItemOpen);
    const [childNavOpen, setChildNavOpen] = useState({});

    useEffect(() => {
        const activePath = location.pathname;
        const checkActive = (links) => {
            for (const link of links) {
                const url = new URL(link.href, window.location.origin);
                const isActive = url.pathname === activePath && url.searchParams.get('id') === searchParams.get('id');

                if (isActive) {
                    setNavOpen(true);
                    return true;
                }

                if (link.children && checkActive(link.children)) {
                    setChildNavOpen((prevState) => ({
                        ...prevState,
                        [link.id]: true,
                    }));
                    setNavOpen(true);
                    return true;
                }
            }
            return false;
        };

        checkActive(items.children);
    }, [location.pathname, location.search, items.children, searchParams]);

    const toggleNavOpen = () => {
        setNavOpen(!navOpen);
    };

    const toggleChildNavOpen = (id) => {
        setChildNavOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const StyledNav = styled(NavLink)(({ status }) => ({
        display: "flex",
        alignItems: "center",
        padding: "12px 20px",
        textDecoration: "none",
        color: "green",
        borderLeft: "4px solid transparent",
        transition: "all 0.3s ease",
        ':hover': { backgroundColor: 'rgb(233, 171, 19,0.7)', '& #navName': { color: 'white' }},
    }));

    const renderLinks = (links, level = 1) => {
        return links.map((link, index) => {
            const isOpen = childNavOpen[link.id];
            const url = new URL(link.href, window.location.origin);
            const isActive = location.pathname === url.pathname && searchParams.get('id') === url.searchParams.get('id');
            
            const fontSize = link.text.trim().length > 20 ? '12px' : '14px';
            
            return (
                <div key={index} style={{ paddingLeft: `${level * 10}px` }}>
                    {link.children ? (
                        <div>
                            <StyledNav onClick={() => toggleChildNavOpen(link.id)}>
                                <i style={{ color: '#2a800f' }}></i>
                                <span id="navName" className="sidebar-mini-hide" style={{ fontSize }} > {link.text} </span>
                                <span style={{ float: 'right' }}>
                                    <i className="fa fa-angle-left" style={isOpen ? { transform: 'rotate(-90deg)' } : {}}></i>
                                </span>
                            </StyledNav>
                            {isOpen && renderLinks(link.children, level + 1)}
                        </div>
                    ) : (
                        <StyledNav
                            to={link.href + `?navOpen=true&id=` + items.id}
                            style={isActive ? { backgroundColor: 'rgb(233, 171, 19,0.7)', color: 'white' } : {}}
                            onClick={() => {
                                setNavOpen(true);
                                setChildNavOpen({});
                            }}
                            key={link.id}
                        >
                            <i style={{ color: '#2a800f' }}></i>
                            <span id="navName" className="sidebar-mini-hide" style={{ fontSize }} > {link.text} </span>
                        </StyledNav>
                    )}
                </div>
            );
        });
    };

    return (
        <div>
            <StyledNav onClick={toggleNavOpen}>
                <i className={items.icon} style={{ color: '#2a800f' }}></i>
                <span id="navName" className="sidebar-mini-hide" style={{ color: "#2a800f" }} >{items.text}</span>
                <span style={{ float: 'right' }}>
                    <i className="fa fa-angle-left" style={navOpen ? { transform: 'rotate(-90deg)' } : {}}></i>
                </span>
            </StyledNav>
            {navOpen && renderLinks(items.children)}
        </div>
    );
};

export default SideItem;
