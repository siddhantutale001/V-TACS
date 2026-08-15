# V-TACS Complete System Implementation & Architectural Report
**Venom Treatment & Ambulance Coordination System (V-TACS)**
*AI SDG Global Hackathon 2026 | Team: Rocket Coders (Team ID: I4I 505)*

---

## 1. Executive Summary
V-TACS is a real-time emergency logistics and triage coordination platform digitizing the National Action Plan for Prevention and Control of Snakebite Envenoming (NAPSE). The platform connects victim GPS coordinates, spoken voice symptoms, hospital Anti-Snake Venom (ASV) stock, ICU ventilator availability, and live ambulance telemetry to identify and coordinate the most suitable treatment facility in real time.

---

## 2. Full List of Features Implemented

### 2.1 🚨 Instant Emergency Profile Bypass (Skip Onboarding)
- **Files Modified**: `PersonalDetailsModal.jsx` & `App.jsx`
- **Functionality**: Bypasses mandatory profile onboarding during acute emergency distress with a single click ("🚨 SKIP PROFILE & LAUNCH IMMEDIATE EMERGENCY TRIAGE"), ensuring zero friction for victims or bystanders in panic mode.

### 2.2 ❌ Explicit Gemini API Error Reporting (No Silent Fallback)
- **Files Modified**: `geminiService.js`, `api.js` (Server & Client), `VoiceTriagePanel.jsx`
- **Functionality**: Replaced silent keyword fallbacks with explicit error handling (`GEMINI_API_KEY_MISSING`). When `GEMINI_API_KEY` is not present in `.env`, the frontend UI explicitly surfaces a prominent red warning banner rather than masking the missing key.

### 2.3 🗺 Interactive Leaflet GIS Map Visualizer
- **Files Created/Modified**: `EmergencyMap.jsx` & `ModernUserDashboard.jsx`
- **Functionality**: Embedded an interactive 2D GIS map canvas (OpenStreetMap + Leaflet Engine) plotting:
  - 📍 **Red Pulse Marker**: Victim GPS location.
  - 🏥 **Green & Blue Markers**: Candidate hospitals with popups showing ASV stock, ventilator status, and operating hours.
  - 🚑 **Orange Vehicle Marker**: Assigned ambulance location.
  - 🛣 **Polyline Route**: Visual dashed road route connecting victim ➔ matched hospital and ambulance.

### 2.4 📡 Ambulance Telemetry API & 3-State Patient Tracker
- **Files Created/Modified**: `dispatchController.js`, `api.js`, `AmbulanceTrackerCard.jsx`
- **Functionality**: Implemented `POST /api/ambulance/telemetry` & `GET /api/ambulance/:id/tracking`. Evaluates GPS signal freshness (< 30s vs > 30s) to render 3 distinct patient tracking states:
  - 🚨 **State 1 (No Ambulance Available)**: Red alert banner recommending private transport + 108 helpline dialer.
  - 🟢 **State 2 (Active Tracking)**: Live moving vehicle marker + dynamic ETA countdown (< 30s ping).
  - ⚠️ **State 3 (Signal Lost / Telemetry Offline)**: Amber warning banner alerting telemetry offline (> 30s ping) + driver phone button.

### 2.5 🏥 Hospital Classification Engine & Worst-Case PHC Fallback Routing
- **Files Modified**: `schema.sql`, `seed.sql`, `mockStore.js`, `triageController.js`, `HospitalList.jsx`, `ModernUserDashboard.jsx`
- **Functionality**: Categorizes facilities into:
  - `TERTIARY_APEX`: Apex trauma hospitals (Sassoon, YCM, Aundh, Hadapsar). Inferred 24/7 care, verified ASV stock, ICU ventilators.
  - `GENERAL_SECONDARY`: General & sub-district hospitals (Talegaon, Shirur).
  - `UNREGISTERED_PHC`: Rural Primary Health Centers (**Assumed 0 ASV Vials - Real-World Stockout Risk**).
  - `SPECIALTY_EXCLUDED`: Eye clinics, dental clinics, dermatology centers (**Excluded automatically**).
