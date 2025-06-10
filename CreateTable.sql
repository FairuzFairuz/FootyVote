CREATE TABLE IF NOT EXISTS public.comments
(
    comment_id integer NOT NULL DEFAULT nextval('comments_comment_id_seq'::regclass),
    user_id integer,
    poll_id integer,
    comment_text text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT comments_pkey PRIMARY KEY (comment_id),
    CONSTRAINT comments_poll_id_fkey FOREIGN KEY (poll_id)
        REFERENCES public.polls (poll_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.comments
    OWNER to postgres;

------------------

CREATE TABLE IF NOT EXISTS public.poll_options
(
    option_id integer NOT NULL DEFAULT nextval('poll_options_option_id_seq'::regclass),
    poll_id integer,
    option_text character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT poll_options_pkey PRIMARY KEY (option_id),
    CONSTRAINT poll_options_poll_id_fkey FOREIGN KEY (poll_id)
        REFERENCES public.polls (poll_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.poll_options
    OWNER to postgres;

----------------------

CREATE TABLE IF NOT EXISTS public.polls
(
    poll_id integer NOT NULL DEFAULT nextval('polls_poll_id_seq'::regclass),
    created_by integer,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    category character varying(100) COLLATE pg_catalog."default",
    option_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ends_at timestamp without time zone NOT NULL DEFAULT (now() + '7 days'::interval),
    "updatedAt" timestamp without time zone DEFAULT now(),
    CONSTRAINT polls_pkey PRIMARY KEY (poll_id),
    CONSTRAINT polls_created_by_fkey FOREIGN KEY (created_by)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT max_options CHECK (option_count <= 3)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.polls
    OWNER to postgres;

-----------------------------
CREATE TABLE IF NOT EXISTS public.users
(
    user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    password_hash text COLLATE pg_catalog."default" NOT NULL,
    role user_role NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

----------------------------------
CREATE TABLE IF NOT EXISTS public.votes
(
    vote_id integer NOT NULL DEFAULT nextval('votes_vote_id_seq'::regclass),
    user_id integer,
    poll_id integer,
    option_id integer,
    CONSTRAINT votes_pkey PRIMARY KEY (vote_id),
    CONSTRAINT votes_user_id_poll_id_key UNIQUE (user_id, poll_id),
    CONSTRAINT votes_option_id_fkey FOREIGN KEY (option_id)
        REFERENCES public.poll_options (option_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT votes_poll_id_fkey FOREIGN KEY (poll_id)
        REFERENCES public.polls (poll_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.votes
    OWNER to postgres;