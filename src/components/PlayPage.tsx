import React from 'react';

const PlayPage: React.FC = () => {
  return (
    <div className="pt-24 lg:pt-28">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Play Sessions</h1>
        <p className="text-center">Information about our play sessions will be displayed here.</p>
        {/* Play session details will be listed here */}
      </div>
    </div>
  );
};

export default PlayPage;
