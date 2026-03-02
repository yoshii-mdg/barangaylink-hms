


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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."audit_action_enum" AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'ARCHIVE',
    'RESTORE',
    'LOGIN',
    'LOGOUT',
    'INVITE',
    'ACTIVATE',
    'DEACTIVATE',
    'SCAN',
    'VERIFY'
);


ALTER TYPE "public"."audit_action_enum" OWNER TO "postgres";


CREATE TYPE "public"."civil_status_enum" AS ENUM (
    'Single',
    'Married',
    'Widowed',
    'Legally Separated',
    'Annulled'
);


ALTER TYPE "public"."civil_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."eid_status_enum" AS ENUM (
    'Active',
    'Expired',
    'Revoked',
    'Pending'
);


ALTER TYPE "public"."eid_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."gender_enum" AS ENUM (
    'Male',
    'Female'
);


ALTER TYPE "public"."gender_enum" OWNER TO "postgres";


CREATE TYPE "public"."household_status_enum" AS ENUM (
    'Active',
    'Inactive',
    'Archived'
);


ALTER TYPE "public"."household_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."membership_role_enum" AS ENUM (
    'Head',
    'Spouse',
    'Child',
    'Parent',
    'Sibling',
    'Relative',
    'Boarder',
    'Other'
);


ALTER TYPE "public"."membership_role_enum" OWNER TO "postgres";


CREATE TYPE "public"."resident_status_enum" AS ENUM (
    'Active',
    'Inactive',
    'Transferred',
    'Deceased'
);


ALTER TYPE "public"."resident_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_role_enum" AS ENUM (
    'superadmin',
    'staff',
    'resident'
);


ALTER TYPE "public"."user_role_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT role::TEXT FROM public.users_tbl WHERE user_id = auth.uid() LIMIT 1;
$$;


ALTER FUNCTION "public"."current_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."expire_overdue_eids"() RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  UPDATE public.eids_tbl
  SET status = 'Expired', updated_at = now()
  WHERE status = 'Active'
    AND expiry_date < CURRENT_DATE;
$$;


ALTER FUNCTION "public"."expire_overdue_eids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_eid_no"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  year_str TEXT;
  seq_no   INT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1
    INTO seq_no
    FROM public.eid_tbl
    WHERE eid_no LIKE 'EID-' || year_str || '-%';
  NEW.eid_no := 'EID-' || year_str || '-' || LPAD(seq_no::TEXT, 5, '0');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_eid_no"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_household_no"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  year_str TEXT;
  seq_no   INT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1
    INTO seq_no
    FROM public.households_tbl
    WHERE household_no LIKE 'HH-' || year_str || '-%';
  NEW.household_no := 'HH-' || year_str || '-' || LPAD(seq_no::TEXT, 4, '0');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_household_no"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_incident_no"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  year_part text;
  seq_no    int;
BEGIN
  IF NEW.incident_no IS NULL THEN
    year_part := to_char(now(), 'YYYY');
    SELECT COALESCE(MAX(
      CAST(SPLIT_PART(incident_no, '-', 3) AS int)
    ), 0) + 1
    INTO seq_no
    FROM public.incidents_tbl
    WHERE incident_no LIKE 'INC-' || year_part || '-%';

    NEW.incident_no := 'INC-' || year_part || '-' || LPAD(seq_no::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_incident_no"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_request_no"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  year_part text;
  seq_no    int;
BEGIN
  IF NEW.request_no IS NULL THEN
    year_part := to_char(now(), 'YYYY');
    SELECT COALESCE(MAX(
      CAST(SPLIT_PART(request_no, '-', 3) AS int)
    ), 0) + 1
    INTO seq_no
    FROM public.document_requests_tbl
    WHERE request_no LIKE 'REQ-' || year_part || '-%';

    NEW.request_no := 'REQ-' || year_part || '-' || LPAD(seq_no::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_request_no"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_resident_no"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  year_str TEXT;
  seq_no   INT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1
    INTO seq_no
    FROM public.residents_tbl
    WHERE resident_no LIKE 'RES-' || year_str || '-%';
  NEW.resident_no := 'RES-' || year_str || '-' || LPAD(seq_no::TEXT, 4, '0');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_resident_no"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_resident_qr_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.qr_code IS NULL OR NEW.qr_code = '' THEN
    NEW.qr_code := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_resident_qr_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT role FROM public.users_tbl WHERE user_id = auth.uid() LIMIT 1;
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_first_name  TEXT;
  v_middle_name TEXT;
  v_last_name   TEXT;
  v_role        user_role_enum;
  v_is_active   BOOLEAN;
BEGIN
  -- Extract names from user_metadata (set during signUp or invite)
  v_first_name  := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'),  ''), '');
  v_middle_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'middle_name'), '');
  v_last_name   := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'),   ''), '');

  -- Determine role and active status:
  --   • Invited staff  → role='staff',    is_active=false  (must accept invitation first)
  --   • Normal signup  → role='resident', is_active=false  (must confirm email first)
  --   • Superadmin     → role='superadmin', is_active=true (immediately active)
  IF NEW.raw_user_meta_data->>'role' = 'staff' THEN
    v_role      := 'staff';
    v_is_active := FALSE;
  ELSIF NEW.raw_user_meta_data->>'role' = 'superadmin' THEN
    v_role      := 'superadmin';
    v_is_active := TRUE;
  ELSE
    v_role      := 'resident';
    v_is_active := FALSE;
  END IF;

  -- Insert placeholder row (ignore if somehow already exists)
  INSERT INTO public.users_tbl (
    user_id,
    first_name,
    middle_name,
    last_name,
    email,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    v_first_name,
    v_middle_name,
    v_last_name,
    COALESCE(NEW.email, ''),
    v_role,
    v_is_active
  )
  ON CONFLICT (user_id) DO NOTHING;  -- safe to re-run

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_deleted"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_uid UUID;
BEGIN
  SELECT id INTO v_uid
  FROM public.users_tbl
  WHERE user_id = OLD.id;

  IF v_uid IS NOT NULL THEN
    UPDATE public.households_tbl        SET archived_by = NULL WHERE archived_by = v_uid;
    UPDATE public.households_tbl        SET created_by  = NULL WHERE created_by  = v_uid;
    UPDATE public.households_tbl        SET updated_by  = NULL WHERE updated_by  = v_uid;
    UPDATE public.residents_tbl         SET archived_by = NULL WHERE archived_by = v_uid;
    UPDATE public.residents_tbl         SET created_by  = NULL WHERE created_by  = v_uid;
    UPDATE public.residents_tbl         SET updated_by  = NULL WHERE updated_by  = v_uid;
    UPDATE public.residents_tbl         SET user_id     = NULL WHERE user_id     = v_uid;
    UPDATE public.eid_tbl               SET issued_by   = NULL WHERE issued_by   = v_uid;
    UPDATE public.eid_tbl               SET revoked_by  = NULL WHERE revoked_by  = v_uid;
    UPDATE public.verification_logs_tbl SET verified_by = NULL WHERE verified_by = v_uid;
    UPDATE public.audit_logs_tbl        SET actor_id    = NULL WHERE actor_id    = v_uid;
    DELETE FROM public.user_profiles_tbl WHERE user_id = v_uid;
    DELETE FROM public.users_tbl         WHERE id      = v_uid;
  END IF;

  -- Clear direct auth.users FK references
  UPDATE public.activity_logs_tbl     SET actor_id    = NULL WHERE actor_id    = OLD.id;
  UPDATE public.incidents_tbl         SET reported_by = NULL WHERE reported_by = OLD.id;
  UPDATE public.incidents_tbl         SET resolved_by = NULL WHERE resolved_by = OLD.id;
  UPDATE public.document_requests_tbl SET released_by = NULL WHERE released_by = OLD.id;
  UPDATE public.eids_tbl              SET issued_by   = NULL WHERE issued_by   = OLD.id;
  UPDATE public.eids_tbl              SET revoked_by  = NULL WHERE revoked_by  = OLD.id;

  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."handle_user_deleted"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT current_user_role() = 'superadmin';
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_staff_or_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT current_user_role() IN ('staff', 'superadmin');
$$;


