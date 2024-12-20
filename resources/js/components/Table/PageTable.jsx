import React from 'react'
import { Table, TableBody } from '@material-ui/core'


const PageTable = ({ th_cell }) => {

    return (
        <div>

            <Table className="table table-md table-bordered table-vcenter">
                <TableBody>
                    {th_cell}
                </TableBody>
            </Table>
        </div>


    )
}

export default PageTable