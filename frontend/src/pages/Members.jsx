import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { api } from '../utils/api';
import Loading from '../components/common/Loading';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    whatsapp_phone: '',
    linkedin_url: '',
    join_date: '',
    status: 'active',
    custom_notes: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.members.list();
      setMembers(response.members);
    } catch (error) {
      setError('Failed to load members');
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await api.members.update(editingMember.id, formData);
      } else {
        await api.members.create(formData);
      }
      await fetchMembers();
      resetForm();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await api.members.delete(id);
        await fetchMembers();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      whatsapp_phone: member.whatsapp_phone,
      linkedin_url: member.linkedin_url || '',
      join_date: member.join_date || '',
      status: member.status,
      custom_notes: member.custom_notes || ''
    });
    setEditingMember(member);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      whatsapp_phone: '',
      linkedin_url: '',
      join_date: '',
      status: 'active',
      custom_notes: ''
    });
    setEditingMember(null);
    setShowAddForm(false);
    setError('');
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <Loading text="Loading members..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Group Members</h1>
            <p className="mt-2 text-gray-600">Manage WhatsApp group member profiles</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            ➕ Add Member
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingMember ? 'Edit Member' : 'Add New Member'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp (last 5 digits) *
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp_phone}
                      onChange={(e) => setFormData({...formData, whatsapp_phone: e.target.value})}
                      className="input"
                      placeholder="12345"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                      className="input"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Join Date
                    </label>
                    <input
                      type="date"
                      value={formData.join_date}
                      onChange={(e) => setFormData({...formData, join_date: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.custom_notes}
                      onChange={(e) => setFormData({...formData, custom_notes: e.target.value})}
                      className="input"
                      rows={3}
                      placeholder="Any additional notes..."
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button type="submit" className="btn btn-primary flex-1">
                      💾 {editingMember ? 'Update' : 'Save'} Member
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn btn-secondary flex-1"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            <div className="text-gray-600">
              {filteredMembers.length} of {members.length} members
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  member.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.status === 'active' ? '✅ Active' : '⏸️ Inactive'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span>📱</span>
                  <span>...{member.whatsapp_phone}</span>
                </div>
                
                {member.linkedin_url && (
                  <div className="flex items-center space-x-2">
                    <span>🔗</span>
                    <a 
                      href={member.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                
                {member.join_date && (
                  <div className="flex items-center space-x-2">
                    <span>📅</span>
                    <span>Joined: {new Date(member.join_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                {member.custom_notes && (
                  <div className="flex items-start space-x-2 mt-2">
                    <span>📝</span>
                    <span className="text-gray-700">{member.custom_notes}</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleEdit(member)}
                  className="btn btn-secondary text-sm flex-1"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="btn bg-red-100 text-red-700 hover:bg-red-200 text-sm flex-1"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <p className="text-gray-500">
              {searchTerm ? 'No members match your search' : 'No members added yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary mt-4"
              >
                Add Your First Member
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Members;