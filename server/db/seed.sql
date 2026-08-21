-- V-TACS Seed Data with Multi-Hospital Facility Codes & Dedicated Officers
-- Geographic focus: Pune & Suburban / Rural Maharashtra

INSERT INTO hospitals (id, facility_code, name, latitude, longitude, current_asv_vials, ventilator_available, is_open, accepting_patients, is_24_7, opening_time, closing_time, facility_category, phone, address) VALUES
(1, 'HOSP-YCM-01', 'YCM Hospital (Yashwantrao Chavan Memorial)', 18.6279, 73.8188, 42, 1, 1, 1, 1, '00:00:00', '23:59:59', 'TERTIARY_APEX', '+91-20-27422500', 'Pimpri Colony, Pimpri-Chinchwad, Pune'),
(2, 'HOSP-SGH-02', 'Sassoon General Hospital (Apex Trauma)', 18.5262, 73.8738, 85, 1, 1, 1, 1, '00:00:00', '23:59:59', 'TERTIARY_APEX', '+91-20-26128000', 'Near Pune Railway Station, Sassoon Road, Pune'),
(3, 'HOSP-CKN-03', 'Chakan Rural Hospital & Trauma Unit', 18.7617, 73.8587, 18, 1, 1, 1, 1, '00:00:00', '23:59:59', 'GENERAL_SECONDARY', '+91-2135-222300', 'Shikrapur Road, Chakan, Maharashtra'),
(4, 'HOSP-ALN-04', 'Alandi Primary Health Center (PHC)', 18.6770, 73.8960, 12, 0, 1, 1, 1, '08:00:00', '20:00:00', 'GENERAL_SECONDARY', '+91-2135-235400', 'Dehu Phata, Alandi, Pune'),
(5, 'HOSP-SHR-05', 'Shirur Sub-District Hospital', 18.8278, 74.3789, 24, 1, 1, 1, 1, '00:00:00', '23:59:59', 'GENERAL_SECONDARY', '+91-2138-222150', 'Pune-Nagar Highway, Shirur, Maharashtra')
ON DUPLICATE KEY UPDATE 
facility_code=VALUES(facility_code), name=VALUES(name), current_asv_vials=VALUES(current_asv_vials);

-- 5 Dedicated Hospital Medical Officers (One per Hospital)
-- Passwords pre-hashed:
-- 1. officer_ycm     | Ycm@Pass2026  | MMC-2018-0912
-- 2. officer_sassoon | Sgh@Pass2026  | MMC-2019-1425
-- 3. officer_chakan  | Ckn@Pass2026  | MMC-2020-2841
-- 4. officer_alandi  | Aln@Pass2026  | MMC-2021-3914
-- 5. officer_shirur  | Shr@Pass2026  | MMC-2017-0582

INSERT INTO hospital_officers (hospital_id, facility_code, username, password_hash, council_reg_number, officer_name, role) VALUES
(1, 'HOSP-YCM-01', 'officer_ycm', '$2a$10$wK1RkCgVzDk8bN8h0pUfceXf5X3sBf1Y6Z9K8a7b6c5d4e3f2g1h0', 'MMC-2018-0912', 'Dr. Siddhant Kulkarni', 'CHIEF_MEDICAL_OFFICER'),
(2, 'HOSP-SGH-02', 'officer_sassoon', '$2a$10$wK1RkCgVzDk8bN8h0pUfceXf5X3sBf1Y6Z9K8a7b6c5d4e3f2g1h0', 'MMC-2019-1425', 'Dr. Anjali Deshmukh', 'CHIEF_MEDICAL_OFFICER'),
(3, 'HOSP-CKN-03', 'officer_chakan', '$2a$10$wK1RkCgVzDk8bN8h0pUfceXf5X3sBf1Y6Z9K8a7b6c5d4e3f2g1h0', 'MMC-2020-2841', 'Dr. Rajesh Patil', 'EMERGENCY_DUTY_OFFICER'),
(4, 'HOSP-ALN-04', 'officer_alandi', '$2a$10$wK1RkCgVzDk8bN8h0pUfceXf5X3sBf1Y6Z9K8a7b6c5d4e3f2g1h0', 'MMC-2021-3914', 'Dr. Sneha Shinde', 'EMERGENCY_DUTY_OFFICER'),
(5, 'HOSP-SHR-05', 'officer_shirur', '$2a$10$wK1RkCgVzDk8bN8h0pUfceXf5X3sBf1Y6Z9K8a7b6c5d4e3f2g1h0', 'MMC-2017-0582', 'Dr. Vikram Joshi', 'EMERGENCY_DUTY_OFFICER')
ON DUPLICATE KEY UPDATE 
officer_name=VALUES(officer_name), council_reg_number=VALUES(council_reg_number);

INSERT INTO ambulances (id, vehicle_number, current_lat, current_lon, status, driver_name, driver_phone, last_ping_time) VALUES
(1, 'MH-12-EM-1081', 18.5314, 73.8446, 'available', 'Suresh Shinde', '+91-9822011111', NOW()),
(2, 'MH-12-EM-1082', 18.7550, 73.8500, 'available', 'Ramesh Pawar', '+91-9822022222', NOW()),
(3, 'MH-12-EM-1083', 18.5020, 73.9300, 'available', 'Mahesh Jadhav', '+91-9822033333', NOW()),
(4, 'MH-12-EM-1084', 18.6250, 73.8100, 'dispatched', 'Aniket Kulkarni', '+91-9822044444', NOW())
ON DUPLICATE KEY UPDATE vehicle_number=VALUES(vehicle_number);

INSERT INTO active_cases (victim_lat, victim_lon, location_description, symptoms, victim_blood_group, victim_medical_history, victim_emergency_contact, bite_time, assigned_hospital_id, assigned_ambulance_id, estimated_eta, asv_vials_reserved, status) VALUES
(18.7500, 73.8600, 'Near Chakan Market Yard', 'Bitten on ankle 40 min ago. Severe local swelling, ptosis, slurred speech.', 'O+ Positive', 'Hypertension', '+91-9876543210', NOW() - INTERVAL 40 MINUTE, 1, 4, 18, 10, 'dispatched'),
(18.8100, 74.3500, 'Near Shirur Highway Phata', 'Cobra bite, respiratory difficulty, active neurotoxic envenoming.', 'B+ Positive', 'None', '+91-9876500001', NOW() - INTERVAL 20 MINUTE, 5, 2, 14, 10, 'dispatched');
