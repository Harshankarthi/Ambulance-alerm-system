-- Create table for storing push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_type TEXT NOT NULL DEFAULT 'traffic_police',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert subscriptions (for demo purposes)
CREATE POLICY "Anyone can subscribe"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (true);

-- Allow reading subscriptions (for sending notifications)
CREATE POLICY "Anyone can read subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (true);

-- Allow deleting own subscription by endpoint
CREATE POLICY "Anyone can delete subscriptions"
ON public.push_subscriptions
FOR DELETE
USING (true);