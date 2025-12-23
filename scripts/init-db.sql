-- Create tables for shift management system

-- Shift mapping table (stores dayTypes configuration)
CREATE TABLE IF NOT EXISTS shift_mapping (
    id SERIAL PRIMARY KEY,
    day_types JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shift data table (stores monthly shift data)
CREATE TABLE IF NOT EXISTS shift_data (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    pod VARCHAR(255) NOT NULL,
    lockdate INTEGER[] DEFAULT '{}',
    people JSONB NOT NULL,
    tag_arrangement JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, month)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shift_data_year_month ON shift_data(year, month);
CREATE INDEX IF NOT EXISTS idx_shift_data_people ON shift_data USING GIN (people);
CREATE INDEX IF NOT EXISTS idx_shift_data_tag_arrangement ON shift_data USING GIN (tag_arrangement);

-- Insert default shift mapping if not exists
INSERT INTO shift_mapping (day_types)
SELECT '{
  "W": {
    "tag": "",
    "color": "green",
    "content": "Work",
    "isOnDuty": 1
  },
  "MS": {
    "tag": "MS",
    "color": "lime",
    "content": "Morning Shift",
    "isOnDuty": 1
  },
  "NS": {
    "tag": "NS",
    "color": "emerald",
    "content": "Night Shift",
    "isOnDuty": 1
  },
  "T": {
    "tag": "T",
    "color": "blue",
    "content": "Training",
    "isOnDuty": 0
  },
  "AL": {
    "tag": "AL",
    "color": "fuchsia",
    "content": "Annual Leave",
    "isOnDuty": 0
  },
  "HMAL": {
    "tag": "H(M)",
    "color": "pink",
    "content": "Morning AL",
    "isOnDuty": 0.5
  },
  "HAAL": {
    "tag": "H(A)",
    "color": "rose",
    "content": "Afternoon AL",
    "isOnDuty": 0.5
  },
  "SL": {
    "tag": "SL",
    "color": "yellow",
    "content": "Sick Leave",
    "isOnDuty": 0
  },
  "HMSL": {
    "tag": "H(M)",
    "color": "amber",
    "content": "Morning SL",
    "isOnDuty": 0.5
  },
  "HASL": {
    "tag": "H(A)",
    "color": "orange",
    "content": "Afternoon SL",
    "isOnDuty": 0.5
  },
  "PO": {
    "tag": "PO",
    "color": "cyan",
    "content": "Holiday OnDuty",
    "isOnDuty": 1
  },
  "PM": {
    "tag": "PM",
    "color": "indigo",
    "content": "Holiday MS",
    "isOnDuty": 1
  },
  "PH": {
    "tag": "PH",
    "color": "violet",
    "content": "Public Holiday",
    "isOnDuty": 0
  },
  "WD": {
    "tag": "WD",
    "color": "red",
    "content": "Weekend",
    "isOnDuty": 0
  },
  "TFL": {
    "tag": "TFL",
    "color": "red",
    "content": "Time for learning",
    "isOnDuty": 0
  }
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM shift_mapping LIMIT 1);
