import React, { useEffect, useState } from 'react';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import Swal from 'sweetalert2';

const AnnouncementPublishFilter = ({ announceInfo, onClose }) => {
  const storedUser = localStorage.getItem("nasya_user");
  const headers = getJWTHeader(JSON.parse(storedUser));

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [announcementTypes, setAnnouncementTypes] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedAnnouncementType, setSelectedAnnouncementType] = useState('');

  useEffect(() => {
    axiosInstance.get('/settings/getBranches', { headers })
      .then((res) => setBranches(res.data.branches))
      .catch((err) => console.error("Error fetching branches:", err));

    axiosInstance.get('/settings/getDepartments', { headers })
      .then((res) => setDepartments(res.data.departments))
      .catch((err) => console.error("Error fetching departments:", err));

    axiosInstance.get('/getAnnouncementType', { headers })
      .then((res) => {
        if (res.data.status === 200) {
          setAnnouncementTypes(res.data.types);
        } else {
          console.error("Failed to fetch announcement types");
        }
      })
      .catch((err) => console.error("Error fetching announcement types:", err));
  }, []);

  const handleSubmit = () => {
    if (!selectedBranch || !selectedDepartment || !selectedAnnouncementType) {
      Swal.fire({
        text: "Please select branch, department, and announcement type",
        icon: "warning",
        confirmButtonColor: '#177604'
      });
      return;
    }

    const data = {
      unique_code: announceInfo?.unique_code,
      branches: [selectedBranch],
      departments: [selectedDepartment],
      announcement_type_id: selectedAnnouncementType,
    };

    axiosInstance.post('/announcements/publishAnnouncement', data, { headers })
      .then(() => {
        Swal.fire({
          title: "Success!",
          text: "Announcement published.",
          icon: "success",
          confirmButtonColor: '#177604'
        }).then(() => onClose?.());
      })
      .catch((err) => {
        console.error("Error publishing announcement:", err);
        Swal.fire({
          title: "Error!",
          text: "Failed to publish announcement.",
          icon: "error"
        });
      });
  };

  return (
    <div className="p-6 border rounded-md bg-white max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">SEND ANNOUNCEMENT</h2>
        <button className="text-gray-500 hover:text-black text-xl" onClick={onClose}>&times;</button>
      </div>
      <hr className="mb-6" />

      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Select Recipients</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="border border-gray-300 rounded px-4 py-2"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">Select Branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded px-4 py-2"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">Select Department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded px-4 py-2"
            value={selectedAnnouncementType}
            onChange={(e) => setSelectedAnnouncementType(e.target.value)}
          >
            <option value="">Select Announcement Type</option>
            {announcementTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          {/* Select Role - Employee Role */}
        </div>
      </div>

      <div className="text-center">
        <button
          className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-6 rounded flex items-center justify-center mx-auto"
          onClick={handleSubmit}
        >
          <span className="mr-2">📩</span> SAVE ANNOUNCEMENT
        </button>
      </div>
    </div>
  );
};

export default AnnouncementPublishFilter;
