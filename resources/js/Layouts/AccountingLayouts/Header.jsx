import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useUser } from "../../hooks/useUser";

const Header = ({ toogleSidebar }) => {
    const { user } = useUser();
    const { logout } = useAuth();
    const handleLogout = async () => {
        logout();
    };
    return (
        <header id="page-header">
            <div className="content-header">
                <div className="content-header-section ">
                    <button
                        type="button"
                        className="btn btn-circle btn-dual-secondary"
                        onClick={toogleSidebar}
                        data-toggle="layout"
                        data-action="sidebar_toggle"
                    >
                        <i className="fa fa-navicon text-dark"></i>
                    </button>
                </div>

                <div className="content-header-section">
                    <div className="btn-group" role="group">
                        <button
                            type="button"
                            className="btn btn-rounded btn-dual-secondary"
                            id="page-header-user-dropdown"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                        >
                            <i className="fa fa-user text-dark mr-3"></i>
                            <span className="d-none d-sm-inline-block text-dark">
                                {user.fname} {user.lname}
                            </span>
                            <i className="fa fa-angle-down ml-5 text-dark"></i>
                        </button>
                        <div
                            className="dropdown-menu dropdown-menu-right min-width-200"
                            aria-labelledby="page-header-user-dropdown"
                        >
                            <h5 className="h6 text-center py-10 mb-5 border-b text-uppercase">
                                User
                            </h5>
                            <a
                                className="dropdown-item"
                                style={{ cursor: "pointer" }}
                                onClick={handleLogout}
                            >
                                <i className="si si-logout mr-5"></i> Sign Out
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div id="page-header-search" className="overlay-header">
                <div className="content-header content-header-fullrow">
                    <form action="/dashboard" method="POST">
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-toggle="layout"
                                    data-action="header_search_off"
                                >
                                    <i className="fa fa-times"></i>
                                </button>
                            </div>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search or hit ESC.."
                                id="page-header-search-input"
                                name="page-header-search-input"
                            />
                            <div className="input-group-append">
                                <button
                                    type="submit"
                                    className="btn btn-secondary"
                                >
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
        </header>
    );
};

export default Header;
