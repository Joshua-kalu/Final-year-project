-- Create role enum
create type public.app_role as enum ('admin', 'doctor', 'patient');

-- Create user_roles table for secure role management
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamp with time zone not null default now(),
    unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer function to check roles (prevents RLS recursion)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS policies for user_roles
create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can manage all roles"
on public.user_roles for all
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Create profiles table
create table public.profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null unique,
    full_name text not null,
    phone text,
    avatar_url text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles"
on public.profiles for select
to authenticated
using (true);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (user_id = auth.uid());

-- Create doctors table
create table public.doctors (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade unique,
    full_name text not null,
    specialty text not null,
    department text not null,
    bio text,
    avatar_url text,
    availability_slots jsonb default '[]'::jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.doctors enable row level security;

create policy "Anyone can view doctors"
on public.doctors for select
using (true);

create policy "Admins can manage doctors"
on public.doctors for all
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Doctors can update their own profile"
on public.doctors for update
to authenticated
using (user_id = auth.uid());

-- Create appointments table
create table public.appointments (
    id uuid primary key default gen_random_uuid(),
    patient_id uuid references auth.users(id) on delete cascade not null,
    doctor_id uuid references public.doctors(id) on delete cascade not null,
    department text not null,
    date_time timestamp with time zone not null,
    status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
    notes text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.appointments enable row level security;

create policy "Patients can view their own appointments"
on public.appointments for select
to authenticated
using (patient_id = auth.uid());

create policy "Doctors can view their appointments"
on public.appointments for select
to authenticated
using (
    exists (
        select 1 from public.doctors 
        where doctors.id = appointments.doctor_id 
        and doctors.user_id = auth.uid()
    )
);

create policy "Admins can view all appointments"
on public.appointments for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Patients can create appointments"
on public.appointments for insert
to authenticated
with check (patient_id = auth.uid());

create policy "Patients can update their own appointments"
on public.appointments for update
to authenticated
using (patient_id = auth.uid());

create policy "Doctors can update their appointments"
on public.appointments for update
to authenticated
using (
    exists (
        select 1 from public.doctors 
        where doctors.id = appointments.doctor_id 
        and doctors.user_id = auth.uid()
    )
);

-- Create function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (user_id, full_name, phone)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
        new.raw_user_meta_data ->> 'phone'
    );
    
    -- Default role is patient
    insert into public.user_roles (user_id, role)
    values (new.id, 'patient');
    
    return new;
end;
$$;

-- Trigger for new user signup
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Function to update timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql set search_path = public;

-- Triggers for updated_at
create trigger update_profiles_updated_at
    before update on public.profiles
    for each row execute function public.update_updated_at_column();

create trigger update_doctors_updated_at
    before update on public.doctors
    for each row execute function public.update_updated_at_column();

create trigger update_appointments_updated_at
    before update on public.appointments
    for each row execute function public.update_updated_at_column();