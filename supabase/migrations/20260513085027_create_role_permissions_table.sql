CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role text NOT NULL,
  path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, path)
);

-- Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read permissions
CREATE POLICY "Allow authenticated read" ON role_permissions
  FOR SELECT TO authenticated USING (true);

-- Only admins can modify permissions
CREATE POLICY "Allow admin all" ON role_permissions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed initial permissions based on current hardcoded roles
INSERT INTO role_permissions (role, path) VALUES
('admin', '/'), ('dispatcher', '/'), ('supervisor', '/'),
('admin', '/control-tower'), ('dispatcher', '/control-tower'),
('admin', '/trips'), ('dispatcher', '/trips'), ('supervisor', '/trips'),
('admin', '/vehicles'), ('dispatcher', '/vehicles'),
('admin', '/orders'), ('dispatcher', '/orders'), ('supervisor', '/orders'),
('admin', '/dispatch'), ('dispatcher', '/dispatch'),
('admin', '/drivers'), ('dispatcher', '/drivers'),
('admin', '/sites'), ('supervisor', '/sites'),
('admin', '/documents'), ('dispatcher', '/documents'),
('admin', '/inspections'), ('supervisor', '/inspections'), ('dispatcher', '/inspections'),
('admin', '/reports'), ('supervisor', '/reports'),
('admin', '/users'),
('admin', '/settings'),
('admin', '/driver-mobile'), ('driver', '/driver-mobile'),
('admin', '/labor'), ('supervisor', '/labor'),
('admin', '/mobilization'), ('supervisor', '/mobilization'),
('admin', '/permissions')
ON CONFLICT DO NOTHING;