- **Worst-Case Fallback Routing**: Unregistered PHCs stay hidden under normal conditions. If NO ambulance is available OR travel time to Tier 1 hospitals > 40 mins AND a PHC is < 15 mins away, the algorithm surfaces the PHC as a **"🚨 Emergency First Aid & Stabilization Stop Only (No ASV Vials in Store)"**.

### 2.6 🕒 24/7 Operating Hours & Triage Time Evaluation
- **Files Modified**: `schema.sql`, `seed.sql`, `mockStore.js`, `triageController.js`, `HospitalDashboard.jsx`
- **Functionality**: Added `is_24_7`, `opening_time`, and `closing_time` fields. The triage algorithm automatically compares current local time against hospital operating hours and excludes after-hours facilities. Medical Officers can toggle 24/7 mode or set custom opening/closing time pickers.

### 2.7 🏥 Hospital Operational Controls (Open/Closed & Capacity Toggles)
- **File Modified**: `HospitalDashboard.jsx` & `hospitalController.js`
- **Functionality**: Medical Officers can toggle:
  - **Facility Operational Status (Open / Closed)**: Excludes closed facilities from triage recommendations.
  - **Accepting Emergency Patients Capacity Toggle (Yes / No - Overcrowded)**: Prevents routing to overcrowded facilities.

### 2.8 🚨 Live Incoming Emergency Patient Alarm Modal
- **File Modified**: `HospitalDashboard.jsx`
- **Functionality**: Visual modal popup + audio alarm chime on the Hospital Dashboard when a victim is dispatched to their facility, showing victim symptoms, reserved ASV vials, and incoming ETA countdown.

### 2.9 📄 Export Audit Log (CSV Download)
- **File Modified**: `HospitalDashboard.jsx`
- **Functionality**: Medical Officers can click **"📄 EXPORT AUDIT LOG (CSV)"** to download official case records, patient medical profiles, and ASV usage histories for hospital administration.

### 2.10 🩸 Patient Medical Profile Auto-Fill
- **File Modified**: `ModernUserDashboard.jsx`
- **Functionality**: Automatically auto-populates saved blood group, allergies, and emergency contact details into emergency dispatch payloads.

### 2.11 🎨 Favicon & Backend Root Handler Fixes
- **Files Created/Modified**: `favicon.svg`, `index.html`, `server/index.js`
- **Functionality**: Created SVG favicon asset and added backend root route `GET /` returning JSON API status to eliminate 404 browser console errors.

---

## 3. Database Schema Alterations Summary

```sql
-- Extended Hospital Schema
ALTER TABLE hospitals ADD COLUMN (
    is_open TINYINT(1) DEFAULT 1,
    accepting_patients TINYINT(1) DEFAULT 1,
    is_24_7 TINYINT(1) DEFAULT 1,
    opening_time TIME DEFAULT '08:00:00',
    closing_time TIME DEFAULT '20:00:00',
    facility_category ENUM('TERTIARY_APEX', 'GENERAL_SECONDARY', 'UNREGISTERED_PHC', 'SPECIALTY_EXCLUDED') DEFAULT 'TERTIARY_APEX'
);

-- Ambulance Telemetry Schema
ALTER TABLE ambulances ADD COLUMN (
    last_ping_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Active Emergency Case Victim Profile Schema
ALTER TABLE active_cases ADD COLUMN (
    victim_blood_group VARCHAR(10),
    victim_medical_history TEXT,
    victim_emergency_contact VARCHAR(50)
);
```

---

## 4. Pending Action Items / System Reminders
1. **Missing `.env` File**: Requires `GEMINI_API_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, and database credentials.
2. **Live MySQL Database Connection**: Currently operating on temporary in-memory store `mockStore.js` (resets on server restart).

---
*Report Generated on: 2026-08-15 | V-TACS System Documentation*
