-- Seed modules
INSERT INTO public.modules (id, slug, name, description, icon, color, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111', 'anatomie-biologie', 'Anatomie & Biologie', 'Bases fondamentales en anatomie et biologie médicale', '🧬', '#4A90D9', 1),
  ('22222222-2222-2222-2222-222222222222', 'medecine', 'Médecine Interne', 'Pathologies médicales et diagnostics cliniques', '🏥', '#E8A83E', 2),
  ('33333333-3333-3333-3333-333333333333', 'chirurgie', 'Chirurgie', 'Techniques chirurgicales et pathologies opératoires', '🔬', '#E85555', 3),
  ('44444444-4444-4444-4444-444444444444', 'urgences-medicales', 'Urgences Médicales', 'Prise en charge des urgences médicales', '🚨', '#9B59B6', 4),
  ('55555555-5555-5555-5555-555555555555', 'urgences-chirurgicales', 'Urgences Chirurgicales', 'Prise en charge des urgences chirurgicales', '⚡', '#E67E22', 5);

-- Seed programs
INSERT INTO public.programs (id, type, title, description, total_days) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '90j', 'Programme 90 Jours', 'Préparation intensive en 90 jours', 90),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '180j', 'Programme 180 Jours', 'Préparation complète en 180 jours', 180);
