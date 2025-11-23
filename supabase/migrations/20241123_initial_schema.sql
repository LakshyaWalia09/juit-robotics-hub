-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for admin users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    -- Student Information
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    branch TEXT NOT NULL,
    year TEXT NOT NULL,
    contact_number TEXT,
    
    -- Team Information
    is_team_project BOOLEAN DEFAULT FALSE,
    team_size INTEGER,
    team_members TEXT,
    
    -- Project Details
    category TEXT NOT NULL,
    project_title TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_outcomes TEXT,
    duration TEXT NOT NULL,
    
    -- Resources
    required_resources TEXT[] NOT NULL,
    other_resources TEXT,
    
    -- Status and Review
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
    faculty_comments TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'in_use', 'maintenance', 'unavailable')),
    image_url TEXT,
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create project_equipment junction table
CREATE TABLE IF NOT EXISTS public.project_equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    quantity_requested INTEGER DEFAULT 1,
    allocated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(project_id, equipment_id)
);

-- Create activity_logs table for admin actions
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_student_email ON public.projects(student_email);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON public.activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users" 
    ON public.profiles FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id);

-- RLS Policies for projects
CREATE POLICY "Projects are viewable by everyone" 
    ON public.projects FOR SELECT 
    TO anon, authenticated 
    USING (true);

CREATE POLICY "Anyone can insert projects" 
    ON public.projects FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (true);

CREATE POLICY "Admins can update projects" 
    ON public.projects FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete projects" 
    ON public.projects FOR DELETE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for equipment
CREATE POLICY "Equipment is viewable by everyone" 
    ON public.equipment FOR SELECT 
    TO anon, authenticated 
    USING (true);

CREATE POLICY "Admins can manage equipment" 
    ON public.equipment FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for project_equipment
CREATE POLICY "Project equipment is viewable by everyone" 
    ON public.project_equipment FOR SELECT 
    TO anon, authenticated 
    USING (true);

CREATE POLICY "Admins can manage project equipment" 
    ON public.project_equipment FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for activity_logs
CREATE POLICY "Activity logs are viewable by admins" 
    ON public.activity_logs FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Activity logs can be inserted by admins" 
    ON public.activity_logs FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_equipment_updated_at
    BEFORE UPDATE ON public.equipment
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Insert some default equipment data
INSERT INTO public.equipment (name, category, description, quantity, availability_status, specifications) VALUES
    ('Drone - DJI Mavic', 'Aerial Robotics', 'Professional quadcopter drone with 4K camera', 2, 'available', '{"max_flight_time": "31 minutes", "max_speed": "72 km/h", "camera": "4K"}'::jsonb),
    ('Robotic Dog - Unitree A1', 'Bio-Inspired Robotics', 'Advanced quadruped robot with AI capabilities', 1, 'available', '{"payload": "5kg", "speed": "11.88 km/h", "battery_life": "2.5 hours"}'::jsonb),
    ('6-Axis Robotic Arm', 'Robotic Manipulation', 'Industrial grade robotic arm for precise manipulation', 3, 'available', '{"reach": "850mm", "payload": "5kg", "repeatability": "±0.05mm"}'::jsonb),
    ('Arduino Mega 2560', 'Development Kits', 'Microcontroller board for robotics projects', 20, 'available', '{"digital_pins": 54, "analog_inputs": 16, "flash_memory": "256 KB"}'::jsonb),
    ('Jetson Nano Developer Kit', 'AI Platform', 'AI computing platform for edge devices', 5, 'available', '{"gpu": "128-core Maxwell", "ram": "4GB", "usb": "4x USB 3.0"}'::jsonb),
    ('3D Printer - Creality Ender 3', '3D Printing', 'FDM 3D printer for prototyping', 2, 'available', '{"build_volume": "220x220x250mm", "layer_resolution": "0.1-0.4mm", "filament": "PLA, ABS, TPU"}'::jsonb),
    ('Ultrasonic Sensors (HC-SR04)', 'Sensors', 'Distance measuring sensors', 50, 'available', '{"range": "2cm-400cm", "accuracy": "3mm", "voltage": "5V"}'::jsonb),
    ('Servo Motors (MG996R)', 'Actuators', 'High torque digital servo motors', 30, 'available', '{"torque": "11kg-cm", "speed": "0.17s/60°", "voltage": "4.8-7.2V"}'::jsonb)
ON CONFLICT DO NOTHING;