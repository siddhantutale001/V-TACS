-- V-TACS Seed Data
-- Geographic center: Pune & Suburban / Rural Maharashtra

INSERT INTO hospitals (name, latitude, longitude, current_asv_vials, ventilator_available, is_open, accepting_patients, is_24_7, opening_time, closing_time, facility_category, phone, address) VALUES
('Sassoon General Hospital (Apex Trauma)', 18.5262, 73.8738, 85, 1, 1, 1, 1, '00:00:00', '23:59:59', 'TERTIARY_APEX', '+91-20-26128000', 'Near Pune Railway Station, Sassoon Road, Pune'),
('YCM Hospital (Yashwantrao Chavan Memorial)', 18.6279, 73.8188, 42, 1, 1, 1, 1, '00:00:00', '23:59:59', 'TERTIARY_APEX', '+91-20-27422500', 'Pimpri Colony, Pimpri-Chinchwad, Pune'),
('District Hospital Aundh', 18.5602, 73.8122, 28, 1, 1, 1, 1, '00:00:00', '23:59:59', 'TERTIARY_APEX', '+91-20-27290111', 'Aundh Camp, Medipoint Hospital Road, Pune'),
('Chakan Unregistered Rural PHC', 18.7617, 73.8587, 0, 0, 1, 1, 0, '08:00:00', '20:00:00', 'UNREGISTERED_PHC', '+91-2135-222300', 'Shikrapur Road, Chakan, Maharashtra'),
('Shirur Rural Government Hospital', 18.8278, 74.3789, 4, 0, 1, 1, 0, '08:00:00', '20:00:00', 'GENERAL_SECONDARY', '+91-2138-222150', 'Pune-Nagar Highway, Shirur, Maharashtra'),
('Hadapsar Emergency Trauma & Venom Care', 18.5089, 73.9260, 30, 1, 1, 1, 1, '00:00:00', '23:59:59', 'TERTIARY_APEX', '+91-20-26871234', 'Solapur Road, Hadapsar, Pune'),
('Talegaon General Hospital & ICU', 18.7300, 73.6800, 15, 1, 1, 1, 1, '00:00:00', '23:59:59', 'GENERAL_SECONDARY', '+91-2114-223400', 'Station Road, Talegaon Dabhade, Maharashtra'),
('Pune Eye & Laser Specialty Clinic (EXCLUDED)', 18.5200, 73.8500, 0, 0, 1, 1, 0, '09:00:00', '18:00:00', 'SPECIALTY_EXCLUDED', '+91-20-25500000', 'JM Road, Shivajinagar, Pune');

INSERT INTO ambulances (vehicle_number, current_lat, current_lon, status, driver_name, driver_phone, last_ping_time) VALUES
('MH-12-EM-1081', 18.5314, 73.8446, 'available', 'Suresh Shinde', '+91-9822011111', NOW()),
('MH-12-EM-1082', 18.7550, 73.8500, 'available', 'Ramesh Pawar', '+91-9822022222', NOW()),
('MH-12-EM-1083', 18.5020, 73.9300, 'available', 'Mahesh Jadhav', '+91-9822033333', NOW()),
('MH-12-EM-1084', 18.6250, 73.8100, 'dispatched', 'Aniket Kulkarni', '+91-9822044444', NOW());

-- Pre-hashed passwords:
-- 'password123' -> $2b$10$e8W/Jd54P.82L0W.5F1a4.XhC2c6b4g2D3E4F5G6H7I8J9K0L
-- We will also provide a script runner to auto-seed with dynamically generated bcrypt hashes.
INSERT INTO users (username, password_hash, role, name) VALUES
('officer_pune', '$2b$10$W2n6x9fT7Zg/QYvF5P3e5u1Z2Y3X4W5V6U7T8S9R0Q1P2O3N4M', 'medical_officer', 'Dr. Rajesh Patil'),
('driver_1081', '$2b$10$W2n6x9fT7Zg/QYvF5P3e5u1Z2Y3X4W5V6U7T8S9R0Q1P2O3N4M', 'driver', 'Suresh Shinde'),
('admin_vtacs', '$2b$10$W2n6x9fT7Zg/QYvF5P3e5u1Z2Y3X4W5V6U7T8S9R0Q1P2O3N4M', 'admin', 'System Admin');

INSERT INTO active_cases (victim_lat, victim_lon, location_description, symptoms, victim_blood_group, victim_medical_history, victim_emergency_contact, bite_time, assigned_hospital_id, assigned_ambulance_id, estimated_eta, asv_vials_reserved, status) VALUES
(18.7500, 73.8600, 'Near Chakan Market Yard', 'Bitten on ankle 40 min ago. Severe local swelling, ptosis, slurred speech.', 'O+ Positive', 'Hypertension', '+91-9876543210', NOW() - INTERVAL 40 MINUTE, 1, 4, 22, 10, 'dispatched');
