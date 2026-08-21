// High-reliability In-Memory Store Fallback for V-TACS
// Multi-Hospital Facility Codes & Medical Officer Credentials

export const mockStore = {
  hospitals: [
    {
      id: 1,
      facility_code: "HOSP-YCM-01",
      name: "YCM Hospital (Yashwantrao Chavan Memorial)",
      latitude: 18.6279,
      longitude: 73.8188,
      current_asv_vials: 42,
      ventilator_available: 1,
      is_open: 1,
      accepting_patients: 1,
      is_24_7: 1,
      opening_time: "00:00",
      closing_time: "23:59",
      facility_category: "TERTIARY_APEX",
      phone: "+91-20-27422500",
      address: "Pimpri Colony, Pimpri-Chinchwad, Pune"
    },
    {
      id: 2,
      facility_code: "HOSP-SGH-02",
      name: "Sassoon General Hospital (Apex Trauma)",
      latitude: 18.5262,
      longitude: 73.8738,
      current_asv_vials: 85,
      ventilator_available: 1,
      is_open: 1,
      accepting_patients: 1,
      is_24_7: 1,
      opening_time: "00:00",
      closing_time: "23:59",
      facility_category: "TERTIARY_APEX",
      phone: "+91-20-26128000",
      address: "Near Pune Railway Station, Sassoon Road, Pune"
    },
    {
      id: 3,
      facility_code: "HOSP-CKN-03",
      name: "Chakan Rural Hospital & Trauma Unit",
      latitude: 18.7617,
      longitude: 73.8587,
      current_asv_vials: 18,
      ventilator_available: 1,
      is_open: 1,
      accepting_patients: 1,
      is_24_7: 1,
      opening_time: "00:00",
      closing_time: "23:59",
      facility_category: "GENERAL_SECONDARY",
      phone: "+91-2135-222300",
      address: "Shikrapur Road, Chakan, Maharashtra"
    },
    {
      id: 4,
      facility_code: "HOSP-ALN-04",
      name: "Alandi Primary Health Center (PHC)",
      latitude: 18.6770,
      longitude: 73.8960,
      current_asv_vials: 12,
      ventilator_available: 0,
      is_open: 1,
      accepting_patients: 1,
      is_24_7: 1,
      opening_time: "08:00",
      closing_time: "20:00",
      facility_category: "GENERAL_SECONDARY",
      phone: "+91-2135-235400",
      address: "Dehu Phata, Alandi, Pune"
    },
    {
      id: 5,
      facility_code: "HOSP-SHR-05",
      name: "Shirur Sub-District Hospital",
      latitude: 18.8278,
      longitude: 74.3789,
      current_asv_vials: 24,
      ventilator_available: 1,
      is_open: 1,
      accepting_patients: 1,
      is_24_7: 1,
      opening_time: "00:00",
      closing_time: "23:59",
      facility_category: "GENERAL_SECONDARY",
      phone: "+91-2138-222150",
      address: "Pune-Nagar Highway, Shirur, Maharashtra"
    }
  ],

  // 5 Registered Medical Officers (One per Hospital)
  officers: [
    {
      id: 1,
      hospital_id: 1,
      facility_code: "HOSP-YCM-01",
      hospital_name: "YCM Hospital (Yashwantrao Chavan Memorial)",
      username: "officer_ycm",
      password: "Ycm@Pass2026",
      council_reg_number: "MMC-2018-0912",
      officer_name: "Dr. Siddhant Kulkarni",
      role: "CHIEF_MEDICAL_OFFICER"
    },
    {
      id: 2,
      hospital_id: 2,
      facility_code: "HOSP-SGH-02",
      hospital_name: "Sassoon General Hospital (Apex Trauma)",
      username: "officer_sassoon",
      password: "Sgh@Pass2026",
      council_reg_number: "MMC-2019-1425",
      officer_name: "Dr. Anjali Deshmukh",
      role: "CHIEF_MEDICAL_OFFICER"
    },
    {
      id: 3,
      hospital_id: 3,
      facility_code: "HOSP-CKN-03",
      hospital_name: "Chakan Rural Hospital & Trauma Unit",
      username: "officer_chakan",
      password: "Ckn@Pass2026",
      council_reg_number: "MMC-2020-2841",
      officer_name: "Dr. Rajesh Patil",
      role: "EMERGENCY_DUTY_OFFICER"
    },
    {
      id: 4,
      hospital_id: 4,
      facility_code: "HOSP-ALN-04",
      hospital_name: "Alandi Primary Health Center (PHC)",
      username: "officer_alandi",
      password: "Aln@Pass2026",
      council_reg_number: "MMC-2021-3914",
      officer_name: "Dr. Sneha Shinde",
      role: "EMERGENCY_DUTY_OFFICER"
    },
    {
      id: 5,
      hospital_id: 5,
      facility_code: "HOSP-SHR-05",
      hospital_name: "Shirur Sub-District Hospital",
      username: "officer_shirur",
      password: "Shr@Pass2026",
      council_reg_number: "MMC-2017-0582",
      officer_name: "Dr. Vikram Joshi",
      role: "EMERGENCY_DUTY_OFFICER"
    }
  ],

  ambulances: [
    {
      id: 1,
      vehicle_number: "MH-12-EM-1081",
      current_lat: 18.5314,
      current_lon: 73.8446,
      status: "available",
      driver_name: "Suresh Shinde",
      driver_phone: "+91-9822011111",
      last_ping_time: new Date().toISOString()
    },
    {
      id: 2,
      vehicle_number: "MH-12-EM-1082",
      current_lat: 18.7550,
      current_lon: 73.8500,
      status: "available",
      driver_name: "Ramesh Pawar",
      driver_phone: "+91-9822022222",
      last_ping_time: new Date().toISOString()
    },
    {
      id: 3,
      vehicle_number: "MH-12-EM-1083",
      current_lat: 18.5020,
      current_lon: 73.9300,
      status: "available",
      driver_name: "Mahesh Jadhav",
      driver_phone: "+91-9822033333",
      last_ping_time: new Date().toISOString()
    },
    {
      id: 4,
      vehicle_number: "MH-12-EM-1084",
      current_lat: 18.6250,
      current_lon: 73.8100,
      status: "dispatched",
      driver_name: "Aniket Kulkarni",
      driver_phone: "+91-9822044444",
      last_ping_time: new Date().toISOString()
    }
  ],

  active_cases: [
    {
      id: 101,
      victim_lat: 18.7500,
      victim_lon: 73.8600,
      location_description: "Near Chakan Market Yard",
      symptoms: "Cobra bite on ankle 30 mins ago. Swelling, ptosis, slurred speech.",
      victim_blood_group: "O+ Positive",
      victim_medical_history: "None",
      victim_emergency_contact: "+91-9876543210",
      bite_time: new Date(Date.now() - 30 * 60000).toISOString(),
      assigned_hospital_id: 1,
      assigned_hospital_name: "YCM Hospital (Yashwantrao Chavan Memorial)",
      assigned_ambulance_id: 4,
      assigned_ambulance_number: "MH-12-EM-1084",
      estimated_eta: 18,
      asv_vials_reserved: 10,
      status: "dispatched",
      created_at: new Date(Date.now() - 30 * 60000).toISOString()
    },
    {
      id: 102,
      victim_lat: 18.8100,
      victim_lon: 74.3500,
      location_description: "Shirur Highway Junction",
      symptoms: "Russells Viper bite, localized edema and active bleeding.",
      victim_blood_group: "B+ Positive",
      victim_medical_history: "Asthma",
      victim_emergency_contact: "+91-9876500001",
      bite_time: new Date(Date.now() - 15 * 60000).toISOString(),
      assigned_hospital_id: 5,
      assigned_hospital_name: "Shirur Sub-District Hospital",
      assigned_ambulance_id: 2,
      assigned_ambulance_number: "MH-12-EM-1082",
      estimated_eta: 12,
      asv_vials_reserved: 10,
      status: "dispatched",
      created_at: new Date(Date.now() - 15 * 60000).toISOString()
    }
  ]
};
