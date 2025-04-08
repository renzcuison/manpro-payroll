import avatar from "../../../images/admin.png";
import nasya_logo from "../../../images/logo.png";
import { useUser } from "../../hooks/useUser";
import {
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    capitalize,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import moment from "moment/moment";
import { Link, NavLink, useNavigate } from "react-router-dom";
// import { Nav, NavItem, Card, CardBody } from "reactstrap";
// import SubMenuCollapse from "../../components/SubMenuCollapse";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AddchartIcon from "@mui/icons-material/Addchart";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SubMenuCollapse from "../../components/SubMenuCollapse";
const sidebarItems = [
    {
        id: 1,
        title: "Dashboard",
        url: "/accounting",
        icon: <DashboardIcon />,
    },
    {
        id: 2,
        title: "Sales",
        icon: <MonetizationOnIcon />,
        isOpen: false,
        subMenu: [
            {
                url: "/accounting/sales",
                title: "All Sales",
                icon: "fa fa-dollar",
            },
            {
                url: "/accounting/invoice",
                title: "Invoice",
                icon: "fa fa-file-pdf-o ",
            },
            {
                url: "/accounting/contacts",
                title: "Contacts",
                icon: "fa fa-address-card",
            },
            {
                url: "/accounting/payment",
                title: "Payment",
                icon: "fa fa-credit-card",
            },
            {
                url: "/accounting/remittance",
                title: "Remittances",
                icon: "fa fa-money",
            },
            {
                url: "/accounting/services",
                title: "Services",
                icon: "fa fa-wrench",
            },
        ],
    },
    {
        id: 3,
        title: "Expenses",
        icon: <PaymentsIcon />,
        isOpen: false,
        subMenu: [
            {
                url: "/accounting/expenses/service",
                title: "Service Expenses",
                icon: "fa fa-wrench",
            },
            {
                url: "/accounting/expenses/personalize",
                title: "Personalize Expenses",
                icon: "fa fa-wrench",
            },
        ],
    },
    {
        id: 4,
        title: "Liabilities",
        url: "/accounting/liabilities",
        icon: <ReceiptIcon />,
    },
    {
        id: 5,
        title: "Chart of Accounts",
        url: "/accounting/accounts",
        icon: <AddchartIcon />,
    },
    {
        id: 6,
        title: "Reports",
        url: "/accounting/reports",
        icon: <SummarizeIcon />,
    },
];

const Sidebar = ({ children, closeMini }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const dayToday = moment().format("DD");
    const handleNavigate = (link) => {
        navigate(link);
    };

    return (
        <nav id="sidebar" style={{ zIndex: 1 }}>
            <div className="sidebar-content">
                <div className="content-header content-header-fullrow px-15">
                    <div className="content-header-section sidebar-mini-visible-b">
                        <span className="content-header-item font-w700 font-size-xl float-left animated fadeIn">
                            <span className="text-dual-primary-dark">c</span>
                            <span className="text-primary">b</span>
                        </span>
                    </div>
                    <div className="content-header-section text-center align-parent sidebar-mini-hidden">
                        <button
                            type="button"
                            className="btn btn-circle btn-dual-secondary d-lg-none align-v-r"
                            data-toggle="layout"
                            data-action="sidebar_close"
                            onClick={closeMini}
                        >
                            <i className="fa fa-times text-danger"></i>
                        </button>
                        <div className="content-header-item">
                            <img
                                src={nasya_logo}
                                style={{ height: "40px", marginBottom: "20px" }}
                            />
                        </div>
                    </div>
                </div>
                <div
                    className="content-side content-side-full content-side-user px-10 align-parent"
                    style={{
                        backgroundImage:
                            "linear-gradient(190deg, rgb(42, 128, 15,0.8), rgb(233, 171, 19,1))",
                    }}
                >
                    <div className="sidebar-mini-visible-b align-v animated fadeIn">
                        <img
                            className="img-avatar img-avatar32"
                            src={avatar}
                            alt=""
                        />
                    </div>
                    <div className="sidebar-mini-hidden-b text-center">
                        <a className="img-link">
                            <img
                                className="img-avatar"
                                src={
                                    "https://nasyaportal.ph/assets/media/upload/" +
                                    user.profile_pic
                                }
                                alt=""
                            />
                        </a>
                        <ul className="list-inline mt-10">
                            <li className="list-inline-item">
                                <a className="link-effect text-white font-size-xs font-w600">
                                    {user.fname}{" "}
                                    {user.lname}

                                    {/* {capitalize(user.fname)}{" "} */}
                                    {/* {capitalize(user.lname)} */}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="content-side content-side-full p-0">
                    {/* <Nav vertical className="nav-main">
                        {sidebarItems.map((item, index) => {
                            const open = item.isOpen;
                            return item.subMenu ? (
                                <SubMenuCollapse item={item} key={item.id} />
                            ) : (
                                <NavItem key={item.id}>
                                    <NavLink to={item.url}>
                                        <i className={item.icon}></i>
                                        {item.title}
                                    </NavLink>
                                </NavItem>
                            );
                        })}
                    </Nav> */}

                    <List
                        sx={{
                            width: "100%",
                            maxWidth: 360,
                            bgcolor: "background.paper",
                        }}
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                        subheader={
                            <ListSubheader
                                component="div"
                                id="nested-list-subheader"
                            >
                                Nested List Items
                            </ListSubheader>
                        }
                    >
                        {sidebarItems.map((item, index) => {
                            return item.subMenu ? (
                                <SubMenuCollapse item={item} key={item.title} />
                            ) : (
                                <Link
                                    to={item.url}
                                    key={item.id}
                                    className="text-muted"
                                >
                                    <ListItemButton>
                                        <ListItemIcon sx={{ paddingRight: 0 }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.title} />
                                    </ListItemButton>
                                </Link>
                            );
                        })}
                    </List>
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;
