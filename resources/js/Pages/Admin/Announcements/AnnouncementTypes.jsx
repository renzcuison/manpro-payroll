import React from 'react';
import AnnouncementTypeAdd from './Modals/AnnouncementTypeAdd';

const AnnouncementTypes = () => {
  return (
    <div>
      <h1>Announcement Types</h1>
      <AnnouncementTypeAdd />
      {/* If you want to show a static message or nothing else, leave it here */}
    </div>
  );
};

export default AnnouncementTypes;