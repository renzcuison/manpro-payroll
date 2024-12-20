import React from 'react'
import Toolbar from '@material-ui/core/Toolbar'
import Tooltip from '@material-ui/core/Tooltip'
const PageToolbar = ({ handleSearch, searchBar = true }) => {
    return (
        <Toolbar sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
        }}>{searchBar && (
            <Tooltip title="Search">
                <div className="d-flex align-items-center p-0 mb-2">
                    <input type="search" className="form-control form-control-sm" style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}} onChange={handleSearch}  aria-controls="employee_table" />
                    <label className="m-0" style={{ fontSize: 14,backgroundColor:'#f0f2f5', border: '1px solid #d4dae3',height: 'calc(1.1428572em + 0.7142858rem + 2px)',padding:'0.3571429rem 0.6429rem',lineHeight:'1.1428572',borderTopRightRadius: '0.2rem', borderBottomRightRadius: '0.2rem' }}><i className="fa fa-search"></i></label>
                </div>
            </Tooltip>
        )
            }</Toolbar>
    )
}

export default PageToolbar