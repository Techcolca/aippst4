--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (02a153c)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.widget_users DROP CONSTRAINT IF EXISTS widget_users_integration_id_integrations_id_fk;
ALTER TABLE IF EXISTS ONLY public.widget_tokens DROP CONSTRAINT IF EXISTS widget_tokens_widget_user_id_widget_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.widget_tokens DROP CONSTRAINT IF EXISTS widget_tokens_integration_id_integrations_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_budgets DROP CONSTRAINT IF EXISTS user_budgets_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.usage_tracking DROP CONSTRAINT IF EXISTS usage_tracking_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.usage_tracking DROP CONSTRAINT IF EXISTS usage_tracking_action_type_action_costs_action_type_fk;
ALTER TABLE IF EXISTS ONLY public.usage_tracking DROP CONSTRAINT IF EXISTS usage_tracking_action_cost_id_action_costs_id_fk;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.sites_content DROP CONSTRAINT IF EXISTS sites_content_integration_id_integrations_id_fk;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.sent_alerts DROP CONSTRAINT IF EXISTS sent_alerts_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_conversations_id_fk;
ALTER TABLE IF EXISTS ONLY public.integrations DROP CONSTRAINT IF EXISTS integrations_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.forms DROP CONSTRAINT IF EXISTS forms_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.form_templates DROP CONSTRAINT IF EXISTS form_templates_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.form_responses DROP CONSTRAINT IF EXISTS form_responses_form_id_forms_id_fk;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_integration_id_integrations_id_fk;
ALTER TABLE IF EXISTS ONLY public.calendar_tokens DROP CONSTRAINT IF EXISTS calendar_tokens_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.automations DROP CONSTRAINT IF EXISTS automations_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_integration_id_integrations_id_fk;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_conversation_id_conversations_id_fk;
ALTER TABLE IF EXISTS ONLY public.action_costs DROP CONSTRAINT IF EXISTS action_costs_last_updated_by_users_id_fk;
DROP INDEX IF EXISTS public.widget_tokens_hash_idx;
DROP INDEX IF EXISTS public.usage_user_billing_idx;
DROP INDEX IF EXISTS public.usage_created_at_idx;
DROP INDEX IF EXISTS public.usage_action_type_idx;
DROP INDEX IF EXISTS public.alerts_user_billing_idx;
DROP INDEX IF EXISTS public.alerts_delivery_status_idx;
DROP INDEX IF EXISTS public.alerts_created_at_idx;
ALTER TABLE IF EXISTS ONLY public.widget_users DROP CONSTRAINT IF EXISTS widget_users_pkey;
ALTER TABLE IF EXISTS ONLY public.widget_tokens DROP CONSTRAINT IF EXISTS widget_tokens_token_hash_unique;
ALTER TABLE IF EXISTS ONLY public.widget_tokens DROP CONSTRAINT IF EXISTS widget_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.welcome_messages DROP CONSTRAINT IF EXISTS welcome_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_api_key_unique;
ALTER TABLE IF EXISTS ONLY public.user_budgets DROP CONSTRAINT IF EXISTS user_budgets_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.user_budgets DROP CONSTRAINT IF EXISTS user_budgets_pkey;
ALTER TABLE IF EXISTS ONLY public.usage_tracking DROP CONSTRAINT IF EXISTS usage_tracking_pkey;
ALTER TABLE IF EXISTS ONLY public.widget_tokens DROP CONSTRAINT IF EXISTS unique_widget_user_integration;
ALTER TABLE IF EXISTS ONLY public.widget_users DROP CONSTRAINT IF EXISTS unique_username_per_integration;
ALTER TABLE IF EXISTS ONLY public.widget_users DROP CONSTRAINT IF EXISTS unique_email_per_integration;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.sites_content DROP CONSTRAINT IF EXISTS sites_content_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.sent_alerts DROP CONSTRAINT IF EXISTS sent_alerts_user_id_alert_type_threshold_reached_billing_month_;
ALTER TABLE IF EXISTS ONLY public.sent_alerts DROP CONSTRAINT IF EXISTS sent_alerts_pkey;
ALTER TABLE IF EXISTS ONLY public.promotional_messages DROP CONSTRAINT IF EXISTS promotional_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.pricing_plans DROP CONSTRAINT IF EXISTS pricing_plans_plan_id_unique;
ALTER TABLE IF EXISTS ONLY public.pricing_plans DROP CONSTRAINT IF EXISTS pricing_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.marketing_campaigns DROP CONSTRAINT IF EXISTS marketing_campaigns_pkey;
ALTER TABLE IF EXISTS ONLY public.integrations DROP CONSTRAINT IF EXISTS integrations_pkey;
ALTER TABLE IF EXISTS ONLY public.integrations DROP CONSTRAINT IF EXISTS integrations_api_key_unique;
ALTER TABLE IF EXISTS ONLY public.forms DROP CONSTRAINT IF EXISTS forms_slug_unique;
ALTER TABLE IF EXISTS ONLY public.forms DROP CONSTRAINT IF EXISTS forms_pkey;
ALTER TABLE IF EXISTS ONLY public.form_templates DROP CONSTRAINT IF EXISTS form_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.form_responses DROP CONSTRAINT IF EXISTS form_responses_pkey;
ALTER TABLE IF EXISTS ONLY public.discount_codes DROP CONSTRAINT IF EXISTS discount_codes_pkey;
ALTER TABLE IF EXISTS ONLY public.discount_codes DROP CONSTRAINT IF EXISTS discount_codes_code_unique;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_pkey;
ALTER TABLE IF EXISTS ONLY public.calendar_tokens DROP CONSTRAINT IF EXISTS calendar_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.automations DROP CONSTRAINT IF EXISTS automations_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_pkey;
ALTER TABLE IF EXISTS ONLY public.action_costs DROP CONSTRAINT IF EXISTS action_costs_pkey;
ALTER TABLE IF EXISTS ONLY public.action_costs DROP CONSTRAINT IF EXISTS action_costs_action_type_unique;
ALTER TABLE IF EXISTS public.widget_users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.widget_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.welcome_messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_budgets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.usage_tracking ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.subscriptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sites_content ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sent_alerts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.promotional_messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pricing_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.marketing_campaigns ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.integrations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.forms ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.form_templates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.form_responses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.discount_codes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.conversations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.calendar_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.automations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.appointments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.action_costs ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.widget_users_id_seq;
DROP TABLE IF EXISTS public.widget_users;
DROP SEQUENCE IF EXISTS public.widget_tokens_id_seq;
DROP TABLE IF EXISTS public.widget_tokens;
DROP SEQUENCE IF EXISTS public.welcome_messages_id_seq;
DROP TABLE IF EXISTS public.welcome_messages;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_budgets_id_seq;
DROP TABLE IF EXISTS public.user_budgets;
DROP SEQUENCE IF EXISTS public.usage_tracking_id_seq;
DROP TABLE IF EXISTS public.usage_tracking;
DROP SEQUENCE IF EXISTS public.subscriptions_id_seq;
DROP TABLE IF EXISTS public.subscriptions;
DROP SEQUENCE IF EXISTS public.sites_content_id_seq;
DROP TABLE IF EXISTS public.sites_content;
DROP SEQUENCE IF EXISTS public.settings_id_seq;
DROP TABLE IF EXISTS public.settings;
DROP SEQUENCE IF EXISTS public.sent_alerts_id_seq;
DROP TABLE IF EXISTS public.sent_alerts;
DROP SEQUENCE IF EXISTS public.promotional_messages_id_seq;
DROP TABLE IF EXISTS public.promotional_messages;
DROP SEQUENCE IF EXISTS public.pricing_plans_id_seq;
DROP TABLE IF EXISTS public.pricing_plans;
DROP SEQUENCE IF EXISTS public.messages_id_seq;
DROP TABLE IF EXISTS public.messages;
DROP SEQUENCE IF EXISTS public.marketing_campaigns_id_seq;
DROP TABLE IF EXISTS public.marketing_campaigns;
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
DROP SEQUENCE IF EXISTS public.appointments_id_seq;
DROP TABLE IF EXISTS public.appointments;
DROP SEQUENCE IF EXISTS public.action_costs_id_seq;
DROP TABLE IF EXISTS public.action_costs;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: action_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_costs (
    id integer NOT NULL,
    action_type text NOT NULL,
    base_cost numeric(12,2) NOT NULL,
    markup_percentage integer DEFAULT 30 NOT NULL,
    final_cost numeric(12,2) NOT NULL,
    currency text DEFAULT 'CAD'::text NOT NULL,
    is_active boolean DEFAULT true,
    update_method text DEFAULT 'manual'::text NOT NULL,
    last_updated_by integer,
    ai_justification text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT positive_base_cost CHECK ((base_cost >= (0)::numeric)),
    CONSTRAINT positive_final_cost CHECK ((final_cost >= (0)::numeric)),
    CONSTRAINT valid_markup CHECK (((markup_percentage >= 0) AND (markup_percentage <= 1000)))
);


