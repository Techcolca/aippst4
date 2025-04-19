--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

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

ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.sites_content DROP CONSTRAINT IF EXISTS sites_content_integration_id_integrations_id_fk;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_conversations_id_fk;
ALTER TABLE IF EXISTS ONLY public.integrations DROP CONSTRAINT IF EXISTS integrations_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.forms DROP CONSTRAINT IF EXISTS forms_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.form_templates DROP CONSTRAINT IF EXISTS form_templates_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.form_responses DROP CONSTRAINT IF EXISTS form_responses_form_id_fkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_integration_id_integrations_id_fk;
ALTER TABLE IF EXISTS ONLY public.calendar_tokens DROP CONSTRAINT IF EXISTS calendar_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.automations DROP CONSTRAINT IF EXISTS automations_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_api_key_unique;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.sites_content DROP CONSTRAINT IF EXISTS sites_content_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.pricing_plans DROP CONSTRAINT IF EXISTS pricing_plans_plan_id_unique;
ALTER TABLE IF EXISTS ONLY public.pricing_plans DROP CONSTRAINT IF EXISTS pricing_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.integrations DROP CONSTRAINT IF EXISTS integrations_pkey;
ALTER TABLE IF EXISTS ONLY public.integrations DROP CONSTRAINT IF EXISTS integrations_api_key_unique;
ALTER TABLE IF EXISTS ONLY public.forms DROP CONSTRAINT IF EXISTS forms_slug_key;
ALTER TABLE IF EXISTS ONLY public.forms DROP CONSTRAINT IF EXISTS forms_pkey;
ALTER TABLE IF EXISTS ONLY public.form_templates DROP CONSTRAINT IF EXISTS form_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.form_responses DROP CONSTRAINT IF EXISTS form_responses_pkey;
ALTER TABLE IF EXISTS ONLY public.discount_codes DROP CONSTRAINT IF EXISTS discount_codes_pkey;
ALTER TABLE IF EXISTS ONLY public.discount_codes DROP CONSTRAINT IF EXISTS discount_codes_code_unique;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_pkey;
ALTER TABLE IF EXISTS ONLY public.calendar_tokens DROP CONSTRAINT IF EXISTS calendar_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.automations DROP CONSTRAINT IF EXISTS automations_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.subscriptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sites_content ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pricing_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.integrations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.forms ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.form_templates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.form_responses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.discount_codes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.conversations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.calendar_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.automations ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.subscriptions_id_seq;
DROP TABLE IF EXISTS public.subscriptions;
DROP SEQUENCE IF EXISTS public.sites_content_id_seq;
DROP TABLE IF EXISTS public.sites_content;
DROP SEQUENCE IF EXISTS public.settings_id_seq;
DROP TABLE IF EXISTS public.settings;
DROP SEQUENCE IF EXISTS public.pricing_plans_id_seq;
DROP TABLE IF EXISTS public.pricing_plans;
DROP SEQUENCE IF EXISTS public.messages_id_seq;
DROP TABLE IF EXISTS public.messages;
DROP SEQUENCE IF EXISTS public.integrations_id_seq;
DROP TABLE IF EXISTS public.integrations;
DROP SEQUENCE IF EXISTS public.forms_id_seq;
DROP TABLE IF EXISTS public.forms;
DROP SEQUENCE IF EXISTS public.form_templates_id_seq;
DROP TABLE IF EXISTS public.form_templates;
DROP SEQUENCE IF EXISTS public.form_responses_id_seq;
DROP TABLE IF EXISTS public.form_responses;
DROP SEQUENCE IF EXISTS public.discount_codes_id_seq;
DROP TABLE IF EXISTS public.discount_codes;
DROP SEQUENCE IF EXISTS public.conversations_id_seq;
DROP TABLE IF EXISTS public.conversations;
DROP SEQUENCE IF EXISTS public.calendar_tokens_id_seq;
DROP TABLE IF EXISTS public.calendar_tokens;
DROP SEQUENCE IF EXISTS public.automations_id_seq;
DROP TABLE IF EXISTS public.automations;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: automations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.automations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    description text,
    status text DEFAULT 'active'::text,
    config json NOT NULL,
    processed_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    last_modified timestamp without time zone DEFAULT now()
);


ALTER TABLE public.automations OWNER TO neondb_owner;

--
-- Name: automations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.automations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.automations_id_seq OWNER TO neondb_owner;

--
-- Name: automations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.automations_id_seq OWNED BY public.automations.id;


--
-- Name: calendar_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.calendar_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    provider text NOT NULL,
    access_token text NOT NULL,
    refresh_token text,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.calendar_tokens OWNER TO neondb_owner;

--
-- Name: calendar_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.calendar_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calendar_tokens_id_seq OWNER TO neondb_owner;

--
-- Name: calendar_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.calendar_tokens_id_seq OWNED BY public.calendar_tokens.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    integration_id integer,
    visitor_id text,
    resolved boolean DEFAULT false,
    duration integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.conversations OWNER TO neondb_owner;

--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversations_id_seq OWNER TO neondb_owner;

