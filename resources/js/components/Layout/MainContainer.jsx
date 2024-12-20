import React from 'react';
import Heading from './Heading'

const MainContainer = ({ children }) => {
    return (
        <main id="main-container">
            <div className="content">
                {children}
            </div>
        </main>
    );
}

export default MainContainer;