--
-- Name: action_costs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_costs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_costs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.action_costs_id_seq OWNED BY public.action_costs.id;


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    integration_id integer NOT NULL,
    conversation_id integer,
    visitor_name text NOT NULL,
    visitor_email text NOT NULL,
    purpose text NOT NULL,
    appointment_date date NOT NULL,
    appointment_time time without time zone NOT NULL,
    duration integer DEFAULT 30,
    status text DEFAULT 'pending'::text,
    calendar_event_id text,
    calendar_provider text,
    notes text,
    reminder_sent boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: automations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: automations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.automations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: automations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.automations_id_seq OWNED BY public.automations.id;


--
-- Name: calendar_tokens; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: calendar_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.calendar_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: calendar_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.calendar_tokens_id_seq OWNED BY public.calendar_tokens.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    integration_id integer,
    visitor_id text,
    title text,
    resolved boolean DEFAULT false,
    duration integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    visitor_name text,
    visitor_email text
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: discount_codes; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: discount_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.discount_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: discount_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.discount_codes_id_seq OWNED BY public.discount_codes.id;


--
-- Name: form_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_responses (
    id integer NOT NULL,
    form_id integer,
    data json NOT NULL,
    metadata json,
    submitted_at timestamp without time zone DEFAULT now()
);


