--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_content_generations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_content_generations (
    id integer NOT NULL,
    agent_type character varying(50) NOT NULL,
    content_type character varying(50),
    prompt text,
    generated_content text,
    model character varying(200),
    status character varying(20) DEFAULT 'draft'::character varying,
    title text,
    metadata jsonb,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_content_generations OWNER TO neondb_owner;

--
-- Name: ai_content_generations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ai_content_generations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_content_generations_id_seq OWNER TO neondb_owner;

--
-- Name: ai_content_generations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ai_content_generations_id_seq OWNED BY public.ai_content_generations.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255),
    phone character varying(20),
    company character varying(255),
    address text,
    city character varying(100),
    state character varying(50),
    zip_code character varying(10),
    notes text,
    lead_source character varying(100),
    lead_score integer DEFAULT 0,
    lead_temperature character varying(10) DEFAULT 'cold'::character varying,
    tags text[],
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contacts OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contacts_id_seq OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    project_id integer,
    opportunity_id integer,
    name character varying(255) NOT NULL,
    type character varying(50),
    file_path text,
    file_size integer,
    mime_type character varying(100),
    version integer DEFAULT 1,
    is_active boolean DEFAULT true,
    uploaded_by character varying(255),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.documents OWNER TO neondb_owner;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_id_seq OWNER TO neondb_owner;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: interactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.interactions (
    id integer NOT NULL,
    contact_id integer,
    opportunity_id integer,
    type character varying(50) NOT NULL,
    subject character varying(255),
    content text,
    direction character varying(10),
    duration integer,
    outcome text,
    next_steps text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.interactions OWNER TO neondb_owner;

--
-- Name: interactions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.interactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interactions_id_seq OWNER TO neondb_owner;

--
-- Name: interactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.interactions_id_seq OWNED BY public.interactions.id;


--
-- Name: marketing_campaigns; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.marketing_campaigns (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50),
    status character varying(20) DEFAULT 'draft'::character varying,
    subject character varying(255),
    content text,
    target_audience text,
    scheduled_date timestamp without time zone,
    sent_date timestamp without time zone,
    open_rate numeric(5,2),
    click_rate numeric(5,2),
    response_rate numeric(5,2),
    generated_by_ai boolean DEFAULT false,
    ai_agent character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.marketing_campaigns OWNER TO neondb_owner;

--
-- Name: marketing_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.marketing_campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marketing_campaigns_id_seq OWNER TO neondb_owner;

--
-- Name: marketing_campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.marketing_campaigns_id_seq OWNED BY public.marketing_campaigns.id;


--
-- Name: opportunities; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.opportunities (
    id integer NOT NULL,
    contact_id integer,
    project_id integer,
    name character varying(255) NOT NULL,
    stage character varying(50) DEFAULT 'new_lead'::character varying,
    probability integer DEFAULT 0,
    value numeric(10,2),
    expected_close_date timestamp without time zone,
    actual_close_date timestamp without time zone,
    lost_reason text,
    next_action text,
    next_action_date timestamp without time zone,
    urgency character varying(20) DEFAULT 'normal'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.opportunities OWNER TO neondb_owner;

--
-- Name: opportunities_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.opportunities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.opportunities_id_seq OWNER TO neondb_owner;

--
-- Name: opportunities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.opportunities_id_seq OWNED BY public.opportunities.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    project_type character varying(100),
    status character varying(50) DEFAULT 'planning'::character varying,
    priority character varying(20) DEFAULT 'normal'::character varying,
    estimated_value numeric(10,2),
    actual_value numeric(10,2),
    estimated_start_date timestamp without time zone,
    actual_start_date timestamp without time zone,
    estimated_end_date timestamp without time zone,
    actual_end_date timestamp without time zone,
    location text,
    lake_area character varying(100),
    materials text[],
    special_requirements text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.projects OWNER TO neondb_owner;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO neondb_owner;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    contact_id integer,
    opportunity_id integer,
    project_id integer,
    title character varying(255) NOT NULL,
    description text,
    type character varying(50),
    status character varying(20) DEFAULT 'pending'::character varying,
    priority character varying(20) DEFAULT 'normal'::character varying,
    due_date timestamp without time zone,
    completed_date timestamp without time zone,
    assigned_to character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tasks OWNER TO neondb_owner;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO neondb_owner;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: ai_content_generations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_content_generations ALTER COLUMN id SET DEFAULT nextval('public.ai_content_generations_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: interactions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interactions ALTER COLUMN id SET DEFAULT nextval('public.interactions_id_seq'::regclass);


--
-- Name: marketing_campaigns id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketing_campaigns ALTER COLUMN id SET DEFAULT nextval('public.marketing_campaigns_id_seq'::regclass);


--
-- Name: opportunities id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunities ALTER COLUMN id SET DEFAULT nextval('public.opportunities_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Data for Name: ai_content_generations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ai_content_generations (id, agent_type, content_type, prompt, generated_content, model, status, title, metadata, published_at, created_at) FROM stdin;
1	newsletter	email_newsletter	I need an industry relevant newletter for this month	Here's a complete newsletter for this month:\n\n**Header Section**\n\n[Image: TBDock logo with dark navy and gold accents]\n\n**March 2023 Edition**\n\nHi [Name],\n\nAs we welcome the arrival of spring, our team at TBDock is excited to share some exciting projects, valuable tips, and exclusive offers to help you make the most of your waterfront living experience. In this edition, we'll take you on a journey to a stunning dock renovation, share expert advice on preparing your dock for the new season, and introduce a limited-time offer to get your dock ready for the warmer months ahead.\n\n**Featured Project Spotlight**\n\n**"Sunset Serenity": A Dock Transformation in Paradise**\n\n[Image: Before/after images of a dock renovation project]\n\nLocated on the picturesque shores of Lake Michigan, this dock renovation project was a true transformation. Our team worked closely with the homeowner to design and build a dock that not only complemented the surrounding landscape but also provided a serene and functional space for relaxation and entertainment.\n\n**Project Details:**\n\n* Location: Lake Michigan shoreline\n* Scope: Complete dock renovation with new decking, railings, and electrical installations\n* Timeline: 6 weeks\n* Key Challenges: Integrating the dock design with the existing landscape and meeting stringent local building codes\n\n**Customer Testimonial:**\n\n"TBDock exceeded our expectations in every way. Their attention to detail, professionalism, and commitment to quality were evident throughout the entire project. We couldn't be happier with our new dock!" - John and Sarah P.\n\n**Educational Article Summary**\n\n**"5 Essential Steps to Prepare Your Dock for Spring"**\n\n[Image: A small icon of a dock with a spring-themed background]\n\nAs the weather warms up, it's essential to ensure your dock is ready for the new season. In our latest blog post, we share expert tips on how to inspect, clean, and maintain your dock to prevent damage and ensure a safe and enjoyable waterfront experience.\n\n**Read More** [CTA button linking to the full article]\n\n**Seasonal Tips & Maintenance Reminders**\n\nSpring is here! Don't forget to:\n\nInspect your dock's electrical systems and lighting\nClean and lubricate your dock's moving parts\nCheck for signs of damage or wear on your dock's decking and railings\nSchedule a professional inspection to ensure your dock is safe and compliant\n\n**Promotions/Special Offers**\n\n**Limited-Time Offer: Spring Dock Prep Package**\n\nGet your dock ready for the new season with our exclusive Spring Dock Prep Package! For a limited time, book a comprehensive dock inspection and receive:\n\nA detailed report highlighting areas of concern\nA priority discount on any necessary repairs or maintenance\nA FREE dock cleaning and lubrication service (valued at $200)\n\n**Schedule Your Free Estimate** [CTA button]\n\n**Footer Section**\n\n[Image: TBDock logo with dark navy and gold accents]\n\n**Stay Connected:**\n\n[Social media links]\n\n**Get in Touch:**\n\n[Contact information]\n\n**Unsubscribe** [Unsubscribe link]\n\n**Email Preferences** [Email preferences link]\n\n**Physical Address and Business Hours:**\n\n[Physical address]\n[Business hours]\n\n**Legal Disclaimer:**\n\nYou're receiving this email because you signed up at tbdock.com or requested information. We respect your inbox and promise to only send you valuable content and exclusive offers. If you have any questions or concerns, please don't hesitate to reach out.\n\nBest regards,\n\nThe TBDock Team	meta-llama/llama-3-70b-instruct	draft	**March 2023 Edition**	{"contentType": "email_newsletter"}	\N	2025-10-03 21:52:15.747653
2	social	social_post	Write a Facebook post about our steel truss dock construction with before/after photos	Caption: 🌊 From rusty to robust! Check out the incredible transformation of our latest steel truss dock project. Quality craftsmanship that stands the test of time.   \n\nHashtags:   \n\nAdditional recommendations:\n- Include a call-to-action inviting followers to visit our website for more project details.\n- Encourage followers to share their thoughts or experiences with similar projects in the comments section to boost engagement.	openai/gpt-3.5-turbo	draft	facebook Post	{"hashtags": ["DockTransformation", "SteelTrussDock", "BeforeAndAfter", "DockTransformation", "SteelTrussDock", "BeforeAndAfter"], "platform": "facebook", "contentType": "social_post"}	\N	2025-10-03 21:59:12.330961
3	blog	text	tips for maintaining waterfront docks in winter	### Essential Winter Maintenance Tips for Waterfront Docks in Coeur d'Alene\n\nWinter in Coeur d'Alene can transform the landscape into a picturesque scene of snow-covered mountains and icy lakes. However, for waterfront property owners, the winter months also bring the challenge of maintaining their docks. Without proper care, the harsh weather conditions can cause significant damage. This guide offers vital tips on how to protect and maintain your dock during the cold season, ensuring its longevity and functionality.\n\n#### Understanding the Impact of Winter on Waterfront Docks\n\nWaterfront docks in regions like Coeur d'Alene are exposed to extreme conditions in winter, including heavy snowfall, ice formation, and fluctuating temperatures. These elements can stress the structural integrity of docks, leading to potential damage such as:\n- Ice pressure against dock frames and decking\n- Snow accumulation weighing down surfaces and floats\n- Freeze-thaw cycles causing wear on materials\n\nPreparing and maintaining your dock for winter is crucial to avoid costly repairs or replacements come spring.\n\n#### Pre-Winter Inspection and Repairs\n\n**1. Conduct a Thorough Inspection:**\nBefore the first freeze, inspect your dock for any signs of wear or damage. Look for loose boards, unstable sections, rust on metal components, or degraded floatation devices. Early detection allows for timely repairs that can prevent further deterioration during winter.\n\n**2. Repair Damages Promptly:**\nAddress any issues found during the inspection. Replace worn-out parts, tighten loose bolts, and fix or replace damaged floats. Ensuring your dock is in good repair before winter sets in can be the difference between minor seasonal maintenance and major reconstruction.\n\n#### Protecting Your Dock from Ice and Snow\n\n**1. Install Ice Barriers:**\nConsider installing ice barriers around your dock. These structures can help reduce the stress placed on your dock by ice shifting in the lake. Ice barriers work by minimizing the direct contact between ice and your dock, thus protecting it from the pressure and abrasion of ice movement.\n\n**2. Regular Snow Removal:**\nSnow can accumulate quickly and weigh down your dock, especially after a heavy snowfall. Regularly clearing snow from your dock not only prevents structural strain but also allows you to inspect the condition of the dock throughout the winter. Use a plastic shovel to avoid scratching wood or composite surfaces.\n\n#### Seasonal Adjustments and Considerations\n\n**1. Adjust Dock Height and Configuration:**\nIf possible, adjust the height of your dock or remove detachable sections that might be more exposed to damage. For floating docks, ensure they are allowed some movement to accommodate rising and lowering water levels and ice movement.\n\n**2. Use Dock Deicers:**\nA dock deicer or bubbler system can keep the water moving around your dock, preventing ice from forming directly against it. This is particularly useful for preventing ice jacking and the uplift of dock structures.\n\n**3. Disconnect Utilities:**\nIf your dock is equipped with electrical or water utilities, ensure they are properly disconnected and winterized to prevent freezing and potential damage.\n\n#### Monitoring and Post-Winter Recovery\n\nThroughout the winter, it's wise to periodically check on your dock, especially after severe weather events. Once the ice begins to thaw, perform another comprehensive inspection to identify any new issues that may have arisen during the winter months. Early spring is also an ideal time for a professional assessment and any necessary repairs to prepare your dock for the busy summer season.\n\n### Conclusion: Stay Ahead of Winter Wear\n\nBy following these winter maintenance tips, you can help ensure that your dock remains safe and functional throughout the harsh Coeur d'Alene winter and beyond. Regular maintenance not only extends the life of your dock but also enhances your enjoyment and safety of waterfront living. If you encounter any major issues or need professional advice, remember that TBDock is here to help. Contact us for expert dock maintenance services and start the next season on the right foot.\n\nFor more information on our services or to schedule a consultation, visit our website or give us a call. Remember, proactive care is the key to maintaining the value and functionality of your waterfront investment.	openai/gpt-4-turbo	draft	Winter in Coeur d'Alene can transform the landscape into a picturesque scene of snow-covered mountains and icy lakes. However, for waterfront property owners, the winter months also bring the challenge of maintaining their docks. Without proper care, the harsh weather conditions can cause significant damage. This guide offers vital tips on how to protect and maintain your dock during the cold season, ensuring its longevity and functionality.	{"wordCount": 647, "contentType": "blog_article"}	\N	2025-10-03 22:29:01.437308
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.contacts (id, first_name, last_name, email, phone, company, address, city, state, zip_code, notes, lead_source, lead_score, lead_temperature, tags, created_at, updated_at) FROM stdin;
1						\N	\N	\N	\N		\N	0	warm	\N	2025-10-03 22:04:17.263521	2025-10-03 22:04:15.04
2	John	Smith	john.smith@example.com	208-555-9876	Waterfront Co	\N	\N	\N	\N		\N	85	warm	\N	2025-10-03 22:08:38.935163	2025-10-03 22:08:38.721
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.documents (id, project_id, opportunity_id, name, type, file_path, file_size, mime_type, version, is_active, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: interactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.interactions (id, contact_id, opportunity_id, type, subject, content, direction, duration, outcome, next_steps, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_campaigns; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.marketing_campaigns (id, name, type, status, subject, content, target_audience, scheduled_date, sent_date, open_rate, click_rate, response_rate, generated_by_ai, ai_agent, created_at) FROM stdin;
\.


--
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.opportunities (id, contact_id, project_id, name, stage, probability, value, expected_close_date, actual_close_date, lost_reason, next_action, next_action_date, urgency, created_at, updated_at) FROM stdin;
1	\N	\N	Lake Dock x6Bs	qualification	0	95000.00	\N	\N	\N	\N	\N	normal	2025-10-03 22:20:24.001458	2025-10-03 22:20:23.786
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.projects (id, name, description, project_type, status, priority, estimated_value, actual_value, estimated_start_date, actual_start_date, estimated_end_date, actual_end_date, location, lake_area, materials, special_requirements, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
YxTRWPlKSS8-odY9oT4J0MoY1eA0YHHX	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-10T21:51:04.894Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "MTaJ_MnOAc6sO9AgUEM9fSTsX6-Uc72mzbGQTEsYlA8"}}	2025-10-10 21:51:05
b0BRFW7KcIeCSWWCGEibhzMAzFd5JO5Z	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-10T22:07:43.235Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "d22355b4-3f50-40ef-8359-e90c166f922b", "exp": 1759532863, "iat": 1759529263, "iss": "https://test-mock-oidc.replit.app/", "jti": "3644bb159d5b4537aa906115e69ff860", "sub": "da8qgV", "email": "testuservVSbW2@tbdock.com", "auth_time": 1759529262, "last_name": "User", "first_name": "Test"}, "expires_at": 1759532863, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU5NTI5MjYzLCJleHAiOjE3NTk1MzI4NjMsInN1YiI6ImRhOHFnViIsImVtYWlsIjoidGVzdHVzZXJ2VlNiVzJAdGJkb2NrLmNvbSIsImZpcnN0X25hbWUiOiJUZXN0IiwibGFzdF9uYW1lIjoiVXNlciJ9.j_IkKR_qHDhlDjOJdPHTxnz5lVFJl6QW9Y357RA3DsGNDLVIv1c5BRdUIPyHnkcrHkqN0rZ1Y5Iqcoe3vCDydktOX7Ra7c4Rj0H7U83jSUvyluSsxfxhGcyg9b1yPeyk-R-liMxZlYCYXYLptLljskkiPTbr5sBSTjeF1VuIFZCrj7u0yQ7p_VWBooS-CrcbZ3oluhMe9SGQ7cAzVtP9tqUN8kZZ2nXl6_fZR8i-CVVA1Uw1-b_Ksw822_khY1T5y5lH-B68130A33Zh63kOwr_PH9ACyrV9f_Tum1dkn3RqnwdH2GOegy4u4XMqiejuZSqEM5jjYtz7c6u6hsCpjA", "refresh_token": "eyJzdWIiOiJkYThxZ1YiLCJlbWFpbCI6InRlc3R1c2VydlZTYlcyQHRiZG9jay5jb20iLCJmaXJzdF9uYW1lIjoiVGVzdCIsImxhc3RfbmFtZSI6IlVzZXIifQ"}}}	2025-10-10 22:08:40
2x6gdJwzqtOJJbegDkDZ4HRMpcjmRF5O	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-10T22:19:06.038Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "d22355b4-3f50-40ef-8359-e90c166f922b", "exp": 1759533545, "iat": 1759529945, "iss": "https://test-mock-oidc.replit.app/", "jti": "f64c0b93c42eb88051aa109e8061bb04", "sub": "3fAdqW", "email": "pipeBAfOMf@tbdock.com", "auth_time": 1759529945, "last_name": "User", "first_name": "Test"}, "expires_at": 1759533545, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU5NTI5OTQ1LCJleHAiOjE3NTk1MzM1NDUsInN1YiI6IjNmQWRxVyIsImVtYWlsIjoicGlwZUJBZk9NZkB0YmRvY2suY29tIiwiZmlyc3RfbmFtZSI6IlRlc3QiLCJsYXN0X25hbWUiOiJVc2VyIn0.D2r4TaO1isKlOyQzTCAA99UDlN-88zf4YC58gY-ex2vxM2U0oDDLJLR_TOKxzy8rO5njRsdnR93oWelw9ccQnDQBPvoyQ2-dAFPoyAHNsiaDrq8_SprKuo6_N8iRcZ4SKVB6ULtkhmnJaY2WWN8CCx-u7qbYWyzhh9BF6TLM5nrwZ3aX9SgrIEhURhhaUl2u3h-Oc1Zuu_gE2a7WdBuww6_tZD73s2Gh6iXYKotEb5z7ujG4C1wJzrKL67fOHoudbhHa_xu__x5uG6vr9caHXo0VQ0s5-I-K8HSy8Ll-uWUikTXGC8HQ2cXI27i5b6Rlb2OIEUkbkuGuJKuwSV_55w", "refresh_token": "eyJzdWIiOiIzZkFkcVciLCJlbWFpbCI6InBpcGVCQWZPTWZAdGJkb2NrLmNvbSIsImZpcnN0X25hbWUiOiJUZXN0IiwibGFzdF9uYW1lIjoiVXNlciJ9"}}}	2025-10-10 22:20:25
wZSpU4hgBUnTumORrrvaU4ny53G0JvYx	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-10T22:01:26.407Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "d22355b4-3f50-40ef-8359-e90c166f922b", "exp": 1759532486, "iat": 1759528886, "iss": "https://test-mock-oidc.replit.app/", "jti": "276db29bb554f1fdd76e320a4a12bc81", "sub": "wTjKPx", "email": "userF1aOzt@tbdock.com", "auth_time": 1759528886, "last_name": "User", "first_name": "Test"}, "expires_at": 1759532486, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU5NTI4ODg2LCJleHAiOjE3NTk1MzI0ODYsInN1YiI6IndUaktQeCIsImVtYWlsIjoidXNlckYxYU96dEB0YmRvY2suY29tIiwiZmlyc3RfbmFtZSI6IlRlc3QiLCJsYXN0X25hbWUiOiJVc2VyIn0.lstIQdq9E_TXASIp4UM6uuypdVahXTzwCv5bDOxJx5Mx4-9aGTa85ZjF21q0XbgXSpYtbxPI4WirfHhlbUWLvDaaKaa-gqiHeIxj2-y1LxWFB_JhPXgHQOfD_MQOSIJXKhpl_UmNARER3HSXgVPp7dgA6cctyVB3Sx4cq9rUY8euRVNCvUsSJqN2TJgnAEOZXkfhdTc0gozm6BuT_DpbiiIJA5HjQwaouu89xM9WdKFwGt_dvKHwFL0RMQ_4IcVH3RicRHHvicDFHP4hAZA3HdzfkSPXq1MOP3kVhxrrgSyf3vVCTwx4ENlfGxsgxEhC2TRezFOb_DyYotnM7FYS9A", "refresh_token": "eyJzdWIiOiJ3VGpLUHgiLCJlbWFpbCI6InVzZXJGMWFPenRAdGJkb2NrLmNvbSIsImZpcnN0X25hbWUiOiJUZXN0IiwibGFzdF9uYW1lIjoiVXNlciJ9"}}}	2025-10-10 22:04:42
M2xmgRQmAv2ZnbWJodGtGF_zIq_vV-mY	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-10T22:10:14.147Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "d22355b4-3f50-40ef-8359-e90c166f922b", "exp": 1759533013, "iat": 1759529413, "iss": "https://test-mock-oidc.replit.app/", "jti": "3019f330bdc417d73e178fe36110edd4", "sub": "xE1I96", "email": "pipelineo68nLh@tbdock.com", "auth_time": 1759529413, "last_name": "Tester", "first_name": "Pipeline"}, "expires_at": 1759533013, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU5NTI5NDEzLCJleHAiOjE3NTk1MzMwMTMsInN1YiI6InhFMUk5NiIsImVtYWlsIjoicGlwZWxpbmVvNjhuTGhAdGJkb2NrLmNvbSIsImZpcnN0X25hbWUiOiJQaXBlbGluZSIsImxhc3RfbmFtZSI6IlRlc3RlciJ9.rUNI2Ftty-2KNdFX40JeuDqYtZozY_MPxzU3kEl43o9foeL6IlvMJFnPkrB3I4_6gTeAknX1LqZyHMOiYkbZj-876DPwa6HzXcUSAbbH7WfmWOSk-_Bt-4xLAWVgtgs1XhVyBuolO4Yv-9utX_aihqhgO1zt4a9vTbbxDW1snsAYoLF-GiBx49Lx0lRUj4mi1ANcsSdkcXIjQ70YwbQQrzDlEvAKP3xeS0LVZfwOqWrwGywr4ZCAK0RW0b6iD2kmQWlgfM8z-AM15FoKUiatImnMdbnFYL6g3jJIb3BdaWoc4prD2UEb3lYPsoMNJIoyTw_Xbf_aFifYRGW2mBU9Hw", "refresh_token": "eyJzdWIiOiJ4RTFJOTYiLCJlbWFpbCI6InBpcGVsaW5lbzY4bkxoQHRiZG9jay5jb20iLCJmaXJzdF9uYW1lIjoiUGlwZWxpbmUiLCJsYXN0X25hbWUiOiJUZXN0ZXIifQ"}}}	2025-10-10 22:10:24
DJbe0VBFctyYi8QotFuAmzGTrHMve99d	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-10T22:12:52.427Z", "httpOnly": true, "originalMaxAge": 604799999}, "passport": {"user": {"claims": {"aud": "d22355b4-3f50-40ef-8359-e90c166f922b", "exp": 1759533172, "iat": 1759529572, "iss": "https://test-mock-oidc.replit.app/", "jti": "8ea2849e311d99c3d1847c0b9a77646d", "sub": "D1oO8i", "email": "sales8HYezr@tbdock.com", "auth_time": 1759529571, "last_name": "Manager", "first_name": "Sales"}, "expires_at": 1759533172, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU5NTI5NTcyLCJleHAiOjE3NTk1MzMxNzIsInN1YiI6IkQxb084aSIsImVtYWlsIjoic2FsZXM4SFllenJAdGJkb2NrLmNvbSIsImZpcnN0X25hbWUiOiJTYWxlcyIsImxhc3RfbmFtZSI6Ik1hbmFnZXIifQ.pklczQWWn5l03nEoM0Z3NUtLyt93QTIrZ4DAK-Kkep3QoInjmKdfslqBA42SnfTZ05zr6-53j_otbsMyu9BKrfMPsAJc-dcclDKjj76Q8HwglC43pEvB1RTOvAySWX9KgaqJqHToCeuUySLK_CLcqQhZejPgfpO8nVpS8JCutlfmh-8Qf68aI2ZQ0N4-FmhckDWGiV2kk9rn4BlqXD0ZxdDrSY02ZakQSb06og_pQutAt5-jjXSxys2DzvY1k4QGf0DwcAyPjcLiIRH3xPuXdkDsunossD1HZp02yNQJXLtMd3v8KHzNLP2DgSSnqd5ALF_cIfFkH1Ibra4EuuocJw", "refresh_token": "eyJzdWIiOiJEMW9POGkiLCJlbWFpbCI6InNhbGVzOEhZZXpyQHRiZG9jay5jb20iLCJmaXJzdF9uYW1lIjoiU2FsZXMiLCJsYXN0X25hbWUiOiJNYW5hZ2VyIn0"}}}	2025-10-10 22:13:05
NA_oLtvdYDPTaTPngfFf4TddWQ1xYD45	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-11T00:19:56.236Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "d22355b4-3f50-40ef-8359-e90c166f922b", "exp": 1759540795, "iat": 1759537195, "iss": "https://replit.com/oidc", "sub": "39061945", "email": "rob@fusiondataco.com", "at_hash": "t9kkl2ZINuGtbJ4ImKzdVQ", "username": "FusionDataCo", "auth_time": 1759528278, "last_name": "Yeager", "first_name": "Robert"}, "expires_at": 1759540795, "access_token": "X8t2tpMgX5gCBP9ja4zuuBdfJdVMErjudlWxlqcKdGn", "refresh_token": "ZWZYt_ewJx_46sj6d-dDy_ZXjz2U72an6uVFqpQvk05"}}}	2025-10-11 00:19:57
hPXRfVSF3H-Y3rVorwnR6pyqx5HM_Inv	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-10T22:21:59.806Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "d22355b4-3f50-40ef-8359-e90c166f922b", "exp": 1759533719, "iat": 1759530119, "iss": "https://test-mock-oidc.replit.app/", "jti": "433b4055d8883743e68955d4edc61232", "sub": "RnSn7M", "email": "aitLwa1O@tbdock.com", "auth_time": 1759530119, "last_name": "Tester", "first_name": "AI"}, "expires_at": 1759533719, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU5NTMwMTE5LCJleHAiOjE3NTk1MzM3MTksInN1YiI6IlJuU243TSIsImVtYWlsIjoiYWl0THdhMU9AdGJkb2NrLmNvbSIsImZpcnN0X25hbWUiOiJBSSIsImxhc3RfbmFtZSI6IlRlc3RlciJ9.gcfesDaYQZ4-lCZvbupMJ_383IJk4Qb37zYD902eHwe0DcTELWVSI7_ruKIdqWypkzwoNs1WwJpIIDxdoVgnoK5g1YqD0fg62QiY4flmIJsWK8DeP0tq8FNeg5A_Y9qSzeUM0IORDepsl-vbWbHysuIKvTy8vOPjpGlNv9PVs30l2vIsBWTLaKpFxO2814sOaC-UA-mugmcp7DF5QFufD04hFw4cEk2gTgmJGre6CYc1MoQ03IHiF4m2am3ECSox4ylw7WCR5yru182Tz6FmmrOUQwzuW09Rjmp7zgNyLPCOREniaSiQYO2IkFKeXHYso9QfN9dcubRjZrHagKP7ZQ", "refresh_token": "eyJzdWIiOiJSblNuN00iLCJlbWFpbCI6ImFpdEx3YTFPQHRiZG9jay5jb20iLCJmaXJzdF9uYW1lIjoiQUkiLCJsYXN0X25hbWUiOiJUZXN0ZXIifQ"}}}	2025-10-10 22:24:11
riHZ9KMStHGc8KlChgWxVhOxr8xd_0s5	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-10T22:26:54.102Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "d22355b4-3f50-40ef-8359-e90c166f922b", "exp": 1759534013, "iat": 1759530413, "iss": "https://test-mock-oidc.replit.app/", "jti": "cfb618ca6e8feb4f36f73724ffbc6ed5", "sub": "dUSoaE", "email": "aigencontentC2-8@tbdock.com", "auth_time": 1759530413, "last_name": "Test", "first_name": "Gen"}, "expires_at": 1759534013, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU5NTMwNDEzLCJleHAiOjE3NTk1MzQwMTMsInN1YiI6ImRVU29hRSIsImVtYWlsIjoiYWlnZW5jb250ZW50QzItOEB0YmRvY2suY29tIiwiZmlyc3RfbmFtZSI6IkdlbiIsImxhc3RfbmFtZSI6IlRlc3QifQ.mxUmCO9IRUwh6RuNPTeBmDNEM_u6Va5Nklx9E4ecD_GJVpEY94O_qEgt5K6zMBo5yh9SmIwz_bf8HHOskbMy1kTl42GH79lgFJazEcMTvA1Slh5O5f-HiedjyENTL01iaINiNElB-bO5a07zbQo95Zc-yr-DngOdW7QSfNF0AaI0By7rz190_xg86cAUZpTMXn9fJ8A_OE974X_ijO8Cn6Lr1eNVfi0IKii6ZuJiGFSRd2o__N3Adflcl8sRvrElToPREh_EsH00kCv8FjVj1pEsnbZUQmwOd1RhRytA-5O5BCEXsCWQdwqDiiPL7D1Io-c_AQtGZxKnTfsZhZosPw", "refresh_token": "eyJzdWIiOiJkVVNvYUUiLCJlbWFpbCI6ImFpZ2VuY29udGVudEMyLThAdGJkb2NrLmNvbSIsImZpcnN0X25hbWUiOiJHZW4iLCJsYXN0X25hbWUiOiJUZXN0In0"}}}	2025-10-10 22:29:03
X91WRHvdVccTrl7qzaAZGf6kHfNWLDOY	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-10T21:54:59.807Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "d22355b4-3f50-40ef-8359-e90c166f922b", "exp": 1759532099, "iat": 1759528499, "iss": "https://test-mock-oidc.replit.app/", "jti": "f2e252658a8ecc8ec7d0d0e1c8ef1fe3", "sub": "P4hwql", "email": "adminTHM8-J@tbdock.com", "auth_time": 1759528499, "last_name": "Admin", "first_name": "Test"}, "expires_at": 1759532099, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU5NTI4NDk5LCJleHAiOjE3NTk1MzIwOTksInN1YiI6IlA0aHdxbCIsImVtYWlsIjoiYWRtaW5USE04LUpAdGJkb2NrLmNvbSIsImZpcnN0X25hbWUiOiJUZXN0IiwibGFzdF9uYW1lIjoiQWRtaW4ifQ.G8H_sVThX5TxV4yGnbWNMGARX2CE4CCQdYPaCJ2qw_ZZuXTbQ00fhHbdyppUKAVwYhV_X4txWGw4vWZ8GGS9PPDOhlVDYbx-l1iPUmjPoExhFm2-D7PjdBtruGOLDWcEgTQ2X0gROG19Fl3B_Q2gpxIolWfyCj1hPo0OMXhe1p_ODZ2FebaVTf_krOFuEKJ3uJYxws0i8njdWiyGDZSCFCdAeKJ9YCqooX69DH15woGCjvI5-b1S34A-KksdrZM4ib8qWRJ81Pv9p0FSogVJyE6MFTNjk6dccciP-r59MvYRC_xecGIZkjtU85l_LZkH40DhFtLCWxy9ut-6OQW9cw", "refresh_token": "eyJzdWIiOiJQNGh3cWwiLCJlbWFpbCI6ImFkbWluVEhNOC1KQHRiZG9jay5jb20iLCJmaXJzdF9uYW1lIjoiVGVzdCIsImxhc3RfbmFtZSI6IkFkbWluIn0"}}}	2025-10-10 21:55:03
zFoX-4mPOEqogXavfcxelhW8h0PG5Qy9	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-10T22:16:40.610Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "d22355b4-3f50-40ef-8359-e90c166f922b", "exp": 1759533400, "iat": 1759529800, "iss": "https://test-mock-oidc.replit.app/", "jti": "54948de6966c815afd08639d32df108d", "sub": "8BZTBI", "email": "oppw8uUBZ@tbdock.com", "auth_time": 1759529800, "last_name": "Tester", "first_name": "Opp"}, "expires_at": 1759533400, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU5NTI5ODAwLCJleHAiOjE3NTk1MzM0MDAsInN1YiI6IjhCWlRCSSIsImVtYWlsIjoib3Bwdzh1VUJaQHRiZG9jay5jb20iLCJmaXJzdF9uYW1lIjoiT3BwIiwibGFzdF9uYW1lIjoiVGVzdGVyIn0.b00wFpNEce3BTsyWzTKHOCnjRDOf6JRvb7a8ZKDEgZiuusA4O57SkvhdAr3YgdsZmVhFZOb1gJL2JEdWU3BZjwM9Xfn97FhIpABn4sHyPjUCcPrLZ960AevA52kmdMxEygNX3Q9rMit6qS1gbUcXLtyljdh7qC8fWZWG-o9MhpijQhiPE9ET-yzW_nVYNeTlKqSa591fTBnREuKjb6eUFOzO4QTgI0WwHAicXYwVE2dOeTMSBZRbfVL7tyQrQJsh95iP567UU_yiQ04q1lqqefK1f7YbSZ8X4NDEwAnURwOID5jfq5qr_HBiP4Lv6lJ8k8ictGrZA-GKVfgTAE_meg", "refresh_token": "eyJzdWIiOiI4QlpUQkkiLCJlbWFpbCI6Im9wcHc4dVVCWkB0YmRvY2suY29tIiwiZmlyc3RfbmFtZSI6Ik9wcCIsImxhc3RfbmFtZSI6IlRlc3RlciJ9"}}}	2025-10-10 22:16:56
aKNKcVKLcvmmLAo87Pwl0h4c1ZRy7uka	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-10T21:56:56.092Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "d22355b4-3f50-40ef-8359-e90c166f922b", "exp": 1759532215, "iat": 1759528615, "iss": "https://test-mock-oidc.replit.app/", "jti": "b79de0c6e2ef0e2306223283b22f222c", "sub": "T9WHFa", "email": "userAc5idZ@tbdock.com", "auth_time": 1759528615, "last_name": "User", "first_name": "Test"}, "expires_at": 1759532215, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzU5NTI4NjE1LCJleHAiOjE3NTk1MzIyMTUsInN1YiI6IlQ5V0hGYSIsImVtYWlsIjoidXNlckFjNWlkWkB0YmRvY2suY29tIiwiZmlyc3RfbmFtZSI6IlRlc3QiLCJsYXN0X25hbWUiOiJVc2VyIn0.ugY3zvyl6LA14e6iMGD5pBDjbIOEvtIWzhQJiz4_hBpkN4hOr9FkEbKYW6MmU4UgwedzS2KsmYguLwDePpQbzA3446BaQ7Xa_pKaDYdj12PJfUmFqwhXHw3j-acKY2lby9Zniy02MEP71FEIzVGpNxbjncFwLIau6wjagjBcvP2Ja8lYroLfpyzmdWepChDs1FLhXRRS7Y94mV80C6K_NN3oVMpiii2iOpej3f5Gz-Ts1WAxC47_b5cLmzFDjQFI7zjydn6V8FoJFiD5ojulc9eLn4gWoxbsiN01_jKLMUgM4i7b4iqzwKyCWHW8t0otjwI-8ozvpsJK4ScTNhsr8w", "refresh_token": "eyJzdWIiOiJUOVdIRmEiLCJlbWFpbCI6InVzZXJBYzVpZFpAdGJkb2NrLmNvbSIsImZpcnN0X25hbWUiOiJUZXN0IiwibGFzdF9uYW1lIjoiVXNlciJ9"}}}	2025-10-10 21:57:06
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tasks (id, contact_id, opportunity_id, project_id, title, description, type, status, priority, due_date, completed_date, assigned_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, first_name, last_name, profile_image_url, created_at, updated_at) FROM stdin;
39061945	rob@fusiondataco.com	Robert	Yeager	\N	2025-10-03 21:51:19.407641	2025-10-03 21:51:19.407641
P4hwql	adminTHM8-J@tbdock.com	Test	Admin	\N	2025-10-03 21:54:59.655909	2025-10-03 21:54:59.655909
T9WHFa	userAc5idZ@tbdock.com	Test	User	\N	2025-10-03 21:56:55.940054	2025-10-03 21:56:55.940054
wTjKPx	userF1aOzt@tbdock.com	Test	User	\N	2025-10-03 22:01:26.254869	2025-10-03 22:01:26.254869
da8qgV	testuservVSbW2@tbdock.com	Test	User	\N	2025-10-03 22:07:43.082541	2025-10-03 22:07:43.082541
xE1I96	pipelineo68nLh@tbdock.com	Pipeline	Tester	\N	2025-10-03 22:10:13.999019	2025-10-03 22:10:13.999019
D1oO8i	sales8HYezr@tbdock.com	Sales	Manager	\N	2025-10-03 22:12:52.271841	2025-10-03 22:12:52.271841
8BZTBI	oppw8uUBZ@tbdock.com	Opp	Tester	\N	2025-10-03 22:16:40.449634	2025-10-03 22:16:40.449634
3fAdqW	pipeBAfOMf@tbdock.com	Test	User	\N	2025-10-03 22:19:05.881629	2025-10-03 22:19:05.881629
RnSn7M	aitLwa1O@tbdock.com	AI	Tester	\N	2025-10-03 22:21:59.648199	2025-10-03 22:21:59.648199
dUSoaE	aigencontentC2-8@tbdock.com	Gen	Test	\N	2025-10-03 22:26:53.927873	2025-10-03 22:26:53.927873
\.


