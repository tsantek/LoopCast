SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: status_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status_type AS ENUM (
    'pending',
    'active',
    'inactive'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ad_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_schedules (
    id uuid NOT NULL,
    ad_id uuid NOT NULL,
    player_id uuid NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    is_filler boolean DEFAULT false,
    ad_order integer DEFAULT 0,
    status public.status_type DEFAULT 'active'::public.status_type,
    repeat_interval interval DEFAULT '00:00:00'::interval
);


--
-- Name: ads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ads (
    id uuid NOT NULL,
    name text NOT NULL,
    file_name text NOT NULL,
    duration integer NOT NULL,
    ad_type text NOT NULL
);


--
-- Name: players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.players (
    id uuid NOT NULL,
    name text,
    address text,
    zip_code text,
    city text,
    country text,
    state text,
    notes text,
    registration_token text NOT NULL,
    status public.status_type DEFAULT 'pending'::public.status_type,
    registered_at timestamp with time zone DEFAULT now()
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: ad_schedules ad_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_schedules
    ADD CONSTRAINT ad_schedules_pkey PRIMARY KEY (id);


--
-- Name: ads ads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: ad_schedules ad_schedules_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_schedules
    ADD CONSTRAINT ad_schedules_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ads(id);


--
-- Name: ad_schedules ad_schedules_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_schedules
    ADD CONSTRAINT ad_schedules_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20251106230846');