--
-- Name: form_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.form_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.form_responses_id_seq OWNED BY public.form_responses.id;


--
-- Name: form_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_templates (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    thumbnail text,
    structure json NOT NULL,
    styling json,
    settings json,
    is_default boolean DEFAULT false,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: form_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.form_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.form_templates_id_seq OWNED BY public.form_templates.id;


--
-- Name: forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forms (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    description text,
    slug text NOT NULL,
    type text DEFAULT 'standard'::text,
    published boolean DEFAULT false,
    structure json NOT NULL,
    styling json,
    settings json,
    language text DEFAULT 'es'::text,
    response_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: forms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forms_id_seq OWNED BY public.forms.id;


--
-- Name: integrations; Type: TABLE; Schema: public; Owner: -
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
    ignored_sections json DEFAULT '[]'::json,
    description text,
    ignored_sections_text text,
    customization json,
    language text DEFAULT 'es'::text,
    text_color text DEFAULT 'auto'::text
);


--
-- Name: integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.integrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: integrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.integrations_id_seq OWNED BY public.integrations.id;


--
-- Name: marketing_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_campaigns (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    max_subscribers integer NOT NULL,
    current_subscribers integer DEFAULT 0,
    start_date timestamp without time zone DEFAULT now(),
    end_date timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: marketing_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.marketing_campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: marketing_campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.marketing_campaigns_id_seq OWNED BY public.marketing_campaigns.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer,
    content text NOT NULL,
    role text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now()
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: pricing_plans; Type: TABLE; Schema: public; Owner: -
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
    stripe_product_id text,
    stripe_price_id text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: pricing_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pricing_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pricing_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pricing_plans_id_seq OWNED BY public.pricing_plans.id;


--
-- Name: promotional_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotional_messages (
    id integer NOT NULL,
    message_text text NOT NULL,
    message_type text DEFAULT 'ai_generated'::text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    language text DEFAULT 'es'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    campaign_id integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: promotional_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.promotional_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: promotional_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.promotional_messages_id_seq OWNED BY public.promotional_messages.id;


--
-- Name: sent_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sent_alerts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    alert_type text NOT NULL,
    threshold_reached integer,
    current_spent numeric(12,2) NOT NULL,
    monthly_budget numeric(12,2) NOT NULL,
    delivery_method text NOT NULL,
    delivery_status text DEFAULT 'pending'::text NOT NULL,
    email_address text,
    message_content text,
    billing_month text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    delivered_at timestamp without time zone,
    CONSTRAINT positive_current_spent_alert CHECK ((current_spent >= (0)::numeric)),
    CONSTRAINT positive_monthly_budget_alert CHECK ((monthly_budget >= (0)::numeric)),
    CONSTRAINT valid_billing_month_alert CHECK ((billing_month ~ '^\d{4}-\d{2}$'::text)),
    CONSTRAINT valid_threshold CHECK (((threshold_reached = ANY (ARRAY[50, 80, 90, 100])) OR (threshold_reached IS NULL)))
);


--
-- Name: sent_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sent_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sent_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sent_alerts_id_seq OWNED BY public.sent_alerts.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    assistant_name text DEFAULT 'AIPPS Assistant'::text,
    default_greeting text DEFAULT '👋 Hi there! I''m AIPPS, your AI assistant. How can I help you today?'::text,
    show_availability boolean DEFAULT true,
    avatar_url text,
    user_bubble_color text DEFAULT '#3B82F6'::text,
    assistant_bubble_color text DEFAULT '#E5E7EB'::text,
    font text DEFAULT 'inter'::text,
    conversation_style text DEFAULT 'professional'::text,
    knowledge_base text DEFAULT 'default'::text,
    enable_learning boolean DEFAULT true,
    email_notification_address text,
    welcome_page_chat_enabled boolean DEFAULT true,
    welcome_page_chat_greeting text DEFAULT '👋 ¡Hola! Soy AIPPS, tu asistente de IA. ¿En qué puedo ayudarte hoy?'::text,
    welcome_page_chat_bubble_color text DEFAULT '#111827'::text,
    welcome_page_chat_text_color text DEFAULT '#FFFFFF'::text,
    welcome_page_chat_behavior text DEFAULT 'Sé amable, informativo y conciso al responder preguntas sobre AIPPS y sus características.'::text,
    welcome_page_chat_scraping_enabled boolean DEFAULT false,
    welcome_page_chat_scraping_depth integer DEFAULT 5,
    welcome_page_chat_scraping_data text
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: sites_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sites_content (
    id integer NOT NULL,
    integration_id integer NOT NULL,
    url text NOT NULL,
    title text,
    content text NOT NULL,
    last_updated timestamp without time zone DEFAULT now()
);


--
-- Name: sites_content_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sites_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sites_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sites_content_id_seq OWNED BY public.sites_content.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: usage_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usage_tracking (
    id integer NOT NULL,
    user_id integer NOT NULL,
    action_type text NOT NULL,
    cost_applied numeric(12,2) NOT NULL,
    currency text DEFAULT 'CAD'::text NOT NULL,
    resource_id integer,
    resource_type text,
    billing_month text NOT NULL,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    action_cost_id integer NOT NULL,
    CONSTRAINT positive_cost_applied CHECK ((cost_applied >= (0)::numeric)),
    CONSTRAINT valid_billing_month CHECK ((billing_month ~ '^\d{4}-\d{2}$'::text))
);


--
-- Name: usage_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usage_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usage_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usage_tracking_id_seq OWNED BY public.usage_tracking.id;


--
-- Name: user_budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_budgets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    monthly_budget numeric(12,2) NOT NULL,
    current_spent numeric(12,2) DEFAULT 0.00 NOT NULL,
    currency text DEFAULT 'CAD'::text NOT NULL,
    billing_cycle_day integer DEFAULT 1 NOT NULL,
    alert_threshold_50 boolean DEFAULT true,
    alert_threshold_80 boolean DEFAULT true,
    alert_threshold_90 boolean DEFAULT true,
    alert_threshold_100 boolean DEFAULT true,
    is_suspended boolean DEFAULT false,
    suspended_at timestamp without time zone,
    last_reset_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT positive_current_spent CHECK ((current_spent >= (0)::numeric)),
    CONSTRAINT positive_monthly_budget CHECK ((monthly_budget >= (0)::numeric)),
    CONSTRAINT valid_billing_day CHECK (((billing_cycle_day >= 1) AND (billing_cycle_day <= 28)))
);


--
-- Name: user_budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_budgets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_budgets_id_seq OWNED BY public.user_budgets.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: welcome_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.welcome_messages (
    id integer NOT NULL,
    message_text text NOT NULL,
    message_text_fr text,
    message_text_en text,
    message_type text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL,
    order_index integer NOT NULL
);


--
-- Name: welcome_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.welcome_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: welcome_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.welcome_messages_id_seq OWNED BY public.welcome_messages.id;


--
-- Name: widget_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.widget_tokens (
    id integer NOT NULL,
    token_hash text NOT NULL,
    widget_user_id integer NOT NULL,
    integration_id integer NOT NULL,
    jwt_payload text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    is_revoked boolean DEFAULT false
);


--
-- Name: widget_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.widget_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: widget_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.widget_tokens_id_seq OWNED BY public.widget_tokens.id;


--
-- Name: widget_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.widget_users (
    id integer NOT NULL,
    integration_id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    full_name text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: widget_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.widget_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: widget_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.widget_users_id_seq OWNED BY public.widget_users.id;


--
-- Name: action_costs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_costs ALTER COLUMN id SET DEFAULT nextval('public.action_costs_id_seq'::regclass);


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: automations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations ALTER COLUMN id SET DEFAULT nextval('public.automations_id_seq'::regclass);


--
-- Name: calendar_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_tokens ALTER COLUMN id SET DEFAULT nextval('public.calendar_tokens_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: discount_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes ALTER COLUMN id SET DEFAULT nextval('public.discount_codes_id_seq'::regclass);


--
-- Name: form_responses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_responses ALTER COLUMN id SET DEFAULT nextval('public.form_responses_id_seq'::regclass);


--
-- Name: form_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_templates ALTER COLUMN id SET DEFAULT nextval('public.form_templates_id_seq'::regclass);


--
-- Name: forms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forms ALTER COLUMN id SET DEFAULT nextval('public.forms_id_seq'::regclass);


--
-- Name: integrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrations ALTER COLUMN id SET DEFAULT nextval('public.integrations_id_seq'::regclass);


--
-- Name: marketing_campaigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_campaigns ALTER COLUMN id SET DEFAULT nextval('public.marketing_campaigns_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: pricing_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_plans ALTER COLUMN id SET DEFAULT nextval('public.pricing_plans_id_seq'::regclass);


--
-- Name: promotional_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotional_messages ALTER COLUMN id SET DEFAULT nextval('public.promotional_messages_id_seq'::regclass);


--
-- Name: sent_alerts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sent_alerts ALTER COLUMN id SET DEFAULT nextval('public.sent_alerts_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: sites_content id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites_content ALTER COLUMN id SET DEFAULT nextval('public.sites_content_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: usage_tracking id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_tracking ALTER COLUMN id SET DEFAULT nextval('public.usage_tracking_id_seq'::regclass);


--
-- Name: user_budgets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_budgets ALTER COLUMN id SET DEFAULT nextval('public.user_budgets_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: welcome_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welcome_messages ALTER COLUMN id SET DEFAULT nextval('public.welcome_messages_id_seq'::regclass);


--
-- Name: widget_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.widget_tokens ALTER COLUMN id SET DEFAULT nextval('public.widget_tokens_id_seq'::regclass);


--
-- Name: widget_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.widget_users ALTER COLUMN id SET DEFAULT nextval('public.widget_users_id_seq'::regclass);


--
-- Name: action_costs action_costs_action_type_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_costs
    ADD CONSTRAINT action_costs_action_type_unique UNIQUE (action_type);


--
-- Name: action_costs action_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_costs
    ADD CONSTRAINT action_costs_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: automations automations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_pkey PRIMARY KEY (id);


--
-- Name: calendar_tokens calendar_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_tokens
    ADD CONSTRAINT calendar_tokens_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: discount_codes discount_codes_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_code_unique UNIQUE (code);


--
-- Name: discount_codes discount_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_pkey PRIMARY KEY (id);


--
-- Name: form_responses form_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT form_responses_pkey PRIMARY KEY (id);


--
-- Name: form_templates form_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_templates
    ADD CONSTRAINT form_templates_pkey PRIMARY KEY (id);


--
-- Name: forms forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_pkey PRIMARY KEY (id);


--
-- Name: forms forms_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_slug_unique UNIQUE (slug);


--
-- Name: integrations integrations_api_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_api_key_unique UNIQUE (api_key);


--
-- Name: integrations integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_pkey PRIMARY KEY (id);


--
-- Name: marketing_campaigns marketing_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: pricing_plans pricing_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_plans
    ADD CONSTRAINT pricing_plans_pkey PRIMARY KEY (id);


--
-- Name: pricing_plans pricing_plans_plan_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_plans
    ADD CONSTRAINT pricing_plans_plan_id_unique UNIQUE (plan_id);


--
-- Name: promotional_messages promotional_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotional_messages
    ADD CONSTRAINT promotional_messages_pkey PRIMARY KEY (id);


--
-- Name: sent_alerts sent_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sent_alerts
    ADD CONSTRAINT sent_alerts_pkey PRIMARY KEY (id);


--
-- Name: sent_alerts sent_alerts_user_id_alert_type_threshold_reached_billing_month_; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sent_alerts
    ADD CONSTRAINT sent_alerts_user_id_alert_type_threshold_reached_billing_month_ UNIQUE (user_id, alert_type, threshold_reached, billing_month);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: sites_content sites_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites_content
    ADD CONSTRAINT sites_content_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: widget_users unique_email_per_integration; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.widget_users
    ADD CONSTRAINT unique_email_per_integration UNIQUE (integration_id, email);


--
-- Name: widget_users unique_username_per_integration; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.widget_users
    ADD CONSTRAINT unique_username_per_integration UNIQUE (integration_id, username);


--
-- Name: widget_tokens unique_widget_user_integration; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.widget_tokens
    ADD CONSTRAINT unique_widget_user_integration UNIQUE (widget_user_id, integration_id);


--
-- Name: usage_tracking usage_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_tracking
    ADD CONSTRAINT usage_tracking_pkey PRIMARY KEY (id);


--
-- Name: user_budgets user_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_budgets
    ADD CONSTRAINT user_budgets_pkey PRIMARY KEY (id);


--
-- Name: user_budgets user_budgets_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_budgets
    ADD CONSTRAINT user_budgets_user_id_unique UNIQUE (user_id);


--
-- Name: users users_api_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_api_key_unique UNIQUE (api_key);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: welcome_messages welcome_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welcome_messages
    ADD CONSTRAINT welcome_messages_pkey PRIMARY KEY (id);


--
-- Name: widget_tokens widget_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.widget_tokens
    ADD CONSTRAINT widget_tokens_pkey PRIMARY KEY (id);


--
-- Name: widget_tokens widget_tokens_token_hash_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.widget_tokens
    ADD CONSTRAINT widget_tokens_token_hash_unique UNIQUE (token_hash);


--
-- Name: widget_users widget_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.widget_users
    ADD CONSTRAINT widget_users_pkey PRIMARY KEY (id);


--
-- Name: alerts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alerts_created_at_idx ON public.sent_alerts USING btree (created_at);


--
-- Name: alerts_delivery_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alerts_delivery_status_idx ON public.sent_alerts USING btree (delivery_status);


--
-- Name: alerts_user_billing_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alerts_user_billing_idx ON public.sent_alerts USING btree (user_id, billing_month);


--
-- Name: usage_action_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX usage_action_type_idx ON public.usage_tracking USING btree (action_type);


--
-- Name: usage_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX usage_created_at_idx ON public.usage_tracking USING btree (created_at);


--
-- Name: usage_user_billing_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX usage_user_billing_idx ON public.usage_tracking USING btree (user_id, billing_month);


--
-- Name: widget_tokens_hash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX widget_tokens_hash_idx ON public.widget_tokens USING btree (token_hash);


--
-- Name: action_costs action_costs_last_updated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_costs
    ADD CONSTRAINT action_costs_last_updated_by_users_id_fk FOREIGN KEY (last_updated_by) REFERENCES public.users(id);


--
-- Name: appointments appointments_conversation_id_conversations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_integration_id_integrations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_integration_id_integrations_id_fk FOREIGN KEY (integration_id) REFERENCES public.integrations(id) ON DELETE CASCADE;


--
-- Name: automations automations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: calendar_tokens calendar_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_tokens
    ADD CONSTRAINT calendar_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_integration_id_integrations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_integration_id_integrations_id_fk FOREIGN KEY (integration_id) REFERENCES public.integrations(id);


--
-- Name: form_responses form_responses_form_id_forms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_responses
    ADD CONSTRAINT form_responses_form_id_forms_id_fk FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: form_templates form_templates_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_templates
    ADD CONSTRAINT form_templates_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: forms forms_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: integrations integrations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: messages messages_conversation_id_conversations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: sent_alerts sent_alerts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sent_alerts
    ADD CONSTRAINT sent_alerts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: settings settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sites_content sites_content_integration_id_integrations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites_content
    ADD CONSTRAINT sites_content_integration_id_integrations_id_fk FOREIGN KEY (integration_id) REFERENCES public.integrations(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: usage_tracking usage_tracking_action_cost_id_action_costs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_tracking
    ADD CONSTRAINT usage_tracking_action_cost_id_action_costs_id_fk FOREIGN KEY (action_cost_id) REFERENCES public.action_costs(id);


--
-- Name: usage_tracking usage_tracking_action_type_action_costs_action_type_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_tracking
    ADD CONSTRAINT usage_tracking_action_type_action_costs_action_type_fk FOREIGN KEY (action_type) REFERENCES public.action_costs(action_type);


--
-- Name: usage_tracking usage_tracking_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_tracking
    ADD CONSTRAINT usage_tracking_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_budgets user_budgets_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_budgets
    ADD CONSTRAINT user_budgets_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: widget_tokens widget_tokens_integration_id_integrations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.widget_tokens
    ADD CONSTRAINT widget_tokens_integration_id_integrations_id_fk FOREIGN KEY (integration_id) REFERENCES public.integrations(id);


--
-- Name: widget_tokens widget_tokens_widget_user_id_widget_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.widget_tokens
    ADD CONSTRAINT widget_tokens_widget_user_id_widget_users_id_fk FOREIGN KEY (widget_user_id) REFERENCES public.widget_users(id);


--
-- Name: widget_users widget_users_integration_id_integrations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.widget_users
    ADD CONSTRAINT widget_users_integration_id_integrations_id_fk FOREIGN KEY (integration_id) REFERENCES public.integrations(id);


--
-- PostgreSQL database dump complete
--

