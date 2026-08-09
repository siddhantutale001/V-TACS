import React, { useState } from 'react';

export default function PersonalDetailsModal({ initialDetails, onSaveDetails, onDeleteAccount, isDeleting }) {
  const [formData, setFormData] = useState(initialDetails || {
    fullName: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bloodGroup: 'O+',
    medicalConditions: ''
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.emergencyContactPhone) {
      alert('Please fill in your Full Name, Phone Number, and Emergency Contact.');
      return;
    }
    onSaveDetails(formData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>📋 Mandatory Personal & Medical Profile</h3>
          <p>Please complete your emergency contact profile before starting voice triage.</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input 
              type="text" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              placeholder="e.g. Ramesh Kumar" 
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Your Phone Number *</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+91-9876543210" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Emergency Contact Name *</label>
              <input 
                type="text" 
                name="emergencyContactName" 
                value={formData.emergencyContactName} 
                onChange={handleChange} 
                placeholder="e.g. Sunita Kumar (Spouse/Kin)" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Emergency Contact Phone *</label>
              <input 
                type="text" 
                name="emergencyContactPhone" 
                value={formData.emergencyContactPhone} 
                onChange={handleChange} 
                placeholder="+91-9876500000" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Allergies / Pre-existing Conditions</label>
            <input 
              type="text" 
              name="medicalConditions" 
              value={formData.medicalConditions} 
              onChange={handleChange} 
              placeholder="e.g. Asthma, Penicillin allergy, Diabetes" 
            />
          </div>

          <button type="submit" className="save-profile-btn">
            💾 SAVE PROFILE & PROCEED TO EMERGENCY TRIAGE
          </button>
        </form>

        {/* Account Deletion Section */}
        <div className="account-delete-section">
          {!confirmDelete ? (
            <button 
              type="button" 
              className="delete-account-trigger"
              onClick={() => setConfirmDelete(true)}
            >
              🗑️ Delete My Account & Wipe Profile
            </button>
          ) : (
            <div className="delete-confirm-box">
              <p>⚠️ <strong>Are you sure you want to permanently delete your account?</strong> This will erase your personal details and active triage history.</p>
              <div className="delete-actions">
                <button 
                  type="button" 
                  className="confirm-delete-btn"
                  onClick={onDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'YES, PERMANENTLY DELETE ACCOUNT'}
                </button>
                <button 
                  type="button" 
                  className="cancel-delete-btn"
                  onClick={() => setConfirmDelete(false)}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