ALTER FUNCTION "public"."is_staff_or_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."link_resident_to_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.residents_tbl
    SET user_id = (
      SELECT id FROM public.users_tbl WHERE user_id = NEW.id
    )
    WHERE id = (
      SELECT id FROM public.residents_tbl
      WHERE email = NEW.email
        AND user_id IS NULL
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."link_resident_to_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_logs_tbl" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "target_table" "text",
    "target_id" "uuid",
    "old_data" "jsonb",
    "new_data" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."activity_logs_tbl" OWNER TO "postgres";


COMMENT ON TABLE "public"."activity_logs_tbl" IS 'Immutable audit trail. Never update or delete rows here.';



CREATE TABLE IF NOT EXISTS "public"."audit_logs_tbl" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "actor_id" "uuid",
    "action" "public"."audit_action_enum" NOT NULL,
    "target_table" character varying(100),
    "target_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "description" "text",
    "ip_address" "inet",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."audit_logs_tbl" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_requests_tbl" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_no" "text" NOT NULL,
    "resident_id" "uuid" NOT NULL,
    "document_type" "text" NOT NULL,
    "purpose" "text",
    "status" "text" DEFAULT 'Pending'::"text" NOT NULL,
    "requested_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "released_at" timestamp with time zone,
    "released_by" "uuid",
    "rejection_notes" "text",
    "document_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "document_requests_tbl_document_type_check" CHECK (("document_type" = ANY (ARRAY['Barangay Clearance'::"text", 'Certificate of Residency'::"text", 'Certificate of Indigency'::"text", 'Business Clearance'::"text", 'Certificate of Good Moral Character'::"text", 'Others'::"text"]))),
    CONSTRAINT "document_requests_tbl_status_check" CHECK (("status" = ANY (ARRAY['Pending'::"text", 'Processing'::"text", 'Ready'::"text", 'Released'::"text", 'Rejected'::"text"])))
);


ALTER TABLE "public"."document_requests_tbl" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_requests_tbl" IS 'Resident requests for barangay certificates and clearances.';



CREATE TABLE IF NOT EXISTS "public"."eid_tbl" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "resident_id" "uuid" NOT NULL,
    "eid_no" character varying(100) NOT NULL,
    "qr_code_data" "text" NOT NULL,
    "qr_code_url" "text",
    "eid_image_url" "text",
    "status" "public"."eid_status_enum" DEFAULT 'Pending'::"public"."eid_status_enum" NOT NULL,
    "issued_date" "date",
    "expiry_date" "date",
    "renewed_date" "date",
    "renewal_count" integer DEFAULT 0 NOT NULL,
    "issued_by" "uuid",
    "revoked_by" "uuid",
    "revoked_at" timestamp with time zone,
    "revoke_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eid_tbl" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eids_tbl" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eid_no" "text" NOT NULL,
    "resident_id" "uuid" NOT NULL,
    "qr_code_data" "text",
    "qr_code_url" "text",
    "issued_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "expiry_date" "date" NOT NULL,
    "status" "text" DEFAULT 'Active'::"text" NOT NULL,
    "issued_by" "uuid",
    "revoked_by" "uuid",
    "revoked_at" timestamp with time zone,
    "revoke_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "eids_tbl_status_check" CHECK (("status" = ANY (ARRAY['Active'::"text", 'Expired'::"text", 'Revoked'::"text", 'Lost'::"text"])))
);


ALTER TABLE "public"."eids_tbl" OWNER TO "postgres";


COMMENT ON TABLE "public"."eids_tbl" IS 'Digital Barangay ID with QR Code per resident.';



CREATE TABLE IF NOT EXISTS "public"."household_members_tbl" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "household_id" "uuid" NOT NULL,
    "resident_id" "uuid" NOT NULL,
    "role" "public"."membership_role_enum" DEFAULT 'Other'::"public"."membership_role_enum" NOT NULL,
    "is_head" boolean DEFAULT false NOT NULL,
    "joined_at" "date",
    "left_at" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."household_members_tbl" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."households_tbl" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "household_no" character varying(50) NOT NULL,
    "purok_id" "uuid",
    "house_no" character varying(50),
    "street" character varying(150),
    "barangay" character varying(150) DEFAULT 'San Bartolome'::character varying NOT NULL,
    "city" character varying(150) DEFAULT 'Quezon City'::character varying NOT NULL,
    "province" character varying(150) DEFAULT 'Metro Manila'::character varying NOT NULL,
    "zip_code" character varying(10),
    "ownership_type" character varying(50),
    "structure_type" character varying(50),
    "remarks" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "is_archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone,
    "archived_by" "uuid",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."households_tbl" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."incidents_tbl" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "incident_no" "text" NOT NULL,
    "incident_type" "text" NOT NULL,
    "description" "text" NOT NULL,
    "location" "text",
    "incident_date" "date" NOT NULL,
    "incident_time" time without time zone,
    "complainant_name" "text",
    "complainant_id" "uuid",
    "respondent_name" "text",
    "respondent_id" "uuid",
    "status" "text" DEFAULT 'Open'::"text" NOT NULL,
    "resolution_notes" "text",
    "resolved_at" timestamp with time zone,
    "resolved_by" "uuid",
    "reported_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "incidents_tbl_status_check" CHECK (("status" = ANY (ARRAY['Open'::"text", 'Under Investigation'::"text", 'Resolved'::"text", 'Escalated'::"text", 'Closed'::"text"])))
);


