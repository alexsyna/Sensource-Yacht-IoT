--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2
-- Dumped by pg_dump version 12.2

-- Started on 2020-03-25 02:07:56

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
-- TOC entry 7 (class 2615 OID 16393)
-- Name: iot; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA iot;


ALTER SCHEMA iot OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 204 (class 1259 OID 16394)
-- Name: User; Type: TABLE; Schema: iot; Owner: postgres
--

CREATE TABLE iot."User" (
    id integer NOT NULL,
    username text NOT NULL,
    house_id integer NOT NULL,
    age integer NOT NULL,
    password text NOT NULL,
    gender text NOT NULL
);


ALTER TABLE iot."User" OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 16447)
-- Name: actionable_id; Type: SEQUENCE; Schema: iot; Owner: postgres
--

CREATE SEQUENCE iot.actionable_id
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    MAXVALUE 10000
    CACHE 1;


ALTER TABLE iot.actionable_id OWNER TO postgres;

--
-- TOC entry 206 (class 1259 OID 16410)
-- Name: actionable; Type: TABLE; Schema: iot; Owner: postgres
--

CREATE TABLE iot.actionable (
    id integer DEFAULT nextval('iot.actionable_id'::regclass) NOT NULL,
    name text NOT NULL,
    trigger_value double precision NOT NULL,
    type text NOT NULL
);


ALTER TABLE iot.actionable OWNER TO postgres;

--
-- TOC entry 208 (class 1259 OID 16426)
-- Name: house; Type: TABLE; Schema: iot; Owner: postgres
--

CREATE TABLE iot.house (
    id integer NOT NULL,
    address text NOT NULL
);


ALTER TABLE iot.house OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 16453)
-- Name: preference_id; Type: SEQUENCE; Schema: iot; Owner: postgres
--

CREATE SEQUENCE iot.preference_id
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    MAXVALUE 10000
    CACHE 1;


ALTER TABLE iot.preference_id OWNER TO postgres;

--
-- TOC entry 207 (class 1259 OID 16418)
-- Name: preferences; Type: TABLE; Schema: iot; Owner: postgres
--

CREATE TABLE iot.preferences (
    id integer DEFAULT nextval('iot.preference_id'::regclass) NOT NULL,
    operator text NOT NULL,
    "when" timestamp with time zone,
    sensor_id text NOT NULL,
    actionable_id text NOT NULL
);


ALTER TABLE iot.preferences OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 16450)
-- Name: sensor_id; Type: SEQUENCE; Schema: iot; Owner: postgres
--

CREATE SEQUENCE iot.sensor_id
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    MAXVALUE 10000
    CACHE 1;


ALTER TABLE iot.sensor_id OWNER TO postgres;

--
-- TOC entry 205 (class 1259 OID 16402)
-- Name: sensor; Type: TABLE; Schema: iot; Owner: postgres
--

CREATE TABLE iot.sensor (
    id integer DEFAULT nextval('iot.sensor_id'::regclass) NOT NULL,
    name text NOT NULL,
    trigger_value double precision NOT NULL
);


ALTER TABLE iot.sensor OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 16444)
-- Name: usage_actionable_id; Type: SEQUENCE; Schema: iot; Owner: postgres
--

CREATE SEQUENCE iot.usage_actionable_id
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    MAXVALUE 100000000
    CACHE 1;


ALTER TABLE iot.usage_actionable_id OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 16434)
-- Name: usage_actionable; Type: TABLE; Schema: iot; Owner: postgres
--

CREATE TABLE iot.usage_actionable (
    id integer DEFAULT nextval('iot.usage_actionable_id'::regclass) NOT NULL,
    actionable_id integer NOT NULL,
    ts_on timestamp with time zone NOT NULL,
    ts_off timestamp with time zone,
    state text
);


ALTER TABLE iot.usage_actionable OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 16439)
-- Name: usage_sensor; Type: TABLE; Schema: iot; Owner: postgres
--

CREATE TABLE iot.usage_sensor (
    id integer NOT NULL,
    sensor_id integer NOT NULL,
    record_value double precision NOT NULL,
    record_ts timestamp with time zone NOT NULL
);


ALTER TABLE iot.usage_sensor OWNER TO postgres;

--
-- TOC entry 2869 (class 0 OID 16394)
-- Dependencies: 204
-- Data for Name: User; Type: TABLE DATA; Schema: iot; Owner: postgres
--

COPY iot."User" (id, username, house_id, age, password, gender) FROM stdin;
\.


--
-- TOC entry 2871 (class 0 OID 16410)
-- Dependencies: 206
-- Data for Name: actionable; Type: TABLE DATA; Schema: iot; Owner: postgres
--

COPY iot.actionable (id, name, trigger_value, type) FROM stdin;
1	relay1	1	E
2	relay	1	E
\.