--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: discount_codes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.discount_codes (
    id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    discount_percentage integer NOT NULL,
    applicable_tier text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone,
    usage_limit integer,
    usage_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.discount_codes OWNER TO neondb_owner;

--
-- Name: discount_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.discount_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discount_codes_id_seq OWNER TO neondb_owner;

--
-- Name: discount_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.discount_codes_id_seq OWNED BY public.discount_codes.id;


--
-- Name: form_responses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.form_responses (
    id integer NOT NULL,
    form_id integer,
    data jsonb NOT NULL,
    metadata jsonb,
    submitted_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.form_responses OWNER TO neondb_owner;

--
-- Name: form_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.form_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_responses_id_seq OWNER TO neondb_owner;

--
-- Name: form_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.form_responses_id_seq OWNED BY public.form_responses.id;


--
-- Name: form_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.form_templates (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    thumbnail text,
    structure jsonb NOT NULL,
    styling jsonb,
    settings jsonb,
    is_default boolean DEFAULT false,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.form_templates OWNER TO neondb_owner;

--
-- Name: form_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.form_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_templates_id_seq OWNER TO neondb_owner;

--
-- Name: form_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.form_templates_id_seq OWNED BY public.form_templates.id;


--
-- Name: forms; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forms (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    description text,
    slug text NOT NULL,
    type text DEFAULT 'standard'::text,
    published boolean DEFAULT false,
    structure jsonb NOT NULL,
    styling jsonb,
    settings jsonb,
    response_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.forms OWNER TO neondb_owner;

--
-- Name: forms_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forms_id_seq OWNER TO neondb_owner;

--
-- Name: forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.forms_id_seq OWNED BY public.forms.id;


--
-- Name: integrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.integrations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    api_key text NOT NULL,
    theme_color text DEFAULT '#3B82F6'::text,
    "position" text DEFAULT 'bottom-right'::text,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    visitor_count integer DEFAULT 0,
    bot_behavior text DEFAULT 'Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web.'::text,
    documents_data json DEFAULT '[]'::json,
    widget_type text DEFAULT 'bubble'::text,
    ignored_sections jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.integrations OWNER TO neondb_owner;

--
-- Name: integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.integrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.integrations_id_seq OWNER TO neondb_owner;

--
-- Name: integrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.integrations_id_seq OWNED BY public.integrations.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer,
    content text NOT NULL,
    role text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO neondb_owner;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: pricing_plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pricing_plans (
    id integer NOT NULL,
    plan_id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price integer NOT NULL,
    price_display text NOT NULL,
    currency text DEFAULT 'cad'::text NOT NULL,
    "interval" text DEFAULT 'month'::text NOT NULL,
    features json NOT NULL,
    tier text NOT NULL,
    interactions_limit integer NOT NULL,
    is_annual boolean DEFAULT false,
    discount integer,
    popular boolean DEFAULT false,
    available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    stripe_product_id character varying(255),
    stripe_price_id character varying(255)
);


ALTER TABLE public.pricing_plans OWNER TO neondb_owner;

--
-- Name: pricing_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pricing_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pricing_plans_id_seq OWNER TO neondb_owner;

--
-- Name: pricing_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pricing_plans_id_seq OWNED BY public.pricing_plans.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    assistant_name text DEFAULT 'AIPI Assistant'::text,
    default_greeting text DEFAULT '👋 Hi there! I''m AIPI, your AI assistant. How can I help you today?'::text,
    show_availability boolean DEFAULT true,
    avatar_url text,
    user_bubble_color text DEFAULT '#3B82F6'::text,
    assistant_bubble_color text DEFAULT '#E5E7EB'::text,
    font text DEFAULT 'inter'::text,
    conversation_style text DEFAULT 'professional'::text,
    knowledge_base text DEFAULT 'default'::text,
    enable_learning boolean DEFAULT true,
    email_notification_address text
);


ALTER TABLE public.settings OWNER TO neondb_owner;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO neondb_owner;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: sites_content; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sites_content (
    id integer NOT NULL,
    integration_id integer NOT NULL,
    url text NOT NULL,
    title text,
    content text NOT NULL,
    last_updated timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sites_content OWNER TO neondb_owner;

--
-- Name: sites_content_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sites_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sites_content_id_seq OWNER TO neondb_owner;

--
-- Name: sites_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sites_content_id_seq OWNED BY public.sites_content.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    stripe_customer_id text,
    stripe_price_id text,
    stripe_subscription_id text,
    status text DEFAULT 'inactive'::text NOT NULL,
    tier text DEFAULT 'free'::text NOT NULL,
    interactions_limit integer DEFAULT 20 NOT NULL,
    interactions_used integer DEFAULT 0 NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.subscriptions OWNER TO neondb_owner;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_id_seq OWNER TO neondb_owner;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    full_name text,
    api_key text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    stripe_customer_id text,
    stripe_subscription_id text
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: automations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.automations ALTER COLUMN id SET DEFAULT nextval('public.automations_id_seq'::regclass);


--
-- Name: calendar_tokens id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.calendar_tokens ALTER COLUMN id SET DEFAULT nextval('public.calendar_tokens_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: discount_codes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discount_codes ALTER COLUMN id SET DEFAULT nextval('public.discount_codes_id_seq'::regclass);


--
-- Name: form_responses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.form_responses ALTER COLUMN id SET DEFAULT nextval('public.form_responses_id_seq'::regclass);


--
-- Name: form_templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.form_templates ALTER COLUMN id SET DEFAULT nextval('public.form_templates_id_seq'::regclass);


--
-- Name: forms id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forms ALTER COLUMN id SET DEFAULT nextval('public.forms_id_seq'::regclass);


--
-- Name: integrations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.integrations ALTER COLUMN id SET DEFAULT nextval('public.integrations_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: pricing_plans id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pricing_plans ALTER COLUMN id SET DEFAULT nextval('public.pricing_plans_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: sites_content id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sites_content ALTER COLUMN id SET DEFAULT nextval('public.sites_content_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: automations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.automations (id, user_id, name, description, status, config, processed_count, created_at, last_modified) FROM stdin;
\.


--
-- Data for Name: calendar_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.calendar_tokens (id, user_id, provider, access_token, refresh_token, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.conversations (id, integration_id, visitor_id, resolved, duration, created_at, updated_at) FROM stdin;
5	5	visitor_28n0co249rd	f	0	2025-03-27 23:16:39.912703	2025-03-27 23:16:39.912703
6	5	visitor_28n0co249rd	f	0	2025-03-27 23:21:56.727482	2025-03-27 23:21:56.727482
7	5	visitor_28n0co249rd	f	0	2025-03-27 23:29:19.205546	2025-03-27 23:29:19.205546
8	5	visitor_kwizu92p04s	f	0	2025-03-28 13:01:23.919613	2025-03-28 13:01:23.919613
9	5	visitor_kwizu92p04s	f	0	2025-03-28 13:03:25.102768	2025-03-28 13:03:25.102768
10	5	visitor_xtidfnr046	f	0	2025-03-28 13:05:53.412773	2025-03-28 13:05:53.412773
11	5	visitor_xtidfnr046	f	0	2025-03-28 13:06:44.875014	2025-03-28 13:06:44.875014
12	5	visitor_kwizu92p04s	f	0	2025-03-28 13:15:30.445268	2025-03-28 13:15:30.445268
13	5	visitor_ziml1vkew2r	f	0	2025-03-28 13:28:56.067362	2025-03-28 13:28:56.067362
14	5	visitor_egb7lpokmyq	f	0	2025-03-28 14:18:14.223715	2025-03-28 14:18:14.223715
15	5	visitor_egb7lpokmyq	f	0	2025-03-28 14:47:10.721081	2025-03-28 14:47:10.721081
16	5	visitor_egb7lpokmyq	f	0	2025-03-28 16:28:12.182336	2025-03-28 16:28:12.182336
17	5	test_visitor	f	0	2025-03-28 18:48:27.566593	2025-03-28 18:48:27.566593
18	5	visitor_egb7lpokmyq	f	0	2025-03-28 18:51:42.37466	2025-03-28 18:51:42.37466
19	5	visitor_8u3cxziw5bc	f	0	2025-03-28 18:53:35.213462	2025-03-28 18:53:35.213462
20	5	visitor_8u3cxziw5bc	f	0	2025-03-28 18:55:49.156937	2025-03-28 18:55:49.156937
21	5	visitor_8u3cxziw5bc	f	0	2025-03-28 18:56:26.809697	2025-03-28 18:56:26.809697
22	5	visitor_x3y8r6otjlc	f	0	2025-03-28 19:12:51.646642	2025-03-28 19:12:51.646642
23	5	visitor_xtidfnr046	f	0	2025-03-28 19:20:39.770147	2025-03-28 19:20:39.770147
24	5	visitor_test	f	0	2025-03-28 19:24:00.277358	2025-03-28 19:24:00.277358
25	5	visitor_x3y8r6otjlc	f	0	2025-03-28 19:33:39.100524	2025-03-28 19:33:39.100524
26	6	\N	f	0	2025-03-28 19:40:58.175905	2025-03-28 19:40:58.175905
27	6	\N	f	0	2025-03-28 19:41:03.738907	2025-03-28 19:41:03.738907
28	6	\N	f	0	2025-03-28 19:41:54.742466	2025-03-28 19:41:54.742466
29	6	visitor_gx3aowo17yl	f	0	2025-03-28 19:56:04.875925	2025-03-28 19:56:04.875925
30	6	visitor_jvrrl0qvwfs	f	0	2025-03-28 22:16:28.520825	2025-03-28 22:16:28.520825
31	5	visitor_x3y8r6otjlc	f	0	2025-03-31 19:34:36.163171	2025-03-31 19:34:36.163171
32	5	visitor_jzs9ng77ut	f	0	2025-04-01 14:43:13.755487	2025-04-01 14:43:13.755487
33	5	visitor_jzs9ng77ut	f	0	2025-04-02 17:08:59.065166	2025-04-02 17:08:59.065166
34	5	visitor_jzs9ng77ut	f	0	2025-04-04 14:59:58.857463	2025-04-04 14:59:58.857463
35	5	visitor_jzs9ng77ut	f	0	2025-04-08 11:30:48.602139	2025-04-08 11:30:48.602139
36	5	visitor_jzs9ng77ut	f	0	2025-04-08 11:37:37.18251	2025-04-08 11:37:37.18251
37	5	visitor_e5et1rftgm8	f	0	2025-04-09 18:21:50.994624	2025-04-09 18:21:50.994624
38	5	visitor_e5et1rftgm8	f	0	2025-04-09 18:29:46.826329	2025-04-09 18:29:46.826329
39	5	visitor_e5et1rftgm8	f	0	2025-04-09 18:42:32.626013	2025-04-09 18:42:32.626013
40	5	visitor_e5et1rftgm8	f	0	2025-04-09 18:44:46.875335	2025-04-09 18:44:46.875335
41	5	visitor_jzs9ng77ut	f	0	2025-04-09 23:56:21.316489	2025-04-09 23:56:21.316489
42	5	visitor_jzs9ng77ut	f	0	2025-04-09 23:57:30.232661	2025-04-09 23:57:30.232661
43	5	visitor_jzs9ng77ut	f	0	2025-04-10 00:01:15.619307	2025-04-10 00:01:15.619307
44	5	visitor_90k1r0w2t2e	f	0	2025-04-10 16:00:54.479176	2025-04-10 16:00:54.479176
45	5	visitor_4gvrn4k5av4	f	0	2025-04-11 11:29:04.247812	2025-04-11 11:29:04.247812
\.


--
-- Data for Name: discount_codes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.discount_codes (id, code, name, discount_percentage, applicable_tier, is_active, created_at, expires_at, usage_limit, usage_count) FROM stdin;
1	NEW-DZXD3N	New	17	all	t	2025-04-01 13:36:41.451684	2025-06-17 00:00:00	20	0
2	NE2-DJ5FTG	ne2	17	all	t	2025-04-01 13:49:29.06884	2025-07-07 00:00:00	17	0
\.


--
-- Data for Name: form_responses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.form_responses (id, form_id, data, metadata, submitted_at) FROM stdin;
1	7	{"23": "234234324342", "email": "perc80@hotmail.com", "first_name": "Pablo"}	\N	2025-04-10 18:53:16.741379
2	7	{"23": "5677", "email": "pablo.rueda@techcolca.ca", "first_name": "Pablo Emilio"}	\N	2025-04-11 14:43:05.188965
\.


--
-- Data for Name: form_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.form_templates (id, name, description, type, thumbnail, structure, styling, settings, is_default, created_by, created_at, updated_at) FROM stdin;
1	Formulario de Contacto	Plantilla estándar para formularios de contacto	contact	\N	{"fields": [{"id": "name", "type": "text", "label": "Nombre completo", "order": 1, "required": true, "placeholder": "Introduce tu nombre completo"}, {"id": "email", "type": "email", "label": "Correo electrónico", "order": 2, "required": true, "placeholder": "tu@email.com"}, {"id": "subject", "type": "text", "label": "Asunto", "order": 3, "required": true, "placeholder": "Asunto de tu mensaje"}, {"id": "message", "type": "textarea", "label": "Mensaje", "order": 4, "required": true, "placeholder": "Escribe tu mensaje aquí..."}], "submitButtonText": "Enviar mensaje"}	{"theme": "light", "fontFamily": "Inter", "borderRadius": "md"}	{"redirectUrl": "", "redirectAfterSubmit": false, "submitSuccessMessage": "¡Gracias por contactarnos! Te responderemos lo antes posible.", "sendEmailNotification": true}	t	\N	2025-04-01 18:53:16.27413	2025-04-01 18:53:16.27413
2	Lista de Espera	Plantilla para capturar usuarios en lista de espera	waitlist	\N	{"fields": [{"id": "name", "type": "text", "label": "Nombre", "order": 1, "required": true, "placeholder": "Tu nombre"}, {"id": "email", "type": "email", "label": "Correo electrónico", "order": 2, "required": true, "placeholder": "tu@email.com"}, {"id": "interest", "type": "select", "label": "¿Cómo te enteraste de nosotros?", "order": 3, "options": ["Redes sociales", "Búsqueda en Google", "Recomendación", "Otro"], "required": false}], "submitButtonText": "Unirme a la lista de espera"}	{"theme": "light", "fontFamily": "Inter", "borderRadius": "md"}	{"redirectUrl": "", "redirectAfterSubmit": false, "submitSuccessMessage": "¡Te has unido a nuestra lista de espera! Te notificaremos cuando sea tu turno.", "sendEmailNotification": true}	t	\N	2025-04-01 18:53:16.27413	2025-04-01 18:53:16.27413
3	Encuesta de Satisfacción	Encuesta para medir la satisfacción del cliente	survey	\N	{"fields": [{"id": "satisfaction", "type": "radio", "label": "¿Cómo calificarías tu experiencia con nosotros?", "order": 1, "options": ["Excelente", "Buena", "Regular", "Mala", "Muy mala"], "required": true}, {"id": "recommendationScore", "max": 10, "min": 1, "type": "range", "label": "Del 1 al 10, ¿qué tan probable es que nos recomiendes?", "order": 2, "required": true}, {"id": "feedback", "type": "textarea", "label": "¿Cómo podríamos mejorar?", "order": 3, "required": false, "placeholder": "Tus comentarios nos ayudan a mejorar"}], "submitButtonText": "Enviar encuesta"}	{"theme": "light", "fontFamily": "Inter", "borderRadius": "md"}	{"redirectUrl": "", "redirectAfterSubmit": false, "submitSuccessMessage": "¡Gracias por tu feedback!", "sendEmailNotification": true}	t	\N	2025-04-01 18:53:16.27413	2025-04-01 18:53:16.27413
4	Solicitud de Presupuesto	Formulario para solicitar presupuestos personalizados para tus clientes.	lead	\N	{"fields": [{"name": "company_name", "type": "text", "label": "Nombre de la empresa", "required": true, "placeholder": "Tu empresa"}, {"name": "contact_name", "type": "text", "label": "Nombre de contacto", "required": true, "placeholder": "Nombre completo"}, {"name": "email", "type": "email", "label": "Correo electrónico", "required": true, "placeholder": "correo@ejemplo.com"}, {"name": "service_type", "type": "select", "label": "Tipo de servicio", "options": [{"label": "Desarrollo web", "value": "web_development"}, {"label": "Diseño gráfico", "value": "graphic_design"}, {"label": "Marketing digital", "value": "digital_marketing"}, {"label": "Consultoría", "value": "consulting"}, {"label": "Otro", "value": "other"}], "required": true}], "settings": {"submitLabel": "Solicitar presupuesto", "successMessage": "¡Hemos recibido tu solicitud! Te contactaremos en breve."}}	{"shadow": "md", "background": "#FFFFFF", "fontFamily": "Poppins, sans-serif", "borderRadius": "4px", "primaryColor": "#2563EB"}	\N	t	\N	2025-04-01 23:47:32.709959	2025-04-01 23:47:32.709959
5	Registro para Webinar	Formulario optimizado para registrar asistentes a eventos virtuales.	registration	\N	{"fields": [{"name": "name", "type": "text", "label": "Nombre completo", "required": true, "placeholder": "Tu nombre"}, {"name": "email", "type": "email", "label": "Correo electrónico", "required": true, "placeholder": "correo@ejemplo.com"}, {"name": "company", "type": "text", "label": "Empresa", "required": false, "placeholder": "Nombre de tu empresa"}], "settings": {"submitLabel": "Confirmar registro", "successMessage": "¡Registro completado! Recibirás un email de confirmación."}}	{"shadow": "sm", "background": "#F9FAFB", "fontFamily": "Roboto, sans-serif", "borderRadius": "8px", "primaryColor": "#8B5CF6"}	\N	t	\N	2025-04-01 23:47:32.783289	2025-04-01 23:47:32.783289
6	Formulario de Pedido	Perfecto para tomar pedidos online de manera organizada.	order	\N	{"fields": [{"name": "customer_name", "type": "text", "label": "Nombre del cliente", "required": true, "placeholder": "Nombre completo"}, {"name": "email", "type": "email", "label": "Correo electrónico", "required": true, "placeholder": "correo@ejemplo.com"}, {"name": "phone", "type": "tel", "label": "Teléfono", "required": true, "placeholder": "+34 600000000"}], "settings": {"submitLabel": "Confirmar Pedido", "successMessage": "¡Pedido recibido! Recibirás un email de confirmación con los detalles."}}	{"shadow": "md", "background": "#FFFFFF", "fontFamily": "Lato, sans-serif", "borderRadius": "6px", "primaryColor": "#10B981"}	\N	t	\N	2025-04-01 23:47:32.827759	2025-04-01 23:47:32.827759
7	Evaluación de Evento	Recopila feedback detallado sobre tus eventos y conferencias.	feedback	\N	{"fields": [{"name": "name", "type": "text", "label": "Nombre (opcional)", "required": false, "placeholder": "Tu nombre"}, {"name": "event_name", "type": "select", "label": "Selecciona el evento", "options": [{"label": "Conferencia anual 2025", "value": "annual_conf_2025"}, {"label": "Taller práctico - Mayo", "value": "workshop_may"}, {"label": "Webinar técnico - Junio", "value": "tech_webinar_june"}], "required": true}, {"name": "overall_rating", "type": "rating", "label": "Valoración general del evento", "required": true, "settings": {"max": 5, "min": 1, "icon": "star"}}], "settings": {"submitLabel": "Enviar evaluación", "successMessage": "¡Gracias por tu evaluación! Tu feedback nos ayuda a mejorar."}}	{"shadow": "md", "background": "#FFFBEB", "fontFamily": "Inter, sans-serif", "borderRadius": "10px", "primaryColor": "#F59E0B"}	\N	t	\N	2025-04-01 23:47:32.871321	2025-04-01 23:47:32.871321
8	Solicitud de Empleo	Optimizado para reclutar candidatos y revisar solicitudes de empleo.	application	\N	{"fields": [{"name": "full_name", "type": "text", "label": "Nombre completo", "required": true, "placeholder": "Tu nombre completo"}, {"name": "email", "type": "email", "label": "Correo electrónico", "required": true, "placeholder": "tu@email.com"}, {"name": "phone", "type": "tel", "label": "Teléfono", "required": true, "placeholder": "+34 600000000"}], "settings": {"submitLabel": "Enviar solicitud", "successMessage": "¡Hemos recibido tu solicitud! Revisaremos tu perfil y te contactaremos en caso de avanzar en el proceso."}}	{"shadow": "md", "background": "#F9FAFB", "fontFamily": "Roboto, sans-serif", "borderRadius": "4px", "primaryColor": "#3B82F6"}	\N	t	\N	2025-04-01 23:47:32.91477	2025-04-01 23:47:32.91477
9	Registro a Newsletter	Forma sencilla para capturar suscriptores a tu boletín informativo.	subscription	\N	{"fields": [{"name": "email", "type": "email", "label": "Tu correo electrónico", "required": true, "placeholder": "correo@ejemplo.com"}, {"name": "first_name", "type": "text", "label": "Nombre", "required": false, "placeholder": "Tu nombre"}], "settings": {"submitLabel": "Suscribirme", "successMessage": "¡Gracias por suscribirte! Por favor, confirma tu correo electrónico para completar el proceso."}}	{"shadow": "sm", "background": "#FFFFFF", "fontFamily": "Inter, sans-serif", "borderRadius": "8px", "primaryColor": "#6366F1"}	\N	t	\N	2025-04-01 23:47:32.957736	2025-04-01 23:47:32.957736
10	Encuesta de Opinión	Recopila opiniones y sugerencias sobre cualquier tema de interés.	survey	\N	{"fields": [{"name": "name", "type": "text", "label": "Nombre completo", "required": true, "placeholder": "Tu nombre"}, {"name": "email", "type": "email", "label": "Correo electrónico", "required": true, "placeholder": "correo@ejemplo.com"}, {"name": "age_group", "type": "select", "label": "Grupo de edad", "options": [{"label": "Menor de 18 años", "value": "under_18"}, {"label": "18-24 años", "value": "18_24"}, {"label": "25-34 años", "value": "25_34"}, {"label": "35-44 años", "value": "35_44"}, {"label": "45-54 años", "value": "45_54"}, {"label": "55 años o más", "value": "55_plus"}], "required": true}, {"name": "frequency", "type": "radio", "label": "¿Con qué frecuencia utilizas nuestro servicio?", "options": [{"label": "Diariamente", "value": "daily"}, {"label": "Semanalmente", "value": "weekly"}, {"label": "Mensualmente", "value": "monthly"}, {"label": "Raramente", "value": "rarely"}, {"label": "Nunca", "value": "never"}], "required": true}, {"name": "suggestions", "type": "textarea", "label": "¿Qué sugerencias tienes para mejorar?", "required": false, "placeholder": "Comparte tus ideas"}], "settings": {"submitLabel": "Enviar opinión", "successMessage": "¡Gracias por compartir tu opinión!"}}	{"shadow": "md", "background": "#FFFFFF", "fontFamily": "Poppins, sans-serif", "borderRadius": "8px", "primaryColor": "#EC4899"}	\N	t	\N	2025-04-01 23:47:52.039542	2025-04-01 23:47:52.039542
\.


--
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forms (id, user_id, title, description, slug, type, published, structure, styling, settings, response_count, created_at, updated_at) FROM stdin;
3	4	Solicitud de Presupuesto 1/4/2025	Formulario para solicitar presupuestos personalizados para tus clientes.	solicitud-de-presupuesto-142025	lead	f	{"fields": [{"name": "company_name", "type": "text", "label": "Nombre de la empresa", "required": true, "placeholder": "Tu empresa"}, {"name": "contact_name", "type": "text", "label": "Nombre de contacto", "required": true, "placeholder": "Nombre completo"}, {"name": "email", "type": "email", "label": "Correo electrónico", "required": true, "placeholder": "correo@ejemplo.com"}, {"name": "service_type", "type": "select", "label": "Tipo de servicio", "options": [{"label": "Desarrollo web", "value": "web_development"}, {"label": "Diseño gráfico", "value": "graphic_design"}, {"label": "Marketing digital", "value": "digital_marketing"}, {"label": "Consultoría", "value": "consulting"}, {"label": "Otro", "value": "other"}], "required": true}], "settings": {"submitLabel": "Solicitar presupuesto", "successMessage": "¡Hemos recibido tu solicitud! Te contactaremos en breve."}}	{"shadow": "md", "background": "#FFFFFF", "fontFamily": "Poppins, sans-serif", "borderRadius": "4px", "primaryColor": "#2563EB"}	\N	0	2025-04-01 23:49:04.44602	2025-04-01 23:49:04.44602
4	4	Lista de Espera 1/4/2025	Plantilla para capturar usuarios en lista de espera	lista-de-espera-142025-127	waitlist	f	{"fields": [{"id": "name", "type": "text", "label": "Nombre", "order": 1, "required": true, "placeholder": "Tu nombre"}, {"id": "email", "type": "email", "label": "Correo electrónico", "order": 2, "required": true, "placeholder": "tu@email.com"}, {"id": "interest", "type": "select", "label": "¿Cómo te enteraste de nosotros?", "order": 3, "options": ["Redes sociales", "Búsqueda en Google", "Recomendación", "Otro"], "required": false}], "submitButtonText": "Unirme a la lista de espera"}	{"theme": "light", "fontFamily": "Inter", "borderRadius": "md"}	{"redirectUrl": "", "redirectAfterSubmit": false, "submitSuccessMessage": "¡Te has unido a nuestra lista de espera! Te notificaremos cuando sea tu turno.", "sendEmailNotification": true}	0	2025-04-01 23:52:50.4401	2025-04-01 23:52:50.4401
5	4	Lista de Espera 1/4/2025	Plantilla para capturar usuarios en lista de espera	lista-de-espera-142025-469	waitlist	f	{"fields": [{"id": "name", "type": "text", "label": "Nombre", "order": 1, "required": true, "placeholder": "Tu nombre"}, {"id": "email", "type": "email", "label": "Correo electrónico", "order": 2, "required": true, "placeholder": "tu@email.com"}, {"id": "interest", "type": "select", "label": "¿Cómo te enteraste de nosotros?", "order": 3, "options": ["Redes sociales", "Búsqueda en Google", "Recomendación", "Otro"], "required": false}], "submitButtonText": "Unirme a la lista de espera"}	{"theme": "light", "fontFamily": "Inter", "borderRadius": "md"}	{"redirectUrl": "", "redirectAfterSubmit": false, "submitSuccessMessage": "¡Te has unido a nuestra lista de espera! Te notificaremos cuando sea tu turno.", "sendEmailNotification": true}	0	2025-04-01 23:53:21.857898	2025-04-01 23:53:21.857898
6	4	Registro para Webinar 2/4/2025	Formulario optimizado para registrar asistentes a eventos virtuales.	registro-para-webinar-242025	registration	f	{"fields": [{"name": "name", "type": "text", "label": "Nombre completo", "required": true, "placeholder": "Tu nombre"}, {"name": "email", "type": "email", "label": "Correo electrónico", "required": true, "placeholder": "correo@ejemplo.com"}, {"name": "company", "type": "text", "label": "Empresa", "required": false, "placeholder": "Nombre de tu empresa"}], "settings": {"submitLabel": "Confirmar registro", "successMessage": "¡Registro completado! Recibirás un email de confirmación."}}	{"shadow": "sm", "background": "#F9FAFB", "fontFamily": "Roboto, sans-serif", "borderRadius": "8px", "primaryColor": "#8B5CF6"}	\N	0	2025-04-02 00:04:24.745822	2025-04-02 00:04:24.745822
10	4	Registro para Webinar 4/4/2025	Formulario optimizado para registrar asistentes a eventos virtuales.	registro-para-webinar-442025	registration	f	{"fields": [{"name": "name", "type": "text", "label": "Nombre completo", "required": true, "placeholder": "Tu nombre"}, {"name": "email", "type": "email", "label": "Correo electrónico", "required": true, "placeholder": "correo@ejemplo.com"}, {"name": "company", "type": "text", "label": "Empresa", "required": false, "placeholder": "Nombre de tu empresa"}], "settings": {"submitLabel": "Confirmar registro", "successMessage": "¡Registro completado! Recibirás un email de confirmación."}}	{"shadow": "sm", "background": "#F9FAFB", "fontFamily": "Roboto, sans-serif", "borderRadius": "8px", "primaryColor": "#8B5CF6"}	\N	0	2025-04-04 15:06:22.738047	2025-04-04 15:06:22.738047
2	4	Lista de Espera 1/4/2025	Plantilla para capturar usuarios en lista de espera	lista-de-espera-142025	waitlist	f	{"fields": [{"id": "name", "type": "text", "label": "Nombre", "order": 1, "required": true, "placeholder": "Tu nombre"}, {"id": "email", "type": "email", "label": "Correo electrónico", "order": 2, "required": true, "placeholder": "tu@email.com"}, {"id": "interest", "type": "select", "label": "¿Cómo te enteraste de nosotros?", "order": 3, "options": ["Redes sociales", "Búsqueda en Google", "Recomendación", "Otro"], "required": false}, {"name": "test54448899", "type": "number", "label": "Numero de tttelefono", "required": false, "placeholder": "", "defaultValue": ""}], "submitButtonText": "Unirme a la lista de espera"}	{"theme": "light", "spacing": "md", "fontFamily": "Inter", "borderRadius": "md", "primaryColor": "#3B82F6"}	{"captcha": false, "redirectUrl": "", "storeResponses": true, "successMessage": "Gracias por tu envío", "emailRecipients": "", "sendEmailNotification": true}	0	2025-04-01 23:43:27.430339	2025-04-04 18:25:12.696
1	4	Formulario de Contacto 1/4/2025	Plantilla estándar para formularios de contacto	formulario-de-contacto-142025	contact	f	{"fields": [{"id": "name", "type": "text", "label": "Nombre completo", "order": 1, "required": true, "placeholder": "Introduce tu nombre completo"}, {"id": "email", "type": "email", "label": "Correo electrónico", "order": 2, "required": true, "placeholder": "tu@email.com"}, {"id": "subject", "type": "text", "label": "Asunto", "order": 3, "required": true, "placeholder": "Asunto de tu mensaje"}, {"id": "message", "type": "textarea", "label": "Mensaje", "order": 4, "required": true, "placeholder": "Escribe tu mensaje aquí..."}, {"name": "test5444", "type": "number", "label": "Numero de elefono", "required": false, "placeholder": "5678", "defaultValue": ""}], "submitButtonText": "Enviar mensaje"}	{"theme": "light", "spacing": "md", "fontFamily": "Inter", "borderRadius": "md", "primaryColor": "#3B82F6"}	{"captcha": false, "redirectUrl": "", "storeResponses": true, "successMessage": "Gracias por tu envío", "emailRecipients": "", "sendEmailNotification": true}	0	2025-04-01 23:42:17.05795	2025-04-04 18:23:28.237
7	1	Registro a Newsletter 2/4/2025	Forma sencilla para capturar suscriptores a tu boletín informativo.	registro-a-newsletter-242025	subscription	f	{"fields": [{"name": "first_name", "type": "text", "label": "Nombre", "required": false, "placeholder": "Tu nombre"}, {"name": "email", "type": "email", "label": "Tu correo electrónico", "required": true, "placeholder": "correo@ejemplo.com", "defaultValue": ""}, {"name": "23", "type": "tel", "label": "Numero de telefono", "required": false, "placeholder": "", "defaultValue": ""}], "settings": {"submitLabel": "Suscribirme", "successMessage": "¡Gracias por suscribirte! Por favor, confirma tu correo electrónico para completar el proceso."}}	{"theme": "light", "spacing": "md", "fontFamily": "Inter, sans-serif", "borderRadius": "8px", "primaryColor": "#6366F1"}	{"captcha": true, "redirectUrl": "", "storeResponses": true, "successMessage": "Gracias por tu envío", "emailRecipients": "perc80@hotmail.com", "sendEmailNotification": true}	4	2025-04-02 13:43:00.748564	2025-04-11 12:19:36.75
8	1	Lista de Espera 2/4/2025	Plantilla para capturar usuarios en lista de espera	lista-de-espera-242025	waitlist	f	{"fields": [{"id": "email", "type": "email", "label": "Correo electrónico", "order": 2, "required": true, "placeholder": "tu@email.com"}, {"id": "name", "type": "text", "label": "Nombre", "order": 1, "required": true, "placeholder": "Tu nombre"}, {"name": "test54", "type": "tel", "label": "Numero de telefono", "required": false, "placeholder": "", "defaultValue": ""}, {"id": "interest", "type": "select", "label": "¿Cómo te enteraste de nosotros?", "order": 3, "options": ["Redes sociales", "Búsqueda en Google", "Recomendación", "Otro"], "required": false}], "submitButtonText": "Unirme a la lista de espera"}	{"theme": "light", "spacing": "md", "fontFamily": "Inter", "borderRadius": "md", "primaryColor": "#3B82F6"}	{"captcha": false, "redirectUrl": "", "storeResponses": true, "successMessage": "Gracias por tu envío", "emailRecipients": "", "sendEmailNotification": true}	0	2025-04-02 14:01:25.258065	2025-04-10 23:19:09.504
9	1	Formulario de Pedido 2/4/2025	Perfecto para tomar pedidos online de manera organizada.	formulario-de-pedido-242025	order	f	{"fields": [{"name": "customer_name", "type": "text", "label": "Nombre del cliente", "required": true, "placeholder": "Nombre completo", "defaultValue": ""}, {"name": "email", "type": "email", "label": "Correo electrónico", "required": true, "placeholder": "correo@ejemplo.com"}, {"name": "hz_clic", "type": "checkbox", "label": "CAepta condiciones", "required": true, "placeholder": "", "defaultValue": ""}, {"name": "phone", "type": "tel", "label": "Numero Teléfono", "required": true, "placeholder": "+34 600000000", "defaultValue": ""}], "settings": {"submitLabel": "Confirmar Pedido", "successMessage": "¡Pedido recibido! Recibirás un email de confirmación con los detalles."}}	{"theme": "light", "spacing": "md", "fontFamily": "Inter", "borderRadius": "none", "primaryColor": "#702e94"}	{"captcha": true, "redirectUrl": "", "storeResponses": true, "successMessage": "Gracias por tu envío", "emailRecipients": "", "sendEmailNotification": false}	0	2025-04-02 14:43:05.636243	2025-04-10 18:07:48.575
12	1	Evaluación de Evento 10/4/2025	Recopila feedback detallado sobre tus eventos y conferencias.	evaluacin-de-evento-1042025	feedback	f	{"fields": [{"name": "name", "type": "text", "label": "Nombre (opcional)", "required": false, "placeholder": "Tu nombre"}, {"name": "event_name", "type": "select", "label": "Selecciona el evento", "options": [{"label": "Conferencia anual 2025", "value": "annual_conf_2025"}, {"label": "Taller práctico - Mayo", "value": "workshop_may"}, {"label": "Webinar técnico - Junio", "value": "tech_webinar_june"}], "required": true}, {"name": "overall_rating", "type": "rating", "label": "Valoración general del evento", "required": true, "settings": {"max": 5, "min": 1, "icon": "star"}}], "settings": {"submitLabel": "Enviar evaluación", "successMessage": "¡Gracias por tu evaluación! Tu feedback nos ayuda a mejorar."}}	{"theme": "light", "spacing": "md", "fontFamily": "Inter, sans-serif", "borderRadius": "10px", "primaryColor": "#F59E0B"}	{"captcha": false, "redirectUrl": "", "storeResponses": true, "successMessage": "Gracias por tu envío", "emailRecipients": "", "sendEmailNotification": false}	0	2025-04-10 23:25:59.123688	2025-04-11 11:51:40.052
11	1	Formulario de Contacto 9/4/2025	Plantilla estándar para formularios de contacto	formulario-de-contacto-942025	contact	f	{"fields": [{"id": "name", "type": "text", "label": "Nombre completo", "order": 1, "required": true, "placeholder": "Introduce tu nombre completo"}, {"id": "email", "type": "email", "label": "Correo electrónico", "order": 2, "required": true, "placeholder": "tu@email.com"}, {"id": "subject", "type": "text", "label": "Asunto", "order": 3, "required": true, "placeholder": "Asunto de tu mensaje"}, {"id": "message", "type": "textarea", "label": "Mensaje", "order": 4, "required": true, "placeholder": "Escribe tu mensaje aquí..."}], "submitButtonText": "Enviar mensaje"}	{"theme": "light", "spacing": "md", "fontFamily": "Inter", "borderRadius": "md", "primaryColor": "#400080"}	{"captcha": false, "redirectUrl": "", "storeResponses": true, "successMessage": "Gracias por tu envío", "emailRecipients": "", "sendEmailNotification": true}	0	2025-04-09 22:09:29.604813	2025-04-11 17:53:14.3
\.


--
-- Data for Name: integrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.integrations (id, user_id, name, url, api_key, theme_color, "position", active, created_at, visitor_count, bot_behavior, documents_data, widget_type, ignored_sections) FROM stdin;
5	1	Techcolca21	https://techcolca.ca/	aipi_mrPg94zRtTKr31hOY0m8PaPk305PJNVD	#e2f202	bottom-right	t	2025-03-27 23:14:20.716384	198	Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web. Al final agrega el link de donde sacaste la respuesta/	[{"filename":"documents-1743117260701-913675433.docx","originalName":"AIPI.docx","path":"/home/runner/workspace/uploads/documents-1743117260701-913675433.docx","size":10980,"mimetype":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","uploadedAt":"2025-03-27T23:14:20.705Z"},{"id":"3ac5f77b-6082-420d-a5e9-9f8171cde9f5","filename":"AIPI.docx","path":"/home/runner/workspace/uploads/documents-1744242945850-794377593.docx","mimetype":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","size":10980,"originalName":"AIPI.docx"}]	fullscreen	[]
7	1	Techcolca21	https://techcolca.ca/	b2f11743abf700bf3e75ea396630dae1e1cbf931d50d1189	#3B82F6	bottom-right	t	2025-04-12 20:46:11.740276	0	Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web.	[{"id":"1cffdc4f-52f9-4308-82bd-39f1de92104a","filename":"teDiter.pdf","path":"/home/runner/workspace/uploads/documents-1744490771896-516261890.pdf","mimetype":"application/pdf","size":2368897,"originalName":"teDiter.pdf"}]	bubble	[]
6	1	AIPI Web Integration	localhost	aipi_web_internal	#6366f1	bottom-right	t	2025-03-28 19:40:54.734728	3	Eres AIPI, un asistente integrado en el sitio web principal de AIPI. Tu objetivo es ayudar a los usuarios a entender cómo funciona la plataforma, sus características y beneficios. Debes ser informativo, profesional y claro en tus respuestas. Brinda ejemplos concretos de cómo se puede utilizar AIPI en diferentes contextos.	[]	floating	[]
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.messages (id, conversation_id, content, role, "timestamp") FROM stdin;
13	5	Hola necesito saber los servicios que ofrecen	user	2025-03-27 23:16:59.186671
14	5	¡Hola! TechColCa ofrece varios servicios en el ámbito de la tecnología de la información. Aquí tienes un resumen de los servicios disponibles:\n\n1. **Aplicaciones con Inteligencia Artificial**: Ofrecen aplicaciones listas para usarse que pueden adaptarse a necesidades específicas.\n\n2. **Diseño Web**: Proporcionan servicios de diseño web de vanguardia para mejorar la presencia en línea de las empresas.\n\n3. **Planes de acompañamiento personalizados**: Diseñados para profesionales formados en su programa, permitiéndoles trabajar directamente con TechColCa.\n\nPara más información sobre estos servicios, puedes visitar su página web: [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-27 23:17:01.812867
15	5	que es aipi?	user	2025-03-27 23:17:40.225827
16	5	AIPI no se menciona específicamente en la información proporcionada sobre la página de TechColCa. Sin embargo, en este contexto, AIPI se refiere a mí, tu Asistente de Inteligencia Artificial Personalizado, diseñado para ayudarte a encontrar información relevante sobre el sitio web de TechColCa y responder a tus preguntas de manera precisa y profesional. Si necesitas más información sobre los servicios de TechColCa, no dudes en preguntar. Puedes visitar la página web para más detalles: [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-27 23:17:42.59668
17	6	Dime los beneficios de AIPI	user	2025-03-27 23:22:16.655023
18	6	Lo siento, pero no tengo información específica sobre "AIPI" en el contenido de la página actual del sitio web de TechColCa. Si está refiriéndose a algún otro servicio o producto específico, por favor proporcióneme más detalles para poder ayudarlo mejor.\n\nPara más información sobre TechColCa y sus servicios, puede visitar su página web: [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-27 23:22:18.25632
19	7	Dime los beneficios de AIPI	user	2025-03-27 23:29:25.538143
20	7	Los beneficios de AIPI incluyen:\n\n1. **Mejora de la eficiencia**: Al reducir los tiempos de respuesta y optimizar tareas repetitivas.\n2. **Ahorro de costos**: Minimiza la necesidad de asistencia humana en consultas comunes.\n3. **Disponibilidad total**: Funciona las 24 horas del día, los 7 días de la semana.\n4. **Experiencia personalizada**: Se adapta a las necesidades y preferencias del usuario.\n5. **Fácil integración**: Compatible con múltiples plataformas y herramientas digitales.\n\nEstos beneficios están diseñados para mejorar la productividad, optimizar la comunicación y proporcionar respuestas inteligentes y personalizadas.\n\nFuente: Documento AIPI.docx proporcionado.	assistant	2025-03-27 23:29:27.287599
21	7	dime los servicios que ofrece techcolca	user	2025-03-27 23:29:46.199674
22	7	TechColCa ofrece los siguientes servicios:\n\n1. **Consultoría en tecnologías de la información**: Son una empresa establecida desde 2022 en este ámbito.\n2. **Aplicaciones con inteligencia artificial**: Ofrecen aplicaciones listas para usar que pueden ser adaptadas a necesidades específicas.\n3. **Diseño Web**: Proporcionan servicios de diseño web de vanguardia para mejorar la presencia en línea de sus clientes.\n\nAdemás, proponen planes de acompañamiento personalizados para los profesionales formados en su programa, permitiéndoles trabajar directamente con la empresa.\n\nPara más información, puedes visitar su página web: [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-27 23:29:48.414192
23	7	dime los casos de uso	user	2025-03-27 23:30:45.675691
24	7	Los casos de uso de AIPI, el Asistente Inteligente Potenciado por IA, incluyen:\n\n1. **Empresas**: Utilizan AIPI para la atención al cliente, automatización de procesos y mejora de la experiencia del usuario.\n2. **Usuarios individuales**: AIPI puede asistir en tareas personales, proporcionando respuestas personalizadas y optimizando la productividad.\n\nEste asistente es versátil y se adapta a las necesidades tanto de empresas como de usuarios individuales, ofreciendo una amplia gama de aplicaciones en diferentes contextos.\n\nFuente: Documento AIPI.docx proporcionado.	assistant	2025-03-27 23:30:47.806933
25	15	hola	user	2025-03-28 14:47:50.363088
26	15	¡Hola! ¿En qué puedo ayudarte hoy? Si tienes alguna pregunta sobre la página de TechColCa o sus servicios, estaré encantado de responderte. Puedes encontrar más información en [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-28 14:47:55.580158
27	16	Hola como estas?	user	2025-03-28 16:28:30.252812
28	16	¡Hola! Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy? Si tienes preguntas sobre el sitio web de TechColCa o cualquier otro tema relacionado, no dudes en preguntar. Aquí tienes el enlace para más información sobre TechColCa: [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-28 16:28:31.982854
29	16	dime la sventaas de AIPI	user	2025-03-28 16:28:56.153326
30	16	Las ventajas de AIPI, el Asistente Inteligente Potenciado por IA, incluyen:\n\n1. **Mejora de la eficiencia**: Reduce tiempos de respuesta y optimiza tareas repetitivas.\n2. **Ahorro de costos**: Minimiza la necesidad de asistencia humana en consultas comunes.\n3. **Disponibilidad total**: Funciona las 24 horas del día, los 7 días de la semana.\n4. **Experiencia personalizada**: Se adapta a las necesidades y preferencias del usuario.\n5. **Fácil integración**: Compatible con múltiples plataformas y herramientas digitales.\n\nPara más información sobre AIPI, puedes consultar el documento que contiene su descripción y características.	assistant	2025-03-28 16:28:57.800914
31	16	dime los servicios de techcolca	user	2025-03-28 16:29:12.068565
34	16	TechColCa ofrece varios cursos diseñados para transformar tu futuro y optimizar tus oportunidades en Canadá. Algunos de los planes disponibles son:\n\n1. **BFF (Meilleurs amis pour toujours avec l'IA)**: Por $42 USD al mes, enfocado en mejorar tu dominio del francés y abrir oportunidades de empleo en Canadá.\n   \n2. **Forfait YOLO (On ne vit qu'une fois avec l'IA)**: Por $87 USD al mes, incluye servicios como la creación de CV y preparación para entrevistas, ofreciendo un pase hacia el éxito profesional en Canadá.\n\n3. **OMG (Oh mon Dieu ! - avec IA)**: Por $107 USD al mes, te permite adquirir experiencia canadiense certificada en francés, mejorando así tu perfil profesional.\n\nPara más información sobre estos cursos, puedes visitar su página web: [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-28 16:29:23.712853
32	16	TechColCa ofrece una variedad de servicios centrados en la tecnología de la información, que incluyen:\n\n1. **Aplicaciones con Inteligencia Artificial**: Ofrecen aplicaciones listas para usar que pueden adaptarse a necesidades específicas.\n2. **Diseño Web**: Proporcionan diseño web de vanguardia para mejorar la presencia en línea de las empresas.\n\nAdemás, TechColCa ofrece planes de acompañamiento personalizados para profesionales formados en su programa, permitiéndoles trabajar directamente con la empresa.\n\nSi deseas más detalles sobre estos servicios, puedes visitar su página web: [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-28 16:29:15.118247
33	16	que cursos puedo hacer	user	2025-03-28 16:29:20.063063
35	17	¿Qué servicios ofrece AIPI?	user	2025-03-28 18:48:31.83546
36	17	AIPI ofrece una variedad de servicios que incluyen:\n\n1. **Asistente Virtual Inteligente**: Responde preguntas en tiempo real con información precisa, aprende del usuario y adapta sus respuestas con el tiempo, y es compatible con múltiples idiomas (Inglés, Francés, Español).\n\n2. **Atención al Cliente 24/7**: Responde consultas frecuentes sin intervención humana, escala problemas complejos a agentes humanos y personaliza respuestas según la empresa o usuario.\n\n3. **Análisis y Reportes Inteligentes**: Permite el seguimiento de interacciones con usuarios, el análisis de tendencias y patrones de conversación, y ofrece sugerencias para mejorar la atención y experiencia del usuario.\n\n4. **Integraciones y Personalización**: El administrador puede generar un código HTML que se integra en el sitio, y personalizar opciones según la identidad de la marca, incluyendo colores y logo, así como configurar flujos de conversación adaptados a cada necesidad de la empresa.\n\nEstos servicios están diseñados para mejorar la eficiencia, reducir costos, garantizar disponibilidad total, ofrecer una experiencia personalizada y facilitar la integración con múltiples plataformas y herramientas digitales.\n\nFuente: Documento AIPI.docx cargado.	assistant	2025-03-28 18:48:36.531013
37	19	hola	user	2025-03-28 18:53:44.106292
38	19	¡Hola! ¿En qué puedo ayudarte hoy? Si tienes alguna pregunta sobre el sitio web de TechColCa o sus servicios, estaré encantado de asistirte. Aquí tienes el enlace al sitio web por si lo necesitas: [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-28 18:53:48.028112
39	19	dime las ventajas de AIPI	user	2025-03-28 18:54:11.440472
40	19	AIPI ofrece varias ventajas significativas, incluyendo:\n\n1. **Mejora la eficiencia**: Reduce tiempos de respuesta y optimiza tareas repetitivas.\n2. **Ahorro de costos**: Minimiza la necesidad de asistencia humana en consultas comunes.\n3. **Disponibilidad total**: Funciona las 24 horas del día, los 7 días de la semana.\n4. **Experiencia personalizada**: Se adapta a las necesidades y preferencias del usuario.\n5. **Fácil integración**: Compatible con múltiples plataformas y herramientas digitales.\n\nEstas características hacen de AIPI una herramienta poderosa para mejorar la productividad y optimizar la comunicación en empresas y con usuarios individuales. \n\nFuente: Documento AIPI.docx.	assistant	2025-03-28 18:54:13.596733
41	19	dime los cursos que ofrecen	user	2025-03-28 18:54:24.658524
42	19	En el sitio web de TechColCa, se ofrecen varios planes que incluyen cursos y servicios diseñados para ayudar a los profesionales a optimizar su futuro en Canadá. Algunos de los planes destacados son:\n\n1. **BFF (Meilleurs amis pour toujours avec l'IA)**: Transforme su futuro con la maestría del francés y oportunidades de empleo en Canadá. Precio: 42 $ USD por mes.\n\n2. **Forfait YOLO (On ne vit qu'une fois avec l'IA)**: Incluye servicios como CV y preparación para entrevistas. Es un pase exclusivo para el éxito profesional en Canadá. Precio: 87 $ USD por mes.\n\n3. **OMG (Oh mon Dieu ! - avec IA)**: Ofrece la oportunidad de adquirir experiencia canadiense certificada en francés, mejorando así su perfil profesional. Precio: 107 $ USD por mes.\n\nEstos planes están diseñados para proporcionar acompañamiento personalizado y mejorar las oportunidades laborales en Canadá. Para más información, puedes visitar el sitio web: [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-28 18:54:29.375225
43	22	Hola	user	2025-03-28 19:12:58.067559
44	22	¡Hola! ¿En qué puedo ayudarte hoy? Si tienes alguna pregunta sobre el sitio de TechColCa o cualquier otra consulta, estaré encantado de asistirte. Puedes visitar el sitio web aquí: [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-28 19:13:00.278871
45	23	hi	user	2025-03-28 19:20:43.944104
46	23	¡Hola! ¿En qué puedo ayudarte hoy? Si tienes preguntas sobre cómo explorar oportunidades laborales en Canadá con TechColCa, no dudes en preguntar. Puedes encontrar más información en su página web: [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-28 19:20:45.453079
47	23	ca va bien et vous	user	2025-03-28 19:20:57.356628
48	23	Je suis une intelligence artificielle, donc je n'ai pas d'émotions, mais je suis là pour vous aider. Comment puis-je vous assister aujourd'hui ? Si vous avez des questions sur TechColCa et leurs services, n'hésitez pas à les poser. Vous pouvez également visiter leur site pour plus d'informations : [TechColCa](https://techcolca.ca/francais/).	assistant	2025-03-28 19:20:59.123425
49	25	hablame de los producto de aipi	user	2025-03-28 19:33:48.902612
50	25	AIPI es una aplicación web basada en inteligencia artificial que ofrece varias características para mejorar la productividad y optimizar la comunicación. Sus principales productos incluyen:\n\n1. **Asistente Virtual Inteligente**: Responde preguntas en tiempo real con información precisa, aprende del usuario y adapta sus respuestas con el tiempo. Es compatible con múltiples idiomas, incluyendo inglés, francés y español.\n\n2. **Atención al Cliente 24/7**: Responde consultas frecuentes sin intervención humana y escala problemas complejos a agentes humanos. Personaliza las respuestas según la empresa o usuario.\n\n3. **Análisis y Reportes Inteligentes**: Realiza seguimiento de interacciones con usuarios, analiza tendencias y patrones de conversación, y sugiere mejoras para la atención y experiencia del usuario.\n\n4. **Integraciones y Personalización**: Permite al administrador generar un código HTML para integrar el asistente en el sitio web, y ofrece opciones de personalización según la identidad de la marca, como colores y logo.\n\nEstos productos están diseñados para mejorar la eficiencia, reducir costos, ofrecer disponibilidad total y proporcionar una experiencia personalizada al usuario. \n\nFuente: AIPI.docx	assistant	2025-03-28 19:33:52.116022
51	28	Hola	user	2025-03-28 19:42:14.854454
52	28	¡Hola! Soy AIPI, tu asistente de inteligencia artificial. ¿En qué puedo ayudarte hoy?	assistant	2025-03-28 19:42:15.543512
53	28	podrias hablarme de aipi	user	2025-03-28 19:42:32.07369
54	28	Claro, AIPI es una plataforma de asistencia conversacional impulsada por inteligencia artificial diseñada para mejorar tu sitio web con asistencia en tiempo real, automatización de tareas e interacciones personalizadas con los usuarios. Algunas de sus características destacadas incluyen:\n\n- **Conversational AI**: Permite interacciones en lenguaje natural que comprenden el contexto y la intención del usuario.\n- **Task Automation**: Automatiza tareas repetitivas y optimiza flujos de trabajo con la ayuda de la inteligencia artificial.\n- **Easy Integration**: Se integra fácilmente en tu sitio web con una sola línea de código, sin necesidad de configuraciones complejas.\n- **Analytics**: Ofrece potentes análisis sobre las conversaciones, la satisfacción del usuario y las métricas de compromiso.\n\nAIPI está diseñado para transformar la experiencia del usuario en tu sitio web y aumentar el compromiso. Si deseas más información o una demostración, puedes comenzar de forma gratuita o programar una demo.	assistant	2025-03-28 19:42:34.498226
55	26	hi	user	2025-03-28 19:42:51.533517
56	26	Hello! How can I assist you today with information about AIPI, the AI-powered conversational assistant?	assistant	2025-03-28 19:42:52.304803
57	32	Hola como estas?	user	2025-04-01 14:43:18.71818
58	32	¡Hola! Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?	assistant	2025-04-01 14:43:19.775256
59	32	¿Qué servicios ofrece AIPI?	user	2025-04-01 14:43:29.50905
60	32	No tengo información específica sobre los servicios que ofrece AIPI en el contexto proporcionado. Sin embargo, en general, AIPI es una aplicación web basada en inteligencia artificial que puede ofrecer interacciones conversacionales avanzadas, automatización de tareas y asistencia en tiempo real. Si necesitas información específica sobre AIPI, sería mejor consultar el documento correspondiente o el sitio web donde se detalla su funcionamiento.	assistant	2025-04-01 14:43:31.622072
61	32	Explica cómo funciona el análisis de contenido	user	2025-04-01 14:51:38.432744
62	32	No tengo información específica sobre el análisis de contenido en el contexto proporcionado. Sin embargo, en términos generales, el análisis de contenido implica examinar y evaluar el contenido de un texto o conjunto de datos para identificar patrones, temas y tendencias. Esto puede incluir la clasificación de información, la extracción de datos relevantes y la interpretación de significados.\n\nSi necesitas detalles específicos sobre el análisis de contenido relacionado con AIPI o TechColCa, no tengo esa información disponible.	assistant	2025-04-01 14:51:40.625745
63	35	Explica cómo funciona el análisis de contenido	user	2025-04-08 11:30:58.281706
64	35	Lo siento, no tengo información específica sobre el análisis de contenido en el contexto proporcionado. Sin embargo, en general, el análisis de contenido es una técnica de investigación utilizada para interpretar y cuantificar la información contenida en documentos, medios o interacciones. Se utiliza comúnmente en estudios de comunicación, marketing y ciencias sociales para identificar patrones, tendencias y significados en los datos. \n\nSi necesitas información más específica sobre el análisis de contenido, te recomendaría buscar en fuentes especializadas en investigación o análisis de datos.	assistant	2025-04-08 11:31:00.695566
65	38	¿Qué servicios ofrece AIPI?	user	2025-04-09 18:30:48.579626
66	38	No tengo información específica sobre los servicios que ofrece AIPI. Sin embargo, de acuerdo con el contexto proporcionado, AIPI es un asistente inteligente basado en inteligencia artificial que ofrece interacciones conversacionales avanzadas, automatización de tareas y asistencia en tiempo real. Si deseas más detalles sobre AIPI, te recomendaría consultar la documentación específica o el sitio web correspondiente.	assistant	2025-04-09 18:30:50.881476
67	39	¿Qué servicios ofrece AIPI?	user	2025-04-09 18:42:38.685041
68	39	No tengo información específica sobre los servicios que ofrece AIPI en el contexto proporcionado. Sin embargo, en general, AIPI es una aplicación web basada en inteligencia artificial que ofrece interacciones conversacionales avanzadas, automatización de tareas y asistencia en tiempo real, diseñada para mejorar la productividad y optimizar la comunicación. Para obtener detalles específicos sobre los servicios, sería necesario consultar la documentación o el sitio web correspondiente.	assistant	2025-04-09 18:42:40.516212
69	40	¿Qué servicios ofrece AIPI?	user	2025-04-09 18:44:56.79379
70	40	No tengo información específica sobre los servicios que ofrece AIPI. Sin embargo, en general, AIPI es una aplicación web basada en inteligencia artificial que proporciona interacciones conversacionales, automatización de tareas y asistencia en tiempo real. Si necesitas información específica sobre AIPI, te recomendaría consultar directamente su documentación o sitio web. \n\nSi te refieres a los servicios de TechColCa, ellos ofrecen desarrollo de aplicaciones personalizadas, diseño web y asesoramiento para viajar y trabajar legalmente en Canadá. \n\nPara más detalles sobre los servicios de TechColCa, puedes visitar su página: [TechColCa](https://techcolca.ca/service/).	assistant	2025-04-09 18:44:59.390103
71	40	Explica cómo funciona el análisis de contenido	user	2025-04-09 18:45:35.137925
72	40	No tengo información específica sobre cómo funciona el análisis de contenido en el contexto proporcionado. Sin embargo, el análisis de contenido generalmente implica examinar y evaluar la información presentada en un texto o conjunto de datos para identificar patrones, tendencias y significados. Este proceso puede incluir la codificación de datos, la identificación de temas recurrentes y la interpretación de los resultados.\n\nSi necesitas información más detallada sobre el análisis de contenido en un contexto específico, te recomendaría buscar fuentes adicionales o documentación especializada.	assistant	2025-04-09 18:45:36.922809
73	41	¿Qué servicios ofrece AIPI?	user	2025-04-09 23:56:26.506345
74	41	AIPI ofrece varios servicios relacionados con la inteligencia artificial, incluyendo:\n\n1. **Asistente Virtual Inteligente**: Responde preguntas en tiempo real con información precisa y se adapta a las necesidades del usuario.\n2. **Atención al Cliente 24/7**: Responde consultas frecuentes sin intervención humana y escala problemas complejos a agentes humanos.\n3. **Análisis y Reportes Inteligentes**: Permite el seguimiento de interacciones con usuarios y análisis de tendencias.\n4. **Integraciones y Personalización**: Ofrece opciones de personalización según la identidad de la marca y permite configurar flujos de conversación adaptados a cada necesidad de la empresa.\n\nEstos servicios están diseñados para mejorar la productividad, optimizar la comunicación y proporcionar respuestas personalizadas. \n\nPara más información, puedes consultar el documento AIPI.docx.	assistant	2025-04-09 23:56:31.762356
75	41	¿Cuáles son las ventajas de usar inteligencia artificial?	user	2025-04-09 23:56:44.005463
76	41	Las ventajas de usar inteligencia artificial incluyen:\n\n1. **Mejora de la eficiencia**: Reduce los tiempos de respuesta y optimiza tareas repetitivas.\n2. **Ahorro de costos**: Minimiza la necesidad de asistencia humana en consultas comunes.\n3. **Disponibilidad total**: Funciona las 24 horas del día, los 7 días de la semana.\n4. **Experiencia personalizada**: Se adapta a las necesidades y preferencias del usuario.\n5. **Fácil integración**: Compatible con múltiples plataformas y herramientas digitales.\n\nEstas ventajas permiten a las empresas mejorar su atención al cliente y optimizar sus procesos operativos. \n\nPara más detalles, puedes consultar el documento AIPI.docx.	assistant	2025-04-09 23:56:46.927966
77	41	¿Qué tipos de documentos puedo subir para entrenar al chatbot?	user	2025-04-09 23:56:56.297746
78	41	No tengo información específica sobre los tipos de documentos que puedes subir para entrenar al chatbot en el contexto proporcionado. Sin embargo, generalmente, los documentos que se utilizan para entrenar chatbots suelen incluir preguntas frecuentes, manuales de usuario, guías de productos y cualquier otro material que contenga información relevante que se desee que el chatbot pueda manejar.\n\nSi necesitas información más específica, te recomendaría consultar directamente con el soporte técnico del servicio de chatbot que estés utilizando.	assistant	2025-04-09 23:56:58.582214
79	43	¿Qué servicios ofrece AIPI?	user	2025-04-10 00:01:21.557189
80	43	AIPI, según el documento proporcionado, ofrece los siguientes servicios:\n\n1. **Asistente Virtual Inteligente**: Responde preguntas en tiempo real con información precisa y se adapta a las necesidades del usuario.\n2. **Atención al Cliente 24/7**: Proporciona respuestas a consultas frecuentes y puede escalar problemas complejos a agentes humanos.\n3. **Análisis y Reportes Inteligentes**: Realiza seguimiento de interacciones y analiza tendencias para mejorar la atención al cliente.\n4. **Integraciones y Personalización**: Permite personalizar la experiencia según la identidad de la marca y configurar flujos de conversación adaptados a cada necesidad.\n\nEstos servicios están diseñados para mejorar la productividad y optimizar la comunicación en empresas y con usuarios individuales. \n\nPara más información, puedes consultar el documento de AIPI.	assistant	2025-04-10 00:01:25.473989
81	43	Como puedo instalar AIPI	user	2025-04-10 00:01:37.643389
82	43	La información específica sobre la instalación de AIPI no está disponible en el contexto proporcionado. Sin embargo, generalmente, para instalar un asistente virtual o aplicación web, se requeriría generar un código HTML que se integre en el sitio web donde se desea implementar el asistente. \n\nAdemás, es posible que se necesiten configuraciones adicionales para personalizar la experiencia según las necesidades de la empresa. Te recomendaría consultar con el proveedor del servicio o la documentación técnica específica para obtener instrucciones detalladas sobre la instalación.\n\nSi necesitas más detalles sobre AIPI, no dudes en preguntar.	assistant	2025-04-10 00:01:40.464635
83	44	¿Qué servicios ofrece AIPI?	user	2025-04-10 16:00:59.216447
84	44	AIPI es un asistente inteligente potenciado por IA que ofrece los siguientes servicios:\n\n1. **Asistente Virtual Inteligente**: Responde preguntas en tiempo real con información precisa y se adapta a las necesidades del usuario.\n2. **Atención al Cliente 24/7**: Responde consultas frecuentes sin necesidad de intervención humana y puede escalar problemas complejos a agentes humanos.\n3. **Análisis y Reportes Inteligentes**: Realiza seguimiento de interacciones y análisis de tendencias para mejorar la atención al usuario.\n4. **Integraciones y Personalización**: Permite personalizar flujos de conversación y se integra fácilmente en plataformas digitales.\n\nEstos servicios están diseñados para mejorar la productividad y optimizar la comunicación. \n\nPara más información, puedes visitar el documento que describe a AIPI: [AIPI.docx](AIPI.docx).	assistant	2025-04-10 16:01:03.735486
85	44	Explica cómo funciona el análisis de contenido	user	2025-04-10 16:01:10.939729
86	44	Lo siento, pero no tengo información específica sobre el análisis de contenido en el contexto proporcionado. Sin embargo, en general, el análisis de contenido implica examinar y evaluar textos, imágenes o cualquier tipo de información para extraer patrones, tendencias o insights que pueden ser útiles para la toma de decisiones. Si necesitas información más específica, te recomendaría buscar fuentes adicionales o contextos relacionados.	assistant	2025-04-10 16:01:13.239588
87	44	¿Qué tipos de documentos puedo subir para entrenar al chatbot?	user	2025-04-10 16:39:53.810701
88	44	Lo siento, pero no tengo información específica sobre los tipos de documentos que puedes subir para entrenar al chatbot en el contexto proporcionado. Generalmente, los chatbots pueden ser entrenados con documentos que contengan preguntas y respuestas, manuales de usuario, bases de datos de conocimiento o cualquier contenido relevante que ayude a mejorar su capacidad de respuesta. Si necesitas información más detallada, te sugiero consultar fuentes adicionales o documentación específica relacionada con el entrenamiento de chatbots.	assistant	2025-04-10 16:39:56.534696
89	44	Explica cómo funciona el análisis de contenido	user	2025-04-10 16:40:06.878521
90	44	Lo siento, pero no tengo información específica sobre el análisis de contenido en el contexto proporcionado. Sin embargo, en términos generales, el análisis de contenido implica la evaluación sistemática de documentos, textos o medios para identificar patrones, temas y significados. Este proceso puede incluir la codificación de datos, la identificación de tendencias y la interpretación de resultados para obtener insights que pueden ser útiles en diversas aplicaciones, como la investigación de mercado, la comunicación y el desarrollo de estrategias. Para detalles más específicos, sería recomendable consultar fuentes adicionales.	assistant	2025-04-10 16:40:09.290249
91	44	servicios de techcolca	user	2025-04-10 16:40:53.317673
92	44	TechColCa ofrece los siguientes servicios:\n\n1. **Desarrollo de Aplicaciones Personalizadas**: Ayudan a optimizar la actividad empresarial mediante el desarrollo de aplicaciones móviles adaptadas a las necesidades específicas de cada negocio.\n\n2. **Diseño Web**: Proporcionan servicios de diseño de sitios web para mejorar la presencia en línea de las empresas, asegurando que sean efectivos y centrados en resultados.\n\n3. **Consultoría**: Ofrecen asesoramiento para viajar legalmente y trabajar en Canadá, ayudando a los usuarios a transformar su sueño de vivir y trabajar en el país en una realidad.\n\nEstos servicios están diseñados para ayudar a las empresas y a los individuos a alcanzar sus objetivos en el entorno digital y laboral. \n\nPara más información, puedes visitar el sitio web de TechColCa: [TechColCa](https://techcolca.ca/service/).	assistant	2025-04-10 16:40:58.299949
93	45	Necesito saber sobre los servicios de techcolca	user	2025-04-11 11:29:31.518937
94	45	TechColCa ofrece varios servicios enfocados en ayudar a las empresas y a individuos que desean optimizar su presencia y oportunidades en Canadá. Los principales servicios incluyen:\n\n1. **Desarrollo de Aplicaciones Personalizadas**: Creación de aplicaciones móviles adaptadas a las necesidades específicas de cada negocio, con el objetivo de maximizar su potencial y mejorar la relación con los clientes.\n\n2. **Diseño Web**: Servicios de diseño de sitios web personalizados que ayudan a las empresas a destacar en línea y obtener resultados tangibles.\n\n3. **Consultoría**: Asesoramiento especializado para viajar legalmente y trabajar en Canadá, ayudando a los clientes a transformar su sueño de vivir y trabajar en Canadá en una realidad.\n\nEstos servicios están diseñados para impulsar la actividad empresarial y facilitar la adaptación al mercado canadiense. Para más información, puedes visitar su página web: [TechColCa](https://techcolca.ca/service/).	assistant	2025-04-11 11:29:34.443011
\.


--
-- Data for Name: pricing_plans; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pricing_plans (id, plan_id, name, description, price, price_display, currency, "interval", features, tier, interactions_limit, is_annual, discount, popular, available, created_at, updated_at, stripe_product_id, stripe_price_id) FROM stdin;
1	free	Gratuito	Ideal para comenzar con AIPI	0	$0	cad	month	["20 interacciones por día","Widget flotante (burbuja)","Respuestas de IA básicas","Estadísticas básicas"]	free	20	f	\N	f	t	2025-04-01 15:24:05.054089	2025-04-01 15:24:05.054089	\N	\N
2	basic	Básico	Para sitios web con tráfico moderado	50	$50 CAD	cad	month	["500 interacciones por mes","Widget flotante (burbuja)","Carga de documentos para entrenar a la IA","Estadísticas básicas","Captura de leads"]	basic	500	f	\N	t	t	2025-04-01 15:24:05.116608	2025-04-01 15:24:05.116608	\N	\N
3	professional	Profesional	Para negocios en crecimiento	150	$150 CAD	cad	month	["2,000 interacciones por mes","Widget flotante y pantalla completa","Carga de documentos para entrenar a la IA","Estadísticas detalladas","Captura de leads","Automatización de tareas"]	professional	2000	f	\N	f	t	2025-04-01 15:24:05.160213	2025-04-01 15:24:05.160213	\N	\N
4	enterprise	Empresa	Para negocios de gran escala	500	$500 CAD	cad	month	["Interacciones ilimitadas","Todas las características de Profesional","Personalización de marca","Integración con CRM","Soporte prioritario","API personalizada"]	enterprise	99999	f	\N	f	t	2025-04-01 15:24:05.202703	2025-04-01 15:24:05.202703	\N	\N
5	basic-annual	Básico Anual	Para sitios web con tráfico moderado (Facturación anual)	540	$540 CAD	cad	year	["500 interacciones por mes","Widget flotante (burbuja)","Carga de documentos para entrenar a la IA","Estadísticas básicas","Captura de leads","10% de descuento sobre el precio mensual"]	basic	500	t	10	f	t	2025-04-01 15:24:05.257934	2025-04-01 15:24:05.257934	\N	\N
6	professional-annual	Profesional Anual	Para negocios en crecimiento (Facturación anual)	1530	$1,530 CAD	cad	year	["2,000 interacciones por mes","Widget flotante y pantalla completa","Carga de documentos para entrenar a la IA","Estadísticas detalladas","Captura de leads","Automatización de tareas","15% de descuento sobre el precio mensual"]	professional	2000	t	15	t	t	2025-04-01 15:24:05.300888	2025-04-01 15:24:05.300888	\N	\N
7	enterprise-annual	Empresa Anual	Para negocios de gran escala (Facturación anual)	5100	$5,100 CAD	cad	year	["Interacciones ilimitadas","Todas las características de Profesional","Personalización de marca","Integración con CRM","Soporte prioritario","API personalizada","15% de descuento sobre el precio mensual"]	enterprise	99999	t	15	f	t	2025-04-01 15:24:05.343046	2025-04-01 15:24:05.343046	\N	\N
8	Com	Comienzo	Lito	0	$17 CAD	CAD	month	[]	free	170	f	\N	f	t	2025-04-11 20:01:26.050652	2025-04-11 20:01:26.657	prod_S71pFi8H6dlz2W	price_1RCnlSBXZVMfAIDG5Pct0rS6
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.settings (id, user_id, assistant_name, default_greeting, show_availability, avatar_url, user_bubble_color, assistant_bubble_color, font, conversation_style, knowledge_base, enable_learning, email_notification_address) FROM stdin;
2	3	AIPI Assistant	👋 Hi there! I'm AIPI, your AI assistant. How can I help you today?	t	\N	#3B82F6	#E5E7EB	inter	professional	default	t	\N
1	1	AIPI Assistant	👋 Hi there! I'm AIPI, your AI assistant. How can I help you today?	t	\N	#3B82F6	#E5E7EB	inter	professional	default	t	\N
3	5	AIPI Assistant	👋 Hi there! I'm AIPI, your AI assistant. How can I help you today?	t	\N	#3B82F6	#E5E7EB	inter	professional	default	t	\N
4	4	AIPI Assistant	👋 Hi there! I'm AIPI, your AI assistant. How can I help you today?	t	\N	#3B82F6	#E5E7EB	inter	professional	default	t	\N
\.


--
-- Data for Name: sites_content; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sites_content (id, integration_id, url, title, content, last_updated) FROM stdin;
5	5	https://techcolca.ca/service/	Atrévete a tu aventura canadiense con TechColCa🇨🇦	\n        Título: Atrévete a tu aventura canadiense con TechColCa🇨🇦\n        Descripción: Descubre oportunidades laborales y haz realidad tu sueño en Canadá.¡Optimiza tu futuro hoy mismo! Quebec, Canadá\n        Contenido:\n        NOS SERVICES Applications Boostez votre activité avec notre développement d'applications personnalisées. voir plus Web Design Démarquez-vous en ligne grâce à notre conception de sites Web experte voir plus Consultatif Obtenez des conseils pour voyager légalement et travailler au Canada voir plus Consultatif Applications personnalisées amélioré Boostez votre activité avec notre développement d’applications personnalisées. acheter maintenant Technologie Techcolca Développement d'applications Boostez votre activité avec nos applications personnalisées et efficaces. Atteindre un autre niveau Réussissez avec notre expertise pour votre entreprise! réussir avec votre entreprise Atteignez un autre niveau avec l’aide de nos experts. Obtenir des résultats Transformez votre vision en réalité avec notre application mobile personnalisée Maximisez votre potentiel avec une application mobile adaptée à votre entreprise Faites rayonner votre marque avec une application mobile unique et personnalisée. Boostez votre business avec une application mobile qui garantit des résultats tangibles. Transformez votre idée en une expérience mobile réussie et rentable. Tirez le meilleur parti de votre présence numérique avec une application mobile sur mesure. Débloquez le succès de votre entreprise avec une application mobile qui s'adapte à vos besoins. Construisez des relations solides avec vos clients grâce à une application mobile personnalisée. Faites une nouvelle étape vers le succès avec une application mobile conçue exclusivement pour vous. Rendez votre marque accessible partout et à tout moment grâce à notre application mobile personnalisée. Web Design personnalisées amélioré Démarquez-vous en ligne grâce à notre conception de sites Web experte acheter maintenant Technologie Techcolca Web Design Démarquez-vous en ligne grâce à notre conception de sites Web experte Atteindre un autre niveau Réussissez avec notre expertise pour votre entreprise! réussir avec votre entreprise Atteignez un autre niveau avec l’aide de nos experts. Obtenir des résultats Libérez le potentiel de votre entreprise avec un site Web personnalisé qui garantit des résultats. Faites briller votre présence en ligne avec un site Web personnalisé et axé sur les résultats. Obtenez des résultats exceptionnels avec un site Web personnalisé pour votre entreprise. Boostez votre présence numérique avec un site Internet conçu pour obtenir des résultats tangibles. Transformez votre vision en réalité avec un site Web qui assure le succès de votre entreprise. Conquérir le marché en ligne avec un site Web personnalisé qui génère de vrais résultats. Maximisez votre visibilité en ligne et atteignez vos objectifs avec un site Web personnalisé. Libérez tout le potentiel de votre activité en ligne avec un site Web personnalisé. Construisez une forte présence en ligne et réussissez avec un site Web personnalisé. Différenciez-vous de la concurrence avec un site Internet conçu pour obtenir des résultats exceptionnels. Consultatif personnalisées amélioré Obtenez des conseils pour voyager légalement et travailler au Canada acheter maintenant Technologie Techcolca Consultatif Obtenez des conseils pour voyager légalement et travailler au Canada Atteindre un autre niveau Réussissez avec notre expertise pour votre entreprise! réussir avec votre entreprise Atteignez un autre niveau avec l’aide de nos experts. Obtenir des résultats Découvrez comment voyager légalement au Canada et trouver un emploi grâce à nos conseils spécialisés. Avec notre cabinet-conseil, voyager et travailler au Canada est plus qu'une possibilité, c'est une réalité ! Transformez votre rêve de vivre et de travailler au Canada en une expérience sans tracas grâce à nos conseils. Obtenez les meilleurs conseils et assistance pour voyager légalement et trouver du travail au Canada. Faites de votre projet de vie au Canada une réalité grâce à nos conseils experts en immigration et en emploi. Ouvrez les portes de nouvelles opportunités au Canada grâce à nos conseils complets pour voyager et travailler légalement. Préparez votre aventure au Canada avec notre guide spécialisé dans les voyages et l'emploi à l'étranger. Assurez votre avenir au Canada grâce à nos conseils professionnels en matière de migration et de recherche d'emploi. Transformez votre désir de vivre au Canada en réalité grâce à nos conseils experts et personnalisés. Voyager et travailler au Canada est plus accessible que vous ne l'imaginez avec nos conseils à vos côtés. augmenter\n      	2025-04-09 18:43:06.768676
6	5	https://techcolca.ca/contact/	Contact -	\n        Título: Contact -\n        Descripción: \n        Contenido:\n        Contact Vous avez des doutes ? écrivez-nous Nous sommes très intéressés par vos commentaires et vous répondrons bientôt. Facebook-f Instagram Youtube Téléphone +1 (581) 305-0812 Mail info@techcolca.ca Por favor, activa JavaScript en tu navegador para completar este formulario.Nom *Mail *Message *Envoyer\n      	2025-04-09 18:43:06.849439
3	6	https://a82260a7-e706-4639-8a5c-db88f2f26167-00-2a8uzldw0vxo4.picard.replit.dev/	AIPI - AI-Powered Conversational Assistant	AI-Powered Conversations for Your WebsiteAIPI is the intelligent conversational platform that enhances your website with real-time AI assistance, task automation, and personalized user interactions.Get StartedWatch Demo👋 Hi there! I'm AIPI, your AI assistant. How can I help you today?Powerful FeaturesEverything you need to enhance your website with intelligent conversationsConversational AINatural language interactions that understand context and user intent.Task AutomationAutomate repetitive tasks and streamline workflows with AI assistance.Easy IntegrationSimple website integration with a single line of code. No complex setup required.AnalyticsPowerful insights into conversations, user satisfaction, and engagement metrics.Ready to transform your website?Join thousands of businesses using AIPI to enhance user experience and boost engagement.Get Started FreeSchedule a Demo	2025-03-28 19:42:51.649
4	5	https://techcolca.ca/	Techcolca2024 - Slider Revolution	\n        Título: Techcolca2024 - Slider Revolution\n        Descripción: Slider Revolution Example\n        Contenido:\n        A votre portée Nous sommes des experts en technologies de l'information, prêts à vous accompagner dans le développement de votre nouveau projet ou à vous fournir les conseils avisés de nos consultants. Qui sommes Technologie Technologie Experts Nous avons l'expérience nécessaire pour vous accompagner dans votre transformation numérique, facilitant ainsi l'efficacité de vos processus au sein de votre entreprise. Nous gérons des projets utilisant des technologies telles que Java, .NET, Adalo, WordPress, Zoho et Squarespace Qui sommes informatique informatique Intelligence Artificielle Nous exploitons l'intelligence artificielle afin de satisfaire rapidement les besoins technologiques de nos clients. Qui sommes Applications Applications stratégique starstarstarstarstar_border Notre mission consiste à être un allié stratégique pour nos clients en utilisant notre expérience et notre esprit d'innovation. Qui sommes allié allié Conception responsable Touchez tout le monde avec une image fraîche et dynamique Qui sommes Site Web Site Web Entreprise responsable et technologique en 2023. 2e PRIX. Chariot (0)\n      	2025-04-09 18:43:06.60407
2	5	https://techcolca.ca/francais/	Atrévete a tu aventura canadiense con TechColCa🇨🇦	\n        Título: Atrévete a tu aventura canadiense con TechColCa🇨🇦\n        Descripción: Descubre oportunidades laborales y haz realidad tu sueño en Canadá.¡Optimiza tu futuro hoy mismo! Quebec, Canadá\n        Contenido:\n        Consultants en technologies de l'information : Depuis 2022, nous sommes devenus une entreprise établie en tant que consultant en technologies de l'information. Voir les cours disponibles Nos services Applications Applications prêtes à l'emploi avec intelligence artificielle Chaque application peut être adaptée à des besoins spécifiques Web Design Boostez votre présence en ligne avec la conception Web de pointe de Techcocla ! Nous sommes une entreprise technologique canadienne de premier plan, offrant des solutions Web de pointe pour dynamiser votre entreprise. Découvrez comment notre expérience et la meilleure technologie peuvent faire passer votre site Web au niveau supérieur. Démarquez-vous dès aujourd'hui avec Techcocla ! Consultatif Atrévete a tu aventura canadiense con TechColCa Descubre oportunidades laborales y haz realidad tu sueño en Canadá. ¡Optimiza tu futuro hoy mismo! Quebec, Canadá services TechColca, une entreprise canadienne récompensée par l'Université Laval comme la deuxième entreprise la plus responsable et technologique en 2023. Écrivez-nous Nous proposons des plans d'accompagnement personnalisés aux professionnels formés dans notre programme, leur permettant de travailer directement avec nous. BFF (Meilleurs amis pour toujours avec l'IA) Prix : 42 $ USD par mois Transformez votre avenir avec la maîtrise du français et des opportunités d'emploi au Canada Plus d'informations Voir tous les cours Forfait YOLO (On ne vit qu'une fois avec l'IA) Prix : 87 $ USD par mois Services : CV + Préparation à un entretien. Découvrez le passeport pour votre réussite professionnelle au Canada avec notre programme exclusif Plus d'informations Voir tous les cours OMG (Oh mon Dieu ! - avec IA) Prix : 107 $ USD par mois Acquérez une expérience canadienne certifiée en français, rehaussant ainsi votre profil professionnel. Plus d'informations Voir tous les cours Osez votre aventure canadienne avec TechColCa Découvrez les opportunités d’emploi et réalisez votre rêve au Canada.Optimisez votre avenir dès aujourd’hui ! Quebec, Canada Éducation: LLs ont une éducation de qualité C'est un pays bilingue: Le français est également l’une des langues officielles du Canada et est parlé par environ 7 millions de personnes. Écrivez-nous Témoignages Jon Lenin@JonLeninPTV Read More J'ai adoré tous les services et cours de Techcocla. En plus d'être des professionnels, j'apprécie le soutien que vous avez à nos côtés. Claudio Morelo@ClaudiaMorelo Read More J'ai adoré tous les services et cours de Techcocla. En plus d'être des professionnels, j'apprécie le soutien que vous avez à nos côtés. Mariena Alviz@MarienaAlviz Read More At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excerit.\n      	2025-04-09 18:43:06.677
7	7	https://techcolca.ca/	Techcolca2024 - Slider Revolution	\n        Título: Techcolca2024 - Slider Revolution\n        Descripción: Slider Revolution Example\n        Contenido:\n        A votre portée Nous sommes des experts en technologies de l'information, prêts à vous accompagner dans le développement de votre nouveau projet ou à vous fournir les conseils avisés de nos consultants. Qui sommes Technologie Technologie Experts Nous avons l'expérience nécessaire pour vous accompagner dans votre transformation numérique, facilitant ainsi l'efficacité de vos processus au sein de votre entreprise. Nous gérons des projets utilisant des technologies telles que Java, .NET, Adalo, WordPress, Zoho et Squarespace Qui sommes informatique informatique Intelligence Artificielle Nous exploitons l'intelligence artificielle afin de satisfaire rapidement les besoins technologiques de nos clients. Qui sommes Applications Applications stratégique starstarstarstarstar_border Notre mission consiste à être un allié stratégique pour nos clients en utilisant notre expérience et notre esprit d'innovation. Qui sommes allié allié Conception responsable Touchez tout le monde avec une image fraîche et dynamique Qui sommes Site Web Site Web Entreprise responsable et technologique en 2023. 2e PRIX. Chariot (0)\n      	2025-04-12 20:46:57.466131
8	7	https://techcolca.ca/francais/	Atrévete a tu aventura canadiense con TechColCa🇨🇦	\n        Título: Atrévete a tu aventura canadiense con TechColCa🇨🇦\n        Descripción: Descubre oportunidades laborales y haz realidad tu sueño en Canadá.¡Optimiza tu futuro hoy mismo! Quebec, Canadá\n        Contenido:\n        Consultants en technologies de l'information : Depuis 2022, nous sommes devenus une entreprise établie en tant que consultant en technologies de l'information. Voir les cours disponibles Nos services Applications Applications prêtes à l'emploi avec intelligence artificielle Chaque application peut être adaptée à des besoins spécifiques Web Design Boostez votre présence en ligne avec la conception Web de pointe de Techcocla ! Nous sommes une entreprise technologique canadienne de premier plan, offrant des solutions Web de pointe pour dynamiser votre entreprise. Découvrez comment notre expérience et la meilleure technologie peuvent faire passer votre site Web au niveau supérieur. Démarquez-vous dès aujourd'hui avec Techcocla ! Consultatif Atrévete a tu aventura canadiense con TechColCa Descubre oportunidades laborales y haz realidad tu sueño en Canadá. ¡Optimiza tu futuro hoy mismo! Quebec, Canadá services TechColca, une entreprise canadienne récompensée par l'Université Laval comme la deuxième entreprise la plus responsable et technologique en 2023. Écrivez-nous Nous proposons des plans d'accompagnement personnalisés aux professionnels formés dans notre programme, leur permettant de travailer directement avec nous. BFF (Meilleurs amis pour toujours avec l'IA) Prix : 42 $ USD par mois Transformez votre avenir avec la maîtrise du français et des opportunités d'emploi au Canada Plus d'informations Voir tous les cours Forfait YOLO (On ne vit qu'une fois avec l'IA) Prix : 87 $ USD par mois Services : CV + Préparation à un entretien. Découvrez le passeport pour votre réussite professionnelle au Canada avec notre programme exclusif Plus d'informations Voir tous les cours OMG (Oh mon Dieu ! - avec IA) Prix : 107 $ USD par mois Acquérez une expérience canadienne certifiée en français, rehaussant ainsi votre profil professionnel. Plus d'informations Voir tous les cours Osez votre aventure canadienne avec TechColCa Découvrez les opportunités d’emploi et réalisez votre rêve au Canada.Optimisez votre avenir dès aujourd’hui ! Quebec, Canada Éducation: LLs ont une éducation de qualité C'est un pays bilingue: Le français est également l’une des langues officielles du Canada et est parlé par environ 7 millions de personnes. Écrivez-nous Témoignages Jon Lenin@JonLeninPTV Read More J'ai adoré tous les services et cours de Techcocla. En plus d'être des professionnels, j'apprécie le soutien que vous avez à nos côtés. Claudio Morelo@ClaudiaMorelo Read More J'ai adoré tous les services et cours de Techcocla. En plus d'être des professionnels, j'apprécie le soutien que vous avez à nos côtés. Mariena Alviz@MarienaAlviz Read More At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excerit.\n      	2025-04-12 20:46:57.554689
9	7	https://techcolca.ca/service/	Atrévete a tu aventura canadiense con TechColCa🇨🇦	\n        Título: Atrévete a tu aventura canadiense con TechColCa🇨🇦\n        Descripción: Descubre oportunidades laborales y haz realidad tu sueño en Canadá.¡Optimiza tu futuro hoy mismo! Quebec, Canadá\n        Contenido:\n        NOS SERVICES Applications Boostez votre activité avec notre développement d'applications personnalisées. voir plus Web Design Démarquez-vous en ligne grâce à notre conception de sites Web experte voir plus Consultatif Obtenez des conseils pour voyager légalement et travailler au Canada voir plus Consultatif Applications personnalisées amélioré Boostez votre activité avec notre développement d’applications personnalisées. acheter maintenant Technologie Techcolca Développement d'applications Boostez votre activité avec nos applications personnalisées et efficaces. Atteindre un autre niveau Réussissez avec notre expertise pour votre entreprise! réussir avec votre entreprise Atteignez un autre niveau avec l’aide de nos experts. Obtenir des résultats Transformez votre vision en réalité avec notre application mobile personnalisée Maximisez votre potentiel avec une application mobile adaptée à votre entreprise Faites rayonner votre marque avec une application mobile unique et personnalisée. Boostez votre business avec une application mobile qui garantit des résultats tangibles. Transformez votre idée en une expérience mobile réussie et rentable. Tirez le meilleur parti de votre présence numérique avec une application mobile sur mesure. Débloquez le succès de votre entreprise avec une application mobile qui s'adapte à vos besoins. Construisez des relations solides avec vos clients grâce à une application mobile personnalisée. Faites une nouvelle étape vers le succès avec une application mobile conçue exclusivement pour vous. Rendez votre marque accessible partout et à tout moment grâce à notre application mobile personnalisée. Web Design personnalisées amélioré Démarquez-vous en ligne grâce à notre conception de sites Web experte acheter maintenant Technologie Techcolca Web Design Démarquez-vous en ligne grâce à notre conception de sites Web experte Atteindre un autre niveau Réussissez avec notre expertise pour votre entreprise! réussir avec votre entreprise Atteignez un autre niveau avec l’aide de nos experts. Obtenir des résultats Libérez le potentiel de votre entreprise avec un site Web personnalisé qui garantit des résultats. Faites briller votre présence en ligne avec un site Web personnalisé et axé sur les résultats. Obtenez des résultats exceptionnels avec un site Web personnalisé pour votre entreprise. Boostez votre présence numérique avec un site Internet conçu pour obtenir des résultats tangibles. Transformez votre vision en réalité avec un site Web qui assure le succès de votre entreprise. Conquérir le marché en ligne avec un site Web personnalisé qui génère de vrais résultats. Maximisez votre visibilité en ligne et atteignez vos objectifs avec un site Web personnalisé. Libérez tout le potentiel de votre activité en ligne avec un site Web personnalisé. Construisez une forte présence en ligne et réussissez avec un site Web personnalisé. Différenciez-vous de la concurrence avec un site Internet conçu pour obtenir des résultats exceptionnels. Consultatif personnalisées amélioré Obtenez des conseils pour voyager légalement et travailler au Canada acheter maintenant Technologie Techcolca Consultatif Obtenez des conseils pour voyager légalement et travailler au Canada Atteindre un autre niveau Réussissez avec notre expertise pour votre entreprise! réussir avec votre entreprise Atteignez un autre niveau avec l’aide de nos experts. Obtenir des résultats Découvrez comment voyager légalement au Canada et trouver un emploi grâce à nos conseils spécialisés. Avec notre cabinet-conseil, voyager et travailler au Canada est plus qu'une possibilité, c'est une réalité ! Transformez votre rêve de vivre et de travailler au Canada en une expérience sans tracas grâce à nos conseils. Obtenez les meilleurs conseils et assistance pour voyager légalement et trouver du travail au Canada. Faites de votre projet de vie au Canada une réalité grâce à nos conseils experts en immigration et en emploi. Ouvrez les portes de nouvelles opportunités au Canada grâce à nos conseils complets pour voyager et travailler légalement. Préparez votre aventure au Canada avec notre guide spécialisé dans les voyages et l'emploi à l'étranger. Assurez votre avenir au Canada grâce à nos conseils professionnels en matière de migration et de recherche d'emploi. Transformez votre désir de vivre au Canada en réalité grâce à nos conseils experts et personnalisés. Voyager et travailler au Canada est plus accessible que vous ne l'imaginez avec nos conseils à vos côtés. augmenter\n      	2025-04-12 20:46:57.646756
10	7	https://techcolca.ca/contact/	Contact -	\n        Título: Contact -\n        Descripción: \n        Contenido:\n        Contact Vous avez des doutes ? écrivez-nous Nous sommes très intéressés par vos commentaires et vous répondrons bientôt. Facebook-f Instagram Youtube Téléphone +1 (581) 305-0812 Mail info@techcolca.ca Por favor, activa JavaScript en tu navegador para completar este formulario.Nom *Mail *Message *Envoyer\n      	2025-04-12 20:46:57.727618
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.subscriptions (id, user_id, stripe_customer_id, stripe_price_id, stripe_subscription_id, status, tier, interactions_limit, interactions_used, start_date, end_date, created_at, updated_at) FROM stdin;
3	3	carlos_customer	price_basic	sub_carlos_basic	inactive	free	500	0	2025-03-31 00:00:00	2026-03-31 00:00:00	2025-03-31 19:47:15.047848	2025-03-31 20:20:56.431782
4	3	\N	\N	\N	inactive	professional	2000	0	2025-03-31 20:29:37.726388	2025-04-30 20:29:37.714	2025-03-31 20:29:37.726388	2025-03-31 20:29:37.726388
2	1	pablo_customer	price_professional	sub_pablo_professional	inactive	free	0	0	2025-03-31 00:00:00	2026-03-31 00:00:00	2025-03-31 19:47:14.984853	2025-03-31 20:48:42.520875
5	3	\N	\N	\N	active	professional	2000	0	2025-03-31 20:49:26.798138	2025-04-30 20:49:26.786	2025-03-31 20:49:26.798138	2025-03-31 20:49:26.798138
1	4	admin_customer	price_enterprise	sub_admin_enterprise	active	free	0	0	2025-03-31 18:51:12.930823	2035-03-31 18:51:12.921	2025-03-31 18:51:12.930823	2025-04-11 18:22:04.388675
6	6	\N	\N	\N	inactive	free	1	0	2025-04-11 18:37:06.756754	2025-04-12 00:00:00	2025-04-11 18:37:06.756754	2025-04-11 20:07:14.060313
7	6	\N	\N	\N	inactive	basic	500	0	2025-04-11 20:07:44.89554	2025-04-12 00:00:00	2025-04-11 20:07:44.89554	2025-04-11 20:07:44.89554
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, email, full_name, api_key, created_at, stripe_customer_id, stripe_subscription_id) FROM stdin;
3	Carlos	$2b$10$qNPiGm7FnfYAtYI9trf6iuDkgrtzty02/7jKongMJI/roUmY4ThhS	carlosandresromero23@hotmail.com	Carlos Romero	cb0b5766893c0bb85470f25c5b31b588254a361a0447ed00	2025-03-26 21:52:00.826787	\N	\N
5	test3	$2b$10$KX4kAnHqorphW1OlAG2fyOZcOkNQLC85YYvInsaBHNSm2fLemUH96	perc180@hotmail.com	porf	6031e1a012ec6a389a5629be294251421468c36e2b9858e1	2025-03-31 20:50:13.310841	\N	\N
6	test1	$2b$10$09rXw9DgCZ/wBDWrfpm6nehtGTDPFrHNw9qO2DBRDtRjxJfCykhtS	gonzadiel72@gmail.com		aipi_ce6b3c2b332f1fff31ce3bbfa752309c	2025-04-11 18:37:06.723721	\N	\N
4	admin	$2b$10$KlUsv8j4Fzy713W5p4FPdudHq9kKns/jOsesGbXDgGutao/ca3CzC	admin@example.com	Administrador	aipi_a9f796b333f9aff8d2de700554c34c73	2025-03-31 18:51:12.857627	\N	\N
1	Pablo	$2b$10$9eJA8tPa/7b9A5wOSks6E.V4FSU..8QbxhekLHN6kWQEWLOHcJ/Iq	techcolca@gmail.com	Pablo Emilio Rueda Criales	d204415da71970ea19d70badd63195719dc05afef6ffe38e	2025-03-26 19:40:08.854383	\N	\N
\.


--
-- Name: automations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.automations_id_seq', 1, false);


--
-- Name: calendar_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.calendar_tokens_id_seq', 1, false);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.conversations_id_seq', 45, true);


--
-- Name: discount_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.discount_codes_id_seq', 2, true);


--
-- Name: form_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.form_responses_id_seq', 2, true);


--
-- Name: form_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.form_templates_id_seq', 10, true);


--
-- Name: forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.forms_id_seq', 12, true);


--
-- Name: integrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.integrations_id_seq', 7, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.messages_id_seq', 94, true);


--
-- Name: pricing_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pricing_plans_id_seq', 8, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.settings_id_seq', 4, true);


--
-- Name: sites_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sites_content_id_seq', 10, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 7, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: automations automations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_pkey PRIMARY KEY (id);


--
-- Name: calendar_tokens calendar_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.calendar_tokens
    ADD CONSTRAINT calendar_tokens_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: discount_codes discount_codes_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_code_unique UNIQUE (code);


--
-- Name: discount_codes discount_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_pkey PRIMARY KEY (id);


--
-- Name: form_responses form_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT form_responses_pkey PRIMARY KEY (id);


--
-- Name: form_templates form_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.form_templates
    ADD CONSTRAINT form_templates_pkey PRIMARY KEY (id);


--
-- Name: forms forms_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_pkey PRIMARY KEY (id);


--
-- Name: forms forms_slug_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_slug_key UNIQUE (slug);


--
-- Name: integrations integrations_api_key_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_api_key_unique UNIQUE (api_key);


--
-- Name: integrations integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: pricing_plans pricing_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pricing_plans
    ADD CONSTRAINT pricing_plans_pkey PRIMARY KEY (id);


--
-- Name: pricing_plans pricing_plans_plan_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pricing_plans
    ADD CONSTRAINT pricing_plans_plan_id_unique UNIQUE (plan_id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: sites_content sites_content_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sites_content
    ADD CONSTRAINT sites_content_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: users users_api_key_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_api_key_unique UNIQUE (api_key);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: automations automations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: calendar_tokens calendar_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.calendar_tokens
    ADD CONSTRAINT calendar_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_integration_id_integrations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_integration_id_integrations_id_fk FOREIGN KEY (integration_id) REFERENCES public.integrations(id);


--
-- Name: form_responses form_responses_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT form_responses_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: form_templates form_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.form_templates
    ADD CONSTRAINT form_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: forms forms_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: integrations integrations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: messages messages_conversation_id_conversations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: settings settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sites_content sites_content_integration_id_integrations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sites_content
    ADD CONSTRAINT sites_content_integration_id_integrations_id_fk FOREIGN KEY (integration_id) REFERENCES public.integrations(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