ALTER TABLE "public"."incidents_tbl" OWNER TO "postgres";


COMMENT ON TABLE "public"."incidents_tbl" IS 'Barangay incident and complaint reports.';



CREATE TABLE IF NOT EXISTS "public"."puroks_tbl" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."puroks_tbl" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."residents_tbl" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "resident_no" character varying(50) NOT NULL,
    "first_name" character varying(100) NOT NULL,
    "middle_name" character varying(100),
    "last_name" character varying(100) NOT NULL,
    "suffix" character varying(20),
    "gender" "public"."gender_enum" NOT NULL,
    "birthdate" "date" NOT NULL,
    "birthplace" character varying(200),
    "civil_status" "public"."civil_status_enum" DEFAULT 'Single'::"public"."civil_status_enum" NOT NULL,
    "nationality" character varying(100) DEFAULT 'Filipino'::character varying NOT NULL,
    "religion" character varying(100),
    "occupation" character varying(150),
    "monthly_income" numeric(12,2),
    "is_voter" boolean DEFAULT false NOT NULL,
    "voter_id_no" character varying(100),
    "is_pwd" boolean DEFAULT false NOT NULL,
    "pwd_id_no" character varying(100),
    "is_solo_parent" boolean DEFAULT false NOT NULL,
    "is_4ps_beneficiary" boolean DEFAULT false NOT NULL,
    "is_senior_citizen" boolean DEFAULT false NOT NULL,
    "educational_attainment" character varying(100),
    "blood_type" character varying(5),
    "photo_url" "text",
    "contact_number" character varying(20),
    "email" character varying(255),
    "household_id" "uuid",
    "purok_id" "uuid",
    "house_no" character varying(50),
    "street" character varying(150),
    "barangay" character varying(150) DEFAULT 'San Bartolome'::character varying NOT NULL,
    "city" character varying(150) DEFAULT 'Quezon City'::character varying NOT NULL,
    "province" character varying(150) DEFAULT 'Metro Manila'::character varying NOT NULL,
    "zip_code" character varying(10),
    "years_of_residency" integer,
    "is_renter" boolean DEFAULT false NOT NULL,
    "philsys_id_no" character varying(100),
    "sss_no" character varying(50),
    "tin_no" character varying(50),
    "philhealth_no" character varying(50),
    "pagibig_no" character varying(50),
    "passport_no" character varying(50),
    "drivers_license_no" character varying(50),
    "postal_id_no" character varying(50),
    "emergency_contact_name" character varying(200),
    "emergency_contact_relationship" character varying(100),
    "emergency_contact_number" character varying(20),
    "qr_code" "text",
    "status" "public"."resident_status_enum" DEFAULT 'Active'::"public"."resident_status_enum" NOT NULL,
    "is_archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone,
    "archived_by" "uuid",
    "transfer_date" "date",
    "transfer_destination" character varying(200),
    "remarks" "text",
    "user_id" "uuid",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."residents_tbl" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles_tbl" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "phone_number" character varying(20),
    "address" "text",
    "bio" "text",
    "date_of_birth" "date",
    "gender" "public"."gender_enum",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_profiles_tbl" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users_tbl" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "first_name" character varying(100) NOT NULL,
    "middle_name" character varying(100),
    "last_name" character varying(100) NOT NULL,
    "email" character varying(255) NOT NULL,
    "role" "public"."user_role_enum" DEFAULT 'resident'::"public"."user_role_enum" NOT NULL,
    "is_active" boolean DEFAULT false NOT NULL,
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users_tbl" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_active_vs_inactive" AS
 SELECT "status",
    "count"(*) AS "count"
   FROM "public"."residents_tbl"
  WHERE ("is_archived" = false)
  GROUP BY "status";


ALTER VIEW "public"."v_active_vs_inactive" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_analytics_summary" AS
 SELECT ( SELECT "count"(*) AS "count"
           FROM "public"."residents_tbl"
          WHERE (("residents_tbl"."is_archived" = false) AND ("residents_tbl"."status" = 'Active'::"public"."resident_status_enum"))) AS "active_residents",
    ( SELECT "count"(*) AS "count"
           FROM "public"."residents_tbl"
          WHERE ("residents_tbl"."is_archived" = false)) AS "total_residents",
    ( SELECT "count"(*) AS "count"
           FROM "public"."households_tbl"
          WHERE (("households_tbl"."is_archived" = false) AND ("households_tbl"."is_active" = true))) AS "active_households",
    ( SELECT "count"(*) AS "count"
           FROM "public"."eid_tbl"
          WHERE ("eid_tbl"."status" = 'Active'::"public"."eid_status_enum")) AS "active_eid",
    ( SELECT "count"(*) AS "count"
           FROM "public"."eid_tbl"
          WHERE ("eid_tbl"."status" = 'Expired'::"public"."eid_status_enum")) AS "expired_eid",
    ( SELECT "count"(*) AS "count"
           FROM "public"."residents_tbl"
          WHERE (("residents_tbl"."is_voter" = true) AND ("residents_tbl"."is_archived" = false))) AS "registered_voters",
    ( SELECT "count"(*) AS "count"
           FROM "public"."residents_tbl"
          WHERE (("residents_tbl"."is_pwd" = true) AND ("residents_tbl"."is_archived" = false))) AS "pwd_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."residents_tbl"
          WHERE (("residents_tbl"."is_senior_citizen" = true) AND ("residents_tbl"."is_archived" = false))) AS "senior_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."residents_tbl"
          WHERE (("residents_tbl"."status" = 'Transferred'::"public"."resident_status_enum") AND ("residents_tbl"."is_archived" = false))) AS "transferred_count";


