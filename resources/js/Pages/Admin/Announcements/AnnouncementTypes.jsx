import React, { useState, useEffect } from 'react';
import AnnouncementTypeAdd from './Modals/AnnouncementTypeAdd';
import AnnouncementTypeEdit from './Modals/AnnouncementTypeEdit';

const AnnouncementTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editType, setEditType] = useState(null);

  const fetchTypes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/getAnnouncementType', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.status === 200) {
        setTypes(data.types || []);
      } else {
        setError(data.message || 'Failed to fetch announcement types.');
      }
    } catch (err) {
      setError('Server error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleEditSuccess = () => {
    fetchTypes();
    setEditType(null);
  };

  return (
    <div>
      <h1>Announcement Types</h1>
      <AnnouncementTypeAdd onSuccess={fetchTypes} />
      {loading && <div>Loading...</div>}
      {error && <div style={{color: 'red'}}>{error}</div>}
      <ul>
        {types.map(type => (
          <li key={type.id}>
            {type.name}
            <button
              onClick={() => setEditType(type)}
              style={{ marginLeft: 8 }}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
      {editType && (
        <AnnouncementTypeEdit
          type={editType}
          onClose={() => setEditType(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default AnnouncementTypes;