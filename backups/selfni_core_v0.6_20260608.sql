--
-- PostgreSQL database dump
--

\restrict v4zgNTl7PsGTOtFciYWt3LzdgGvLC4tvGXfbR5CYsxHosGrfqHJE44aVZIGAk0F

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: amortization_schedule; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.amortization_schedule (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    debt_id uuid NOT NULL,
    installment_number integer NOT NULL,
    due_date date NOT NULL,
    principal_cents bigint NOT NULL,
    interest_cents bigint NOT NULL,
    total_payment_cents bigint NOT NULL,
    remaining_balance_cents bigint NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    paid_at timestamp with time zone
);


ALTER TABLE public.amortization_schedule OWNER TO u0_a202;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    phone text NOT NULL,
    name text,
    tenant_id text DEFAULT 'USER-001'::text NOT NULL,
    national_id text,
    email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO u0_a202;

--
-- Name: debt_agreements; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.debt_agreements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    principal_cents bigint NOT NULL,
    currency text DEFAULT 'EGP'::text NOT NULL,
    annual_rate_bps integer NOT NULL,
    term_months integer NOT NULL,
    amort_type text DEFAULT 'DECLINING'::text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    customer_id uuid
);


ALTER TABLE public.debt_agreements OWNER TO u0_a202;

--
-- Name: customer_portfolio_summary; Type: VIEW; Schema: public; Owner: u0_a202
--

CREATE VIEW public.customer_portfolio_summary AS
 SELECT c.id AS customer_id,
    c.tenant_id,
    c.name,
    c.phone,
    c.national_id,
    c.created_at,
    count(DISTINCT d.id) AS debt_count,
    COALESCE(sum(d.principal_cents), (0)::numeric) AS total_principal_cents,
    COALESCE(sum(s.remaining), (0)::numeric) AS remaining_balance_cents,
    COALESCE(sum(s.overdue_amount), (0)::numeric) AS overdue_amount_cents,
    COALESCE(sum(s.overdue_count), (0)::numeric) AS overdue_installments
   FROM ((public.customers c
     LEFT JOIN public.debt_agreements d ON ((d.customer_id = c.id)))
     LEFT JOIN LATERAL ( SELECT sum(amortization_schedule.total_payment_cents) FILTER (WHERE (amortization_schedule.status = 'OVERDUE'::text)) AS overdue_amount,
            count(*) FILTER (WHERE (amortization_schedule.status = 'OVERDUE'::text)) AS overdue_count,
            sum(amortization_schedule.remaining_balance_cents) FILTER (WHERE ((amortization_schedule.status <> 'PAID'::text) AND (amortization_schedule.installment_number = ( SELECT max(amortization_schedule_1.installment_number) AS max
                   FROM public.amortization_schedule amortization_schedule_1
                  WHERE (amortization_schedule_1.debt_id = d.id))))) AS remaining
           FROM public.amortization_schedule
          WHERE (amortization_schedule.debt_id = d.id)) s ON (true))
  GROUP BY c.id, c.tenant_id, c.name, c.phone, c.national_id, c.created_at;


ALTER VIEW public.customer_portfolio_summary OWNER TO u0_a202;

--
-- Name: dashboard_installments; Type: VIEW; Schema: public; Owner: u0_a202
--

CREATE VIEW public.dashboard_installments AS
 SELECT s.id AS installment_id,
    d.user_id,
    d.currency,
    s.due_date,
    s.total_payment_cents,
    s.status,
    (s.due_date - CURRENT_DATE) AS days_remaining,
        CASE
            WHEN (s.status = 'PAID'::text) THEN 'green'::text
            WHEN (s.due_date < CURRENT_DATE) THEN 'red'::text
            WHEN (s.due_date <= (CURRENT_DATE + '7 days'::interval)) THEN 'yellow'::text
            ELSE 'green'::text
        END AS color_code
   FROM (public.amortization_schedule s
     JOIN public.debt_agreements d ON ((s.debt_id = d.id)));


ALTER VIEW public.dashboard_installments OWNER TO u0_a202;

