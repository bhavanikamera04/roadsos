-- RoadSOS Production Schema v1.0
-- Enable PostGIS for location-based queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. PROFILES
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    blood_group TEXT,
    allergies TEXT,
    medical_notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EMERGENCY CONTACTS
CREATE TABLE emergency_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT,
    priority INTEGER CHECK (priority BETWEEN 1 AND 3) DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HOSPITALS & FACILITIES
CREATE TABLE hospitals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    trauma_score DECIMAL(3,2),
    has_icu BOOLEAN DEFAULT false,
    is_24hr BOOLEAN DEFAULT true,
    level INTEGER DEFAULT 0,
    specialty TEXT,
    phone TEXT,
    facility_type TEXT DEFAULT 'hospital', -- hospital, police, ambulance, towing, etc.
    operational_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INCIDENTS (The Heart of the system)
CREATE TABLE incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('pending', 'active', 'resolved', 'false_positive')) DEFAULT 'pending',
    severity_score DECIMAL(3,2),
    final_location GEOGRAPHY(POINT),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INCIDENT HEARTBEATS (The Dead Man's Switch)
CREATE TABLE incident_heartbeats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location GEOGRAPHY(POINT),
    battery_level INTEGER,
    network_strength TEXT,
    sensor_confidence DECIMAL(3,2)
);

-- 6. BYSTANDER REPORTS
CREATE TABLE bystander_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    reporter_id TEXT, -- Anonymous ID or Auth ID
    description TEXT,
    photo_url TEXT,
    location GEOGRAPHY(POINT),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. NOTIFICATION LOGS
CREATE TABLE notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    recipient TEXT NOT NULL,
    channel TEXT CHECK (channel IN ('SMS', 'Email', 'Push')),
    status TEXT CHECK (status IN ('sent', 'delivered', 'failed')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXING FOR PERFORMANCE
CREATE INDEX idx_hospitals_location ON hospitals USING GIST (location);
CREATE INDEX idx_incidents_status ON incidents (status);
CREATE INDEX idx_heartbeats_incident ON incident_heartbeats (incident_id);
CREATE INDEX idx_bystander_location ON bystander_reports USING GIST (location);

-- RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bystander_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/write their own profile.
CREATE POLICY "Users can manage own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

-- Contacts: Users can manage their own contacts.
CREATE POLICY "Users can manage own contacts" ON emergency_contacts
    FOR ALL USING (auth.uid() = user_id);

-- Hospitals: Everyone can read.
CREATE POLICY "Anyone can view hospitals" ON hospitals
    FOR SELECT USING (true);

-- Incidents: Users can manage their own. Emergency services (admin) can view all.
CREATE POLICY "Users can manage own incidents" ON incidents
    FOR ALL USING (auth.uid() = user_id);

-- Heartbeats: User can insert/update their heartbeat.
CREATE POLICY "Users can manage own heartbeats" ON incident_heartbeats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM incidents
            WHERE incidents.id = incident_heartbeats.incident_id
            AND incidents.user_id = auth.uid()
        )
    );

-- Bystander Reports: Anyone can create. Active incident owners can view.
CREATE POLICY "Anyone can create bystander reports" ON bystander_reports
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Incident owners can view related reports" ON bystander_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM incidents
            WHERE incidents.id = bystander_reports.incident_id
            AND incidents.user_id = auth.uid()
        )
    );

