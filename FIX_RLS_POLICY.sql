-- ============================================
-- FIX RLS POLICY FOR PUBLIC PROJECT SUBMISSIONS
-- This allows anyone (not just authenticated users) to submit projects
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies on projects
DROP POLICY IF EXISTS "projects_insert_public" ON public.projects;
DROP POLICY IF EXISTS "projects_select_authenticated" ON public.projects;
DROP POLICY IF EXISTS "projects_update_authenticated" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_authenticated" ON public.projects;

-- Create new policies that work correctly

-- Allow ANYONE (including anonymous/public users) to insert projects
CREATE POLICY "Enable insert for all users"
    ON public.projects
    FOR INSERT
    TO public, anon
    WITH CHECK (true);

-- Allow authenticated users to view all projects
CREATE POLICY "Enable read for authenticated users"
    ON public.projects
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to update projects
CREATE POLICY "Enable update for authenticated users"
    ON public.projects
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete projects
CREATE POLICY "Enable delete for authenticated users"
    ON public.projects
    FOR DELETE
    TO authenticated
    USING (true);

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'projects'
ORDER BY policyname;

-- Test RLS status
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'Enabled ✅' ELSE 'Disabled ❌' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'projects';

SELECT '✅ RLS POLICIES FIXED - Public submissions now allowed' as status;
