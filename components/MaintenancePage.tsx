import React from 'react';

const MaintenancePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4 text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl max-w-lg w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-accent-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4">We'll be back soon!</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Sorry for the inconvenience. We're performing some maintenance at the moment. We'll be back up and running shortly!
                </p>
            </div>
        </div>
    );
};

export default MaintenancePage;