--
-- Name: financial_events; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.financial_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type character varying(50) NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.financial_events OWNER TO u0_a202;

--
-- Name: view_overdue_report; Type: VIEW; Schema: public; Owner: u0_a202
--

CREATE VIEW public.view_overdue_report AS
 SELECT s.id AS installment_id,
    s.installment_number,
    s.due_date,
    s.principal_cents,
    s.interest_cents,
    s.total_payment_cents,
    s.remaining_balance_cents,
    s.status,
    d.user_id,
    d.currency,
    (CURRENT_DATE - s.due_date) AS days_late,
    e.created_at AS event_recorded_at
   FROM ((public.amortization_schedule s
     JOIN public.debt_agreements d ON ((d.id = s.debt_id)))
     JOIN public.financial_events e ON (((((((e.payload #>> '{}'::text[]))::jsonb ->> 'installmentId'::text))::uuid = s.id) AND ((e.event_type)::text = 'InstallmentOverdue'::text))))
  WHERE (s.status = 'OVERDUE'::text);


ALTER VIEW public.view_overdue_report OWNER TO u0_a202;

--
-- Name: dashboard_overdue_summary; Type: VIEW; Schema: public; Owner: u0_a202
--

CREATE VIEW public.dashboard_overdue_summary AS
 SELECT count(*) AS overdue_count,
    sum(total_payment_cents) AS overdue_amount_cents,
    round(avg(days_late), 1) AS average_days_late,
    max(days_late) AS max_days_late
   FROM public.view_overdue_report;


ALTER VIEW public.dashboard_overdue_summary OWNER TO u0_a202;

--
-- Name: ledger_entries; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.ledger_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid,
    order_id uuid,
    type text NOT NULL,
    debit_account text NOT NULL,
    credit_account text NOT NULL,
    amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.ledger_entries OWNER TO u0_a202;

--
-- Name: merchants; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.merchants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    status text DEFAULT 'PENDING'::text,
    plan text DEFAULT 'FREE'::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.merchants OWNER TO u0_a202;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id text NOT NULL,
    customer_id uuid,
    debt_id uuid,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO u0_a202;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    product_id uuid,
    quantity integer NOT NULL,
    price numeric(12,2) NOT NULL
);


ALTER TABLE public.order_items OWNER TO u0_a202;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid,
    customer_id uuid,
    total_amount numeric(12,2) NOT NULL,
    status text DEFAULT 'PENDING'::text,
    payment_method text,
    created_at timestamp with time zone DEFAULT now(),
    salesman_id uuid
);


ALTER TABLE public.orders OWNER TO u0_a202;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    debt_id uuid NOT NULL,
    amount_cents bigint NOT NULL,
    currency text DEFAULT 'EGP'::text NOT NULL,
    penalties_paid bigint DEFAULT 0 NOT NULL,
    interest_paid bigint DEFAULT 0 NOT NULL,
    principal_paid bigint DEFAULT 0 NOT NULL,
    remaining bigint DEFAULT 0 NOT NULL,
    paid_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO u0_a202;

--
-- Name: products; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid,
    title text NOT NULL,
    description text,
    price numeric(12,2) NOT NULL,
    stock integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.products OWNER TO u0_a202;

--
-- Name: salesmen; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.salesmen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid,
    name text NOT NULL,
    commission_rate numeric(5,2) DEFAULT 0.05
);


ALTER TABLE public.salesmen OWNER TO u0_a202;

--
-- Name: users; Type: TABLE; Schema: public; Owner: u0_a202
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO u0_a202;

--
-- Data for Name: amortization_schedule; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.amortization_schedule (id, debt_id, installment_number, due_date, principal_cents, interest_cents, total_payment_cents, remaining_balance_cents, status, paid_at) FROM stdin;
617df7eb-ad7c-45ac-bbc1-af69918e4752	bb135790-a68b-470a-b4c8-7ed4cfbcf236	11	2026-07-01	70194	5615	75809	70200	PENDING	\N
22670939-a3d6-4492-89b6-6213f754b336	bb135790-a68b-470a-b4c8-7ed4cfbcf236	12	2026-08-01	70200	5615	75815	0	PENDING	\N
21bb5138-e670-4fa8-918a-1a3424c8e337	a637dc98-ca36-4dd1-a199-26e521c814d0	1	2026-07-07	83333	5000	88333	416667	PENDING	\N
0c300e4e-428f-4e55-a0f1-a91a4704764b	a637dc98-ca36-4dd1-a199-26e521c814d0	2	2026-08-07	83333	4166	87499	333334	PENDING	\N
f28654ea-d378-4c41-930c-89e2e230c300	a637dc98-ca36-4dd1-a199-26e521c814d0	3	2026-09-07	83333	3333	86666	250001	PENDING	\N
5c647330-dc25-41d6-aab2-5e10fa082d6f	a637dc98-ca36-4dd1-a199-26e521c814d0	4	2026-10-07	83333	2500	85833	166668	PENDING	\N
cdd2365e-0336-4aca-82ef-226d443fc4e6	a637dc98-ca36-4dd1-a199-26e521c814d0	5	2026-11-07	83333	1666	84999	83335	PENDING	\N
3c9b72ee-e24d-465c-ac65-b67ee9bc7519	a637dc98-ca36-4dd1-a199-26e521c814d0	6	2026-12-07	83335	833	84168	0	PENDING	\N
2c434eb8-d722-4cca-8575-bf210f661b39	4adb8edd-ed6e-44be-834c-66a2b485948a	1	2026-07-07	50000	3000	53000	250000	PENDING	\N
06e55740-1838-49d8-b32a-9d267a71657c	4adb8edd-ed6e-44be-834c-66a2b485948a	2	2026-08-07	50000	2500	52500	200000	PENDING	\N
db61e88a-c7fe-4316-988d-15bff7a68bb0	4adb8edd-ed6e-44be-834c-66a2b485948a	3	2026-09-07	50000	2000	52000	150000	PENDING	\N
99babbb4-16f6-4671-ae90-9851172a185b	4adb8edd-ed6e-44be-834c-66a2b485948a	4	2026-10-07	50000	1500	51500	100000	PENDING	\N
26ec061e-8ca4-42c8-8d65-effb8d3b7d82	4adb8edd-ed6e-44be-834c-66a2b485948a	5	2026-11-07	50000	1000	51000	50000	PENDING	\N
785e6f3e-b117-4da8-98c8-0c5cc163ff08	4adb8edd-ed6e-44be-834c-66a2b485948a	6	2026-12-07	50000	500	50500	0	PENDING	\N
a0f6eac9-c185-4fd4-91ae-61cf813789c6	bb135790-a68b-470a-b4c8-7ed4cfbcf236	8	2026-04-01	70194	5615	75809	280782	OVERDUE	\N
0d50adb4-7caf-4121-9dd5-e2b0ef2a9171	bb135790-a68b-470a-b4c8-7ed4cfbcf236	9	2026-05-01	70194	5615	75809	210588	OVERDUE	\N
f6e3aa90-995f-4593-aabb-3380e4ab7d49	bb135790-a68b-470a-b4c8-7ed4cfbcf236	10	2026-06-01	70194	5615	75809	140394	OVERDUE	\N
4e14b32c-2e86-4f79-b661-8feb25168b81	c8827b11-0662-44c8-99ff-425fa9013733	1	2025-07-01	166666	10000	176666	833334	OVERDUE	\N
753eb709-1009-4df8-b8fd-1e3f5a5facec	c8827b11-0662-44c8-99ff-425fa9013733	2	2025-08-01	166666	8333	174999	666668	OVERDUE	\N
a970580b-ca26-4525-93d9-756344b19c5a	c8827b11-0662-44c8-99ff-425fa9013733	3	2025-09-01	166666	6666	173332	500002	OVERDUE	\N
b3d38922-23c0-40c8-812c-b53360952293	c8827b11-0662-44c8-99ff-425fa9013733	4	2025-10-01	166666	5000	171666	333336	OVERDUE	\N
12664eea-7412-49f5-997d-d766dfe4b221	c8827b11-0662-44c8-99ff-425fa9013733	5	2025-11-01	166666	3333	169999	166670	OVERDUE	\N
7536cae4-0628-4635-9e11-caa1028f6017	c8827b11-0662-44c8-99ff-425fa9013733	6	2025-12-01	166670	1666	168336	0	OVERDUE	\N
362b3ecd-631b-4357-a60f-b2c9abcbd410	bb135790-a68b-470a-b4c8-7ed4cfbcf236	1	2025-09-01	70194	5615	75809	772140	OVERDUE	\N
5c57c984-3f87-40f7-82e0-6b08f22360f2	bb135790-a68b-470a-b4c8-7ed4cfbcf236	2	2025-10-01	70194	5615	75809	701946	OVERDUE	\N
6b1dd48d-907f-4f39-bf52-6b609818cb66	bb135790-a68b-470a-b4c8-7ed4cfbcf236	3	2025-11-01	70194	5615	75809	631752	OVERDUE	\N
1aaf7384-6dc2-479f-9e7a-d1061748ed34	bb135790-a68b-470a-b4c8-7ed4cfbcf236	4	2025-12-01	70194	5615	75809	561558	OVERDUE	\N
13d3c6f7-3310-40d7-b5a6-5f2893938a3c	bb135790-a68b-470a-b4c8-7ed4cfbcf236	5	2026-01-01	70194	5615	75809	491364	OVERDUE	\N
cf30e262-85a2-4a68-b1ec-fcdf2d09870a	bb135790-a68b-470a-b4c8-7ed4cfbcf236	6	2026-02-01	70194	5615	75809	421170	OVERDUE	\N
78372989-3004-44bd-a1b3-0925fc4a1c90	bb135790-a68b-470a-b4c8-7ed4cfbcf236	7	2026-03-01	70194	5615	75809	350976	OVERDUE	\N
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.customers (id, phone, name, tenant_id, national_id, email, created_at) FROM stdin;
993756d6-a2c2-4a7e-87d3-1f218eb7798c	01	\N	USER-001	\N	\N	2026-06-07 04:58:17.669672+02
b0fffb66-d9af-468e-8c9f-84d05b7b9381	01000000001	عميل افتراضي	USER-001	\N	\N	2026-06-07 04:58:17.737489+02
7ccaf14d-6554-4f38-b8b2-4425e4f6c132	01000000002	عميل A	TENANT-A	\N	\N	2026-06-07 04:58:17.737489+02
e8989990-ed78-4cb6-8f7b-f1d35b104d3e	01000000003	عميل B	TENANT-B	\N	\N	2026-06-07 04:58:17.737489+02
54a464d2-2ff2-4cdf-b178-1ec386d27751	01012345678	أحمد محمد	4c17051d-0760-4d02-b130-a13cf5d3ed20	12345678901234	\N	2026-06-07 05:04:10.058954+02
\.


--
-- Data for Name: debt_agreements; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.debt_agreements (id, user_id, principal_cents, currency, annual_rate_bps, term_months, amort_type, status, created_at, customer_id) FROM stdin;
5f142b66-9bb1-402e-95bb-54e357946650	TENANT-A	50000	EGP	1000	6	DECLINING	ACTIVE	2026-06-05 07:30:47.843207+02	7ccaf14d-6554-4f38-b8b2-4425e4f6c132
d46a748a-b552-46ed-b68c-00c107b3aca1	TENANT-B	75000	EGP	1000	6	DECLINING	ACTIVE	2026-06-05 07:30:47.857182+02	e8989990-ed78-4cb6-8f7b-f1d35b104d3e
13dd4ed8-5d5a-44ec-bc67-97bda840df39	4c17051d-0760-4d02-b130-a13cf5d3ed20	500000	EGP	1200	6	DECLINING_BALANCE	ACTIVE	2026-06-07 05:05:25.246424+02	\N
a637dc98-ca36-4dd1-a199-26e521c814d0	4c17051d-0760-4d02-b130-a13cf5d3ed20	500000	EGP	1200	6	DECLINING_BALANCE	ACTIVE	2026-06-07 05:09:17.431157+02	\N
4adb8edd-ed6e-44be-834c-66a2b485948a	4c17051d-0760-4d02-b130-a13cf5d3ed20	300000	EGP	1200	6	DECLINING_BALANCE	ACTIVE	2026-06-07 10:21:24.999465+02	54a464d2-2ff2-4cdf-b178-1ec386d27751
6c0b8f27-79bd-4c5b-87d1-a7bd5c52b631	4c17051d-0760-4d02-b130-a13cf5d3ed20	1000000	EGP	1200	6	DECLINING	ACTIVE	2026-06-06 11:22:08.574891+02	b0fffb66-d9af-468e-8c9f-84d05b7b9381
bb135790-a68b-470a-b4c8-7ed4cfbcf236	4c17051d-0760-4d02-b130-a13cf5d3ed20	842334	EGP	800	12	FLAT	RESTRUCTURED	2026-06-06 11:27:18.907892+02	b0fffb66-d9af-468e-8c9f-84d05b7b9381
c8827b11-0662-44c8-99ff-425fa9013733	4c17051d-0760-4d02-b130-a13cf5d3ed20	1000000	EGP	1200	6	DECLINING	CLOSED	2026-06-06 11:26:28.528349+02	b0fffb66-d9af-468e-8c9f-84d05b7b9381
\.


--
-- Data for Name: financial_events; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.financial_events (id, event_type, payload, created_at) FROM stdin;
a8af75df-b55b-4a0f-953b-d3705fe8f122	InstallmentOverdue	{"dueDate": "2026-04-01T00:00:00.000Z", "currency": "EGP", "daysLate": 67, "customerId": "USER-001", "occurredAt": "2026-06-07T01:15:51.357Z", "amountCents": "75809", "installmentId": "a0f6eac9-c185-4fd4-91ae-61cf813789c6"}	2026-06-07 03:15:51.322276+02
e6f1ec9a-b447-4e4e-87d0-22dd87ebadc6	InstallmentOverdue	{"dueDate": "2026-05-01T00:00:00.000Z", "currency": "EGP", "daysLate": 37, "customerId": "USER-001", "occurredAt": "2026-06-07T01:15:51.388Z", "amountCents": "75809", "installmentId": "0d50adb4-7caf-4121-9dd5-e2b0ef2a9171"}	2026-06-07 03:15:51.322276+02
ccd91d87-0622-4160-b968-a359a755763f	InstallmentOverdue	{"dueDate": "2026-06-01T00:00:00.000Z", "currency": "EGP", "daysLate": 6, "customerId": "USER-001", "occurredAt": "2026-06-07T01:15:51.393Z", "amountCents": "75809", "installmentId": "f6e3aa90-995f-4593-aabb-3380e4ab7d49"}	2026-06-07 03:15:51.322276+02
e7b0618f-0f69-4603-bce8-af8f717f1436	InstallmentOverdue	{"dueDate": "2025-07-01T00:00:00.000Z", "currency": "EGP", "daysLate": 341, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.677Z", "amountCents": "176666", "installmentId": "4e14b32c-2e86-4f79-b661-8feb25168b81"}	2026-06-07 03:18:27.662587+02
28d78155-3bd1-4fcf-9a45-4cc356b65248	InstallmentOverdue	{"dueDate": "2025-08-01T00:00:00.000Z", "currency": "EGP", "daysLate": 310, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.686Z", "amountCents": "174999", "installmentId": "753eb709-1009-4df8-b8fd-1e3f5a5facec"}	2026-06-07 03:18:27.662587+02
c4591715-ba09-4062-8978-f8a52d976648	InstallmentOverdue	{"dueDate": "2025-09-01T00:00:00.000Z", "currency": "EGP", "daysLate": 279, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.690Z", "amountCents": "173332", "installmentId": "a970580b-ca26-4525-93d9-756344b19c5a"}	2026-06-07 03:18:27.662587+02
220ef346-09af-404f-8fa1-d0f3ee451ebf	InstallmentOverdue	{"dueDate": "2025-10-01T00:00:00.000Z", "currency": "EGP", "daysLate": 249, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.695Z", "amountCents": "171666", "installmentId": "b3d38922-23c0-40c8-812c-b53360952293"}	2026-06-07 03:18:27.662587+02
381477dc-d91c-4b6e-9a76-67cd6b55b8bd	InstallmentOverdue	{"dueDate": "2025-11-01T00:00:00.000Z", "currency": "EGP", "daysLate": 218, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.699Z", "amountCents": "169999", "installmentId": "12664eea-7412-49f5-997d-d766dfe4b221"}	2026-06-07 03:18:27.662587+02
c5ee34d5-2661-4327-be09-14ed60973327	InstallmentOverdue	{"dueDate": "2025-12-01T00:00:00.000Z", "currency": "EGP", "daysLate": 188, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.703Z", "amountCents": "168336", "installmentId": "7536cae4-0628-4635-9e11-caa1028f6017"}	2026-06-07 03:18:27.662587+02
bf3c5b11-5edd-49b2-b0fb-03bb82938fc1	InstallmentOverdue	{"dueDate": "2025-09-01T00:00:00.000Z", "currency": "EGP", "daysLate": 279, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.707Z", "amountCents": "75809", "installmentId": "362b3ecd-631b-4357-a60f-b2c9abcbd410"}	2026-06-07 03:18:27.662587+02
6c81b3af-eb3c-406c-8336-4cfc9084a57b	InstallmentOverdue	{"dueDate": "2025-10-01T00:00:00.000Z", "currency": "EGP", "daysLate": 249, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.711Z", "amountCents": "75809", "installmentId": "5c57c984-3f87-40f7-82e0-6b08f22360f2"}	2026-06-07 03:18:27.662587+02
8231716c-0cc8-49bf-8ca8-4811887162a6	InstallmentOverdue	{"dueDate": "2025-11-01T00:00:00.000Z", "currency": "EGP", "daysLate": 218, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.715Z", "amountCents": "75809", "installmentId": "6b1dd48d-907f-4f39-bf52-6b609818cb66"}	2026-06-07 03:18:27.662587+02
2830c8b5-55f0-4f5b-af1b-8342c198e837	InstallmentOverdue	{"dueDate": "2025-12-01T00:00:00.000Z", "currency": "EGP", "daysLate": 188, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.719Z", "amountCents": "75809", "installmentId": "1aaf7384-6dc2-479f-9e7a-d1061748ed34"}	2026-06-07 03:18:27.662587+02
e7914a9d-547d-4f81-aaa7-32ec71511f13	InstallmentOverdue	{"dueDate": "2026-01-01T00:00:00.000Z", "currency": "EGP", "daysLate": 157, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.723Z", "amountCents": "75809", "installmentId": "13d3c6f7-3310-40d7-b5a6-5f2893938a3c"}	2026-06-07 03:18:27.662587+02
23d8075a-6c86-45a4-bf71-f4392e21874f	InstallmentOverdue	{"dueDate": "2026-02-01T00:00:00.000Z", "currency": "EGP", "daysLate": 126, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.727Z", "amountCents": "75809", "installmentId": "cf30e262-85a2-4a68-b1ec-fcdf2d09870a"}	2026-06-07 03:18:27.662587+02
8c510444-3af4-4a13-9a92-48411fa6ee0c	InstallmentOverdue	{"dueDate": "2026-03-01T00:00:00.000Z", "currency": "EGP", "daysLate": 98, "customerId": "USER-001", "occurredAt": "2026-06-07T01:18:27.731Z", "amountCents": "75809", "installmentId": "78372989-3004-44bd-a1b3-0925fc4a1c90"}	2026-06-07 03:18:27.662587+02
\.


--
-- Data for Name: ledger_entries; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.ledger_entries (id, merchant_id, order_id, type, debit_account, credit_account, amount, created_at) FROM stdin;
6a105a88-605d-4fea-97f4-2a46b9ce4670	aa9e6627-9ac5-4ea7-95d9-f41c55efca72	0d0c235a-58ec-4c68-b8dc-4494a98ccc47	SALE	CASH_RECEIVABLE	SALES_REVENUE	1000.00	2026-06-05 10:02:49.625702+02
84f7d5f7-2904-4c83-810b-317fe3c1408a	aa9e6627-9ac5-4ea7-95d9-f41c55efca72	0d0c235a-58ec-4c68-b8dc-4494a98ccc47	COMMISSION	SALESMAN_PAYABLE	SALESMAN_COMMISSION	100.00	2026-06-05 10:02:49.625702+02
\.


--
-- Data for Name: merchants; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.merchants (id, name, phone, status, plan, created_at) FROM stdin;
aa9e6627-9ac5-4ea7-95d9-f41c55efca72	موزع الجملة	0100	PENDING	FREE	2026-06-05 10:02:49.581559+02
e9545337-cb12-4d94-8542-1c43d053820f	متجر الجملة التجريبي	01012345678	PENDING	FREE	2026-06-05 10:28:52.590243+02
8c039276-b59c-4f52-8fa7-7fa54882c821	المتجر الرئيسي	01011122233	PENDING	FREE	2026-06-05 10:31:17.622953+02
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.notifications (id, tenant_id, customer_id, debt_id, type, title, body, is_read, created_at) FROM stdin;
b107279e-5cc4-45b8-b11e-e4ab82a707a9	4c17051d-0760-4d02-b130-a13cf5d3ed20	b0fffb66-d9af-468e-8c9f-84d05b7b9381	bb135790-a68b-470a-b4c8-7ed4cfbcf236	OVERDUE_REMINDER	تذكير: قسط متأخر	العميل عميل افتراضي — قسط رقم 6 متأخر منذ 126 يوم بمبلغ 758 جنيه	f	2026-06-07 21:16:17.141766+02
993340d3-452a-4610-abb7-0c475444081f	4c17051d-0760-4d02-b130-a13cf5d3ed20	b0fffb66-d9af-468e-8c9f-84d05b7b9381	bb135790-a68b-470a-b4c8-7ed4cfbcf236	OVERDUE_REMINDER	تذكير: قسط متأخر	العميل عميل افتراضي — قسط رقم 10 متأخر منذ 7 يوم بمبلغ 758 جنيه	f	2026-06-08 00:00:01.850879+02
a1158708-391f-4bdc-b104-c456743edffd	4c17051d-0760-4d02-b130-a13cf5d3ed20	b0fffb66-d9af-468e-8c9f-84d05b7b9381	c8827b11-0662-44c8-99ff-425fa9013733	OVERDUE_REMINDER	تذكير: قسط متأخر	العميل عميل افتراضي — قسط رقم 3 متأخر منذ 280 يوم بمبلغ 1733 جنيه	f	2026-06-08 00:00:01.873641+02
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.order_items (id, order_id, product_id, quantity, price) FROM stdin;
c294933b-9cdc-4e18-9239-b7646688b81e	0d0c235a-58ec-4c68-b8dc-4494a98ccc47	fc98cbde-4b1c-43a3-af4b-16a506b2d2fb	1	1000.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.orders (id, merchant_id, customer_id, total_amount, status, payment_method, created_at, salesman_id) FROM stdin;
0d0c235a-58ec-4c68-b8dc-4494a98ccc47	aa9e6627-9ac5-4ea7-95d9-f41c55efca72	993756d6-a2c2-4a7e-87d3-1f218eb7798c	1000.00	CONFIRMED	\N	2026-06-05 10:02:49.625702+02	590e6a53-08b8-4849-a45a-bf172761835e
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.payments (id, debt_id, amount_cents, currency, penalties_paid, interest_paid, principal_paid, remaining, paid_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.products (id, merchant_id, title, description, price, stock, is_active, created_at) FROM stdin;
fc98cbde-4b1c-43a3-af4b-16a506b2d2fb	aa9e6627-9ac5-4ea7-95d9-f41c55efca72	بضاعة	\N	1000.00	0	t	2026-06-05 10:02:49.603386+02
f19b9b70-d6b2-4e23-901b-cc87f10a5e2c	8c039276-b59c-4f52-8fa7-7fa54882c821	تيشرت قطني	\N	500.00	10	t	2026-06-05 10:33:28.138913+02
\.


--
-- Data for Name: salesmen; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.salesmen (id, merchant_id, name, commission_rate) FROM stdin;
590e6a53-08b8-4849-a45a-bf172761835e	aa9e6627-9ac5-4ea7-95d9-f41c55efca72	أحمد المندوب	0.10
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: u0_a202
--

COPY public.users (id, username, email, password_hash, created_at) FROM stdin;
4c17051d-0760-4d02-b130-a13cf5d3ed20	حسام	hossam@selfni.com	$2b$10$iuVBOxvJlGzCM78L61qErOptIst.X0PX7fAyYbR1iPJZmzAfEq4ZS	2026-06-04 12:50:46.901706+02
\.


--
-- Name: amortization_schedule amortization_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.amortization_schedule
    ADD CONSTRAINT amortization_schedule_pkey PRIMARY KEY (id);


--
-- Name: customers customers_phone_unique; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_phone_unique UNIQUE (phone);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: debt_agreements debt_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.debt_agreements
    ADD CONSTRAINT debt_agreements_pkey PRIMARY KEY (id);


--
-- Name: financial_events financial_events_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.financial_events
    ADD CONSTRAINT financial_events_pkey PRIMARY KEY (id);


--
-- Name: ledger_entries ledger_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_pkey PRIMARY KEY (id);


--
-- Name: merchants merchants_phone_key; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.merchants
    ADD CONSTRAINT merchants_phone_key UNIQUE (phone);


--
-- Name: merchants merchants_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.merchants
    ADD CONSTRAINT merchants_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: salesmen salesmen_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.salesmen
    ADD CONSTRAINT salesmen_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_notifications_tenant; Type: INDEX; Schema: public; Owner: u0_a202
--

CREATE INDEX idx_notifications_tenant ON public.notifications USING btree (tenant_id);


--
-- Name: idx_notifications_unread; Type: INDEX; Schema: public; Owner: u0_a202
--

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (tenant_id, is_read) WHERE (is_read = false);


--
-- Name: idx_payments_debt; Type: INDEX; Schema: public; Owner: u0_a202
--

CREATE INDEX idx_payments_debt ON public.payments USING btree (debt_id);


--
-- Name: idx_schedule_debt; Type: INDEX; Schema: public; Owner: u0_a202
--

CREATE INDEX idx_schedule_debt ON public.amortization_schedule USING btree (debt_id);


--
-- Name: uq_installment_overdue; Type: INDEX; Schema: public; Owner: u0_a202
--

CREATE UNIQUE INDEX uq_installment_overdue ON public.financial_events USING btree (event_type, ((payload ->> 'installmentId'::text))) WHERE ((event_type)::text = 'InstallmentOverdue'::text);


--
-- Name: amortization_schedule amortization_schedule_debt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.amortization_schedule
    ADD CONSTRAINT amortization_schedule_debt_id_fkey FOREIGN KEY (debt_id) REFERENCES public.debt_agreements(id);


--
-- Name: debt_agreements debt_agreements_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.debt_agreements
    ADD CONSTRAINT debt_agreements_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: ledger_entries ledger_entries_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id);


--
-- Name: ledger_entries ledger_entries_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: notifications notifications_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: notifications notifications_debt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_debt_id_fkey FOREIGN KEY (debt_id) REFERENCES public.debt_agreements(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: orders orders_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id);


--
-- Name: orders orders_salesman_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_salesman_id_fkey FOREIGN KEY (salesman_id) REFERENCES public.salesmen(id);


--
-- Name: payments payments_debt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_debt_id_fkey FOREIGN KEY (debt_id) REFERENCES public.debt_agreements(id);


--
-- Name: products products_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id);


--
-- Name: salesmen salesmen_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: u0_a202
--

ALTER TABLE ONLY public.salesmen
    ADD CONSTRAINT salesmen_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id);


--
-- PostgreSQL database dump complete
--

\unrestrict v4zgNTl7PsGTOtFciYWt3LzdgGvLC4tvGXfbR5CYsxHosGrfqHJE44aVZIGAk0F

