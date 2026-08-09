import React from 'react';

const LANDMARKS = [
  { label: 'Select Pune Landmark / Location...', lat: '', lon: '' },
  { label: 'Chakan Market Yard (Rural North)', lat: '18.7617', lon: '73.8587' },
  { label: 'Shirur Highway Junction (Rural East)', lat: '18.8278', lon: '74.3789' },
  { label: 'Pimpri-Chinchwad Colony', lat: '18.6279', lon: '73.8188' },
  { label: 'Hadapsar Solapur Bypass', lat: '18.5089', lon: '73.9260' },
  { label: 'Aundh Camp Road', lat: '18.5602', lon: '73.8122' },
  { label: 'Talegaon Dabhade', lat: '18.7300', lon: '73.6800' },
  { label: 'Pune Swargate Bus Stand', lat: '18.5018', lon: '73.8576' }
];

export default function TriageForm({ formData, setFormData, onCalculateMatch, isLoading }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLandmarkSelect = (e) => {
    const selectedIndex = e.target.selectedIndex;
    if (selectedIndex > 0) {
      const landmark = LANDMARKS[selectedIndex];
      setFormData(prev => ({
        ...prev,
        victim_lat: landmark.lat,
        victim_lon: landmark.lon,
        location_description: landmark.label
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculateMatch();
  };

  return (
    <div className="win-panel">
      <div className="win-panel-title">
        📍 TRIAGE & VICTIM LOCATION INPUT
      </div>
      <div className="win-panel-body">
        <form onSubmit={handleSubmit}>
          <label>Quick Preset Landmark (Pune Suburban):</label>
          <select onChange={handleLandmarkSelect}>
            {LANDMARKS.map((lm, idx) => (
              <option key={idx} value={lm.label}>{lm.label}</option>
            ))}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
            <div>
              <label>Victim Latitude:</label>
              <input 
                type="text" 
                name="victim_lat" 
                value={formData.victim_lat} 
                onChange={handleChange} 
                placeholder="18.7617" 
                required 
              />
            </div>
            <div>
              <label>Victim Longitude:</label>
              <input 
                type="text" 
                name="victim_lon" 
                value={formData.victim_lon} 
                onChange={handleChange} 
                placeholder="73.8587" 
                required 
              />
            </div>
          </div>

          <label>Location Landmark Description:</label>
          <input 
            type="text" 
            name="location_description" 
            value={formData.location_description} 
            onChange={handleChange} 
            placeholder="e.g. Near Chakan Petrol Pump" 
          />

          <label>Symptoms & Envenoming Signs:</label>
          <textarea 
            name="symptoms" 
            value={formData.symptoms} 
            onChange={handleChange} 
            rows="2" 
            placeholder="Swelling, ptosis, bleeding, dyspnea..." 
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
            <div>
              <label>ASV Vials Needed:</label>
              <input 
                type="number" 
                name="asv_vials_needed" 
                value={formData.asv_vials_needed} 
                onChange={handleChange} 
                min="1" 
                max="30" 
              />
            </div>
            <div style={{ paddingTop: '16px' }}>
              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="ventilator_check" 
                  name="requires_ventilator" 
                  checked={formData.requires_ventilator} 
                  onChange={handleChange} 
                />
                <label htmlFor="ventilator_check" style={{ margin: 0, cursor: 'pointer' }}>
                  VENTILATOR NEEDED
                </label>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="primary" 
            style={{ width: '100%', marginTop: '6px', padding: '6px' }}
            disabled={isLoading}
          >
            {isLoading ? 'CALCULATING OSRM MATRIX...' : '🔍 CALCULATE NEAREST HOSPITAL & AMBULANCE'}
          </button>
        </form>
      </div>
    </div>
  );
}
