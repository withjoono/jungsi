--
-- PostgreSQL database dump
--

\restrict xexbOrJhtMMU8vCN4fIIilTCni175abro4bLfW93OfzXfhz1ruNfWhqlJlkKH5T

-- Dumped from database version 14.20 (Debian 14.20-1.pgdg13+1)
-- Dumped by pg_dump version 14.20 (Debian 14.20-1.pgdg13+1)

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
-- Name: ts_admissions_basic_type_enum; Type: TYPE; Schema: public; Owner: tsuser
--

CREATE TYPE public.ts_admissions_basic_type_enum AS ENUM (
    '일반',
    '특별'
);


ALTER TYPE public.ts_admissions_basic_type_enum OWNER TO tsuser;

--
-- Name: ts_recruitment_unit_minimum_grades_is_applied_enum; Type: TYPE; Schema: public; Owner: tsuser
--

CREATE TYPE public.ts_recruitment_unit_minimum_grades_is_applied_enum AS ENUM (
    'Y',
    'N'
);


ALTER TYPE public.ts_recruitment_unit_minimum_grades_is_applied_enum OWNER TO tsuser;

--
-- Name: ts_universities_establishment_type_enum; Type: TYPE; Schema: public; Owner: tsuser
--

CREATE TYPE public.ts_universities_establishment_type_enum AS ENUM (
    '국립',
    '사립',
    ''
);


ALTER TYPE public.ts_universities_establishment_type_enum OWNER TO tsuser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: board_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.board_tb (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    permission character varying(50) NOT NULL
);


ALTER TABLE public.board_tb OWNER TO tsuser;

--
-- Name: COLUMN board_tb.name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.board_tb.name IS '게시판 이름';


--
-- Name: COLUMN board_tb.permission; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.board_tb.permission IS '게시판 권한 (ROLE_ADMIN 또는 ROLE_USER)';


--
-- Name: board_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.board_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.board_tb_id_seq OWNER TO tsuser;

--
-- Name: board_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.board_tb_id_seq OWNED BY public.board_tb.id;


--
-- Name: comment_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.comment_tb (
    id bigint NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    post_id bigint,
    member_id bigint
);


ALTER TABLE public.comment_tb OWNER TO tsuser;

--
-- Name: COLUMN comment_tb.content; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.comment_tb.content IS '댓글 내용';


--
-- Name: COLUMN comment_tb.created_at; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.comment_tb.created_at IS '댓글 작성일';


--
-- Name: COLUMN comment_tb.updated_at; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.comment_tb.updated_at IS '댓글 수정일';


--
-- Name: comment_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.comment_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comment_tb_id_seq OWNER TO tsuser;

--
-- Name: comment_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.comment_tb_id_seq OWNED BY public.comment_tb.id;


--
-- Name: earlyd_subject_code_list_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.earlyd_subject_code_list_tb (
    id bigint NOT NULL,
    main_subject_code character varying(500) NOT NULL,
    main_subject_name character varying(500) NOT NULL,
    subject_code character varying(500) NOT NULL,
    subject_name character varying(500) NOT NULL,
    type integer,
    course_type smallint DEFAULT '0'::smallint NOT NULL,
    is_required boolean DEFAULT false NOT NULL
);


ALTER TABLE public.earlyd_subject_code_list_tb OWNER TO tsuser;

--
-- Name: COLUMN earlyd_subject_code_list_tb.type; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.earlyd_subject_code_list_tb.type IS '평가방식 (0: 석차등급, 1: 성취도)';


--
-- Name: COLUMN earlyd_subject_code_list_tb.course_type; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.earlyd_subject_code_list_tb.course_type IS '과목 종류 (0: 공통일반, 1: 일반선택, 2: 진로선택, 3: 전문교과1, 4: 전문교과2)';


--
-- Name: COLUMN earlyd_subject_code_list_tb.is_required; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.earlyd_subject_code_list_tb.is_required IS '필수 과목 여부 (false: 선택, true: 필수)';


--
-- Name: earlyd_subject_code_list_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.earlyd_subject_code_list_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.earlyd_subject_code_list_tb_id_seq OWNER TO tsuser;

--
-- Name: earlyd_subject_code_list_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.earlyd_subject_code_list_tb_id_seq OWNED BY public.earlyd_subject_code_list_tb.id;


--
-- Name: essay_list_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.essay_list_tb (
    id integer NOT NULL,
    admission_series_code character varying(50) NOT NULL,
    college_code character varying(100) NOT NULL,
    integration_code character varying(1000) NOT NULL,
    essay_subject character varying(100) NOT NULL,
    essay_type character varying(100) NOT NULL,
    examination_tendency character varying(1000) NOT NULL,
    competition_rate character varying(1000) NOT NULL,
    recruitment_unit character varying(200) NOT NULL,
    rthree_etc_code character varying(1000) NOT NULL,
    rthree_etc_flag integer NOT NULL,
    rthree_region_flag integer NOT NULL,
    rthree_region_info character varying(1000) NOT NULL,
    su_nosul character varying(1000) NOT NULL,
    susi character varying(1000) NOT NULL,
    type_rate character varying(100) NOT NULL,
    type_time character varying(1000) NOT NULL,
    admission_date character varying(255),
    admission_time character varying(255),
    common_math integer,
    common_science integer,
    cross_support integer,
    df_in integer,
    except_nonsul integer,
    geometry integer,
    hwaone integer,
    hwaonetwo integer,
    jiown integer,
    jiowntwo integer,
    mulone integer,
    mulonetwo integer,
    mun_mathen integer,
    pb_st integer,
    sangone integer,
    sangonetwo integer,
    science_designation integer,
    select_math_subject integer,
    select_science_subject integer,
    student_recruitment_num integer,
    suone_sutwo integer
);


ALTER TABLE public.essay_list_tb OWNER TO tsuser;

--
-- Name: essay_list_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.essay_list_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.essay_list_tb_id_seq OWNER TO tsuser;

--
-- Name: essay_list_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.essay_list_tb_id_seq OWNED BY public.essay_list_tb.id;


--
-- Name: essay_lowest_grade_list_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.essay_lowest_grade_list_tb (
    id integer NOT NULL,
    college_code character varying(1000) NOT NULL,
    content character varying(1000) NOT NULL,
    essay_id bigint,
    lowest_cal integer NOT NULL,
    lowest_count integer NOT NULL,
    lowest_english integer NOT NULL,
    lowest_history integer NOT NULL,
    lowest_korean integer NOT NULL,
    lowest_math integer NOT NULL,
    lowest_migi integer NOT NULL,
    lowest_science integer NOT NULL,
    lowest_society integer NOT NULL,
    lowest_sum integer NOT NULL,
    lowest_use integer NOT NULL
);


ALTER TABLE public.essay_lowest_grade_list_tb OWNER TO tsuser;

--
-- Name: essay_lowest_grade_list_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.essay_lowest_grade_list_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.essay_lowest_grade_list_tb_id_seq OWNER TO tsuser;

--
-- Name: essay_lowest_grade_list_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.essay_lowest_grade_list_tb_id_seq OWNED BY public.essay_lowest_grade_list_tb.id;


