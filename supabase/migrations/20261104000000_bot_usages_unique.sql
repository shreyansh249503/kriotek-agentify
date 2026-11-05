-- One usage row per bot per billing period.
--
-- recordBotTokenUsage adds each message's tokens with INSERT ... ON CONFLICT (bot_id, billing_period),
-- which needs this unique constraint. Before it, concurrent messages could each insert a row for a
-- new period, and the budget check read only one of them.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.bot_usages'::regclass AND conname = 'bot_usages_bot_id_billing_period_key'
    ) THEN
        -- Block writes so no new duplicate appears between the merge and the constraint.
        LOCK TABLE public.bot_usages IN SHARE ROW EXCLUSIVE MODE;

        -- Fold duplicate rows into the oldest one for each (bot_id, billing_period).
        WITH totals AS (
            SELECT bot_id,
                   billing_period,
                   (array_agg(id ORDER BY created_at, id))[1] AS keep_id,
                   SUM(COALESCE(total_tokens, 0)) AS total_tokens,
                   SUM(COALESCE(prompt_tokens, 0)) AS prompt_tokens,
                   SUM(COALESCE(completion_tokens, 0)) AS completion_tokens,
                   SUM(COALESCE(message_count, 0)) AS message_count
            FROM public.bot_usages
            GROUP BY bot_id, billing_period
            HAVING COUNT(*) > 1
        ),
        merged AS (
            UPDATE public.bot_usages u
            SET total_tokens = t.total_tokens,
                prompt_tokens = t.prompt_tokens,
                completion_tokens = t.completion_tokens,
                message_count = t.message_count,
                updated_at = NOW()
            FROM totals t
            WHERE u.id = t.keep_id
            RETURNING u.id
        )
        DELETE FROM public.bot_usages u
        USING totals t
        WHERE u.bot_id = t.bot_id
          AND u.billing_period = t.billing_period
          AND u.id <> t.keep_id;

        ALTER TABLE public.bot_usages
            ADD CONSTRAINT bot_usages_bot_id_billing_period_key UNIQUE (bot_id, billing_period);
    END IF;
END $$;

-- The constraint's index covers lookups by (bot_id, billing_period).
DROP INDEX IF EXISTS public.idx_bot_usages_bot_period;