ALTER VIEW "public"."v_analytics_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_eid_renewal_stats" AS
 SELECT ("date_trunc"('month'::"text", ("renewed_date")::timestamp with time zone))::"date" AS "month",
    "count"(*) AS "renewals"
   FROM "public"."eid_tbl"
  WHERE ("renewed_date" IS NOT NULL)
  GROUP BY (("date_trunc"('month'::"text", ("renewed_date")::timestamp with time zone))::"date")
  ORDER BY (("date_trunc"('month'::"text", ("renewed_date")::timestamp with time zone))::"date");


ALTER VIEW "public"."v_eid_renewal_stats" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_gender_distribution" AS
 SELECT "gender",
    "count"(*) AS "count",
    "round"(((("count"(*))::numeric * 100.0) / NULLIF("sum"("count"(*)) OVER (), (0)::numeric)), 2) AS "percentage"
   FROM "public"."residents_tbl"
  WHERE (("is_archived" = false) AND ("status" <> 'Deceased'::"public"."resident_status_enum"))
  GROUP BY "gender";


ALTER VIEW "public"."v_gender_distribution" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_households_per_purok" AS
 SELECT "p"."name" AS "purok_name",
    "count"("h"."id") AS "household_count",
    "count"("r"."id") AS "resident_count"
   FROM (("public"."puroks_tbl" "p"
     LEFT JOIN "public"."households_tbl" "h" ON ((("h"."purok_id" = "p"."id") AND ("h"."is_archived" = false) AND ("h"."is_active" = true))))
     LEFT JOIN "public"."residents_tbl" "r" ON ((("r"."purok_id" = "p"."id") AND ("r"."is_archived" = false) AND ("r"."status" = 'Active'::"public"."resident_status_enum"))))
  GROUP BY "p"."name"
  ORDER BY "p"."name";


ALTER VIEW "public"."v_households_per_purok" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_new_residents_per_year" AS
 SELECT (EXTRACT(year FROM "created_at"))::integer AS "year",
    "count"(*) AS "count"
   FROM "public"."residents_tbl"
  WHERE ("is_archived" = false)
  GROUP BY ((EXTRACT(year FROM "created_at"))::integer)
  ORDER BY ((EXTRACT(year FROM "created_at"))::integer);


ALTER VIEW "public"."v_new_residents_per_year" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_population_by_age_group" AS
 SELECT
        CASE
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) < (1)::numeric) THEN 'Infant (< 1)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (4)::numeric) THEN 'Toddler (1–4)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (12)::numeric) THEN 'Child (5–12)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (17)::numeric) THEN 'Teen (13–17)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (29)::numeric) THEN 'Young Adult (18–29)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (59)::numeric) THEN 'Adult (30–59)'::"text"
            ELSE 'Senior (60+)'::"text"
        END AS "age_group",
    "count"(*) AS "count"
   FROM "public"."residents_tbl"
  WHERE (("is_archived" = false) AND ("status" <> 'Deceased'::"public"."resident_status_enum"))
  GROUP BY
        CASE
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) < (1)::numeric) THEN 'Infant (< 1)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (4)::numeric) THEN 'Toddler (1–4)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (12)::numeric) THEN 'Child (5–12)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (17)::numeric) THEN 'Teen (13–17)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (29)::numeric) THEN 'Young Adult (18–29)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (59)::numeric) THEN 'Adult (30–59)'::"text"
            ELSE 'Senior (60+)'::"text"
        END
  ORDER BY
        CASE
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) < (1)::numeric) THEN 'Infant (< 1)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (4)::numeric) THEN 'Toddler (1–4)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (12)::numeric) THEN 'Child (5–12)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (17)::numeric) THEN 'Teen (13–17)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (29)::numeric) THEN 'Young Adult (18–29)'::"text"
            WHEN (EXTRACT(year FROM "age"(("birthdate")::timestamp with time zone)) <= (59)::numeric) THEN 'Adult (30–59)'::"text"
            ELSE 'Senior (60+)'::"text"
        END;


ALTER VIEW "public"."v_population_by_age_group" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_population_growth" AS
 SELECT (EXTRACT(year FROM "created_at"))::integer AS "year",
    "count"(*) AS "new_residents",
    "sum"("count"(*)) OVER (ORDER BY ((EXTRACT(year FROM "created_at"))::integer)) AS "cumulative_total"
   FROM "public"."residents_tbl"
  WHERE ("is_archived" = false)
  GROUP BY ((EXTRACT(year FROM "created_at"))::integer)
  ORDER BY ((EXTRACT(year FROM "created_at"))::integer);


ALTER VIEW "public"."v_population_growth" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_residents_transferred_out" AS
 SELECT (EXTRACT(year FROM "transfer_date"))::integer AS "year",
    "count"(*) AS "count"
   FROM "public"."residents_tbl"
  WHERE (("status" = 'Transferred'::"public"."resident_status_enum") AND ("transfer_date" IS NOT NULL))
  GROUP BY ((EXTRACT(year FROM "transfer_date"))::integer)
  ORDER BY ((EXTRACT(year FROM "transfer_date"))::integer);


ALTER VIEW "public"."v_residents_transferred_out" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verification_logs_tbl" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "resident_id" "uuid",
    "eid_id" "uuid",
    "scanned_code" "text" NOT NULL,
    "scan_method" character varying(20) DEFAULT 'camera'::character varying NOT NULL,
    "verified_by" "uuid",
    "is_valid" boolean DEFAULT false NOT NULL,
    "failure_reason" "text",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."verification_logs_tbl" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activity_logs_tbl"
    ADD CONSTRAINT "activity_logs_tbl_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs_tbl"
    ADD CONSTRAINT "audit_logs_tbl_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_requests_tbl"
    ADD CONSTRAINT "document_requests_tbl_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_requests_tbl"
    ADD CONSTRAINT "document_requests_tbl_request_no_key" UNIQUE ("request_no");



ALTER TABLE ONLY "public"."eid_tbl"
    ADD CONSTRAINT "eid_tbl_eid_no_key" UNIQUE ("eid_no");



ALTER TABLE ONLY "public"."eid_tbl"
    ADD CONSTRAINT "eid_tbl_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."eid_tbl"
    ADD CONSTRAINT "eid_tbl_qr_code_data_key" UNIQUE ("qr_code_data");



