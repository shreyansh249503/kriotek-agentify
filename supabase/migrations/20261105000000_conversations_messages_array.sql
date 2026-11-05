-- Store conversations.messages as a real jsonb array.
--
-- The app wrote JSON.stringify(history) into this jsonb column, so most rows hold a jsonb *string*
-- that contains the array. Messages are now appended in SQL (messages || new), which needs an
-- array. Unwrap the strings, reset anything unparseable or not an array to [], and require a value.
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT id, messages #>> '{}' AS raw
        FROM public.conversations
        WHERE jsonb_typeof(messages) = 'string'
    LOOP
        BEGIN
            UPDATE public.conversations SET messages = r.raw::jsonb WHERE id = r.id;
        EXCEPTION
            WHEN invalid_text_representation THEN
                RAISE WARNING 'conversation % had malformed messages; reset to []', r.id;
                UPDATE public.conversations SET messages = '[]'::jsonb WHERE id = r.id;
        END;
    END LOOP;
END $$;

UPDATE public.conversations
SET messages = '[]'::jsonb
WHERE messages IS NULL OR jsonb_typeof(messages) <> 'array';

ALTER TABLE public.conversations ALTER COLUMN messages SET DEFAULT '[]'::jsonb;
ALTER TABLE public.conversations ALTER COLUMN messages SET NOT NULL;