--
-- TOC entry 2873 (class 0 OID 16426)
-- Dependencies: 208
-- Data for Name: house; Type: TABLE DATA; Schema: iot; Owner: postgres
--

COPY iot.house (id, address) FROM stdin;
\.


--
-- TOC entry 2872 (class 0 OID 16418)
-- Dependencies: 207
-- Data for Name: preferences; Type: TABLE DATA; Schema: iot; Owner: postgres
--

COPY iot.preferences (id, operator, "when", sensor_id, actionable_id) FROM stdin;
1	>	2020-03-21 01:01:01+02	1	2
\.


--
-- TOC entry 2870 (class 0 OID 16402)
-- Dependencies: 205
-- Data for Name: sensor; Type: TABLE DATA; Schema: iot; Owner: postgres
--

COPY iot.sensor (id, name, trigger_value) FROM stdin;
1	ultrasonic	50
\.


--
-- TOC entry 2874 (class 0 OID 16434)
-- Dependencies: 209
-- Data for Name: usage_actionable; Type: TABLE DATA; Schema: iot; Owner: postgres
--

COPY iot.usage_actionable (id, actionable_id, ts_on, ts_off, state) FROM stdin;
1	1	2020-03-21 00:00:00+02	2020-03-21 00:00:00+02	\N
2	1	2020-03-10 00:00:00+02	2020-10-10 00:00:00+03	\N
\.


--
-- TOC entry 2875 (class 0 OID 16439)
-- Dependencies: 210
-- Data for Name: usage_sensor; Type: TABLE DATA; Schema: iot; Owner: postgres
--

COPY iot.usage_sensor (id, sensor_id, record_value, record_ts) FROM stdin;
\.


--
-- TOC entry 2885 (class 0 OID 0)
-- Dependencies: 212
-- Name: actionable_id; Type: SEQUENCE SET; Schema: iot; Owner: postgres
--

SELECT pg_catalog.setval('iot.actionable_id', 2, true);


--
-- TOC entry 2886 (class 0 OID 0)
-- Dependencies: 214
-- Name: preference_id; Type: SEQUENCE SET; Schema: iot; Owner: postgres
--

SELECT pg_catalog.setval('iot.preference_id', 1, true);


--
-- TOC entry 2887 (class 0 OID 0)
-- Dependencies: 213
-- Name: sensor_id; Type: SEQUENCE SET; Schema: iot; Owner: postgres
--

SELECT pg_catalog.setval('iot.sensor_id', 1, true);


--
-- TOC entry 2888 (class 0 OID 0)
-- Dependencies: 211
-- Name: usage_actionable_id; Type: SEQUENCE SET; Schema: iot; Owner: postgres
--

SELECT pg_catalog.setval('iot.usage_actionable_id', 2, true);


--
-- TOC entry 2730 (class 2606 OID 16401)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: iot; Owner: postgres
--

ALTER TABLE ONLY iot."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 2734 (class 2606 OID 16417)
-- Name: actionable actionable_pkey; Type: CONSTRAINT; Schema: iot; Owner: postgres
--

ALTER TABLE ONLY iot.actionable
    ADD CONSTRAINT actionable_pkey PRIMARY KEY (id);


--
-- TOC entry 2738 (class 2606 OID 16433)
-- Name: house house_pkey; Type: CONSTRAINT; Schema: iot; Owner: postgres
--

ALTER TABLE ONLY iot.house
    ADD CONSTRAINT house_pkey PRIMARY KEY (id);


--
-- TOC entry 2736 (class 2606 OID 16425)
-- Name: preferences preferences_pkey; Type: CONSTRAINT; Schema: iot; Owner: postgres
--

ALTER TABLE ONLY iot.preferences
    ADD CONSTRAINT preferences_pkey PRIMARY KEY (id);


--
-- TOC entry 2732 (class 2606 OID 16409)
-- Name: sensor sensor_pkey; Type: CONSTRAINT; Schema: iot; Owner: postgres
--

ALTER TABLE ONLY iot.sensor
    ADD CONSTRAINT sensor_pkey PRIMARY KEY (id);


--
-- TOC entry 2740 (class 2606 OID 16438)
-- Name: usage_actionable usage_actionable_pkey; Type: CONSTRAINT; Schema: iot; Owner: postgres
--

ALTER TABLE ONLY iot.usage_actionable
    ADD CONSTRAINT usage_actionable_pkey PRIMARY KEY (id);


--
-- TOC entry 2742 (class 2606 OID 16443)
-- Name: usage_sensor usage_sensor_pkey; Type: CONSTRAINT; Schema: iot; Owner: postgres
--

ALTER TABLE ONLY iot.usage_sensor
    ADD CONSTRAINT usage_sensor_pkey PRIMARY KEY (id);


-- Completed on 2020-03-25 02:07:56

--
-- PostgreSQL database dump complete
--