ALTER TABLE ONLY "public"."eids_tbl"
    ADD CONSTRAINT "eids_tbl_eid_no_key" UNIQUE ("eid_no");



ALTER TABLE ONLY "public"."eids_tbl"
    ADD CONSTRAINT "eids_tbl_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."household_members_tbl"
    ADD CONSTRAINT "household_members_tbl_household_id_resident_id_key" UNIQUE ("household_id", "resident_id");



ALTER TABLE ONLY "public"."household_members_tbl"
    ADD CONSTRAINT "household_members_tbl_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."households_tbl"
    ADD CONSTRAINT "households_tbl_household_no_key" UNIQUE ("household_no");



ALTER TABLE ONLY "public"."households_tbl"
    ADD CONSTRAINT "households_tbl_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."incidents_tbl"
    ADD CONSTRAINT "incidents_tbl_incident_no_key" UNIQUE ("incident_no");



ALTER TABLE ONLY "public"."incidents_tbl"
    ADD CONSTRAINT "incidents_tbl_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."puroks_tbl"
    ADD CONSTRAINT "puroks_tbl_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."puroks_tbl"
    ADD CONSTRAINT "puroks_tbl_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."residents_tbl"
    ADD CONSTRAINT "residents_tbl_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."residents_tbl"
    ADD CONSTRAINT "residents_tbl_qr_code_key" UNIQUE ("qr_code");



ALTER TABLE ONLY "public"."residents_tbl"
    ADD CONSTRAINT "residents_tbl_resident_no_key" UNIQUE ("resident_no");



ALTER TABLE ONLY "public"."user_profiles_tbl"
    ADD CONSTRAINT "user_profiles_tbl_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles_tbl"
    ADD CONSTRAINT "user_profiles_tbl_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."users_tbl"
    ADD CONSTRAINT "users_tbl_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users_tbl"
    ADD CONSTRAINT "users_tbl_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users_tbl"
    ADD CONSTRAINT "users_tbl_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."verification_logs_tbl"
    ADD CONSTRAINT "verification_logs_tbl_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_al_action" ON "public"."audit_logs_tbl" USING "btree" ("action");



CREATE INDEX "idx_al_actor_id" ON "public"."audit_logs_tbl" USING "btree" ("actor_id");



CREATE INDEX "idx_al_created_at" ON "public"."audit_logs_tbl" USING "btree" ("created_at");



CREATE INDEX "idx_al_target_table" ON "public"."audit_logs_tbl" USING "btree" ("target_table");



CREATE INDEX "idx_docrequests_resident" ON "public"."document_requests_tbl" USING "btree" ("resident_id");



CREATE INDEX "idx_docrequests_status" ON "public"."document_requests_tbl" USING "btree" ("status");



CREATE INDEX "idx_eid_expiry_date" ON "public"."eid_tbl" USING "btree" ("expiry_date");



CREATE INDEX "idx_eid_qr_code_data" ON "public"."eid_tbl" USING "btree" ("qr_code_data");



CREATE INDEX "idx_eid_resident_id" ON "public"."eid_tbl" USING "btree" ("resident_id");



CREATE INDEX "idx_eid_status" ON "public"."eid_tbl" USING "btree" ("status");



CREATE INDEX "idx_eids_resident" ON "public"."eids_tbl" USING "btree" ("resident_id");



CREATE INDEX "idx_eids_status" ON "public"."eids_tbl" USING "btree" ("status");



CREATE INDEX "idx_hm_household_id" ON "public"."household_members_tbl" USING "btree" ("household_id");



CREATE INDEX "idx_hm_is_head" ON "public"."household_members_tbl" USING "btree" ("is_head");



CREATE INDEX "idx_hm_resident_id" ON "public"."household_members_tbl" USING "btree" ("resident_id");



CREATE INDEX "idx_households_household_no" ON "public"."households_tbl" USING "btree" ("household_no");



CREATE INDEX "idx_households_is_active" ON "public"."households_tbl" USING "btree" ("is_active");



CREATE INDEX "idx_households_is_archived" ON "public"."households_tbl" USING "btree" ("is_archived");



CREATE INDEX "idx_households_purok_id" ON "public"."households_tbl" USING "btree" ("purok_id");



CREATE INDEX "idx_incidents_complainant" ON "public"."incidents_tbl" USING "btree" ("complainant_id");



CREATE INDEX "idx_incidents_date" ON "public"."incidents_tbl" USING "btree" ("incident_date");



CREATE INDEX "idx_incidents_status" ON "public"."incidents_tbl" USING "btree" ("status");



CREATE INDEX "idx_logs_action" ON "public"."activity_logs_tbl" USING "btree" ("action");



CREATE INDEX "idx_logs_actor" ON "public"."activity_logs_tbl" USING "btree" ("actor_id");



CREATE INDEX "idx_logs_created_at" ON "public"."activity_logs_tbl" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_logs_target" ON "public"."activity_logs_tbl" USING "btree" ("target_table", "target_id");



CREATE INDEX "idx_residents_birthdate" ON "public"."residents_tbl" USING "btree" ("birthdate");



CREATE INDEX "idx_residents_created_at" ON "public"."residents_tbl" USING "btree" ("created_at");



CREATE INDEX "idx_residents_gender" ON "public"."residents_tbl" USING "btree" ("gender");



CREATE INDEX "idx_residents_household_id" ON "public"."residents_tbl" USING "btree" ("household_id");



CREATE INDEX "idx_residents_is_archived" ON "public"."residents_tbl" USING "btree" ("is_archived");



CREATE INDEX "idx_residents_last_name" ON "public"."residents_tbl" USING "btree" ("last_name");



CREATE INDEX "idx_residents_purok_id" ON "public"."residents_tbl" USING "btree" ("purok_id");



CREATE INDEX "idx_residents_qr_code" ON "public"."residents_tbl" USING "btree" ("qr_code");



CREATE INDEX "idx_residents_resident_no" ON "public"."residents_tbl" USING "btree" ("resident_no");



CREATE INDEX "idx_residents_status" ON "public"."residents_tbl" USING "btree" ("status");



CREATE INDEX "idx_residents_user_id" ON "public"."residents_tbl" USING "btree" ("user_id");



CREATE INDEX "idx_up_user_id" ON "public"."user_profiles_tbl" USING "btree" ("user_id");



CREATE INDEX "idx_users_is_active" ON "public"."users_tbl" USING "btree" ("is_active");



