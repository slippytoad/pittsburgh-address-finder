-- Update the cron job to run every hour at 5 minutes past instead of daily
-- Change from '0 13 * * *' (daily at 13:00) to '5 * * * *' (every hour at 5 minutes past)
SELECT cron.alter_job(
  1, -- job ID for the daily violation check
  schedule := '5 * * * *', -- every hour at 5 minutes past
  command := $$
  select
    net.http_post(
        url:='https://qdjfzjqhnhrlkpqdtssp.supabase.co/functions/v1/hourly-violation-check',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkamZ6anFobmhybGtwcWR0c3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTcyMDUsImV4cCI6MjA1NzMzMzIwNX0.KSREpeFWe08W1bdY1GPxUEol9_Gd3PRqT37HIXl4_r4"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);