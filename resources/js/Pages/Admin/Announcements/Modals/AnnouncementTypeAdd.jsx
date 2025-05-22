import React, { useState } from 'react';

const AnnouncementTypeAdd = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/addAnnouncementType', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // If you use Bearer token:
          // 'Authorization': 'Bearer ' + yourToken,
        },
        body: JSON.stringify({ name }),
        credentials: 'include', // Needed if using Sanctum/cookies
      });

      const data = await response.json();

      if (response.ok && data.status === 200) {
        setSuccess('Announcement type added!');
        setName('');
        if (onSuccess) onSuccess(data.type);
      } else if (data.errors) {
        setError(data.errors.name ? data.errors.name[0] : 'Validation error');
      } else if (data.message) {
        setError(data.message);
      } else {
        setError('An error occurred.');
      }
    } catch (err) {
      setError('Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Announcement Type Name:
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          disabled={loading}
        />
      </label>
      <button type="submit" disabled={loading || !name}>
        {loading ? 'Adding...' : 'Add Type'}
      </button>
      {error && <div style={{color: 'red', marginTop: 8}}>{error}</div>}
      {success && <div style={{color: 'green', marginTop: 8}}>{success}</div>}
    </form>
  );
};

export default AnnouncementTypeAdd;