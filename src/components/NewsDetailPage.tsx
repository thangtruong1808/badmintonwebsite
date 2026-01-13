import React from 'react';
import { useParams } from 'react-router-dom';

// You would fetch news details based on the id, here we use a placeholder
const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="pt-24 lg:pt-28">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">News Detail Page</h1>
        <p className="text-center">Details for news item with ID: {id}</p>
      </div>
    </div>
  );
};

export default NewsDetailPage;
