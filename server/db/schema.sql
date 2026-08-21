-- V-TACS Database Schema
-- System: Venom Treatment & Ambulance Coordination System
-- Engine: MySQL (Aiven Cloud Compatible with SSL)

CREATE TABLE IF NOT EXISTS hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facility_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    current_asv_vials INT NOT NULL DEFAULT 0,
    ventilator_available TINYINT(1) NOT NULL DEFAULT 0,
    is_open TINYINT(1) NOT NULL DEFAULT 1,
    accepting_patients TINYINT(1) NOT NULL DEFAULT 1,
    is_24_7 TINYINT(1) NOT NULL DEFAULT 1,
    opening_time TIME DEFAULT '08:00:00',
    closing_time TIME DEFAULT '20:00:00',
    facility_category ENUM('TERTIARY_APEX', 'GENERAL_SECONDARY', 'UNREGISTERED_PHC', 'SPECIALTY_EXCLUDED') NOT NULL DEFAULT 'TERTIARY_APEX',
    phone VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS hospital_officers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    facility_code VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    council_reg_number VARCHAR(100) NOT NULL UNIQUE,
    officer_name VARCHAR(150) NOT NULL,
    role ENUM('CHIEF_MEDICAL_OFFICER', 'EMERGENCY_DUTY_OFFICER', 'PHARMACY_AUDITOR') NOT NULL DEFAULT 'EMERGENCY_DUTY_OFFICER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ambulances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    current_lat DECIMAL(10, 7) NOT NULL,
    current_lon DECIMAL(10, 7) NOT NULL,
    status ENUM('available', 'dispatched') NOT NULL DEFAULT 'available',
    driver_name VARCHAR(100) NOT NULL,
    driver_phone VARCHAR(50) NOT NULL,
    last_ping_time TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS active_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    victim_lat DECIMAL(10, 7) NOT NULL,
    victim_lon DECIMAL(10, 7) NOT NULL,
    location_description TEXT,
    symptoms TEXT NOT NULL,
    victim_blood_group VARCHAR(10),
    victim_medical_history TEXT,
    victim_emergency_contact VARCHAR(50),
    bite_time DATETIME,
    assigned_hospital_id INT,
    assigned_ambulance_id INT,
    estimated_eta INT,
    asv_vials_reserved INT DEFAULT 10,
    status ENUM('triaged', 'dispatched', 'resolved', 'cancelled') NOT NULL DEFAULT 'triaged',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_ambulance_id) REFERENCES ambulances(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('medical_officer', 'driver', 'admin') NOT NULL DEFAULT 'medical_officer',
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
