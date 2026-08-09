-- V-TACS Database Schema
-- System: Venom Treatment & Ambulance Coordination System
-- Engine: MySQL (Aiven Cloud Compatible with SSL)

CREATE TABLE IF NOT EXISTS hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    current_asv_vials INT NOT NULL DEFAULT 0,
    ventilator_available TINYINT(1) NOT NULL DEFAULT 0,
    phone VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ambulances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    current_lat DECIMAL(10, 7) NOT NULL,
    current_lon DECIMAL(10, 7) NOT NULL,
    status ENUM('available', 'dispatched') NOT NULL DEFAULT 'available',
    driver_name VARCHAR(100) NOT NULL,
    driver_phone VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS active_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    victim_lat DECIMAL(10, 7) NOT NULL,
    victim_lon DECIMAL(10, 7) NOT NULL,
    location_description TEXT,
    symptoms TEXT NOT NULL,
    bite_time DATETIME,
    assigned_hospital_id INT,
    assigned_ambulance_id INT,
    estimated_eta INT, -- travel time in minutes
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