CREATE INDEX "idx_users_role" ON "public"."users_tbl" USING "btree" ("role");



CREATE INDEX "idx_users_user_id" ON "public"."users_tbl" USING "btree" ("user_id");



CREATE INDEX "idx_vl_created_at" ON "public"."verification_logs_tbl" USING "btree" ("created_at");



CREATE INDEX "idx_vl_is_valid" ON "public"."verification_logs_tbl" USING "btree" ("is_valid");



CREATE INDEX "idx_vl_resident_id" ON "public"."verification_logs_tbl" USING "btree" ("resident_id");



CREATE INDEX "idx_vl_verified_by" ON "public"."verification_logs_tbl" USING "btree" ("verified_by");



CREATE OR REPLACE TRIGGER "trg_docrequests_updated_at" BEFORE UPDATE ON "public"."document_requests_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_eid_no" BEFORE INSERT ON "public"."eids_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."generate_eid_no"();



CREATE OR REPLACE TRIGGER "trg_eids_updated_at" BEFORE UPDATE ON "public"."eids_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_generate_eid_no" BEFORE INSERT ON "public"."eid_tbl" FOR EACH ROW WHEN ((("new"."eid_no" IS NULL) OR (("new"."eid_no")::"text" = ''::"text"))) EXECUTE FUNCTION "public"."generate_eid_no"();



CREATE OR REPLACE TRIGGER "trg_generate_household_no" BEFORE INSERT ON "public"."households_tbl" FOR EACH ROW WHEN ((("new"."household_no" IS NULL) OR (("new"."household_no")::"text" = ''::"text"))) EXECUTE FUNCTION "public"."generate_household_no"();



CREATE OR REPLACE TRIGGER "trg_generate_resident_no" BEFORE INSERT ON "public"."residents_tbl" FOR EACH ROW WHEN ((("new"."resident_no" IS NULL) OR (("new"."resident_no")::"text" = ''::"text"))) EXECUTE FUNCTION "public"."generate_resident_no"();



CREATE OR REPLACE TRIGGER "trg_generate_resident_qr_code" BEFORE INSERT ON "public"."residents_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."generate_resident_qr_code"();



CREATE OR REPLACE TRIGGER "trg_incident_no" BEFORE INSERT ON "public"."incidents_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."generate_incident_no"();



CREATE OR REPLACE TRIGGER "trg_incidents_updated_at" BEFORE UPDATE ON "public"."incidents_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_request_no" BEFORE INSERT ON "public"."document_requests_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."generate_request_no"();



CREATE OR REPLACE TRIGGER "trg_set_updated_at" BEFORE UPDATE ON "public"."eid_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_set_updated_at" BEFORE UPDATE ON "public"."household_members_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_set_updated_at" BEFORE UPDATE ON "public"."households_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_set_updated_at" BEFORE UPDATE ON "public"."puroks_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_set_updated_at" BEFORE UPDATE ON "public"."residents_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_set_updated_at" BEFORE UPDATE ON "public"."user_profiles_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_set_updated_at" BEFORE UPDATE ON "public"."users_tbl" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."activity_logs_tbl"
    ADD CONSTRAINT "activity_logs_tbl_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."audit_logs_tbl"
    ADD CONSTRAINT "audit_logs_tbl_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_requests_tbl"
    ADD CONSTRAINT "document_requests_tbl_released_by_fkey" FOREIGN KEY ("released_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."eid_tbl"
    ADD CONSTRAINT "eid_tbl_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "public"."users_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."eid_tbl"
    ADD CONSTRAINT "eid_tbl_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "public"."residents_tbl"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."eid_tbl"
    ADD CONSTRAINT "eid_tbl_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "public"."users_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."eids_tbl"
    ADD CONSTRAINT "eids_tbl_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."eids_tbl"
    ADD CONSTRAINT "eids_tbl_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."household_members_tbl"
    ADD CONSTRAINT "household_members_tbl_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households_tbl"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."household_members_tbl"
    ADD CONSTRAINT "household_members_tbl_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "public"."residents_tbl"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."households_tbl"
    ADD CONSTRAINT "households_tbl_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "public"."users_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."households_tbl"
    ADD CONSTRAINT "households_tbl_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."households_tbl"
    ADD CONSTRAINT "households_tbl_purok_id_fkey" FOREIGN KEY ("purok_id") REFERENCES "public"."puroks_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."households_tbl"
    ADD CONSTRAINT "households_tbl_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."incidents_tbl"
    ADD CONSTRAINT "incidents_tbl_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."incidents_tbl"
    ADD CONSTRAINT "incidents_tbl_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."residents_tbl"
    ADD CONSTRAINT "residents_tbl_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "public"."users_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."residents_tbl"
    ADD CONSTRAINT "residents_tbl_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."residents_tbl"
    ADD CONSTRAINT "residents_tbl_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."residents_tbl"
    ADD CONSTRAINT "residents_tbl_purok_id_fkey" FOREIGN KEY ("purok_id") REFERENCES "public"."puroks_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."residents_tbl"
    ADD CONSTRAINT "residents_tbl_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."residents_tbl"
    ADD CONSTRAINT "residents_tbl_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_profiles_tbl"
    ADD CONSTRAINT "user_profiles_tbl_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users_tbl"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users_tbl"
    ADD CONSTRAINT "users_tbl_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."verification_logs_tbl"
    ADD CONSTRAINT "verification_logs_tbl_eid_id_fkey" FOREIGN KEY ("eid_id") REFERENCES "public"."eid_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."verification_logs_tbl"
    ADD CONSTRAINT "verification_logs_tbl_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "public"."residents_tbl"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."verification_logs_tbl"
    ADD CONSTRAINT "verification_logs_tbl_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users_tbl"("id") ON DELETE SET NULL;



ALTER TABLE "public"."activity_logs_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "al_insert_authenticated" ON "public"."audit_logs_tbl" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "al_select_admin_only" ON "public"."audit_logs_tbl" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



ALTER TABLE "public"."audit_logs_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "docrequests: staff read all" ON "public"."document_requests_tbl" FOR SELECT USING (("public"."get_my_role"() = ANY (ARRAY['staff'::"text", 'superadmin'::"text"])));



CREATE POLICY "docrequests: staff update" ON "public"."document_requests_tbl" FOR UPDATE USING (("public"."get_my_role"() = ANY (ARRAY['staff'::"text", 'superadmin'::"text"])));



CREATE POLICY "docrequests: superadmin delete" ON "public"."document_requests_tbl" FOR DELETE USING (("public"."get_my_role"() = 'superadmin'::"text"));



ALTER TABLE "public"."document_requests_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "eid_delete_admin_only" ON "public"."eid_tbl" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "eid_insert_staff_admin" ON "public"."eid_tbl" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_staff_or_admin"());