--
-- Name: member_interests; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.member_interests (
    id integer NOT NULL,
    member_id bigint NOT NULL,
    target_table character varying(50) NOT NULL,
    target_id bigint NOT NULL,
    evaluation_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.member_interests OWNER TO tsuser;

--
-- Name: member_interests_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.member_interests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.member_interests_id_seq OWNER TO tsuser;

--
-- Name: member_interests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.member_interests_id_seq OWNED BY public.member_interests.id;


--
-- Name: member_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.member_tb (
    id bigint NOT NULL,
    email character varying(500) NOT NULL,
    password character varying(500),
    role_type character varying(500) NOT NULL,
    phone character varying(255) NOT NULL,
    ck_sms bit(1) DEFAULT '0'::"bit" NOT NULL,
    ck_sms_agree bit(1) DEFAULT '0'::"bit" NOT NULL,
    expiration_period integer,
    nickname character varying(255),
    member_type character varying(20) DEFAULT 'student'::character varying NOT NULL,
    introduction character varying(255),
    profile_image_url character varying(4000),
    address character varying(500),
    provider_type character varying(20),
    oauth_id character varying(500),
    s_type_id bigint,
    hst_type_id bigint,
    g_type_id bigint,
    graduate_year character varying(500),
    major character varying(500),
    account_stop_yn character varying(1) DEFAULT 'N'::character varying NOT NULL,
    create_dt timestamp without time zone,
    update_dt timestamp without time zone
);


ALTER TABLE public.member_tb OWNER TO tsuser;

--
-- Name: member_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.member_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.member_tb_id_seq OWNER TO tsuser;

--
-- Name: member_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.member_tb_id_seq OWNED BY public.member_tb.id;


--
-- Name: member_upload_file_list_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.member_upload_file_list_tb (
    id bigint NOT NULL,
    create_dt timestamp without time zone DEFAULT now() NOT NULL,
    file_key character varying(500) NOT NULL,
    file_name character varying(500) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer,
    file_type character varying(500) NOT NULL,
    member_id bigint NOT NULL,
    update_dt timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.member_upload_file_list_tb OWNER TO tsuser;

--
-- Name: member_upload_file_list_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.member_upload_file_list_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.member_upload_file_list_tb_id_seq OWNER TO tsuser;

--
-- Name: member_upload_file_list_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.member_upload_file_list_tb_id_seq OWNED BY public.member_upload_file_list_tb.id;


--
-- Name: mockexam_marks_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.mockexam_marks_tb (
    id integer NOT NULL,
    marks_score character varying(500) NOT NULL,
    subject_code character varying(500) NOT NULL,
    member_id bigint,
    schedule_id integer
);


ALTER TABLE public.mockexam_marks_tb OWNER TO tsuser;

--
-- Name: mockexam_marks_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.mockexam_marks_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mockexam_marks_tb_id_seq OWNER TO tsuser;

--
-- Name: mockexam_marks_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.mockexam_marks_tb_id_seq OWNED BY public.mockexam_marks_tb.id;


--
-- Name: mockexam_raw_score_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.mockexam_raw_score_tb (
    id integer NOT NULL,
    raw_score character varying(500) NOT NULL,
    subject_code character varying(500) NOT NULL,
    member_id bigint,
    schedule_id integer
);


ALTER TABLE public.mockexam_raw_score_tb OWNER TO tsuser;

--
-- Name: mockexam_raw_score_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.mockexam_raw_score_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mockexam_raw_score_tb_id_seq OWNER TO tsuser;

--
-- Name: mockexam_raw_score_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.mockexam_raw_score_tb_id_seq OWNED BY public.mockexam_raw_score_tb.id;


--
-- Name: mockexam_raw_to_standard_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.mockexam_raw_to_standard_tb (
    id integer NOT NULL,
    code character varying(500) NOT NULL,
    grade integer,
    percentile double precision NOT NULL,
    raw_score_common character varying(500) NOT NULL,
    raw_score_select character varying(500) NOT NULL,
    standard_score character varying(500) NOT NULL,
    top_cumulative double precision NOT NULL
);


ALTER TABLE public.mockexam_raw_to_standard_tb OWNER TO tsuser;

--
-- Name: mockexam_raw_to_standard_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.mockexam_raw_to_standard_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mockexam_raw_to_standard_tb_id_seq OWNER TO tsuser;

--
-- Name: mockexam_raw_to_standard_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.mockexam_raw_to_standard_tb_id_seq OWNED BY public.mockexam_raw_to_standard_tb.id;


--
-- Name: mockexam_schedule_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.mockexam_schedule_tb (
    id integer NOT NULL,
    mockexam_month character varying(50) NOT NULL,
    mockexam_year character varying(50) NOT NULL
);


ALTER TABLE public.mockexam_schedule_tb OWNER TO tsuser;

--
-- Name: mockexam_schedule_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.mockexam_schedule_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mockexam_schedule_tb_id_seq OWNER TO tsuser;

--
-- Name: mockexam_schedule_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.mockexam_schedule_tb_id_seq OWNED BY public.mockexam_schedule_tb.id;


--
-- Name: mockexam_standard_score_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.mockexam_standard_score_tb (
    id integer NOT NULL,
    standard_score integer,
    grade integer NOT NULL,
    percentile integer,
    subject_code character varying(500) NOT NULL,
    member_id bigint,
    schedule_id integer
);


ALTER TABLE public.mockexam_standard_score_tb OWNER TO tsuser;

--
-- Name: mockexam_standard_score_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.mockexam_standard_score_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mockexam_standard_score_tb_id_seq OWNER TO tsuser;

--
-- Name: mockexam_standard_score_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.mockexam_standard_score_tb_id_seq OWNED BY public.mockexam_standard_score_tb.id;


--
-- Name: officer_bottom_survey_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.officer_bottom_survey_tb (
    id integer NOT NULL,
    evaluate_content character varying(500) NOT NULL,
    order_num integer
);


ALTER TABLE public.officer_bottom_survey_tb OWNER TO tsuser;

--
-- Name: officer_bottom_survey_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.officer_bottom_survey_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.officer_bottom_survey_tb_id_seq OWNER TO tsuser;

--
-- Name: officer_bottom_survey_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.officer_bottom_survey_tb_id_seq OWNED BY public.officer_bottom_survey_tb.id;


--
-- Name: officer_comment_list_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.officer_comment_list_tb (
    id integer NOT NULL,
    comment character varying(7000) NOT NULL,
    main_survey_type character varying(255) NOT NULL,
    officer_relation_id bigint NOT NULL
);


ALTER TABLE public.officer_comment_list_tb OWNER TO tsuser;

--
-- Name: officer_comment_list_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.officer_comment_list_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.officer_comment_list_tb_id_seq OWNER TO tsuser;

--
-- Name: officer_comment_list_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.officer_comment_list_tb_id_seq OWNED BY public.officer_comment_list_tb.id;


--
-- Name: officer_list_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.officer_list_tb (
    id bigint NOT NULL,
    approval_status integer NOT NULL,
    create_dt timestamp without time zone,
    del_yn character varying(255),
    education character varying(500),
    officer_apply_file character varying(500),
    officer_name character varying(500),
    officer_profile_image character varying(500),
    reject_reason character varying(500),
    university character varying(500),
    update_dt timestamp without time zone,
    member_id bigint
);


ALTER TABLE public.officer_list_tb OWNER TO tsuser;

--
-- Name: officer_list_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.officer_list_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.officer_list_tb_id_seq OWNER TO tsuser;

--
-- Name: officer_list_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.officer_list_tb_id_seq OWNED BY public.officer_list_tb.id;


--
-- Name: officer_scoring_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.officer_scoring_tb (
    id integer NOT NULL,
    bottom_survey_id bigint,
    officer_relation_id bigint NOT NULL,
    score integer NOT NULL
);


ALTER TABLE public.officer_scoring_tb OWNER TO tsuser;

--
-- Name: officer_scoring_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.officer_scoring_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.officer_scoring_tb_id_seq OWNER TO tsuser;

--
-- Name: officer_scoring_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.officer_scoring_tb_id_seq OWNED BY public.officer_scoring_tb.id;


--
-- Name: officer_student_evaludate_relation_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.officer_student_evaludate_relation_tb (
    id integer NOT NULL,
    create_dt timestamp without time zone DEFAULT now(),
    member_id bigint NOT NULL,
    series character varying(500) NOT NULL,
    status character varying(500) NOT NULL,
    student_id bigint NOT NULL,
    update_dt timestamp without time zone DEFAULT now()
);


ALTER TABLE public.officer_student_evaludate_relation_tb OWNER TO tsuser;

--
-- Name: officer_student_evaludate_relation_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.officer_student_evaludate_relation_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.officer_student_evaludate_relation_tb_id_seq OWNER TO tsuser;

--
-- Name: officer_student_evaludate_relation_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.officer_student_evaludate_relation_tb_id_seq OWNED BY public.officer_student_evaludate_relation_tb.id;


--
-- Name: officer_ticket_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.officer_ticket_tb (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    ticket_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.officer_ticket_tb OWNER TO tsuser;

--
-- Name: officer_ticket_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.officer_ticket_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.officer_ticket_tb_id_seq OWNER TO tsuser;

--
-- Name: officer_ticket_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.officer_ticket_tb_id_seq OWNED BY public.officer_ticket_tb.id;


--
-- Name: pay_cancel_log_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.pay_cancel_log_tb (
    id bigint NOT NULL,
    cancel_reason character varying(500),
    code character varying(500) NOT NULL,
    fail_reason character varying(500),
    imp_uid character varying(500) NOT NULL,
    merchant_uid character varying(500) NOT NULL,
    pay_amount character varying(500) NOT NULL,
    pay_method character varying(500),
    result_msg character varying(500),
    status character varying(500),
    create_dt timestamp without time zone,
    update_dt timestamp without time zone
);


ALTER TABLE public.pay_cancel_log_tb OWNER TO tsuser;

--
-- Name: pay_cancel_log_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.pay_cancel_log_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pay_cancel_log_tb_id_seq OWNER TO tsuser;

--
-- Name: pay_cancel_log_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.pay_cancel_log_tb_id_seq OWNED BY public.pay_cancel_log_tb.id;


--
-- Name: pay_contract_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.pay_contract_tb (
    id bigint NOT NULL,
    contract_period_end_dt timestamp without time zone NOT NULL,
    contract_start_dt timestamp without time zone NOT NULL,
    contract_use integer,
    create_dt timestamp without time zone,
    product_code character varying(200) NOT NULL,
    regular_contract_fl boolean NOT NULL,
    update_dt timestamp without time zone,
    member_id bigint,
    order_id integer
);


ALTER TABLE public.pay_contract_tb OWNER TO tsuser;

--
-- Name: COLUMN pay_contract_tb.contract_period_end_dt; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.pay_contract_tb.contract_period_end_dt IS '계약기간 종료일';


--
-- Name: COLUMN pay_contract_tb.contract_start_dt; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.pay_contract_tb.contract_start_dt IS '계약기간 시작일';


--
-- Name: COLUMN pay_contract_tb.product_code; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.pay_contract_tb.product_code IS '상품 코드';


--
-- Name: COLUMN pay_contract_tb.regular_contract_fl; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.pay_contract_tb.regular_contract_fl IS '정기 계약 여부';


--
-- Name: pay_contract_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.pay_contract_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pay_contract_tb_id_seq OWNER TO tsuser;

--
-- Name: pay_contract_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.pay_contract_tb_id_seq OWNED BY public.pay_contract_tb.id;


--
-- Name: pay_coupon_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.pay_coupon_tb (
    id bigint NOT NULL,
    coupon_number character varying(500) NOT NULL,
    discount_info character varying(500) NOT NULL,
    discount_value integer NOT NULL,
    number_of_available integer DEFAULT 0 NOT NULL,
    pay_service_id bigint
);


ALTER TABLE public.pay_coupon_tb OWNER TO tsuser;

--
-- Name: pay_coupon_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.pay_coupon_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pay_coupon_tb_id_seq OWNER TO tsuser;

--
-- Name: pay_coupon_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.pay_coupon_tb_id_seq OWNED BY public.pay_coupon_tb.id;


--
-- Name: pay_order_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.pay_order_tb (
    id bigint NOT NULL,
    cancel_amount integer DEFAULT 0 NOT NULL,
    emb_pg_provider character varying(500),
    card_name character varying(500),
    card_number character varying(500),
    contract_id bigint,
    create_dt timestamp without time zone,
    imp_uid character varying(500),
    member_id bigint,
    merchant_uid character varying(500) NOT NULL,
    order_state character varying(20) NOT NULL,
    paid_amount integer,
    update_dt timestamp without time zone,
    vbank_code character varying(500),
    vbank_name character varying(500),
    pay_service_id bigint
);


ALTER TABLE public.pay_order_tb OWNER TO tsuser;

--
-- Name: pay_order_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.pay_order_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pay_order_tb_id_seq OWNER TO tsuser;

--
-- Name: pay_order_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.pay_order_tb_id_seq OWNED BY public.pay_order_tb.id;


--
-- Name: pay_service_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.pay_service_tb (
    id bigint NOT NULL,
    create_dt timestamp without time zone,
    explain_comment character varying(3000),
    product_image character varying(3000),
    product_nm character varying(500) NOT NULL,
    product_payment_type character varying(500),
    product_price character varying(500) NOT NULL,
    promotion_discount double precision DEFAULT '0'::double precision NOT NULL,
    term timestamp without time zone,
    update_dt timestamp without time zone,
    refund_policy character varying(1000),
    delete_flag integer DEFAULT 0 NOT NULL,
    product_cate_code character varying(45),
    product_type_code character varying(45),
    service_range_code character varying(45),
    available_count integer,
    available_term character varying(45)
);


ALTER TABLE public.pay_service_tb OWNER TO tsuser;

--
-- Name: pay_service_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.pay_service_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pay_service_tb_id_seq OWNER TO tsuser;

--
-- Name: pay_service_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.pay_service_tb_id_seq OWNED BY public.pay_service_tb.id;


--
-- Name: post_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.post_tb (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT '2025-11-26 10:39:52.711137'::timestamp without time zone NOT NULL,
    is_emphasized boolean DEFAULT false NOT NULL,
    board_id integer,
    member_id bigint
);


ALTER TABLE public.post_tb OWNER TO tsuser;

--
-- Name: COLUMN post_tb.title; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.post_tb.title IS '게시글 제목';


--
-- Name: COLUMN post_tb.content; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.post_tb.content IS '게시글 내용';


--
-- Name: COLUMN post_tb.created_at; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.post_tb.created_at IS '게시글 작성일';


--
-- Name: COLUMN post_tb.updated_at; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.post_tb.updated_at IS '게시글 수정일';


--
-- Name: COLUMN post_tb.is_emphasized; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.post_tb.is_emphasized IS '게시글 강조 여부';


--
-- Name: post_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.post_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.post_tb_id_seq OWNER TO tsuser;

--
-- Name: post_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.post_tb_id_seq OWNED BY public.post_tb.id;


--
-- Name: schoolrecord_attendance_detail_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.schoolrecord_attendance_detail_tb (
    id integer NOT NULL,
    absent_disease integer,
    absent_etc integer,
    absent_unrecognized integer,
    class_days integer,
    etc text,
    grade character varying(1000),
    late_disease integer,
    late_etc integer,
    late_unrecognized integer,
    leave_early_disease integer,
    leave_early_etc integer,
    leave_early_unrecognized integer,
    result_disease integer,
    result_early_etc integer,
    result_unrecognized integer,
    member_id bigint
);


ALTER TABLE public.schoolrecord_attendance_detail_tb OWNER TO tsuser;

--
-- Name: schoolrecord_attendance_detail_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.schoolrecord_attendance_detail_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.schoolrecord_attendance_detail_tb_id_seq OWNER TO tsuser;

--
-- Name: schoolrecord_attendance_detail_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.schoolrecord_attendance_detail_tb_id_seq OWNED BY public.schoolrecord_attendance_detail_tb.id;


--
-- Name: schoolrecord_select_subject_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.schoolrecord_select_subject_tb (
    id integer NOT NULL,
    achievement text,
    achievementa text,
    achievementb text,
    achievementc text,
    etc text,
    grade text,
    main_subject_code text,
    main_subject_name text NOT NULL,
    raw_score text,
    semester text,
    students_num text,
    sub_subject_average text,
    subject_code text,
    subject_name text NOT NULL,
    unit text,
    member_id bigint
);


ALTER TABLE public.schoolrecord_select_subject_tb OWNER TO tsuser;

--
-- Name: schoolrecord_select_subject_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.schoolrecord_select_subject_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.schoolrecord_select_subject_tb_id_seq OWNER TO tsuser;

--
-- Name: schoolrecord_select_subject_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.schoolrecord_select_subject_tb_id_seq OWNED BY public.schoolrecord_select_subject_tb.id;


--
-- Name: schoolrecord_subject_learning_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.schoolrecord_subject_learning_tb (
    id integer NOT NULL,
    achievement character varying(1000),
    etc character varying(1000),
    grade character varying(1000),
    main_subject_code character varying(1000),
    main_subject_name character varying(1000) NOT NULL,
    ranking character varying(1000),
    raw_score character varying(1000),
    semester character varying(1000),
    standard_deviation character varying(1000),
    students_num character varying(1000),
    sub_subject_average character varying(1000),
    subject_code character varying(1000),
    subject_name character varying(1000),
    unit character varying(1000),
    member_id bigint
);


ALTER TABLE public.schoolrecord_subject_learning_tb OWNER TO tsuser;

--
-- Name: schoolrecord_subject_learning_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.schoolrecord_subject_learning_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.schoolrecord_subject_learning_tb_id_seq OWNER TO tsuser;

--
-- Name: schoolrecord_subject_learning_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.schoolrecord_subject_learning_tb_id_seq OWNED BY public.schoolrecord_subject_learning_tb.id;


--
-- Name: schoolrecord_subject_sports_art_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.schoolrecord_subject_sports_art_tb (
    id bigint NOT NULL,
    achievement text,
    etc text,
    grade text,
    semester text,
    sub_subject text,
    subject text,
    unit text,
    member_id bigint
);


ALTER TABLE public.schoolrecord_subject_sports_art_tb OWNER TO tsuser;

--
-- Name: COLUMN schoolrecord_subject_sports_art_tb.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.schoolrecord_subject_sports_art_tb.id IS '아이디';


--
-- Name: COLUMN schoolrecord_subject_sports_art_tb.achievement; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.schoolrecord_subject_sports_art_tb.achievement IS '성취도';


--
-- Name: COLUMN schoolrecord_subject_sports_art_tb.etc; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.schoolrecord_subject_sports_art_tb.etc IS '비고';


--
-- Name: COLUMN schoolrecord_subject_sports_art_tb.grade; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.schoolrecord_subject_sports_art_tb.grade IS '학년';


--
-- Name: COLUMN schoolrecord_subject_sports_art_tb.semester; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.schoolrecord_subject_sports_art_tb.semester IS '학기';


--
-- Name: COLUMN schoolrecord_subject_sports_art_tb.sub_subject; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.schoolrecord_subject_sports_art_tb.sub_subject IS '교과';


--
-- Name: COLUMN schoolrecord_subject_sports_art_tb.subject; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.schoolrecord_subject_sports_art_tb.subject IS '과목';


--
-- Name: COLUMN schoolrecord_subject_sports_art_tb.unit; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.schoolrecord_subject_sports_art_tb.unit IS '단위 수';


--
-- Name: schoolrecord_subject_sports_art_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.schoolrecord_subject_sports_art_tb_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.schoolrecord_subject_sports_art_tb_id_seq OWNER TO tsuser;

--
-- Name: schoolrecord_subject_sports_art_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.schoolrecord_subject_sports_art_tb_id_seq OWNED BY public.schoolrecord_subject_sports_art_tb.id;


--
-- Name: schoolrecord_volunteer_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.schoolrecord_volunteer_tb (
    id integer NOT NULL,
    accumulate_time character varying(1000),
    activity_content character varying(1000),
    activity_time character varying(1000),
    date character varying(1000),
    grade character varying(1000),
    place character varying(1000),
    member_id bigint
);


ALTER TABLE public.schoolrecord_volunteer_tb OWNER TO tsuser;

--
-- Name: schoolrecord_volunteer_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.schoolrecord_volunteer_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.schoolrecord_volunteer_tb_id_seq OWNER TO tsuser;

--
-- Name: schoolrecord_volunteer_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.schoolrecord_volunteer_tb_id_seq OWNED BY public.schoolrecord_volunteer_tb.id;


--
-- Name: susi_comprehensive_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.susi_comprehensive_tb (
    id integer NOT NULL,
    unified_id character varying(50),
    year integer,
    region character varying(20),
    university_name character varying(50),
    university_code character varying(20),
    national_or_private character varying(10),
    basic_type character varying(30),
    detailed_type character varying(100),
    type_name character varying(100),
    central_classification character varying(10),
    department character varying(10),
    recruitment_unit_name character varying(100),
    large_department character varying(50),
    medium_department character varying(50),
    small_department character varying(50),
    recruitment_number character varying(30),
    selection_model character varying(30),
    selection_ratio character varying(30),
    selection_method character varying(80),
    document_rate integer,
    interview_rate integer,
    other_rate integer,
    other_details text,
    step2_step1_score_rate integer,
    step2_interview_rate integer,
    step2_other_rate integer,
    step2_other_details text,
    application_eligibility_text text,
    cut_50 character varying(50),
    cut_70 character varying(50),
    risk_level_plus5 double precision,
    risk_level_plus4 double precision,
    risk_level_plus3 double precision,
    risk_level_plus2 double precision,
    risk_level_plus1 double precision,
    risk_level_minus1 double precision,
    risk_level_minus2 double precision,
    risk_level_minus3 double precision,
    risk_level_minus4 double precision,
    risk_level_minus5 double precision,
    minimum_academic_standards_applied integer,
    minimum_academic_standards_text text,
    minimum_korean integer,
    minimum_math integer,
    minimum_math_science_engineering integer,
    minimum_english integer,
    minimum_social_studies integer,
    minimum_science_studies integer,
    minimum_calculation_studies integer,
    minimum_count integer,
    minimum_sum double precision,
    minimum_korean_history double precision,
    minimum_others integer,
    minimum_others_details text,
    additional_point character varying(50),
    additional_point_text character varying(50),
    evaluation_ratios character varying(80),
    evaluation_code character varying(60),
    interview_score_applied integer,
    interview_type character varying(50),
    interview_resources character varying(100),
    interview_method character varying(100),
    interview_evaluation_content character varying(100),
    interview_date_text character varying(80),
    interview_time character varying(20),
    admission_criteria_2024 character varying(120),
    admission_2024_grade character varying(80),
    admission_2024_converted_score character varying(80),
    competition_rate_2024 character varying(80),
    replenishment_2024 character varying(80),
    admission_criteria_2023 character varying(50),
    admission_2023_grade character varying(80),
    admission_2023_converted_score character varying(80),
    competition_rate_2023 character varying(80),
    replenishment_2023 character varying(80),
    admission_criteria_2022 character varying(50),
    admission_2022_grade character varying(80),
    competition_rate_2022 character varying(80),
    replenishment_2022 character varying(80),
    admission_2021_grade character varying(80),
    competition_rate_2021 character varying(80),
    replenishment_2021 character varying(80),
    admission_2020_grade character varying(80),
    competition_rate_2020 character varying(80),
    replenishment_2020 character varying(80),
    application_notes character varying(50)
);


ALTER TABLE public.susi_comprehensive_tb OWNER TO tsuser;

--
-- Name: COLUMN susi_comprehensive_tb.unified_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.unified_id IS '통합 아이디 (ex. U0094121)';


--
-- Name: COLUMN susi_comprehensive_tb.year; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.year IS '년도';


--
-- Name: COLUMN susi_comprehensive_tb.region; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.region IS '지역구분';


--
-- Name: COLUMN susi_comprehensive_tb.university_name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.university_name IS '대학명';


--
-- Name: COLUMN susi_comprehensive_tb.university_code; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.university_code IS '대학코드';


--
-- Name: COLUMN susi_comprehensive_tb.national_or_private; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.national_or_private IS '국립/사립';


--
-- Name: COLUMN susi_comprehensive_tb.basic_type; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.basic_type IS '기본유형';


--
-- Name: COLUMN susi_comprehensive_tb.detailed_type; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.detailed_type IS '전형세부유형';


--
-- Name: COLUMN susi_comprehensive_tb.type_name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.type_name IS '전형명';


--
-- Name: COLUMN susi_comprehensive_tb.central_classification; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.central_classification IS '중심전형분류';


--
-- Name: COLUMN susi_comprehensive_tb.department; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.department IS '계열';


--
-- Name: COLUMN susi_comprehensive_tb.recruitment_unit_name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.recruitment_unit_name IS '모집단위명';


--
-- Name: COLUMN susi_comprehensive_tb.large_department; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.large_department IS '대계열';


--
-- Name: COLUMN susi_comprehensive_tb.medium_department; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.medium_department IS '중계열';


--
-- Name: COLUMN susi_comprehensive_tb.small_department; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.small_department IS '소계열';


--
-- Name: COLUMN susi_comprehensive_tb.recruitment_number; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.recruitment_number IS '모집인원';


--
-- Name: COLUMN susi_comprehensive_tb.selection_model; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.selection_model IS '선발모형';


--
-- Name: COLUMN susi_comprehensive_tb.selection_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.selection_ratio IS '선발비율';


--
-- Name: COLUMN susi_comprehensive_tb.selection_method; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.selection_method IS '전형방법';


--
-- Name: COLUMN susi_comprehensive_tb.document_rate; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.document_rate IS '서류비율';


--
-- Name: COLUMN susi_comprehensive_tb.interview_rate; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.interview_rate IS '면접비율';


--
-- Name: COLUMN susi_comprehensive_tb.other_rate; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.other_rate IS '그외비율';


--
-- Name: COLUMN susi_comprehensive_tb.other_details; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.other_details IS '그외내역';


--
-- Name: COLUMN susi_comprehensive_tb.step2_step1_score_rate; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.step2_step1_score_rate IS '(2단계)1단계성적';


--
-- Name: COLUMN susi_comprehensive_tb.step2_interview_rate; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.step2_interview_rate IS '(2단계)면접비율';


--
-- Name: COLUMN susi_comprehensive_tb.step2_other_rate; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.step2_other_rate IS '(2단계)그외';


--
-- Name: COLUMN susi_comprehensive_tb.step2_other_details; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.step2_other_details IS '(2단계)그외내역';


--
-- Name: COLUMN susi_comprehensive_tb.application_eligibility_text; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.application_eligibility_text IS '지원자격TEXT';


--
-- Name: COLUMN susi_comprehensive_tb.cut_50; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.cut_50 IS '50컷';


--
-- Name: COLUMN susi_comprehensive_tb.cut_70; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.cut_70 IS '70컷';


--
-- Name: COLUMN susi_comprehensive_tb.risk_level_plus5; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.risk_level_plus5 IS '환산점수위험도(+)5';


--
-- Name: COLUMN susi_comprehensive_tb.risk_level_plus4; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.risk_level_plus4 IS '위험도(+)4';


--
-- Name: COLUMN susi_comprehensive_tb.risk_level_plus3; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.risk_level_plus3 IS '위험도(+)3';


--
-- Name: COLUMN susi_comprehensive_tb.risk_level_plus2; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.risk_level_plus2 IS '위험도(+)2';


--
-- Name: COLUMN susi_comprehensive_tb.risk_level_plus1; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.risk_level_plus1 IS '위험도(+)1';


--
-- Name: COLUMN susi_comprehensive_tb.risk_level_minus1; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.risk_level_minus1 IS '위험도(-1)';


--
-- Name: COLUMN susi_comprehensive_tb.risk_level_minus2; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.risk_level_minus2 IS '위험도(-2)';


--
-- Name: COLUMN susi_comprehensive_tb.risk_level_minus3; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.risk_level_minus3 IS '위험도(-3)';


--
-- Name: COLUMN susi_comprehensive_tb.risk_level_minus4; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.risk_level_minus4 IS '위험도(-4)';


--
-- Name: COLUMN susi_comprehensive_tb.risk_level_minus5; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.risk_level_minus5 IS '위험도(-5)';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_academic_standards_applied; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_academic_standards_applied IS '최저학력기준_반영여부';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_academic_standards_text; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_academic_standards_text IS '수능최저학력기준TEXT';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_korean; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_korean IS '최저국어';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_math; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_math IS '최저수학';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_math_science_engineering; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_math_science_engineering IS '최저수학(미/기)';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_english; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_english IS '영어';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_social_studies; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_social_studies IS '사탐';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_science_studies; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_science_studies IS '과탐';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_calculation_studies; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_calculation_studies IS '탐계산';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_count; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_count IS '최저갯수';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_sum; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_sum IS '최저합';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_korean_history; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_korean_history IS '한국사';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_others; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_others IS '그외';


--
-- Name: COLUMN susi_comprehensive_tb.minimum_others_details; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.minimum_others_details IS '그외상세';


--
-- Name: COLUMN susi_comprehensive_tb.additional_point; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.additional_point IS '가산점';


--
-- Name: COLUMN susi_comprehensive_tb.additional_point_text; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.additional_point_text IS '가산점 TEXT';


--
-- Name: COLUMN susi_comprehensive_tb.evaluation_ratios; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.evaluation_ratios IS '3개평가 비중(30:20:50)';


--
-- Name: COLUMN susi_comprehensive_tb.evaluation_code; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.evaluation_code IS '3개평가 코드';


--
-- Name: COLUMN susi_comprehensive_tb.interview_score_applied; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.interview_score_applied IS '면접점수반영여부';


--
-- Name: COLUMN susi_comprehensive_tb.interview_type; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.interview_type IS '면접유형';


--
-- Name: COLUMN susi_comprehensive_tb.interview_resources; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.interview_resources IS '면접시활용자료';


--
-- Name: COLUMN susi_comprehensive_tb.interview_method; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.interview_method IS '면접진행방식';


--
-- Name: COLUMN susi_comprehensive_tb.interview_evaluation_content; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.interview_evaluation_content IS '면접평가내용';


--
-- Name: COLUMN susi_comprehensive_tb.interview_date_text; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.interview_date_text IS '면접날짜TEXT';


--
-- Name: COLUMN susi_comprehensive_tb.interview_time; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.interview_time IS '면접시간';


--
-- Name: COLUMN susi_comprehensive_tb.admission_criteria_2024; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.admission_criteria_2024 IS '2024년입결기준';


--
-- Name: COLUMN susi_comprehensive_tb.admission_2024_grade; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.admission_2024_grade IS '2024학년도입결(등급)';


--
-- Name: COLUMN susi_comprehensive_tb.admission_2024_converted_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.admission_2024_converted_score IS '2024학년도입결(환산점수)';


--
-- Name: COLUMN susi_comprehensive_tb.competition_rate_2024; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.competition_rate_2024 IS '2024학년도경쟁률';


--
-- Name: COLUMN susi_comprehensive_tb.replenishment_2024; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.replenishment_2024 IS '2024충원';


--
-- Name: COLUMN susi_comprehensive_tb.admission_criteria_2023; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.admission_criteria_2023 IS '2023학년도기준';


--
-- Name: COLUMN susi_comprehensive_tb.admission_2023_grade; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.admission_2023_grade IS '2023학년도입결(등급)';


--
-- Name: COLUMN susi_comprehensive_tb.admission_2023_converted_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.admission_2023_converted_score IS '2023학년도입결(환산점수)';


--
-- Name: COLUMN susi_comprehensive_tb.competition_rate_2023; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.competition_rate_2023 IS '2023학년도경쟁률';


--
-- Name: COLUMN susi_comprehensive_tb.replenishment_2023; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.replenishment_2023 IS '2023충원';


--
-- Name: COLUMN susi_comprehensive_tb.admission_criteria_2022; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.admission_criteria_2022 IS '2022학년도기준';


--
-- Name: COLUMN susi_comprehensive_tb.admission_2022_grade; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.admission_2022_grade IS '2022학년도입결';


--
-- Name: COLUMN susi_comprehensive_tb.competition_rate_2022; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.competition_rate_2022 IS '2022학년도경쟁률';


--
-- Name: COLUMN susi_comprehensive_tb.replenishment_2022; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.replenishment_2022 IS '2022충원';


--
-- Name: COLUMN susi_comprehensive_tb.admission_2021_grade; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.admission_2021_grade IS '2021학년도입결';


--
-- Name: COLUMN susi_comprehensive_tb.competition_rate_2021; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.competition_rate_2021 IS '2021학년도경쟁률';


--
-- Name: COLUMN susi_comprehensive_tb.replenishment_2021; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.replenishment_2021 IS '2021충원';


--
-- Name: COLUMN susi_comprehensive_tb.admission_2020_grade; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.admission_2020_grade IS '2020학년도입결';


--
-- Name: COLUMN susi_comprehensive_tb.competition_rate_2020; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.competition_rate_2020 IS '2020학년도경쟁률';


--
-- Name: COLUMN susi_comprehensive_tb.replenishment_2020; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.replenishment_2020 IS '2020충원';


--
-- Name: COLUMN susi_comprehensive_tb.application_notes; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_comprehensive_tb.application_notes IS '지원시유의사항';


--
-- Name: susi_comprehensive_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.susi_comprehensive_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.susi_comprehensive_tb_id_seq OWNER TO tsuser;

--
-- Name: susi_comprehensive_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.susi_comprehensive_tb_id_seq OWNED BY public.susi_comprehensive_tb.id;


--
-- Name: susi_pass_record_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.susi_pass_record_tb (
    id integer NOT NULL,
    unified_id character varying(50),
    region character varying(20),
    department character varying(80),
    university_name character varying(80),
    recruitment_unit_name character varying(80),
    central_classification character varying(20),
    basic_type character varying(20),
    type_name character varying(50),
    first_result character varying(20),
    final_result character varying(20),
    avg_grade_all character varying(20),
    avg_grade_gyss character varying(20),
    avg_grade_gysg character varying(20),
    avg_grade_gyst_100 character varying(20),
    avg_grade_gyst character varying(20)
);


ALTER TABLE public.susi_pass_record_tb OWNER TO tsuser;

--
-- Name: COLUMN susi_pass_record_tb.unified_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.unified_id IS '통합 아이디 (ex. U0094121)';


--
-- Name: COLUMN susi_pass_record_tb.region; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.region IS '지역';


--
-- Name: COLUMN susi_pass_record_tb.department; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.department IS '계열';


--
-- Name: COLUMN susi_pass_record_tb.university_name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.university_name IS '대학명';


--
-- Name: COLUMN susi_pass_record_tb.recruitment_unit_name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.recruitment_unit_name IS '학과명';


--
-- Name: COLUMN susi_pass_record_tb.central_classification; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.central_classification IS '전형유형 (실기, 논술, 교과)';


--
-- Name: COLUMN susi_pass_record_tb.basic_type; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.basic_type IS '일반, 특별';


--
-- Name: COLUMN susi_pass_record_tb.type_name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.type_name IS '전형명';


--
-- Name: COLUMN susi_pass_record_tb.first_result; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.first_result IS '지원결과 1단계';


--
-- Name: COLUMN susi_pass_record_tb.final_result; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.final_result IS '지원결과 최종';


--
-- Name: COLUMN susi_pass_record_tb.avg_grade_all; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.avg_grade_all IS '평균등급 - 전과목';


--
-- Name: COLUMN susi_pass_record_tb.avg_grade_gyss; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.avg_grade_gyss IS '평균등급 국영수사';


--
-- Name: COLUMN susi_pass_record_tb.avg_grade_gysg; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.avg_grade_gysg IS '평균등급 국영수과';


--
-- Name: COLUMN susi_pass_record_tb.avg_grade_gyst_100; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.avg_grade_gyst_100 IS '국영수탐 백분위';


--
-- Name: COLUMN susi_pass_record_tb.avg_grade_gyst; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_pass_record_tb.avg_grade_gyst IS '평균등급 국영수탐';


--
-- Name: susi_pass_record_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.susi_pass_record_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.susi_pass_record_tb_id_seq OWNER TO tsuser;

--
-- Name: susi_pass_record_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.susi_pass_record_tb_id_seq OWNED BY public.susi_pass_record_tb.id;


--
-- Name: susi_subject_tb; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.susi_subject_tb (
    id integer NOT NULL,
    unified_id character varying(50),
    year integer,
    region character varying(20),
    university_name character varying(50),
    university_code character varying(20),
    national_or_private character varying(10),
    basic_type character varying(30),
    detailed_type character varying(50),
    type_name character varying(100),
    central_classification character varying(10),
    department character varying(10),
    college character varying(50),
    recruitment_unit_name character varying(50),
    large_department character varying(50),
    medium_department character varying(50),
    small_department character varying(50),
    recruitment_number character varying(30),
    selection_model character varying(30),
    selection_ratio character varying(30),
    selection_method character varying(60),
    curriculum integer,
    interview integer,
    attendance integer,
    volunteer integer,
    document_non_academic integer,
    practical_skills integer,
    step1_score integer,
    step2_others integer,
    step2_interview integer,
    step2_other_details character varying(255),
    application_eligibility_text text,
    student_record_utilization_index character varying(30),
    curriculum_reflection_semester integer,
    first_year_ratio integer,
    second_year_ratio integer,
    third_year_ratio integer,
    second_third_year_ratio integer,
    first_second_third_year_ratio integer,
    curriculum_grade_1 integer,
    curriculum_grade_2 integer,
    curriculum_grade_3 integer,
    curriculum_grade_4 integer,
    curriculum_grade_5 integer,
    curriculum_grade_6 integer,
    curriculum_grade_7 integer,
    curriculum_grade_8 integer,
    curriculum_grade_9 integer,
    common_general_and_career_integration integer,
    common_general_subject_ratio integer,
    reflected_subject_1_year_korean integer,
    reflected_subject_1_year_math integer,
    reflected_subject_1_year_english integer,
    reflected_subject_1_year_science integer,
    reflected_subject_1_year_social integer,
    reflected_subject_1_year_korean_history integer,
    reflected_subject_1_year_other integer,
    number_of_optional_subjects_1 integer,
    total_number_of_top_subjects_1 integer,
    number_of_top_subjects_per_subject_1 integer,
    reflected_subject_2_3_years_korean integer,
    reflected_subject_2_3_years_math integer,
    reflected_subject_2_3_years_english integer,
    reflected_subject_2_3_years_science integer,
    reflected_subject_2_3_years_social integer,
    reflected_subject_2_3_years_korean_history integer,
    reflected_subject_2_3_years_other integer,
    number_of_optional_subjects_2_3 integer,
    total_number_of_top_subjects_2_3 integer,
    number_of_top_subjects_per_subject_2_3 integer,
    common_general_reflection_method character varying(100),
    perfect_score integer,
    attendance_usage integer,
    attendance_usage_ratio integer,
    absence_1 integer,
    absence_2 integer,
    absence_3 integer,
    absence_4 integer,
    absence_5 integer,
    absence_6 integer,
    absence_7 integer,
    absence_8 integer,
    absence_9 integer,
    absence_10 integer,
    absence_11 integer,
    absence_12 integer,
    absence_13 integer,
    absence_14 integer,
    absence_15 integer,
    absence_16 integer,
    absence_17 integer,
    absence_18 integer,
    absence_19 integer,
    absence_20 integer,
    career_subject_application integer,
    career_subject_reflection_method text,
    career_optional_subject integer,
    career_if_2 text,
    "career_optional_subject_A" integer,
    "career_optional_subject_B" integer,
    "career_optional_subject_C" integer,
    "A_distribution_ratio" integer,
    "B_distribution_ratio" integer,
    "C_distribution_ratio" integer,
    career_subject_ratio integer,
    career_subject_additional_points integer,
    number_of_top_subjects_in_all_career_subjects integer,
    number_of_top_subjects_in_career_curriculum integer,
    grade_cut character varying(50),
    grade_cut_70 character varying(50),
    converted_score_cut character varying(50),
    non_subject_cut character varying(50),
    converted_score_total double precision,
    risk_level_plus5 double precision,
    risk_level_plus4 double precision,
    risk_level_plus3 double precision,
    risk_level_plus2 double precision,
    risk_level_plus1 double precision,
    risk_level_minus1 double precision,
    risk_level_minus2 double precision,
    risk_level_minus3 double precision,
    risk_level_minus4 double precision,
    risk_level_minus5 double precision,
    minimum_academic_standards_applied integer,
    minimum_academic_standards_text text,
    minimum_korean integer,
    minimum_math integer,
    minimum_math_science_engineering integer,
    english integer,
    social_studies integer,
    science_studies integer,
    calculation_studies integer,
    minimum_count integer,
    minimum_sum double precision,
    korean_history double precision,
    others integer,
    others_details text,
    additional_points integer,
    additional_points_text text,
    interview_score_applied character varying(100),
    interview_type character varying(50),
    interview_resources character varying(100),
    interview_method character varying(100),
    interview_evaluation_content character varying(100),
    interview_date_text character varying(20),
    interview_time character varying(20),
    curriculum_calculation_formula integer,
    admission_criteria_2024 character varying(50),
    admission_2024_grade character varying(50),
    admission_2024_converted_score character varying(60),
    competition_rate_2024 character varying(50),
    replenishment_2024 character varying(10),
    admission_criteria_2023 character varying(50),
    admission_2023_grade character varying(50),
    admission_2023_converted_score character varying(10),
    competition_rate_2023 character varying(50),
    replenishment_2023 character varying(10),
    admission_criteria_2022 character varying(50),
    admission_2022_grade character varying(50),
    competition_rate_2022 character varying(50),
    replenishment_2022 character varying(10),
    admission_2021_grade character varying(50),
    competition_rate_2021 character varying(50),
    replenishment_2021 character varying(10),
    admission_2020_grade character varying(50),
    competition_rate_2020 character varying(50),
    replenishment_2020 character varying(10),
    application_notes character varying(50)
);


ALTER TABLE public.susi_subject_tb OWNER TO tsuser;

--
-- Name: COLUMN susi_subject_tb.unified_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.susi_subject_tb.unified_id IS '통합 아이디 (ex. U0094121)';


--
-- Name: susi_subject_tb_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.susi_subject_tb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.susi_subject_tb_id_seq OWNER TO tsuser;

--
-- Name: susi_subject_tb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.susi_subject_tb_id_seq OWNED BY public.susi_subject_tb.id;


--
-- Name: ts_admission_categories; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_admission_categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.ts_admission_categories OWNER TO tsuser;

--
-- Name: TABLE ts_admission_categories; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_admission_categories IS '중심전형분류 정보 테이블';


--
-- Name: COLUMN ts_admission_categories.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_categories.id IS '중심전형분류 고유 ID';


--
-- Name: COLUMN ts_admission_categories.name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_categories.name IS '중심전형분류 이름 (예: 학생부종합, 학생부교과)';


--
-- Name: ts_admission_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_admission_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_admission_categories_id_seq OWNER TO tsuser;

--
-- Name: ts_admission_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_admission_categories_id_seq OWNED BY public.ts_admission_categories.id;


--
-- Name: ts_admission_methods; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_admission_methods (
    id integer NOT NULL,
    method_description character varying(255) NOT NULL,
    subject_ratio numeric(5,2),
    document_ratio numeric(5,2),
    interview_ratio numeric(5,2),
    practical_ratio numeric(5,2),
    other_details text,
    second_stage_first_ratio numeric(5,2),
    second_stage_interview_ratio numeric(5,2),
    second_stage_other_ratio numeric(5,2),
    second_stage_other_details text,
    eligibility text NOT NULL,
    school_record_evaluation_score character varying(100),
    school_record_evaluation_elements character varying(100),
    admission_id integer
);


ALTER TABLE public.ts_admission_methods OWNER TO tsuser;

--
-- Name: TABLE ts_admission_methods; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_admission_methods IS '대학 입학전형 방법 정보 테이블';


--
-- Name: COLUMN ts_admission_methods.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.id IS '전형 방법 고유 ID';


--
-- Name: COLUMN ts_admission_methods.method_description; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.method_description IS '전형방법 설명';


--
-- Name: COLUMN ts_admission_methods.subject_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.subject_ratio IS '교과비율';


--
-- Name: COLUMN ts_admission_methods.document_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.document_ratio IS '서류비율';


--
-- Name: COLUMN ts_admission_methods.interview_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.interview_ratio IS '면접비율';


--
-- Name: COLUMN ts_admission_methods.practical_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.practical_ratio IS '실기/실적비율';


--
-- Name: COLUMN ts_admission_methods.other_details; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.other_details IS '기타내역';


--
-- Name: COLUMN ts_admission_methods.second_stage_first_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.second_stage_first_ratio IS '2단계_1단계성적비율';


--
-- Name: COLUMN ts_admission_methods.second_stage_interview_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.second_stage_interview_ratio IS '2단계_면접비율';


--
-- Name: COLUMN ts_admission_methods.second_stage_other_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.second_stage_other_ratio IS '2단계_그외비율';


--
-- Name: COLUMN ts_admission_methods.second_stage_other_details; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.second_stage_other_details IS '2단계_그외내역';


--
-- Name: COLUMN ts_admission_methods.eligibility; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.eligibility IS '지원자격';


--
-- Name: COLUMN ts_admission_methods.school_record_evaluation_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.school_record_evaluation_score IS '생기부평가배점 (예: 40/40/20)';


--
-- Name: COLUMN ts_admission_methods.school_record_evaluation_elements; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.school_record_evaluation_elements IS '생기부평가요소 (예: CD/O/GS)';


--
-- Name: COLUMN ts_admission_methods.admission_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_methods.admission_id IS '전형 고유 ID';


--
-- Name: ts_admission_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_admission_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_admission_methods_id_seq OWNER TO tsuser;

--
-- Name: ts_admission_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_admission_methods_id_seq OWNED BY public.ts_admission_methods.id;


--
-- Name: ts_admission_subtype_relations; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_admission_subtype_relations (
    admission_id integer NOT NULL,
    subtype_id integer NOT NULL
);


ALTER TABLE public.ts_admission_subtype_relations OWNER TO tsuser;

--
-- Name: ts_admission_subtypes; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_admission_subtypes (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.ts_admission_subtypes OWNER TO tsuser;

--
-- Name: TABLE ts_admission_subtypes; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_admission_subtypes IS '전형 세부유형 정보 테이블';


--
-- Name: COLUMN ts_admission_subtypes.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_subtypes.id IS '전형 세부유형 고유 ID';


--
-- Name: COLUMN ts_admission_subtypes.name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admission_subtypes.name IS '전형 세부유형 이름 (예: 농어촌, 특기자)';


--
-- Name: ts_admission_subtypes_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_admission_subtypes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_admission_subtypes_id_seq OWNER TO tsuser;

--
-- Name: ts_admission_subtypes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_admission_subtypes_id_seq OWNED BY public.ts_admission_subtypes.id;


--
-- Name: ts_admissions; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_admissions (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    year integer NOT NULL,
    basic_type public.ts_admissions_basic_type_enum NOT NULL,
    university_id integer,
    category_id integer
);


ALTER TABLE public.ts_admissions OWNER TO tsuser;

--
-- Name: TABLE ts_admissions; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_admissions IS '대학 입학전형 정보 테이블';


--
-- Name: COLUMN ts_admissions.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admissions.id IS '전형 고유 ID';


--
-- Name: COLUMN ts_admissions.name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admissions.name IS '전형 이름 (예: 일반전형, 학교장추천전형, 고른기회전형)';


--
-- Name: COLUMN ts_admissions.year; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admissions.year IS '전형 년도 (예: 2024, 2025)';


--
-- Name: COLUMN ts_admissions.basic_type; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admissions.basic_type IS '전형 기본유형 (일반 또는 특별)';


--
-- Name: COLUMN ts_admissions.university_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admissions.university_id IS '대학 고유 ID';


--
-- Name: COLUMN ts_admissions.category_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_admissions.category_id IS '중심전형분류 고유 ID';


--
-- Name: ts_admissions_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_admissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_admissions_id_seq OWNER TO tsuser;

--
-- Name: ts_admissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_admissions_id_seq OWNED BY public.ts_admissions.id;


--
-- Name: ts_general_fields; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_general_fields (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.ts_general_fields OWNER TO tsuser;

--
-- Name: TABLE ts_general_fields; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_general_fields IS '대학 입학전형의 일반 계열 정보 테이블';


--
-- Name: COLUMN ts_general_fields.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_general_fields.id IS '일반 계열 고유 ID';


--
-- Name: COLUMN ts_general_fields.name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_general_fields.name IS '일반 계열 이름';


--
-- Name: ts_general_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_general_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_general_fields_id_seq OWNER TO tsuser;

--
-- Name: ts_general_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_general_fields_id_seq OWNED BY public.ts_general_fields.id;


--
-- Name: ts_major_fields; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_major_fields (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.ts_major_fields OWNER TO tsuser;

--
-- Name: TABLE ts_major_fields; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_major_fields IS '대학 대계열(예: 인문계열, 자연계열) 정보를 저장하는 테이블';


--
-- Name: COLUMN ts_major_fields.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_major_fields.id IS '대계열 고유 ID';


--
-- Name: COLUMN ts_major_fields.name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_major_fields.name IS '대계열 이름';


--
-- Name: ts_major_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_major_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_major_fields_id_seq OWNER TO tsuser;

--
-- Name: ts_major_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_major_fields_id_seq OWNED BY public.ts_major_fields.id;


--
-- Name: ts_member_recruitment_unit_combination_items; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_member_recruitment_unit_combination_items (
    combination_id integer NOT NULL,
    recruitment_unit_id integer NOT NULL
);


ALTER TABLE public.ts_member_recruitment_unit_combination_items OWNER TO tsuser;

--
-- Name: ts_member_recruitment_unit_combinations; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_member_recruitment_unit_combinations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    member_id bigint
);


ALTER TABLE public.ts_member_recruitment_unit_combinations OWNER TO tsuser;

--
-- Name: COLUMN ts_member_recruitment_unit_combinations.name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_member_recruitment_unit_combinations.name IS '조합 이름';


--
-- Name: ts_member_recruitment_unit_combinations_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_member_recruitment_unit_combinations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_member_recruitment_unit_combinations_id_seq OWNER TO tsuser;

--
-- Name: ts_member_recruitment_unit_combinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_member_recruitment_unit_combinations_id_seq OWNED BY public.ts_member_recruitment_unit_combinations.id;


--
-- Name: ts_member_regular_combination_items; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_member_regular_combination_items (
    combination_id integer NOT NULL,
    regular_admission_id integer NOT NULL
);


ALTER TABLE public.ts_member_regular_combination_items OWNER TO tsuser;

--
-- Name: ts_member_regular_combinations; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_member_regular_combinations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    member_id bigint
);


ALTER TABLE public.ts_member_regular_combinations OWNER TO tsuser;

--
-- Name: COLUMN ts_member_regular_combinations.name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_member_regular_combinations.name IS '조합 이름';


--
-- Name: ts_member_regular_combinations_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_member_regular_combinations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_member_regular_combinations_id_seq OWNER TO tsuser;

--
-- Name: ts_member_regular_combinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_member_regular_combinations_id_seq OWNED BY public.ts_member_regular_combinations.id;


--
-- Name: ts_member_regular_interests; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_member_regular_interests (
    id integer NOT NULL,
    member_id bigint NOT NULL,
    admission_type character varying(50) NOT NULL,
    target_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ts_member_regular_interests OWNER TO tsuser;

--
-- Name: ts_member_regular_interests_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_member_regular_interests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_member_regular_interests_id_seq OWNER TO tsuser;

--
-- Name: ts_member_regular_interests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_member_regular_interests_id_seq OWNED BY public.ts_member_regular_interests.id;


--
-- Name: ts_mid_fields; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_mid_fields (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    major_field_id integer
);


ALTER TABLE public.ts_mid_fields OWNER TO tsuser;

--
-- Name: TABLE ts_mid_fields; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_mid_fields IS '대학 중계열(예: 경영·경제, 건축) 정보를 저장하는 테이블';


--
-- Name: COLUMN ts_mid_fields.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_mid_fields.id IS '중계열 고유 ID';


--
-- Name: COLUMN ts_mid_fields.name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_mid_fields.name IS '중계열 이름';


--
-- Name: ts_mid_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_mid_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_mid_fields_id_seq OWNER TO tsuser;

--
-- Name: ts_mid_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_mid_fields_id_seq OWNED BY public.ts_mid_fields.id;


--
-- Name: ts_minor_fields; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_minor_fields (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    mid_field_id integer
);


ALTER TABLE public.ts_minor_fields OWNER TO tsuser;

--
-- Name: TABLE ts_minor_fields; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_minor_fields IS '대학 소계열(예: 경제학, 건축·설비공학) 정보를 저장하는 테이블';


--
-- Name: COLUMN ts_minor_fields.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_minor_fields.id IS '소계열 고유 ID';


--
-- Name: COLUMN ts_minor_fields.name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_minor_fields.name IS '소계열 이름';


--
-- Name: ts_minor_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_minor_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_minor_fields_id_seq OWNER TO tsuser;

--
-- Name: ts_minor_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_minor_fields_id_seq OWNED BY public.ts_minor_fields.id;


--
-- Name: ts_recruitment_unit_interviews; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_recruitment_unit_interviews (
    id integer NOT NULL,
    is_reflected boolean DEFAULT false NOT NULL,
    interview_type character varying(100),
    materials_used character varying(255),
    interview_process character varying(255),
    evaluation_content text,
    interview_date character varying(100),
    interview_time character varying(100),
    recruitment_unit_id integer
);


ALTER TABLE public.ts_recruitment_unit_interviews OWNER TO tsuser;

--
-- Name: TABLE ts_recruitment_unit_interviews; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_recruitment_unit_interviews IS '모집단위별 면접 정보 테이블';


--
-- Name: COLUMN ts_recruitment_unit_interviews.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_interviews.id IS '면접 정보 고유 ID';


--
-- Name: COLUMN ts_recruitment_unit_interviews.is_reflected; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_interviews.is_reflected IS '면접 점수 반영여부 (true: 반영, false: 미반영)';


--
-- Name: COLUMN ts_recruitment_unit_interviews.interview_type; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_interviews.interview_type IS '면접 유형';


--
-- Name: COLUMN ts_recruitment_unit_interviews.materials_used; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_interviews.materials_used IS '면접시 활용자료';


--
-- Name: COLUMN ts_recruitment_unit_interviews.interview_process; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_interviews.interview_process IS '면접 진행방식';


--
-- Name: COLUMN ts_recruitment_unit_interviews.evaluation_content; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_interviews.evaluation_content IS '면접 평가내용';


--
-- Name: COLUMN ts_recruitment_unit_interviews.interview_date; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_interviews.interview_date IS '면접날짜';


--
-- Name: COLUMN ts_recruitment_unit_interviews.interview_time; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_interviews.interview_time IS '면접시간';


--
-- Name: COLUMN ts_recruitment_unit_interviews.recruitment_unit_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_interviews.recruitment_unit_id IS '모집단위 고유 ID';


--
-- Name: ts_recruitment_unit_interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_recruitment_unit_interviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_recruitment_unit_interviews_id_seq OWNER TO tsuser;

--
-- Name: ts_recruitment_unit_interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_recruitment_unit_interviews_id_seq OWNED BY public.ts_recruitment_unit_interviews.id;


--
-- Name: ts_recruitment_unit_minimum_grades; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_recruitment_unit_minimum_grades (
    id integer NOT NULL,
    is_applied public.ts_recruitment_unit_minimum_grades_is_applied_enum NOT NULL,
    description text,
    recruitment_unit_id integer
);


ALTER TABLE public.ts_recruitment_unit_minimum_grades OWNER TO tsuser;

--
-- Name: TABLE ts_recruitment_unit_minimum_grades; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_recruitment_unit_minimum_grades IS '모집단위별 최저등급 정보 테이블';


--
-- Name: COLUMN ts_recruitment_unit_minimum_grades.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_minimum_grades.id IS '최저등급 정보 고유 ID';


--
-- Name: COLUMN ts_recruitment_unit_minimum_grades.is_applied; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_minimum_grades.is_applied IS '최저학력기준 반영여부';


--
-- Name: COLUMN ts_recruitment_unit_minimum_grades.description; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_minimum_grades.description IS '수능 최저학력기준 설명';


--
-- Name: COLUMN ts_recruitment_unit_minimum_grades.recruitment_unit_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_minimum_grades.recruitment_unit_id IS '모집단위 고유 ID';


--
-- Name: ts_recruitment_unit_minimum_grades_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_recruitment_unit_minimum_grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_recruitment_unit_minimum_grades_id_seq OWNER TO tsuser;

--
-- Name: ts_recruitment_unit_minimum_grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_recruitment_unit_minimum_grades_id_seq OWNED BY public.ts_recruitment_unit_minimum_grades.id;


--
-- Name: ts_recruitment_unit_pass_fail_records; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_recruitment_unit_pass_fail_records (
    id integer NOT NULL,
    first_result character varying(5),
    final_result character varying(5),
    avg_grade_all numeric(5,2),
    avg_grade_gyss numeric(5,2),
    avg_grade_gysg numeric(5,2),
    avg_grade_gyst_100 numeric(5,2),
    avg_grade_gyst numeric(5,2),
    recruitment_unit_id integer
);


ALTER TABLE public.ts_recruitment_unit_pass_fail_records OWNER TO tsuser;

--
-- Name: TABLE ts_recruitment_unit_pass_fail_records; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_recruitment_unit_pass_fail_records IS '모집단위 합불 데이터 테이블';


--
-- Name: COLUMN ts_recruitment_unit_pass_fail_records.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_pass_fail_records.id IS '합불 데이터 고유 ID';


--
-- Name: COLUMN ts_recruitment_unit_pass_fail_records.first_result; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_pass_fail_records.first_result IS '지원결과 1단계 (합/불)';


--
-- Name: COLUMN ts_recruitment_unit_pass_fail_records.final_result; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_pass_fail_records.final_result IS '지원결과 최종 (합/불)';


--
-- Name: COLUMN ts_recruitment_unit_pass_fail_records.avg_grade_all; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_pass_fail_records.avg_grade_all IS '평균등급 - 전과목';


--
-- Name: COLUMN ts_recruitment_unit_pass_fail_records.avg_grade_gyss; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_pass_fail_records.avg_grade_gyss IS '평균등급 - 국영수사';


--
-- Name: COLUMN ts_recruitment_unit_pass_fail_records.avg_grade_gysg; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_pass_fail_records.avg_grade_gysg IS '평균등급 - 국영수과';


--
-- Name: COLUMN ts_recruitment_unit_pass_fail_records.avg_grade_gyst_100; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_pass_fail_records.avg_grade_gyst_100 IS '평균등급 - 국영수탐(백분위)';


--
-- Name: COLUMN ts_recruitment_unit_pass_fail_records.avg_grade_gyst; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_pass_fail_records.avg_grade_gyst IS '평균등급 - 국영수탐';


--
-- Name: COLUMN ts_recruitment_unit_pass_fail_records.recruitment_unit_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_pass_fail_records.recruitment_unit_id IS '모집단위 고유 ID';


--
-- Name: ts_recruitment_unit_pass_fail_records_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_recruitment_unit_pass_fail_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_recruitment_unit_pass_fail_records_id_seq OWNER TO tsuser;

--
-- Name: ts_recruitment_unit_pass_fail_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_recruitment_unit_pass_fail_records_id_seq OWNED BY public.ts_recruitment_unit_pass_fail_records.id;


--
-- Name: ts_recruitment_unit_previous_results; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_recruitment_unit_previous_results (
    id integer NOT NULL,
    year integer NOT NULL,
    result_criteria character varying(100) NOT NULL,
    grade_cut numeric(10,5),
    converted_score_cut numeric(10,5),
    competition_ratio numeric(10,5),
    recruitment_number integer,
    recruitment_unit_id integer
);


ALTER TABLE public.ts_recruitment_unit_previous_results OWNER TO tsuser;

--
-- Name: TABLE ts_recruitment_unit_previous_results; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_recruitment_unit_previous_results IS '모집단위별 이전 연도 입결 정보 테이블';


--
-- Name: COLUMN ts_recruitment_unit_previous_results.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_previous_results.id IS '입결 정보 고유 ID';


--
-- Name: COLUMN ts_recruitment_unit_previous_results.year; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_previous_results.year IS '입결 연도';


--
-- Name: COLUMN ts_recruitment_unit_previous_results.result_criteria; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_previous_results.result_criteria IS '입결 기준 (예: 최종등록자90%컷)';


--
-- Name: COLUMN ts_recruitment_unit_previous_results.grade_cut; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_previous_results.grade_cut IS '등급컷';


--
-- Name: COLUMN ts_recruitment_unit_previous_results.converted_score_cut; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_previous_results.converted_score_cut IS '환산컷';


--
-- Name: COLUMN ts_recruitment_unit_previous_results.competition_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_previous_results.competition_ratio IS '경쟁률';


--
-- Name: COLUMN ts_recruitment_unit_previous_results.recruitment_number; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_previous_results.recruitment_number IS '모집인원';


--
-- Name: COLUMN ts_recruitment_unit_previous_results.recruitment_unit_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_previous_results.recruitment_unit_id IS '모집단위 고유 ID';


--
-- Name: ts_recruitment_unit_previous_results_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_recruitment_unit_previous_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_recruitment_unit_previous_results_id_seq OWNER TO tsuser;

--
-- Name: ts_recruitment_unit_previous_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_recruitment_unit_previous_results_id_seq OWNED BY public.ts_recruitment_unit_previous_results.id;


--
-- Name: ts_recruitment_unit_scores; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_recruitment_unit_scores (
    id integer NOT NULL,
    grade_50_cut numeric(10,5),
    grade_70_cut numeric(10,5),
    convert_50_cut numeric(10,5),
    convert_70_cut numeric(10,5),
    risk_plus_5 numeric(10,5),
    risk_plus_4 numeric(10,5),
    risk_plus_3 numeric(10,5),
    risk_plus_2 numeric(10,5),
    risk_plus_1 numeric(10,5),
    risk_minus_1 numeric(10,5),
    risk_minus_2 numeric(10,5),
    risk_minus_3 numeric(10,5),
    risk_minus_4 numeric(10,5),
    risk_minus_5 numeric(10,5),
    recruitment_unit_id integer
);


ALTER TABLE public.ts_recruitment_unit_scores OWNER TO tsuser;

--
-- Name: TABLE ts_recruitment_unit_scores; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_recruitment_unit_scores IS '모집단위별 성적 정보 테이블';


--
-- Name: COLUMN ts_recruitment_unit_scores.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.id IS '성적 정보 고유 ID';


--
-- Name: COLUMN ts_recruitment_unit_scores.grade_50_cut; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.grade_50_cut IS '등급50컷';


--
-- Name: COLUMN ts_recruitment_unit_scores.grade_70_cut; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.grade_70_cut IS '등급70컷';


--
-- Name: COLUMN ts_recruitment_unit_scores.convert_50_cut; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.convert_50_cut IS '환산50컷';


--
-- Name: COLUMN ts_recruitment_unit_scores.convert_70_cut; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.convert_70_cut IS '환산70컷';


--
-- Name: COLUMN ts_recruitment_unit_scores.risk_plus_5; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.risk_plus_5 IS '위험도 +5';


--
-- Name: COLUMN ts_recruitment_unit_scores.risk_plus_4; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.risk_plus_4 IS '위험도 +4';


--
-- Name: COLUMN ts_recruitment_unit_scores.risk_plus_3; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.risk_plus_3 IS '위험도 +3';


--
-- Name: COLUMN ts_recruitment_unit_scores.risk_plus_2; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.risk_plus_2 IS '위험도 +2';


--
-- Name: COLUMN ts_recruitment_unit_scores.risk_plus_1; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.risk_plus_1 IS '위험도 +1';


--
-- Name: COLUMN ts_recruitment_unit_scores.risk_minus_1; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.risk_minus_1 IS '위험도 -1';


--
-- Name: COLUMN ts_recruitment_unit_scores.risk_minus_2; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.risk_minus_2 IS '위험도 -2';


--
-- Name: COLUMN ts_recruitment_unit_scores.risk_minus_3; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.risk_minus_3 IS '위험도 -3';


--
-- Name: COLUMN ts_recruitment_unit_scores.risk_minus_4; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.risk_minus_4 IS '위험도 -4';


--
-- Name: COLUMN ts_recruitment_unit_scores.risk_minus_5; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.risk_minus_5 IS '위험도 -5';


--
-- Name: COLUMN ts_recruitment_unit_scores.recruitment_unit_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_unit_scores.recruitment_unit_id IS '모집단위 고유 ID';


--
-- Name: ts_recruitment_unit_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_recruitment_unit_scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_recruitment_unit_scores_id_seq OWNER TO tsuser;

--
-- Name: ts_recruitment_unit_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_recruitment_unit_scores_id_seq OWNED BY public.ts_recruitment_unit_scores.id;


--
-- Name: ts_recruitment_units; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_recruitment_units (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    recruitment_number integer,
    code character varying(20),
    admission_id integer,
    general_field_id integer,
    minor_field_id integer
);


ALTER TABLE public.ts_recruitment_units OWNER TO tsuser;

--
-- Name: TABLE ts_recruitment_units; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_recruitment_units IS '대학 입학전형의 모집단위 정보 테이블';


--
-- Name: COLUMN ts_recruitment_units.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_units.id IS '모집단위 고유 ID';


--
-- Name: COLUMN ts_recruitment_units.name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_units.name IS '모집단위 이름';


--
-- Name: COLUMN ts_recruitment_units.recruitment_number; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_units.recruitment_number IS '모집인원';


--
-- Name: COLUMN ts_recruitment_units.code; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_units.code IS '모집단위 코드';


--
-- Name: COLUMN ts_recruitment_units.admission_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_units.admission_id IS '전형 고유 ID';


--
-- Name: COLUMN ts_recruitment_units.general_field_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_units.general_field_id IS '일반 계열 고유 ID';


--
-- Name: COLUMN ts_recruitment_units.minor_field_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_recruitment_units.minor_field_id IS '소계열 고유 ID';


--
-- Name: ts_recruitment_units_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_recruitment_units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_recruitment_units_id_seq OWNER TO tsuser;

--
-- Name: ts_recruitment_units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_recruitment_units_id_seq OWNED BY public.ts_recruitment_units.id;


--
-- Name: ts_regular_admission_previous_results; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_regular_admission_previous_results (
    id integer NOT NULL,
    year integer NOT NULL,
    min_cut numeric(10,5),
    max_cut numeric(10,5),
    competition_ratio numeric(10,5),
    percent numeric(10,5),
    recruitment_number integer,
    regular_admission_id integer
);


ALTER TABLE public.ts_regular_admission_previous_results OWNER TO tsuser;

--
-- Name: TABLE ts_regular_admission_previous_results; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_regular_admission_previous_results IS '과거 정시 입학 결과 테이블';


--
-- Name: COLUMN ts_regular_admission_previous_results.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admission_previous_results.id IS '과거 정시 입학 결과 고유 ID';


--
-- Name: COLUMN ts_regular_admission_previous_results.year; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admission_previous_results.year IS '년도';


--
-- Name: COLUMN ts_regular_admission_previous_results.min_cut; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admission_previous_results.min_cut IS '최초컷';


--
-- Name: COLUMN ts_regular_admission_previous_results.max_cut; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admission_previous_results.max_cut IS '추합컷';


--
-- Name: COLUMN ts_regular_admission_previous_results.competition_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admission_previous_results.competition_ratio IS '경쟁률';


--
-- Name: COLUMN ts_regular_admission_previous_results.percent; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admission_previous_results.percent IS '누백';


--
-- Name: COLUMN ts_regular_admission_previous_results.recruitment_number; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admission_previous_results.recruitment_number IS '모집인원';


--
-- Name: COLUMN ts_regular_admission_previous_results.regular_admission_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admission_previous_results.regular_admission_id IS '정시 입학 정보 고유 ID';


--
-- Name: ts_regular_admission_previous_results_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_regular_admission_previous_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_regular_admission_previous_results_id_seq OWNER TO tsuser;

--
-- Name: ts_regular_admission_previous_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_regular_admission_previous_results_id_seq OWNED BY public.ts_regular_admission_previous_results.id;


--
-- Name: ts_regular_admissions; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_regular_admissions (
    id integer NOT NULL,
    year integer NOT NULL,
    admission_name character varying(30) NOT NULL,
    admission_type character varying(10) NOT NULL,
    general_field_name character varying(50) NOT NULL,
    detailed_fields character varying(100) NOT NULL,
    recruitment_number integer DEFAULT 0 NOT NULL,
    selection_method character varying(50) NOT NULL,
    recruitment_name character varying(50) NOT NULL,
    csat_ratio character varying(30) NOT NULL,
    school_record_ratio character varying(30) NOT NULL,
    interview_ratio character varying(30) NOT NULL,
    other_ratio character varying(30) NOT NULL,
    score_calculation character varying(100),
    csat_elements character varying(100),
    csat_combination character varying(100),
    csat_required character varying(100),
    csat_optional character varying(100),
    total_score integer,
    research_subject_count integer,
    korean_reflection_score numeric(10,5),
    math_reflection_score numeric(10,5),
    research_reflection_score numeric(10,5),
    english_reflection_score numeric(10,5),
    korean_history_reflection_score numeric(10,5),
    second_foreign_language_reflection_score numeric(10,5),
    min_cut numeric(10,5),
    min_cut_percent numeric(10,5),
    max_cut numeric(10,5),
    max_cut_percent numeric(10,5),
    risk_plus_5 numeric(10,5),
    risk_plus_4 numeric(10,5),
    risk_plus_3 numeric(10,5),
    risk_plus_2 numeric(10,5),
    risk_plus_1 numeric(10,5),
    risk_minus_1 numeric(10,5),
    risk_minus_2 numeric(10,5),
    risk_minus_3 numeric(10,5),
    risk_minus_4 numeric(10,5),
    risk_minus_5 numeric(10,5),
    initial_cumulative_percentile numeric(10,5),
    additional_cumulative_percentile numeric(10,5),
    korean_elective_subject character varying(40),
    math_elective_subject character varying(40),
    math_probability_statistics_additional_points character varying(40),
    math_calculus_additional_points character varying(40),
    math_geometry_additional_points character varying(40),
    research_type character varying(40),
    research_social_additional_points character varying(40),
    research_science_additional_points character varying(40),
    math_research_selection character varying(40),
    english_application_criteria character varying(40),
    english_grade_1_score character varying(40),
    english_grade_2_score character varying(40),
    english_grade_3_score character varying(40),
    english_grade_4_score character varying(40),
    english_grade_5_score character varying(40),
    english_grade_6_score character varying(40),
    english_grade_7_score character varying(40),
    english_grade_8_score character varying(40),
    english_grade_9_score character varying(40),
    english_minimum_criteria character varying(50),
    korean_history_application_criteria character varying(40),
    korean_history_grade_1_score character varying(40),
    korean_history_grade_2_score character varying(40),
    korean_history_grade_3_score character varying(40),
    korean_history_grade_4_score character varying(40),
    korean_history_grade_5_score character varying(40),
    korean_history_grade_6_score character varying(40),
    korean_history_grade_7_score character varying(40),
    korean_history_grade_8_score character varying(40),
    korean_history_grade_9_score character varying(40),
    korean_history_minimum_criteria character varying(50),
    university_id integer
);


ALTER TABLE public.ts_regular_admissions OWNER TO tsuser;

--
-- Name: TABLE ts_regular_admissions; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_regular_admissions IS '정시 입학 정보 테이블';


--
-- Name: COLUMN ts_regular_admissions.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.id IS '정시 입학 정보 고유 ID';


--
-- Name: COLUMN ts_regular_admissions.year; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.year IS '년도';


--
-- Name: COLUMN ts_regular_admissions.admission_name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.admission_name IS '전형명';


--
-- Name: COLUMN ts_regular_admissions.admission_type; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.admission_type IS '모집군';


--
-- Name: COLUMN ts_regular_admissions.general_field_name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.general_field_name IS '계열명 (의치한약수)';


--
-- Name: COLUMN ts_regular_admissions.detailed_fields; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.detailed_fields IS '상세계열 (전기•전자•컴퓨터•통신)';


--
-- Name: COLUMN ts_regular_admissions.recruitment_number; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.recruitment_number IS '정원';


--
-- Name: COLUMN ts_regular_admissions.selection_method; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.selection_method IS '선발 방식';


--
-- Name: COLUMN ts_regular_admissions.recruitment_name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.recruitment_name IS '모집단위명 (한국어문학과)';


--
-- Name: COLUMN ts_regular_admissions.csat_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.csat_ratio IS '수능 비율';


--
-- Name: COLUMN ts_regular_admissions.school_record_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.school_record_ratio IS '학생부 비율';


--
-- Name: COLUMN ts_regular_admissions.interview_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.interview_ratio IS '면접 비율';


--
-- Name: COLUMN ts_regular_admissions.other_ratio; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.other_ratio IS '기타 비율';


--
-- Name: COLUMN ts_regular_admissions.score_calculation; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.score_calculation IS '점수환산식 (계명의학)';


--
-- Name: COLUMN ts_regular_admissions.csat_elements; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.csat_elements IS '수능요소 (백+백)';


--
-- Name: COLUMN ts_regular_admissions.csat_combination; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.csat_combination IS '수능조합 (수탐(2)+국영中택1)';


--
-- Name: COLUMN ts_regular_admissions.csat_required; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.csat_required IS '수능필수 (수탐(2))';


--
-- Name: COLUMN ts_regular_admissions.csat_optional; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.csat_optional IS '수능선택 (국영中택1)';


--
-- Name: COLUMN ts_regular_admissions.total_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.total_score IS '전형 총점';


--
-- Name: COLUMN ts_regular_admissions.research_subject_count; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.research_subject_count IS '탐구과목수';


--
-- Name: COLUMN ts_regular_admissions.korean_reflection_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_reflection_score IS '국어배점';


--
-- Name: COLUMN ts_regular_admissions.math_reflection_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.math_reflection_score IS '수학배점';


--
-- Name: COLUMN ts_regular_admissions.research_reflection_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.research_reflection_score IS '탐구배점';


--
-- Name: COLUMN ts_regular_admissions.english_reflection_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.english_reflection_score IS '영어 배점';


--
-- Name: COLUMN ts_regular_admissions.korean_history_reflection_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_history_reflection_score IS '한국사 배점';


--
-- Name: COLUMN ts_regular_admissions.second_foreign_language_reflection_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.second_foreign_language_reflection_score IS '제2외국어 배점';


--
-- Name: COLUMN ts_regular_admissions.min_cut; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.min_cut IS '최초컷';


--
-- Name: COLUMN ts_regular_admissions.min_cut_percent; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.min_cut_percent IS '최초누백';


--
-- Name: COLUMN ts_regular_admissions.max_cut; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.max_cut IS '추합컷';


--
-- Name: COLUMN ts_regular_admissions.max_cut_percent; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.max_cut_percent IS '추합누백';


--
-- Name: COLUMN ts_regular_admissions.risk_plus_5; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.risk_plus_5 IS '위험도 +5';


--
-- Name: COLUMN ts_regular_admissions.risk_plus_4; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.risk_plus_4 IS '위험도 +4';


--
-- Name: COLUMN ts_regular_admissions.risk_plus_3; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.risk_plus_3 IS '위험도 +3';


--
-- Name: COLUMN ts_regular_admissions.risk_plus_2; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.risk_plus_2 IS '위험도 +2';


--
-- Name: COLUMN ts_regular_admissions.risk_plus_1; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.risk_plus_1 IS '위험도 +1';


--
-- Name: COLUMN ts_regular_admissions.risk_minus_1; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.risk_minus_1 IS '위험도 -1';


--
-- Name: COLUMN ts_regular_admissions.risk_minus_2; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.risk_minus_2 IS '위험도 -2';


--
-- Name: COLUMN ts_regular_admissions.risk_minus_3; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.risk_minus_3 IS '위험도 -3';


--
-- Name: COLUMN ts_regular_admissions.risk_minus_4; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.risk_minus_4 IS '위험도 -4';


--
-- Name: COLUMN ts_regular_admissions.risk_minus_5; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.risk_minus_5 IS '위험도 -5';


--
-- Name: COLUMN ts_regular_admissions.initial_cumulative_percentile; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.initial_cumulative_percentile IS '최초누백';


--
-- Name: COLUMN ts_regular_admissions.additional_cumulative_percentile; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.additional_cumulative_percentile IS '추합누백';


--
-- Name: COLUMN ts_regular_admissions.korean_elective_subject; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_elective_subject IS '국어선택과목';


--
-- Name: COLUMN ts_regular_admissions.math_elective_subject; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.math_elective_subject IS '수학_선택과목';


--
-- Name: COLUMN ts_regular_admissions.math_probability_statistics_additional_points; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.math_probability_statistics_additional_points IS '수학_확통가산점';


--
-- Name: COLUMN ts_regular_admissions.math_calculus_additional_points; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.math_calculus_additional_points IS '수학_미적가산점';


--
-- Name: COLUMN ts_regular_admissions.math_geometry_additional_points; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.math_geometry_additional_points IS '수학_기하가산점';


--
-- Name: COLUMN ts_regular_admissions.research_type; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.research_type IS '탐구_유형';


--
-- Name: COLUMN ts_regular_admissions.research_social_additional_points; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.research_social_additional_points IS '탐구_사회가산점';


--
-- Name: COLUMN ts_regular_admissions.research_science_additional_points; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.research_science_additional_points IS '탐구_과학가산점';


--
-- Name: COLUMN ts_regular_admissions.math_research_selection; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.math_research_selection IS '수탐선택';


--
-- Name: COLUMN ts_regular_admissions.english_application_criteria; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.english_application_criteria IS '영어_적용기준';


--
-- Name: COLUMN ts_regular_admissions.english_grade_1_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.english_grade_1_score IS '영어 1등급점수';


--
-- Name: COLUMN ts_regular_admissions.english_grade_2_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.english_grade_2_score IS '영어 2등급점수';


--
-- Name: COLUMN ts_regular_admissions.english_grade_3_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.english_grade_3_score IS '영어 3등급점수';


--
-- Name: COLUMN ts_regular_admissions.english_grade_4_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.english_grade_4_score IS '영어 4등급점수';


--
-- Name: COLUMN ts_regular_admissions.english_grade_5_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.english_grade_5_score IS '영어 5등급점수';


--
-- Name: COLUMN ts_regular_admissions.english_grade_6_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.english_grade_6_score IS '영어 6등급점수';


--
-- Name: COLUMN ts_regular_admissions.english_grade_7_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.english_grade_7_score IS '영어 7등급점수';


--
-- Name: COLUMN ts_regular_admissions.english_grade_8_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.english_grade_8_score IS '영어 8등급점수';


--
-- Name: COLUMN ts_regular_admissions.english_grade_9_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.english_grade_9_score IS '영어 9등급점수';


--
-- Name: COLUMN ts_regular_admissions.english_minimum_criteria; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.english_minimum_criteria IS '영어 최저기준';


--
-- Name: COLUMN ts_regular_admissions.korean_history_application_criteria; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_history_application_criteria IS '한국사_적용기준';


--
-- Name: COLUMN ts_regular_admissions.korean_history_grade_1_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_history_grade_1_score IS '한국사 1등급점수';


--
-- Name: COLUMN ts_regular_admissions.korean_history_grade_2_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_history_grade_2_score IS '한국사 2등급점수';


--
-- Name: COLUMN ts_regular_admissions.korean_history_grade_3_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_history_grade_3_score IS '한국사 3등급점수';


--
-- Name: COLUMN ts_regular_admissions.korean_history_grade_4_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_history_grade_4_score IS '한국사 4등급점수';


--
-- Name: COLUMN ts_regular_admissions.korean_history_grade_5_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_history_grade_5_score IS '한국사 5등급점수';


--
-- Name: COLUMN ts_regular_admissions.korean_history_grade_6_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_history_grade_6_score IS '한국사 6등급점수';


--
-- Name: COLUMN ts_regular_admissions.korean_history_grade_7_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_history_grade_7_score IS '한국사 7등급점수';


--
-- Name: COLUMN ts_regular_admissions.korean_history_grade_8_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_history_grade_8_score IS '한국사 8등급점수';


--
-- Name: COLUMN ts_regular_admissions.korean_history_grade_9_score; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_history_grade_9_score IS '한국사 9등급점수';


--
-- Name: COLUMN ts_regular_admissions.korean_history_minimum_criteria; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.korean_history_minimum_criteria IS '한국사 최저기준';


--
-- Name: COLUMN ts_regular_admissions.university_id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_regular_admissions.university_id IS '대학 고유 ID';


--
-- Name: ts_regular_admissions_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_regular_admissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_regular_admissions_id_seq OWNER TO tsuser;

--
-- Name: ts_regular_admissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_regular_admissions_id_seq OWNED BY public.ts_regular_admissions.id;


--
-- Name: ts_universities; Type: TABLE; Schema: public; Owner: tsuser
--

CREATE TABLE public.ts_universities (
    id integer NOT NULL,
    region character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    establishment_type public.ts_universities_establishment_type_enum NOT NULL
);


ALTER TABLE public.ts_universities OWNER TO tsuser;

--
-- Name: TABLE ts_universities; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON TABLE public.ts_universities IS '대학 정보 테이블';


--
-- Name: COLUMN ts_universities.id; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_universities.id IS '대학 고유 ID';


--
-- Name: COLUMN ts_universities.region; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_universities.region IS '지역';


--
-- Name: COLUMN ts_universities.name; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_universities.name IS '대학명';


--
-- Name: COLUMN ts_universities.code; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_universities.code IS '대학코드';


--
-- Name: COLUMN ts_universities.establishment_type; Type: COMMENT; Schema: public; Owner: tsuser
--

COMMENT ON COLUMN public.ts_universities.establishment_type IS '대학설립형태';


--
-- Name: ts_universities_id_seq; Type: SEQUENCE; Schema: public; Owner: tsuser
--

CREATE SEQUENCE public.ts_universities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ts_universities_id_seq OWNER TO tsuser;

--
-- Name: ts_universities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tsuser
--

ALTER SEQUENCE public.ts_universities_id_seq OWNED BY public.ts_universities.id;


--
-- Name: board_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.board_tb ALTER COLUMN id SET DEFAULT nextval('public.board_tb_id_seq'::regclass);


--
-- Name: comment_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.comment_tb ALTER COLUMN id SET DEFAULT nextval('public.comment_tb_id_seq'::regclass);


--
-- Name: earlyd_subject_code_list_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.earlyd_subject_code_list_tb ALTER COLUMN id SET DEFAULT nextval('public.earlyd_subject_code_list_tb_id_seq'::regclass);


--
-- Name: essay_list_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.essay_list_tb ALTER COLUMN id SET DEFAULT nextval('public.essay_list_tb_id_seq'::regclass);


--
-- Name: essay_lowest_grade_list_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.essay_lowest_grade_list_tb ALTER COLUMN id SET DEFAULT nextval('public.essay_lowest_grade_list_tb_id_seq'::regclass);


--
-- Name: member_interests id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.member_interests ALTER COLUMN id SET DEFAULT nextval('public.member_interests_id_seq'::regclass);


--
-- Name: member_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.member_tb ALTER COLUMN id SET DEFAULT nextval('public.member_tb_id_seq'::regclass);


--
-- Name: member_upload_file_list_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.member_upload_file_list_tb ALTER COLUMN id SET DEFAULT nextval('public.member_upload_file_list_tb_id_seq'::regclass);


--
-- Name: mockexam_marks_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_marks_tb ALTER COLUMN id SET DEFAULT nextval('public.mockexam_marks_tb_id_seq'::regclass);


--
-- Name: mockexam_raw_score_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_raw_score_tb ALTER COLUMN id SET DEFAULT nextval('public.mockexam_raw_score_tb_id_seq'::regclass);


--
-- Name: mockexam_raw_to_standard_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_raw_to_standard_tb ALTER COLUMN id SET DEFAULT nextval('public.mockexam_raw_to_standard_tb_id_seq'::regclass);


--
-- Name: mockexam_schedule_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_schedule_tb ALTER COLUMN id SET DEFAULT nextval('public.mockexam_schedule_tb_id_seq'::regclass);


--
-- Name: mockexam_standard_score_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_standard_score_tb ALTER COLUMN id SET DEFAULT nextval('public.mockexam_standard_score_tb_id_seq'::regclass);


--
-- Name: officer_bottom_survey_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_bottom_survey_tb ALTER COLUMN id SET DEFAULT nextval('public.officer_bottom_survey_tb_id_seq'::regclass);


--
-- Name: officer_comment_list_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_comment_list_tb ALTER COLUMN id SET DEFAULT nextval('public.officer_comment_list_tb_id_seq'::regclass);


--
-- Name: officer_list_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_list_tb ALTER COLUMN id SET DEFAULT nextval('public.officer_list_tb_id_seq'::regclass);


--
-- Name: officer_scoring_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_scoring_tb ALTER COLUMN id SET DEFAULT nextval('public.officer_scoring_tb_id_seq'::regclass);


--
-- Name: officer_student_evaludate_relation_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_student_evaludate_relation_tb ALTER COLUMN id SET DEFAULT nextval('public.officer_student_evaludate_relation_tb_id_seq'::regclass);


--
-- Name: officer_ticket_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_ticket_tb ALTER COLUMN id SET DEFAULT nextval('public.officer_ticket_tb_id_seq'::regclass);


--
-- Name: pay_cancel_log_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_cancel_log_tb ALTER COLUMN id SET DEFAULT nextval('public.pay_cancel_log_tb_id_seq'::regclass);


--
-- Name: pay_contract_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_contract_tb ALTER COLUMN id SET DEFAULT nextval('public.pay_contract_tb_id_seq'::regclass);


--
-- Name: pay_coupon_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_coupon_tb ALTER COLUMN id SET DEFAULT nextval('public.pay_coupon_tb_id_seq'::regclass);


--
-- Name: pay_order_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_order_tb ALTER COLUMN id SET DEFAULT nextval('public.pay_order_tb_id_seq'::regclass);


--
-- Name: pay_service_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_service_tb ALTER COLUMN id SET DEFAULT nextval('public.pay_service_tb_id_seq'::regclass);


--
-- Name: post_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.post_tb ALTER COLUMN id SET DEFAULT nextval('public.post_tb_id_seq'::regclass);


--
-- Name: schoolrecord_attendance_detail_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_attendance_detail_tb ALTER COLUMN id SET DEFAULT nextval('public.schoolrecord_attendance_detail_tb_id_seq'::regclass);


--
-- Name: schoolrecord_select_subject_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_select_subject_tb ALTER COLUMN id SET DEFAULT nextval('public.schoolrecord_select_subject_tb_id_seq'::regclass);


--
-- Name: schoolrecord_subject_learning_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_subject_learning_tb ALTER COLUMN id SET DEFAULT nextval('public.schoolrecord_subject_learning_tb_id_seq'::regclass);


--
-- Name: schoolrecord_subject_sports_art_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_subject_sports_art_tb ALTER COLUMN id SET DEFAULT nextval('public.schoolrecord_subject_sports_art_tb_id_seq'::regclass);


--
-- Name: schoolrecord_volunteer_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_volunteer_tb ALTER COLUMN id SET DEFAULT nextval('public.schoolrecord_volunteer_tb_id_seq'::regclass);


--
-- Name: susi_comprehensive_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.susi_comprehensive_tb ALTER COLUMN id SET DEFAULT nextval('public.susi_comprehensive_tb_id_seq'::regclass);


--
-- Name: susi_pass_record_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.susi_pass_record_tb ALTER COLUMN id SET DEFAULT nextval('public.susi_pass_record_tb_id_seq'::regclass);


--
-- Name: susi_subject_tb id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.susi_subject_tb ALTER COLUMN id SET DEFAULT nextval('public.susi_subject_tb_id_seq'::regclass);


--
-- Name: ts_admission_categories id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_categories ALTER COLUMN id SET DEFAULT nextval('public.ts_admission_categories_id_seq'::regclass);


--
-- Name: ts_admission_methods id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_methods ALTER COLUMN id SET DEFAULT nextval('public.ts_admission_methods_id_seq'::regclass);


--
-- Name: ts_admission_subtypes id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_subtypes ALTER COLUMN id SET DEFAULT nextval('public.ts_admission_subtypes_id_seq'::regclass);


--
-- Name: ts_admissions id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admissions ALTER COLUMN id SET DEFAULT nextval('public.ts_admissions_id_seq'::regclass);


--
-- Name: ts_general_fields id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_general_fields ALTER COLUMN id SET DEFAULT nextval('public.ts_general_fields_id_seq'::regclass);


--
-- Name: ts_major_fields id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_major_fields ALTER COLUMN id SET DEFAULT nextval('public.ts_major_fields_id_seq'::regclass);


--
-- Name: ts_member_recruitment_unit_combinations id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_recruitment_unit_combinations ALTER COLUMN id SET DEFAULT nextval('public.ts_member_recruitment_unit_combinations_id_seq'::regclass);


--
-- Name: ts_member_regular_combinations id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_regular_combinations ALTER COLUMN id SET DEFAULT nextval('public.ts_member_regular_combinations_id_seq'::regclass);


--
-- Name: ts_member_regular_interests id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_regular_interests ALTER COLUMN id SET DEFAULT nextval('public.ts_member_regular_interests_id_seq'::regclass);


--
-- Name: ts_mid_fields id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_mid_fields ALTER COLUMN id SET DEFAULT nextval('public.ts_mid_fields_id_seq'::regclass);


--
-- Name: ts_minor_fields id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_minor_fields ALTER COLUMN id SET DEFAULT nextval('public.ts_minor_fields_id_seq'::regclass);


--
-- Name: ts_recruitment_unit_interviews id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_interviews ALTER COLUMN id SET DEFAULT nextval('public.ts_recruitment_unit_interviews_id_seq'::regclass);


--
-- Name: ts_recruitment_unit_minimum_grades id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_minimum_grades ALTER COLUMN id SET DEFAULT nextval('public.ts_recruitment_unit_minimum_grades_id_seq'::regclass);


--
-- Name: ts_recruitment_unit_pass_fail_records id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_pass_fail_records ALTER COLUMN id SET DEFAULT nextval('public.ts_recruitment_unit_pass_fail_records_id_seq'::regclass);


--
-- Name: ts_recruitment_unit_previous_results id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_previous_results ALTER COLUMN id SET DEFAULT nextval('public.ts_recruitment_unit_previous_results_id_seq'::regclass);


--
-- Name: ts_recruitment_unit_scores id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_scores ALTER COLUMN id SET DEFAULT nextval('public.ts_recruitment_unit_scores_id_seq'::regclass);


--
-- Name: ts_recruitment_units id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_units ALTER COLUMN id SET DEFAULT nextval('public.ts_recruitment_units_id_seq'::regclass);


--
-- Name: ts_regular_admission_previous_results id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_regular_admission_previous_results ALTER COLUMN id SET DEFAULT nextval('public.ts_regular_admission_previous_results_id_seq'::regclass);


--
-- Name: ts_regular_admissions id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_regular_admissions ALTER COLUMN id SET DEFAULT nextval('public.ts_regular_admissions_id_seq'::regclass);


--
-- Name: ts_universities id; Type: DEFAULT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_universities ALTER COLUMN id SET DEFAULT nextval('public.ts_universities_id_seq'::regclass);


--
-- Name: board_tb PK_043a2e346137b381d2fdeabd341; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.board_tb
    ADD CONSTRAINT "PK_043a2e346137b381d2fdeabd341" PRIMARY KEY (id);


--
-- Name: ts_member_recruitment_unit_combination_items PK_0656732513b826b2f0b4d1b1d55; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_recruitment_unit_combination_items
    ADD CONSTRAINT "PK_0656732513b826b2f0b4d1b1d55" PRIMARY KEY (combination_id, recruitment_unit_id);


--
-- Name: essay_lowest_grade_list_tb PK_0d7e03c21f1729878db218e2fcc; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.essay_lowest_grade_list_tb
    ADD CONSTRAINT "PK_0d7e03c21f1729878db218e2fcc" PRIMARY KEY (id);


--
-- Name: ts_member_regular_combinations PK_0fec10619d66baf40df59ef87a0; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_regular_combinations
    ADD CONSTRAINT "PK_0fec10619d66baf40df59ef87a0" PRIMARY KEY (id);


--
-- Name: ts_admissions PK_179ef988b6a4a87b7232e97f691; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admissions
    ADD CONSTRAINT "PK_179ef988b6a4a87b7232e97f691" PRIMARY KEY (id);


--
-- Name: susi_subject_tb PK_17bacf530936e96d6eb6f1b303c; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.susi_subject_tb
    ADD CONSTRAINT "PK_17bacf530936e96d6eb6f1b303c" PRIMARY KEY (id);


--
-- Name: officer_bottom_survey_tb PK_255399b38ac82bed4b0e2068032; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_bottom_survey_tb
    ADD CONSTRAINT "PK_255399b38ac82bed4b0e2068032" PRIMARY KEY (id);


--
-- Name: ts_admission_categories PK_29677625f262b0cb4adaf220f97; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_categories
    ADD CONSTRAINT "PK_29677625f262b0cb4adaf220f97" PRIMARY KEY (id);


--
-- Name: ts_member_regular_interests PK_29edf3b6ac404d4c94df65aaba3; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_regular_interests
    ADD CONSTRAINT "PK_29edf3b6ac404d4c94df65aaba3" PRIMARY KEY (id);


--
-- Name: schoolrecord_attendance_detail_tb PK_2c8f4ea9d3c3d10d9c7d7fc1fb1; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_attendance_detail_tb
    ADD CONSTRAINT "PK_2c8f4ea9d3c3d10d9c7d7fc1fb1" PRIMARY KEY (id);


--
-- Name: ts_universities PK_2f945277eb94695362adde05db1; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_universities
    ADD CONSTRAINT "PK_2f945277eb94695362adde05db1" PRIMARY KEY (id);


--
-- Name: susi_comprehensive_tb PK_329a86ea2f628cbfa21514937fc; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.susi_comprehensive_tb
    ADD CONSTRAINT "PK_329a86ea2f628cbfa21514937fc" PRIMARY KEY (id);


--
-- Name: ts_recruitment_unit_scores PK_3408a0cebc4b1e36d07d1b024f4; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_scores
    ADD CONSTRAINT "PK_3408a0cebc4b1e36d07d1b024f4" PRIMARY KEY (id);


--
-- Name: essay_list_tb PK_370c2f3fc54ea1bce6f7750ff18; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.essay_list_tb
    ADD CONSTRAINT "PK_370c2f3fc54ea1bce6f7750ff18" PRIMARY KEY (id);


--
-- Name: officer_scoring_tb PK_3cf383c4f8a62083a56575481f3; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_scoring_tb
    ADD CONSTRAINT "PK_3cf383c4f8a62083a56575481f3" PRIMARY KEY (id);


--
-- Name: ts_minor_fields PK_3d2ef5db1e0b1e45c3088bb9c42; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_minor_fields
    ADD CONSTRAINT "PK_3d2ef5db1e0b1e45c3088bb9c42" PRIMARY KEY (id);


--
-- Name: post_tb PK_411b73a7fba0772a512e2b760a4; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.post_tb
    ADD CONSTRAINT "PK_411b73a7fba0772a512e2b760a4" PRIMARY KEY (id);


--
-- Name: ts_admission_subtypes PK_478e72e57d0016720e5e1ce073b; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_subtypes
    ADD CONSTRAINT "PK_478e72e57d0016720e5e1ce073b" PRIMARY KEY (id);


--
-- Name: schoolrecord_subject_learning_tb PK_48746da203c15ea037d8c0c8708; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_subject_learning_tb
    ADD CONSTRAINT "PK_48746da203c15ea037d8c0c8708" PRIMARY KEY (id);


--
-- Name: officer_student_evaludate_relation_tb PK_488eb9bde60a4535d60c65e1479; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_student_evaludate_relation_tb
    ADD CONSTRAINT "PK_488eb9bde60a4535d60c65e1479" PRIMARY KEY (id);


--
-- Name: ts_recruitment_unit_pass_fail_records PK_5256e459785682aca7389b6a6e4; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_pass_fail_records
    ADD CONSTRAINT "PK_5256e459785682aca7389b6a6e4" PRIMARY KEY (id);


--
-- Name: officer_list_tb PK_531cef8bd10e2d7b9805e1a9fb9; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_list_tb
    ADD CONSTRAINT "PK_531cef8bd10e2d7b9805e1a9fb9" PRIMARY KEY (id);


--
-- Name: ts_general_fields PK_5543bc6e7bee5aa9c7ce073c0dd; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_general_fields
    ADD CONSTRAINT "PK_5543bc6e7bee5aa9c7ce073c0dd" PRIMARY KEY (id);


--
-- Name: ts_recruitment_unit_minimum_grades PK_56b1b19739e45c910665d5202de; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_minimum_grades
    ADD CONSTRAINT "PK_56b1b19739e45c910665d5202de" PRIMARY KEY (id);


--
-- Name: mockexam_marks_tb PK_58fb4f5bc00fdf197fce976574c; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_marks_tb
    ADD CONSTRAINT "PK_58fb4f5bc00fdf197fce976574c" PRIMARY KEY (id);


--
-- Name: mockexam_raw_to_standard_tb PK_5d1e1398813afe7866e8dcd5558; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_raw_to_standard_tb
    ADD CONSTRAINT "PK_5d1e1398813afe7866e8dcd5558" PRIMARY KEY (id);


--
-- Name: ts_recruitment_units PK_5e577146229b0d0654f16e57f72; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_units
    ADD CONSTRAINT "PK_5e577146229b0d0654f16e57f72" PRIMARY KEY (id);


--
-- Name: ts_member_recruitment_unit_combinations PK_62e44c52b567669383a8e19547f; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_recruitment_unit_combinations
    ADD CONSTRAINT "PK_62e44c52b567669383a8e19547f" PRIMARY KEY (id);


--
-- Name: mockexam_schedule_tb PK_64e44e3f1c904121444efd87dd3; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_schedule_tb
    ADD CONSTRAINT "PK_64e44e3f1c904121444efd87dd3" PRIMARY KEY (id);


--
-- Name: ts_major_fields PK_69c672fed11799d215fd25d6864; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_major_fields
    ADD CONSTRAINT "PK_69c672fed11799d215fd25d6864" PRIMARY KEY (id);


--
-- Name: ts_admission_methods PK_782a263fc95fe984d0acd0627c9; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_methods
    ADD CONSTRAINT "PK_782a263fc95fe984d0acd0627c9" PRIMARY KEY (id);


--
-- Name: pay_service_tb PK_7bce2b962fbffa75f3e8f000fa0; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_service_tb
    ADD CONSTRAINT "PK_7bce2b962fbffa75f3e8f000fa0" PRIMARY KEY (id);


--
-- Name: member_tb PK_7d790bdfd10e7d57998c35e568b; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.member_tb
    ADD CONSTRAINT "PK_7d790bdfd10e7d57998c35e568b" PRIMARY KEY (id);


--
-- Name: schoolrecord_select_subject_tb PK_7e9dc526a5e4f0243808ae90553; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_select_subject_tb
    ADD CONSTRAINT "PK_7e9dc526a5e4f0243808ae90553" PRIMARY KEY (id);


--
-- Name: pay_cancel_log_tb PK_81ba0c14c1133a89041a3e5e858; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_cancel_log_tb
    ADD CONSTRAINT "PK_81ba0c14c1133a89041a3e5e858" PRIMARY KEY (id);


--
-- Name: ts_regular_admission_previous_results PK_81d3b7e8059cb8ac0f17cb5543d; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_regular_admission_previous_results
    ADD CONSTRAINT "PK_81d3b7e8059cb8ac0f17cb5543d" PRIMARY KEY (id);


--
-- Name: pay_contract_tb PK_9b101807120fa7e09e1a4cf7e7a; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_contract_tb
    ADD CONSTRAINT "PK_9b101807120fa7e09e1a4cf7e7a" PRIMARY KEY (id);


--
-- Name: ts_member_regular_combination_items PK_a3dae4df71b39dd0be482b513ce; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_regular_combination_items
    ADD CONSTRAINT "PK_a3dae4df71b39dd0be482b513ce" PRIMARY KEY (combination_id, regular_admission_id);


--
-- Name: ts_recruitment_unit_previous_results PK_b1976a1a29c5ff737c6f17b297b; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_previous_results
    ADD CONSTRAINT "PK_b1976a1a29c5ff737c6f17b297b" PRIMARY KEY (id);


--
-- Name: ts_recruitment_unit_interviews PK_b5a69314592181d0a31e4649825; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_interviews
    ADD CONSTRAINT "PK_b5a69314592181d0a31e4649825" PRIMARY KEY (id);


--
-- Name: comment_tb PK_b8992d2601e1948921bc75f6b0f; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.comment_tb
    ADD CONSTRAINT "PK_b8992d2601e1948921bc75f6b0f" PRIMARY KEY (id);


--
-- Name: schoolrecord_volunteer_tb PK_bb72218124466217305f09498f2; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_volunteer_tb
    ADD CONSTRAINT "PK_bb72218124466217305f09498f2" PRIMARY KEY (id);


--
-- Name: ts_admission_subtype_relations PK_c14551c33a19ce7d7978479c7ce; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_subtype_relations
    ADD CONSTRAINT "PK_c14551c33a19ce7d7978479c7ce" PRIMARY KEY (admission_id, subtype_id);


--
-- Name: pay_coupon_tb PK_c20d2d7a90d59ba3dfa104a15fd; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_coupon_tb
    ADD CONSTRAINT "PK_c20d2d7a90d59ba3dfa104a15fd" PRIMARY KEY (id);


--
-- Name: mockexam_standard_score_tb PK_c5ef8763a7a206b37e5f5af499e; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_standard_score_tb
    ADD CONSTRAINT "PK_c5ef8763a7a206b37e5f5af499e" PRIMARY KEY (id);


--
-- Name: ts_regular_admissions PK_c89feda44852b91fad821158154; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_regular_admissions
    ADD CONSTRAINT "PK_c89feda44852b91fad821158154" PRIMARY KEY (id);


--
-- Name: ts_mid_fields PK_c9eff3ca71991ff56516367d874; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_mid_fields
    ADD CONSTRAINT "PK_c9eff3ca71991ff56516367d874" PRIMARY KEY (id);


--
-- Name: earlyd_subject_code_list_tb PK_cc27e056b17ab778d53a6c1ca5b; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.earlyd_subject_code_list_tb
    ADD CONSTRAINT "PK_cc27e056b17ab778d53a6c1ca5b" PRIMARY KEY (id);


--
-- Name: schoolrecord_subject_sports_art_tb PK_cf46327c53d1c9d93194dab0c6c; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_subject_sports_art_tb
    ADD CONSTRAINT "PK_cf46327c53d1c9d93194dab0c6c" PRIMARY KEY (id);


--
-- Name: pay_order_tb PK_d0af6687433c1020e9408bd3594; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_order_tb
    ADD CONSTRAINT "PK_d0af6687433c1020e9408bd3594" PRIMARY KEY (id);


--
-- Name: member_upload_file_list_tb PK_d855d4bf2acabbe0b18301419b9; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.member_upload_file_list_tb
    ADD CONSTRAINT "PK_d855d4bf2acabbe0b18301419b9" PRIMARY KEY (id);


--
-- Name: member_interests PK_dc8a3c68cef89c7d4fb4cf0e83b; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.member_interests
    ADD CONSTRAINT "PK_dc8a3c68cef89c7d4fb4cf0e83b" PRIMARY KEY (id);


--
-- Name: officer_comment_list_tb PK_e5fac60658c4d5fbe11920d05fd; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_comment_list_tb
    ADD CONSTRAINT "PK_e5fac60658c4d5fbe11920d05fd" PRIMARY KEY (id);


--
-- Name: mockexam_raw_score_tb PK_e84fd7b8b008d7302a0ea1fc6bc; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_raw_score_tb
    ADD CONSTRAINT "PK_e84fd7b8b008d7302a0ea1fc6bc" PRIMARY KEY (id);


--
-- Name: susi_pass_record_tb PK_ec96f76e7b1eb90dfb130952880; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.susi_pass_record_tb
    ADD CONSTRAINT "PK_ec96f76e7b1eb90dfb130952880" PRIMARY KEY (id);


--
-- Name: officer_ticket_tb PK_f5cb8ced0e955317d8c794f0d31; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_ticket_tb
    ADD CONSTRAINT "PK_f5cb8ced0e955317d8c794f0d31" PRIMARY KEY (id);


--
-- Name: ts_recruitment_unit_minimum_grades REL_41f7d8356eab93ccbeedbfbb51; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_minimum_grades
    ADD CONSTRAINT "REL_41f7d8356eab93ccbeedbfbb51" UNIQUE (recruitment_unit_id);


--
-- Name: ts_admission_methods REL_d94f1511ec10557e47b32ff5f9; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_methods
    ADD CONSTRAINT "REL_d94f1511ec10557e47b32ff5f9" UNIQUE (admission_id);


--
-- Name: ts_recruitment_unit_interviews REL_f2b9d5df6805e7314a736dbfce; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_interviews
    ADD CONSTRAINT "REL_f2b9d5df6805e7314a736dbfce" UNIQUE (recruitment_unit_id);


--
-- Name: pay_order_tb UK_4c9pqmv7an15g602u8wa6dje; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_order_tb
    ADD CONSTRAINT "UK_4c9pqmv7an15g602u8wa6dje" UNIQUE (merchant_uid);


--
-- Name: pay_order_tb UK_gnwosnxtfwcpt1acvc9c1t1vf; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_order_tb
    ADD CONSTRAINT "UK_gnwosnxtfwcpt1acvc9c1t1vf" UNIQUE (imp_uid);


--
-- Name: pay_service_tb UK_pk3sdbagrh1cdo8jk2oog4g0v; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_service_tb
    ADD CONSTRAINT "UK_pk3sdbagrh1cdo8jk2oog4g0v" UNIQUE (product_nm);


--
-- Name: ts_general_fields UQ_2d0dc819a523eea9586a16218e5; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_general_fields
    ADD CONSTRAINT "UQ_2d0dc819a523eea9586a16218e5" UNIQUE (name);


--
-- Name: ts_admission_subtypes UQ_3eeef13a6196baf112558bd071a; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_subtypes
    ADD CONSTRAINT "UQ_3eeef13a6196baf112558bd071a" UNIQUE (name);


--
-- Name: ts_admission_categories UQ_54e6f68a2398d61d5d97b9bf191; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_categories
    ADD CONSTRAINT "UQ_54e6f68a2398d61d5d97b9bf191" UNIQUE (name);


--
-- Name: ts_major_fields UQ_cde952e038333d8fa4d019cb72d; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_major_fields
    ADD CONSTRAINT "UQ_cde952e038333d8fa4d019cb72d" UNIQUE (name);


--
-- Name: ts_universities UQ_f4a14dcea066cf8a444ed661562; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_universities
    ADD CONSTRAINT "UQ_f4a14dcea066cf8a444ed661562" UNIQUE (code);


--
-- Name: member_tb UQ_f866ea79fb061e5b53c8e04af7f; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.member_tb
    ADD CONSTRAINT "UQ_f866ea79fb061e5b53c8e04af7f" UNIQUE (email, phone, oauth_id);


--
-- Name: mockexam_marks_tb mockexam_marks_tb_UN; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_marks_tb
    ADD CONSTRAINT "mockexam_marks_tb_UN" UNIQUE (subject_code, member_id, schedule_id);


--
-- Name: officer_comment_list_tb officer_comment_list_tb_UN; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_comment_list_tb
    ADD CONSTRAINT "officer_comment_list_tb_UN" UNIQUE (main_survey_type, officer_relation_id);


--
-- Name: officer_scoring_tb officer_scoring_tb_UN; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_scoring_tb
    ADD CONSTRAINT "officer_scoring_tb_UN" UNIQUE (bottom_survey_id, officer_relation_id);


--
-- Name: ts_recruitment_units uk_recruitment_admission_name; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_units
    ADD CONSTRAINT uk_recruitment_admission_name UNIQUE (admission_id, name);


--
-- Name: ts_admissions uk_ts_admissions_name_year_university_category; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admissions
    ADD CONSTRAINT uk_ts_admissions_name_year_university_category UNIQUE (name, year, university_id, category_id);


--
-- Name: ts_mid_fields uk_ts_mid_fields_name_major_field; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_mid_fields
    ADD CONSTRAINT uk_ts_mid_fields_name_major_field UNIQUE (name, major_field_id);


--
-- Name: ts_minor_fields uk_ts_minor_fields_name_mid_field; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_minor_fields
    ADD CONSTRAINT uk_ts_minor_fields_name_mid_field UNIQUE (name, mid_field_id);


--
-- Name: essay_list_tb unique_essay; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.essay_list_tb
    ADD CONSTRAINT unique_essay UNIQUE (college_code, admission_series_code, recruitment_unit, type_rate, essay_type);


--
-- Name: officer_student_evaludate_relation_tb unique_mock2; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_student_evaludate_relation_tb
    ADD CONSTRAINT unique_mock2 UNIQUE (student_id, member_id);


--
-- Name: mockexam_raw_score_tb unique_mock_raw_score; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_raw_score_tb
    ADD CONSTRAINT unique_mock_raw_score UNIQUE (subject_code, member_id, schedule_id);


--
-- Name: mockexam_schedule_tb unique_mock_schedule; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_schedule_tb
    ADD CONSTRAINT unique_mock_schedule UNIQUE (mockexam_month, mockexam_year);


--
-- Name: mockexam_standard_score_tb unique_mock_standard_score; Type: CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_standard_score_tb
    ADD CONSTRAINT unique_mock_standard_score UNIQUE (subject_code, member_id, schedule_id);


--
-- Name: FK7u12dq9x1x8ln2t2559lcnphu; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX "FK7u12dq9x1x8ln2t2559lcnphu" ON public.mockexam_raw_score_tb USING btree (schedule_id);


--
-- Name: FKesul5u5vlua3mvqg1jlda6xa; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX "FKesul5u5vlua3mvqg1jlda6xa" ON public.mockexam_marks_tb USING btree (schedule_id);


--
-- Name: FKnxd2cq5t1ueyg5tg39s1gt10v; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX "FKnxd2cq5t1ueyg5tg39s1gt10v" ON public.mockexam_marks_tb USING btree (member_id);


--
-- Name: FKrnh66ujfb1ufu3cns2fsgllje; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX "FKrnh66ujfb1ufu3cns2fsgllje" ON public.mockexam_raw_score_tb USING btree (member_id);


--
-- Name: IDX_3a4ffe7127089f0b7e2d3b6a1f; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX "IDX_3a4ffe7127089f0b7e2d3b6a1f" ON public.ts_member_recruitment_unit_combination_items USING btree (combination_id);


--
-- Name: IDX_46af081a6131b134e0932dce95; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX "IDX_46af081a6131b134e0932dce95" ON public.ts_member_regular_combination_items USING btree (regular_admission_id);


--
-- Name: IDX_a1e017732e2abd5be8375a835f; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX "IDX_a1e017732e2abd5be8375a835f" ON public.ts_admission_subtype_relations USING btree (admission_id);


--
-- Name: IDX_b17cde38fcf8e5ffd67226d356; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX "IDX_b17cde38fcf8e5ffd67226d356" ON public.susi_pass_record_tb USING btree (unified_id);


--
-- Name: IDX_d75661e0272f23ebc44135f58d; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX "IDX_d75661e0272f23ebc44135f58d" ON public.ts_admission_subtype_relations USING btree (subtype_id);


--
-- Name: IDX_e8365a33222d0d621787d7fae7; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX "IDX_e8365a33222d0d621787d7fae7" ON public.ts_member_recruitment_unit_combination_items USING btree (recruitment_unit_id);


--
-- Name: IDX_f808bd9731f0b3f4377fc95313; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX "IDX_f808bd9731f0b3f4377fc95313" ON public.ts_member_regular_combination_items USING btree (combination_id);


--
-- Name: IDX_f866ea79fb061e5b53c8e04af7; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX "IDX_f866ea79fb061e5b53c8e04af7" ON public.member_tb USING btree (email, phone, oauth_id);


--
-- Name: idx_year_basic_type_large_medium_small; Type: INDEX; Schema: public; Owner: tsuser
--

CREATE INDEX idx_year_basic_type_large_medium_small ON public.susi_comprehensive_tb USING btree (year, basic_type, large_department, medium_department, small_department);


--
-- Name: schoolrecord_select_subject_tb FK_04b64d34cec6b65696f63f97e3a; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_select_subject_tb
    ADD CONSTRAINT "FK_04b64d34cec6b65696f63f97e3a" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: mockexam_marks_tb FK_064c9ea730c7a92c8cc897fa0f2; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_marks_tb
    ADD CONSTRAINT "FK_064c9ea730c7a92c8cc897fa0f2" FOREIGN KEY (schedule_id) REFERENCES public.mockexam_schedule_tb(id);


--
-- Name: ts_regular_admission_previous_results FK_0ec1798017167ae852a44247d0e; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_regular_admission_previous_results
    ADD CONSTRAINT "FK_0ec1798017167ae852a44247d0e" FOREIGN KEY (regular_admission_id) REFERENCES public.ts_regular_admissions(id) ON DELETE CASCADE;


--
-- Name: ts_recruitment_unit_scores FK_16eb2a0201916907c7cdea598a3; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_scores
    ADD CONSTRAINT "FK_16eb2a0201916907c7cdea598a3" FOREIGN KEY (recruitment_unit_id) REFERENCES public.ts_recruitment_units(id) ON DELETE CASCADE;


--
-- Name: pay_order_tb FK_190b10f2dc7bbef154a0eeb3516; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_order_tb
    ADD CONSTRAINT "FK_190b10f2dc7bbef154a0eeb3516" FOREIGN KEY (pay_service_id) REFERENCES public.pay_service_tb(id);


--
-- Name: ts_member_regular_combinations FK_1e144e8772967ac02d455a29126; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_regular_combinations
    ADD CONSTRAINT "FK_1e144e8772967ac02d455a29126" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: mockexam_raw_score_tb FK_1fb6df1764de52a2d81bfdd2bcb; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_raw_score_tb
    ADD CONSTRAINT "FK_1fb6df1764de52a2d81bfdd2bcb" FOREIGN KEY (schedule_id) REFERENCES public.mockexam_schedule_tb(id);


--
-- Name: ts_admissions FK_2d7348e347c06920372a7a82dc4; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admissions
    ADD CONSTRAINT "FK_2d7348e347c06920372a7a82dc4" FOREIGN KEY (university_id) REFERENCES public.ts_universities(id) ON DELETE CASCADE;


--
-- Name: ts_recruitment_unit_pass_fail_records FK_339a18f458cb70924633199175e; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_pass_fail_records
    ADD CONSTRAINT "FK_339a18f458cb70924633199175e" FOREIGN KEY (recruitment_unit_id) REFERENCES public.ts_recruitment_units(id) ON DELETE CASCADE;


--
-- Name: schoolrecord_attendance_detail_tb FK_369f230135dc3c60e38e2a8fce8; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_attendance_detail_tb
    ADD CONSTRAINT "FK_369f230135dc3c60e38e2a8fce8" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: ts_admissions FK_3715e5ff9c2d37277256d0fbd84; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admissions
    ADD CONSTRAINT "FK_3715e5ff9c2d37277256d0fbd84" FOREIGN KEY (category_id) REFERENCES public.ts_admission_categories(id) ON DELETE CASCADE;


--
-- Name: ts_member_recruitment_unit_combination_items FK_3a4ffe7127089f0b7e2d3b6a1fc; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_recruitment_unit_combination_items
    ADD CONSTRAINT "FK_3a4ffe7127089f0b7e2d3b6a1fc" FOREIGN KEY (combination_id) REFERENCES public.ts_member_recruitment_unit_combinations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_interests FK_3ee6439b6002c5da67a9440e047; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.member_interests
    ADD CONSTRAINT "FK_3ee6439b6002c5da67a9440e047" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: ts_recruitment_unit_minimum_grades FK_41f7d8356eab93ccbeedbfbb511; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_minimum_grades
    ADD CONSTRAINT "FK_41f7d8356eab93ccbeedbfbb511" FOREIGN KEY (recruitment_unit_id) REFERENCES public.ts_recruitment_units(id) ON DELETE CASCADE;


--
-- Name: schoolrecord_subject_sports_art_tb FK_46043135228a78978b21b5404e0; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_subject_sports_art_tb
    ADD CONSTRAINT "FK_46043135228a78978b21b5404e0" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: ts_member_regular_combination_items FK_46af081a6131b134e0932dce954; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_regular_combination_items
    ADD CONSTRAINT "FK_46af081a6131b134e0932dce954" FOREIGN KEY (regular_admission_id) REFERENCES public.ts_regular_admissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pay_order_tb FK_489a7b9d871b977e484c086fc18; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.pay_order_tb
    ADD CONSTRAINT "FK_489a7b9d871b977e484c086fc18" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: ts_recruitment_units FK_4cd812dd624ffa1368f3caae642; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_units
    ADD CONSTRAINT "FK_4cd812dd624ffa1368f3caae642" FOREIGN KEY (general_field_id) REFERENCES public.ts_general_fields(id);


--
-- Name: comment_tb FK_505e81f3fe89c36ad689546aa9c; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.comment_tb
    ADD CONSTRAINT "FK_505e81f3fe89c36ad689546aa9c" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: ts_regular_admissions FK_53b35ca57b07ee4d0d70df38928; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_regular_admissions
    ADD CONSTRAINT "FK_53b35ca57b07ee4d0d70df38928" FOREIGN KEY (university_id) REFERENCES public.ts_universities(id) ON DELETE CASCADE;


--
-- Name: mockexam_standard_score_tb FK_5912d53e61948be9803d4f79dd1; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_standard_score_tb
    ADD CONSTRAINT "FK_5912d53e61948be9803d4f79dd1" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: officer_list_tb FK_66031c9b22af5d481c5e8fe818a; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.officer_list_tb
    ADD CONSTRAINT "FK_66031c9b22af5d481c5e8fe818a" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: ts_minor_fields FK_6d00ad2e46cab3a76c3155d6213; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_minor_fields
    ADD CONSTRAINT "FK_6d00ad2e46cab3a76c3155d6213" FOREIGN KEY (mid_field_id) REFERENCES public.ts_mid_fields(id) ON DELETE CASCADE;


--
-- Name: comment_tb FK_78272ad3a402104afc39ec31ecb; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.comment_tb
    ADD CONSTRAINT "FK_78272ad3a402104afc39ec31ecb" FOREIGN KEY (post_id) REFERENCES public.post_tb(id);


--
-- Name: ts_member_regular_interests FK_7fcc417515b78d808613acf112e; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_regular_interests
    ADD CONSTRAINT "FK_7fcc417515b78d808613acf112e" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: post_tb FK_86b9b5657798e1a44fdb64f2b35; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.post_tb
    ADD CONSTRAINT "FK_86b9b5657798e1a44fdb64f2b35" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: ts_recruitment_units FK_926fd520a9e46b893471d5b4408; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_units
    ADD CONSTRAINT "FK_926fd520a9e46b893471d5b4408" FOREIGN KEY (admission_id) REFERENCES public.ts_admissions(id) ON DELETE CASCADE;


--
-- Name: ts_admission_subtype_relations FK_a1e017732e2abd5be8375a835f2; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_subtype_relations
    ADD CONSTRAINT "FK_a1e017732e2abd5be8375a835f2" FOREIGN KEY (admission_id) REFERENCES public.ts_admissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mockexam_raw_score_tb FK_a4f5012938a9c16e066a63a7f28; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_raw_score_tb
    ADD CONSTRAINT "FK_a4f5012938a9c16e066a63a7f28" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: mockexam_standard_score_tb FK_adf821c1c83313b732f09480f00; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_standard_score_tb
    ADD CONSTRAINT "FK_adf821c1c83313b732f09480f00" FOREIGN KEY (schedule_id) REFERENCES public.mockexam_schedule_tb(id);


--
-- Name: ts_recruitment_units FK_b2b2326db9d3e592119742f21c4; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_units
    ADD CONSTRAINT "FK_b2b2326db9d3e592119742f21c4" FOREIGN KEY (minor_field_id) REFERENCES public.ts_minor_fields(id);


--
-- Name: post_tb FK_c2e9e06a71d0cde473d0e1f40c3; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.post_tb
    ADD CONSTRAINT "FK_c2e9e06a71d0cde473d0e1f40c3" FOREIGN KEY (board_id) REFERENCES public.board_tb(id);


--
-- Name: schoolrecord_volunteer_tb FK_c990c29129cc97cbc5499d6f70f; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_volunteer_tb
    ADD CONSTRAINT "FK_c990c29129cc97cbc5499d6f70f" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: mockexam_marks_tb FK_cb9e42c8becf1e0aa9867f70a79; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.mockexam_marks_tb
    ADD CONSTRAINT "FK_cb9e42c8becf1e0aa9867f70a79" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: schoolrecord_subject_learning_tb FK_cf2d678390bda37fbf32e92e8cf; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.schoolrecord_subject_learning_tb
    ADD CONSTRAINT "FK_cf2d678390bda37fbf32e92e8cf" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: ts_recruitment_unit_previous_results FK_d67d911e0bdf6dee046e9e4eee7; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_previous_results
    ADD CONSTRAINT "FK_d67d911e0bdf6dee046e9e4eee7" FOREIGN KEY (recruitment_unit_id) REFERENCES public.ts_recruitment_units(id) ON DELETE CASCADE;


--
-- Name: ts_admission_subtype_relations FK_d75661e0272f23ebc44135f58d7; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_subtype_relations
    ADD CONSTRAINT "FK_d75661e0272f23ebc44135f58d7" FOREIGN KEY (subtype_id) REFERENCES public.ts_admission_subtypes(id);


--
-- Name: ts_admission_methods FK_d94f1511ec10557e47b32ff5f9b; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_admission_methods
    ADD CONSTRAINT "FK_d94f1511ec10557e47b32ff5f9b" FOREIGN KEY (admission_id) REFERENCES public.ts_admissions(id) ON DELETE CASCADE;


--
-- Name: ts_member_recruitment_unit_combinations FK_e16aec543c007873f4fe07cc1cd; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_recruitment_unit_combinations
    ADD CONSTRAINT "FK_e16aec543c007873f4fe07cc1cd" FOREIGN KEY (member_id) REFERENCES public.member_tb(id);


--
-- Name: ts_member_recruitment_unit_combination_items FK_e8365a33222d0d621787d7fae74; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_recruitment_unit_combination_items
    ADD CONSTRAINT "FK_e8365a33222d0d621787d7fae74" FOREIGN KEY (recruitment_unit_id) REFERENCES public.ts_recruitment_units(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ts_recruitment_unit_interviews FK_f2b9d5df6805e7314a736dbfce3; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_recruitment_unit_interviews
    ADD CONSTRAINT "FK_f2b9d5df6805e7314a736dbfce3" FOREIGN KEY (recruitment_unit_id) REFERENCES public.ts_recruitment_units(id) ON DELETE CASCADE;


--
-- Name: ts_mid_fields FK_f733c429a1105afb61da26d85a8; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_mid_fields
    ADD CONSTRAINT "FK_f733c429a1105afb61da26d85a8" FOREIGN KEY (major_field_id) REFERENCES public.ts_major_fields(id) ON DELETE CASCADE;


--
-- Name: ts_member_regular_combination_items FK_f808bd9731f0b3f4377fc953132; Type: FK CONSTRAINT; Schema: public; Owner: tsuser
--

ALTER TABLE ONLY public.ts_member_regular_combination_items
    ADD CONSTRAINT "FK_f808bd9731f0b3f4377fc953132" FOREIGN KEY (combination_id) REFERENCES public.ts_member_regular_combinations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict xexbOrJhtMMU8vCN4fIIilTCni175abro4bLfW93OfzXfhz1ruNfWhqlJlkKH5T

