import React from 'react'

function Heading(props) {
    return (
        <div className="bg-image" >
            <div className="bg-black-op-75">
                <div className="content content-top content-full text-center">
                    <div className="py-20">
                        <h1 className="h2 font-w700 text-white mb-10">{props.moduleTitle}</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Heading