CREATE POLICY "eid_select_own_resident" ON "public"."eid_tbl" FOR SELECT TO "authenticated" USING (("resident_id" IN ( SELECT "residents_tbl"."id"
   FROM "public"."residents_tbl"
  WHERE ("residents_tbl"."user_id" = ( SELECT "users_tbl"."id"
           FROM "public"."users_tbl"
          WHERE ("users_tbl"."user_id" = "auth"."uid"()))))));



CREATE POLICY "eid_select_staff_admin" ON "public"."eid_tbl" FOR SELECT TO "authenticated" USING ("public"."is_staff_or_admin"());



ALTER TABLE "public"."eid_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "eid_update_staff_admin" ON "public"."eid_tbl" FOR UPDATE TO "authenticated" USING ("public"."is_staff_or_admin"()) WITH CHECK ("public"."is_staff_or_admin"());



CREATE POLICY "eids: staff insert" ON "public"."eids_tbl" FOR INSERT WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['staff'::"text", 'superadmin'::"text"])));



CREATE POLICY "eids: staff read all" ON "public"."eids_tbl" FOR SELECT USING (("public"."get_my_role"() = ANY (ARRAY['staff'::"text", 'superadmin'::"text"])));



CREATE POLICY "eids: staff update" ON "public"."eids_tbl" FOR UPDATE USING (("public"."get_my_role"() = ANY (ARRAY['staff'::"text", 'superadmin'::"text"])));



CREATE POLICY "eids: superadmin delete" ON "public"."eids_tbl" FOR DELETE USING (("public"."get_my_role"() = 'superadmin'::"text"));



ALTER TABLE "public"."eids_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "hm_delete_admin_only" ON "public"."household_members_tbl" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "hm_insert_staff_admin" ON "public"."household_members_tbl" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_staff_or_admin"());



CREATE POLICY "hm_select_own_resident" ON "public"."household_members_tbl" FOR SELECT TO "authenticated" USING (("resident_id" IN ( SELECT "residents_tbl"."id"
   FROM "public"."residents_tbl"
  WHERE ("residents_tbl"."user_id" = ( SELECT "users_tbl"."id"
           FROM "public"."users_tbl"
          WHERE ("users_tbl"."user_id" = "auth"."uid"()))))));



CREATE POLICY "hm_select_staff_admin" ON "public"."household_members_tbl" FOR SELECT TO "authenticated" USING ("public"."is_staff_or_admin"());



CREATE POLICY "hm_update_staff_admin" ON "public"."household_members_tbl" FOR UPDATE TO "authenticated" USING ("public"."is_staff_or_admin"()) WITH CHECK ("public"."is_staff_or_admin"());



ALTER TABLE "public"."household_members_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "households_delete_admin_only" ON "public"."households_tbl" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "households_insert_staff_admin" ON "public"."households_tbl" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_staff_or_admin"());



CREATE POLICY "households_select_own_resident" ON "public"."households_tbl" FOR SELECT TO "authenticated" USING (("id" IN ( SELECT "residents_tbl"."household_id"
   FROM "public"."residents_tbl"
  WHERE ("residents_tbl"."user_id" = ( SELECT "users_tbl"."id"
           FROM "public"."users_tbl"
          WHERE ("users_tbl"."user_id" = "auth"."uid"()))))));



CREATE POLICY "households_select_staff_admin" ON "public"."households_tbl" FOR SELECT TO "authenticated" USING ("public"."is_staff_or_admin"());



ALTER TABLE "public"."households_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "households_update_staff_admin" ON "public"."households_tbl" FOR UPDATE TO "authenticated" USING ("public"."is_staff_or_admin"()) WITH CHECK ("public"."is_staff_or_admin"());



CREATE POLICY "incidents: staff insert" ON "public"."incidents_tbl" FOR INSERT WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['staff'::"text", 'superadmin'::"text"])));



CREATE POLICY "incidents: staff read all" ON "public"."incidents_tbl" FOR SELECT USING (("public"."get_my_role"() = ANY (ARRAY['staff'::"text", 'superadmin'::"text"])));



CREATE POLICY "incidents: staff update" ON "public"."incidents_tbl" FOR UPDATE USING (("public"."get_my_role"() = ANY (ARRAY['staff'::"text", 'superadmin'::"text"])));



CREATE POLICY "incidents: superadmin delete" ON "public"."incidents_tbl" FOR DELETE USING (("public"."get_my_role"() = 'superadmin'::"text"));



ALTER TABLE "public"."incidents_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "logs: staff insert" ON "public"."activity_logs_tbl" FOR INSERT WITH CHECK (("public"."get_my_role"() = ANY (ARRAY['staff'::"text", 'superadmin'::"text"])));



CREATE POLICY "logs: superadmin read" ON "public"."activity_logs_tbl" FOR SELECT USING (("public"."get_my_role"() = 'superadmin'::"text"));



CREATE POLICY "profiles_insert_own" ON "public"."user_profiles_tbl" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = ( SELECT "users_tbl"."id"
   FROM "public"."users_tbl"
  WHERE ("users_tbl"."user_id" = "auth"."uid"()))));



CREATE POLICY "profiles_select_own_or_staff" ON "public"."user_profiles_tbl" FOR SELECT TO "authenticated" USING ((("user_id" = ( SELECT "users_tbl"."id"
   FROM "public"."users_tbl"
  WHERE ("users_tbl"."user_id" = "auth"."uid"()))) OR "public"."is_staff_or_admin"()));



CREATE POLICY "profiles_update_own" ON "public"."user_profiles_tbl" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "users_tbl"."id"
   FROM "public"."users_tbl"
  WHERE ("users_tbl"."user_id" = "auth"."uid"())))) WITH CHECK (("user_id" = ( SELECT "users_tbl"."id"
   FROM "public"."users_tbl"
  WHERE ("users_tbl"."user_id" = "auth"."uid"()))));



CREATE POLICY "puroks_all_admin" ON "public"."puroks_tbl" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "puroks_select_authenticated" ON "public"."puroks_tbl" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."puroks_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "residents_delete_admin_only" ON "public"."residents_tbl" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "residents_insert_staff_admin" ON "public"."residents_tbl" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_staff_or_admin"());