--
-- Name: ai_content_generations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ai_content_generations_id_seq', 3, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.contacts_id_seq', 2, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: interactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.interactions_id_seq', 1, false);


--
-- Name: marketing_campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.marketing_campaigns_id_seq', 1, false);


--
-- Name: opportunities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.opportunities_id_seq', 1, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.tasks_id_seq', 1, false);


--
-- Name: ai_content_generations ai_content_generations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_content_generations
    ADD CONSTRAINT ai_content_generations_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: interactions interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT interactions_pkey PRIMARY KEY (id);


--
-- Name: marketing_campaigns marketing_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_pkey PRIMARY KEY (id);


--
-- Name: opportunities opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


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
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: documents documents_opportunity_id_opportunities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_opportunity_id_opportunities_id_fk FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id);


--
-- Name: documents documents_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: interactions interactions_contact_id_contacts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT interactions_contact_id_contacts_id_fk FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: interactions interactions_opportunity_id_opportunities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT interactions_opportunity_id_opportunities_id_fk FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id);


--
-- Name: opportunities opportunities_contact_id_contacts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_contact_id_contacts_id_fk FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: opportunities opportunities_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: tasks tasks_contact_id_contacts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_contact_id_contacts_id_fk FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: tasks tasks_opportunity_id_opportunities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_opportunity_id_opportunities_id_fk FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id);


--
-- Name: tasks tasks_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id);


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

