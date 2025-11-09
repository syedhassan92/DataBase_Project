import React from 'react';

const PageTemplate = ({ title, description }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-gray-500 text-center py-8">Page content coming soon...</p>
      </div>
    </div>
  );
};

export default PageTemplate;
