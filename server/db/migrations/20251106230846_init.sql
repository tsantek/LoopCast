-- migrate:up

 CREATE TYPE status_type AS ENUM ('pending', 'active', 'inactive');



-- Ads table
CREATE TABLE ads (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    duration INTEGER NOT NULL,
    ad_type TEXT NOT NULL
);

-- Players table
CREATE TABLE players (
    device_id UUID PRIMARY KEY NOT NULL,
    name TEXT,
    address TEXT,
    zip_code TEXT,
    city TEXT,
    country TEXT,
    state TEXT,
    notes TEXT,
    registration_token TEXT NOT NULL,
    status status_type DEFAULT status_type('pending'),
    registered_at TIMESTAMPTZ DEFAULT NOW()
);


-- Ad schedules table
CREATE TABLE ad_schedules (
    id UUID PRIMARY KEY,
    ad_id UUID NOT NULL REFERENCES ads(id),
    device_id UUID NOT NULL REFERENCES players(device_id),
    start_time TIME,
    end_time TIME,
    is_filler BOOLEAN DEFAULT FALSE,
    ad_order INTEGER DEFAULT 0
);


-- migrate:down

DROP TABLE IF EXISTS ad_schedules;
DROP TABLE IF EXISTS ads;
DROP TABLE IF EXISTS players;
DROP TYPE IF EXISTS status_type;