CREATE POLICY "residents_select_own" ON "public"."residents_tbl" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "users_tbl"."id"
   FROM "public"."users_tbl"
  WHERE ("users_tbl"."user_id" = "auth"."uid"()))));



CREATE POLICY "residents_select_staff_admin" ON "public"."residents_tbl" FOR SELECT TO "authenticated" USING ("public"."is_staff_or_admin"());



ALTER TABLE "public"."residents_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "residents_update_staff_admin" ON "public"."residents_tbl" FOR UPDATE TO "authenticated" USING ("public"."is_staff_or_admin"()) WITH CHECK ("public"."is_staff_or_admin"());



ALTER TABLE "public"."user_profiles_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_delete_admin" ON "public"."users_tbl" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "users_insert_admin" ON "public"."users_tbl" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "users_select_own_or_staff" ON "public"."users_tbl" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_staff_or_admin"()));



ALTER TABLE "public"."users_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_update_own" ON "public"."users_tbl" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK ((("user_id" = "auth"."uid"()) AND ("role" = ( SELECT "users_tbl_1"."role"
   FROM "public"."users_tbl" "users_tbl_1"
  WHERE ("users_tbl_1"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."verification_logs_tbl" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "vl_insert_staff_admin" ON "public"."verification_logs_tbl" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_staff_or_admin"());



CREATE POLICY "vl_select_staff_admin" ON "public"."verification_logs_tbl" FOR SELECT TO "authenticated" USING ("public"."is_staff_or_admin"());



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."expire_overdue_eids"() TO "anon";
GRANT ALL ON FUNCTION "public"."expire_overdue_eids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."expire_overdue_eids"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_eid_no"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_eid_no"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_eid_no"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_household_no"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_household_no"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_household_no"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_incident_no"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_incident_no"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_incident_no"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_request_no"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_request_no"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_request_no"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_resident_no"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_resident_no"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_resident_no"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_resident_qr_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_resident_qr_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_resident_qr_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_deleted"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_deleted"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_deleted"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_staff_or_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_staff_or_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_staff_or_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."link_resident_to_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."link_resident_to_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."link_resident_to_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."activity_logs_tbl" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs_tbl" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs_tbl" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs_tbl" TO "service_role";



GRANT ALL ON TABLE "public"."document_requests_tbl" TO "anon";
GRANT ALL ON TABLE "public"."document_requests_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."document_requests_tbl" TO "service_role";



GRANT ALL ON TABLE "public"."eid_tbl" TO "anon";
GRANT ALL ON TABLE "public"."eid_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."eid_tbl" TO "service_role";



GRANT ALL ON TABLE "public"."eids_tbl" TO "anon";
GRANT ALL ON TABLE "public"."eids_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."eids_tbl" TO "service_role";



GRANT ALL ON TABLE "public"."household_members_tbl" TO "anon";
GRANT ALL ON TABLE "public"."household_members_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."household_members_tbl" TO "service_role";



GRANT ALL ON TABLE "public"."households_tbl" TO "anon";
GRANT ALL ON TABLE "public"."households_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."households_tbl" TO "service_role";



GRANT ALL ON TABLE "public"."incidents_tbl" TO "anon";
GRANT ALL ON TABLE "public"."incidents_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."incidents_tbl" TO "service_role";



GRANT ALL ON TABLE "public"."puroks_tbl" TO "anon";
GRANT ALL ON TABLE "public"."puroks_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."puroks_tbl" TO "service_role";



GRANT ALL ON TABLE "public"."residents_tbl" TO "anon";
GRANT ALL ON TABLE "public"."residents_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."residents_tbl" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles_tbl" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles_tbl" TO "service_role";



GRANT ALL ON TABLE "public"."users_tbl" TO "anon";
GRANT ALL ON TABLE "public"."users_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."users_tbl" TO "service_role";



GRANT ALL ON TABLE "public"."v_active_vs_inactive" TO "anon";
GRANT ALL ON TABLE "public"."v_active_vs_inactive" TO "authenticated";
GRANT ALL ON TABLE "public"."v_active_vs_inactive" TO "service_role";



GRANT ALL ON TABLE "public"."v_analytics_summary" TO "anon";
GRANT ALL ON TABLE "public"."v_analytics_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."v_analytics_summary" TO "service_role";



GRANT ALL ON TABLE "public"."v_eid_renewal_stats" TO "anon";
GRANT ALL ON TABLE "public"."v_eid_renewal_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."v_eid_renewal_stats" TO "service_role";



GRANT ALL ON TABLE "public"."v_gender_distribution" TO "anon";
GRANT ALL ON TABLE "public"."v_gender_distribution" TO "authenticated";
GRANT ALL ON TABLE "public"."v_gender_distribution" TO "service_role";



GRANT ALL ON TABLE "public"."v_households_per_purok" TO "anon";
GRANT ALL ON TABLE "public"."v_households_per_purok" TO "authenticated";
GRANT ALL ON TABLE "public"."v_households_per_purok" TO "service_role";



GRANT ALL ON TABLE "public"."v_new_residents_per_year" TO "anon";
GRANT ALL ON TABLE "public"."v_new_residents_per_year" TO "authenticated";
GRANT ALL ON TABLE "public"."v_new_residents_per_year" TO "service_role";



GRANT ALL ON TABLE "public"."v_population_by_age_group" TO "anon";
GRANT ALL ON TABLE "public"."v_population_by_age_group" TO "authenticated";
GRANT ALL ON TABLE "public"."v_population_by_age_group" TO "service_role";



GRANT ALL ON TABLE "public"."v_population_growth" TO "anon";
GRANT ALL ON TABLE "public"."v_population_growth" TO "authenticated";
GRANT ALL ON TABLE "public"."v_population_growth" TO "service_role";



GRANT ALL ON TABLE "public"."v_residents_transferred_out" TO "anon";
GRANT ALL ON TABLE "public"."v_residents_transferred_out" TO "authenticated";
GRANT ALL ON TABLE "public"."v_residents_transferred_out" TO "service_role";



GRANT ALL ON TABLE "public"."verification_logs_tbl" TO "anon";
GRANT ALL ON TABLE "public"."verification_logs_tbl" TO "authenticated";
GRANT ALL ON TABLE "public"."verification_logs_tbl" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