-- SEED DATA: Migrating Prototype Hospitals to DB
INSERT INTO hospitals (name, location, trauma_score, has_icu, is_24hr, level, specialty, phone, facility_type) VALUES
('Yashoda Hospital, Secunderabad', ST_SetSRID(ST_MakePoint(78.4983, 17.4441), 4326), 0.95, true, true, 3, 'Level 3 trauma, neurosurgery, burns, ICU', '04067191919', 'hospital'),
('Apollo Hospital, Jubilee Hills', ST_SetSRID(ST_MakePoint(78.4081, 17.4317), 4326), 0.92, true, true, 3, 'Level 3 trauma, cardiac, neurology', '04023607777', 'hospital'),
('Care Hospital, Banjara Hills', ST_SetSRID(ST_MakePoint(78.4483, 17.4126), 4326), 0.80, true, true, 2, 'Level 2 trauma, ortho, surgery', '04030418888', 'hospital'),
('Government General Hospital', ST_SetSRID(ST_MakePoint(78.4867, 17.3850), 4326), 0.70, true, true, 2, 'Government trauma centre, free treatment', '04024600700', 'hospital'),
('Shadnagar Primary Health Centre', ST_SetSRID(ST_MakePoint(78.2059, 17.0693), 4326), 0.15, false, false, 1, 'Primary care only, no emergency surgery', '08418222222', 'hospital'),
('NIMS Hospital, Punjagutta', ST_SetSRID(ST_MakePoint(78.4483, 17.4255), 4326), 0.88, true, true, 3, 'Neurosciences, trauma, ICU, government', '04023489000', 'hospital'),
('Apollo Hospital, Hydernagar', ST_SetSRID(ST_MakePoint(78.4032, 17.4941), 4326), 0.90, true, true, 3, 'Level 3 trauma, cardiac, multi-speciality', '04023607777', 'hospital'),
('KIMS Hospital, Secunderabad', ST_SetSRID(ST_MakePoint(78.4827, 17.4373), 4326), 0.88, true, true, 3, 'Level 3 trauma, ortho, neurology, ICU', '04044885000', 'hospital'),
('KIMS Hospital, Kondapur', ST_SetSRID(ST_MakePoint(78.3852, 17.4203), 4326), 0.85, true, true, 3, 'Multi-speciality, trauma, ICU', '04044885000', 'hospital'),
('Citizens Specialty Hospital, Nallagandla', ST_SetSRID(ST_MakePoint(78.3113, 17.4708), 4326), 0.82, true, true, 3, 'Multi-speciality, emergency, ICU', '04067241919', 'hospital'),
('Sunshine Hospital, Begumpet', ST_SetSRID(ST_MakePoint(78.4868, 17.4412), 4326), 0.83, true, true, 3, 'Trauma, ortho, emergency surgery', '04027890000', 'hospital'),
('Osmania General Hospital', ST_SetSRID(ST_MakePoint(78.4742, 17.3792), 4326), 0.85, true, true, 3, 'Government Level 3 trauma, free treatment, burns', '04024600199', 'hospital'),
('Kothur Government Hospital', ST_SetSRID(ST_MakePoint(78.2478, 17.0534), 4326), 0.35, false, false, 1, 'Basic emergency, limited facilities', '08418220100', 'hospital'),
('Maheshwara Hospital, Isnapur NH-65', ST_SetSRID(ST_MakePoint(78.2658, 17.5156), 4326), 0.45, false, true, 1, 'Basic emergency, highway access', '09848098480', 'hospital'),
('Medicover Hospital, Hitec City', ST_SetSRID(ST_MakePoint(78.3762, 17.4486), 4326), 0.84, true, true, 3, 'Multi-speciality, trauma, cardiac ICU', '04067898989', 'hospital'),
('Star Hospital, Banjara Hills', ST_SetSRID(ST_MakePoint(78.4392, 17.4162), 4326), 0.80, true, true, 2, 'Emergency, cardiac, trauma surgery', '04044777777', 'hospital'),
('Niloufer Hospital (Children)', ST_SetSRID(ST_MakePoint(78.4714, 17.3967), 4326), 0.65, true, true, 2, 'Government paediatric emergency, free', '04023314649', 'hospital'),
('Raichur Institute of Medical Sciences', ST_SetSRID(ST_MakePoint(77.3560, 16.2120), 4326), 0.72, true, true, 2, 'Government trauma, serves NH-50 corridor', '08532226820', 'hospital'),
('Wockhardt Hospital, Mumbai', ST_SetSRID(ST_MakePoint(72.8561, 19.0176), 4326), 0.90, true, true, 3, 'Level 3 trauma, cardiac, neuro ICU', '02226558000', 'hospital'),
('Rashid Hospital, Dubai', ST_SetSRID(ST_MakePoint(55.3273, 25.2285), 4326), 0.95, true, true, 3, 'Level 1 trauma UAE, government, free for emergencies', '+97143371111', 'hospital'),
('Shadnagar Police Station', ST_SetSRID(ST_MakePoint(78.2063, 17.0695), 4326), 0, false, true, 0, 'Highway patrol, accident response, NH-65', '08418220033', 'police'),
('Kothur Police Station', ST_SetSRID(ST_MakePoint(78.2478, 17.0534), 4326), 0, false, true, 0, 'Local police, accident first response', '08418220044', 'police'),
('Hyderabad Traffic Police Control', ST_SetSRID(ST_MakePoint(78.4867, 17.3850), 4326), 0, false, true, 0, 'City traffic control, accident coordination', '04027852485', 'police'),
('EMRI 108 Ambulance Service', ST_SetSRID(ST_MakePoint(78.4867, 17.3850), 4326), 0, false, true, 0, 'Government emergency ambulance, free service', '108', 'ambulance'),
('Ziqitza Ambulance 1950', ST_SetSRID(ST_MakePoint(78.4867, 17.3850), 4326), 0, false, true, 0, 'National ambulance helpline, ICU ambulances', '1950', 'ambulance'),
('NHAI Highway Emergency NH-65', ST_SetSRID(ST_MakePoint(78.2059, 17.0693), 4326), 0, false, true, 0, 'Highway towing, rescue, free on NHAI roads', '1033', 'towing'),
('Shadnagar Vehicle Recovery', ST_SetSRID(ST_MakePoint(78.2080, 17.0710), 4326), 0, false, true, 0, '24hr towing, highway vehicle recovery', '09848012345', 'towing'),
('NH-65 Tyre Service, Kothur', ST_SetSRID(ST_MakePoint(78.2480, 17.0540), 4326), 0, false, false, 0, 'Tyre repair, puncture, all vehicles', '09876541234', 'puncture'),
('Shadnagar Tyre Works', ST_SetSRID(ST_MakePoint(78.2070, 17.0700), 4326), 0, false, false, 0, 'All vehicle tyre service, highway', '09123456789', 'puncture');

-- RPC Function for nearby hospitals
CREATE OR REPLACE FUNCTION get_hospitals_within_radius(user_lat FLOAT, user_lon FLOAT, radius FLOAT)
RETURNS SETOF hospitals AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM hospitals
    WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
        radius
    )
    ORDER BY ST_Distance(
        location,
        ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
    );
END;
$$ LANGUAGE plpgsql;
