-- ============================================================================
-- SPOTLIGHT REAL ESTATE - IDEMPOTENT SEED DATA
-- ============================================================================
-- This seed file can be run multiple times without creating duplicates.
-- All inserts use ON CONFLICT DO NOTHING or WHERE NOT EXISTS patterns.
-- ============================================================================

-- ============================================================================
-- REGIONS
-- ============================================================================

INSERT INTO public.regions (name_en, name_gr, slug, description_en, description_gr, featured, display_order)
VALUES
  ('Athens', 'Αθήνα', 'athens', 
   'Capital city of Greece with rich history and modern amenities', 
   'Πρωτεύουσα της Ελλάδας με πλούσια ιστορία και σύγχρονες ανέσεις',
   true, 1),
  ('Mykonos', 'Μύκονος', 'mykonos',
   'Beautiful Cycladic island known for beaches and nightlife',
   'Όμορφο κυκλαδίτικο νησί γνωστό για τις παραλίες και τη νυχτερινή ζωή',
   true, 2),
  ('Santorini', 'Σαντορίνη', 'santorini',
   'Iconic island with stunning sunsets and white-washed buildings',
   'Εμβληματικό νησί με εκπληκτικά ηλιοβασιλέματα και ασπρισμένα κτίρια',
   true, 3),
  ('Thessaloniki', 'Θεσσαλονίκη', 'thessaloniki',
   'Second largest city in Greece, cultural and economic hub',
   'Δεύτερη μεγαλύτερη πόλη της Ελλάδας, πολιτιστικό και οικονομικό κέντρο',
   false, 4),
  ('Crete', 'Κρήτη', 'crete',
   'Largest Greek island with diverse landscapes and rich history',
   'Μεγαλύτερο ελληνικό νησί με ποικίλα τοπία και πλούσια ιστορία',
   false, 5),
  ('Rhodes', 'Ρόδος', 'rhodes',
   'Historic island in the Dodecanese with medieval architecture',
   'Ιστορικό νησί της Δωδεκανήσου με μεσαιωνική αρχιτεκτονική',
   false, 6),
  ('Corfu', 'Κέρκυρα', 'corfu',
   'Lush Ionian island with Venetian influence',
   'Καταπράσινο Ιόνιο νησί με ενετική επιρροή',
   false, 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- AGENTS
-- ============================================================================

INSERT INTO public.agents (name_en, name_gr, email, phone, bio_en, bio_gr, featured, display_order, languages, specialties)
VALUES
  ('Maria Papadopoulos', 'Μαρία Παπαδοπούλου', 'maria@spotlight.gr', '+30 210 123 4567',
   'Senior real estate consultant with 15 years of experience in luxury properties',
   'Ανώτερη σύμβουλος ακινήτων με 15 χρόνια εμπειρίας σε πολυτελή ακίνητα',
   true, 1, ARRAY['en', 'gr'], ARRAY['luxury', 'villas', 'waterfront']),
  ('Nikos Dimitriou', 'Νίκος Δημητρίου', 'nikos@spotlight.gr', '+30 210 123 4568',
   'Specialist in commercial properties and investment opportunities',
   'Ειδικός σε εμπορικά ακίνητα και επενδυτικές ευκαιρίες',
   true, 2, ARRAY['en', 'gr', 'de'], ARRAY['commercial', 'investment', 'development']),
  ('Elena Georgiou', 'Έλενα Γεωργίου', 'elena@spotlight.gr', '+30 210 123 4569',
   'Expert in island properties and vacation homes',
   'Ειδικός σε νησιωτικά ακίνητα και εξοχικές κατοικίες',
   true, 3, ARRAY['en', 'gr', 'fr'], ARRAY['islands', 'vacation', 'rentals']),
  ('Dimitris Katsaros', 'Δημήτρης Κατσαρός', 'dimitris@spotlight.gr', '+30 210 123 4570',
   'Residential property specialist focusing on Athens metropolitan area',
   'Ειδικός σε κατοικίες με εστίαση στην ευρύτερη περιοχή Αθηνών',
   false, 4, ARRAY['en', 'gr'], ARRAY['residential', 'apartments', 'urban'])
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SAMPLE PROPERTIES
-- ============================================================================

-- Get region and agent IDs for foreign keys
DO $$
DECLARE
  mykonos_id UUID;
  santorini_id UUID;
  athens_id UUID;
  maria_id UUID;
  elena_id UUID;
BEGIN
  -- Get region IDs
  SELECT id INTO mykonos_id FROM public.regions WHERE slug = 'mykonos';
  SELECT id INTO santorini_id FROM public.regions WHERE slug = 'santorini';
  SELECT id INTO athens_id FROM public.regions WHERE slug = 'athens';
  
  -- Get agent IDs
  SELECT id INTO maria_id FROM public.agents WHERE email = 'maria@spotlight.gr';
  SELECT id INTO elena_id FROM public.agents WHERE email = 'elena@spotlight.gr';

  -- Insert properties (only if they don't exist)
  INSERT INTO public.properties (
    property_code, title_en, title_gr, description_en, description_gr,
    property_type, listing_type, status, price_sale, currency,
    bedrooms, bathrooms, area_sqm, plot_size_sqm, year_built,
    region_id, city_en, city_gr, agent_id, featured, published,
    main_image_url, features, amenities
  )
  SELECT * FROM (VALUES
    ('SP25-0001', 
     'Luxury Villa with Sea View in Mykonos',
     'Πολυτελής Βίλα με Θέα στη Θάλασσα στη Μύκονο',
     'Stunning luxury villa with panoramic sea views, infinity pool, and modern amenities. Perfect for those seeking the ultimate Mykonos lifestyle.',
     'Εκπληκτική πολυτελής βίλα με πανοραμική θέα στη θάλασσα, πισίνα υπερχείλισης και σύγχρονες ανέσεις. Ιδανική για όσους αναζητούν τον απόλυτο τρόπο ζωής της Μυκόνου.',
     'villa', 'sale', 'available', 2500000.00, 'EUR',
     5, 4, 350.00, 1200.00, 2020,
     mykonos_id, 'Mykonos', 'Μύκονος', maria_id, true, true,
     '/luxury-villa-sea-view-mykonos.jpg',
     ARRAY['sea_view', 'infinity_pool', 'modern_design', 'smart_home', 'solar_panels'],
     ARRAY['pool', 'garden', 'parking', 'security', 'gym', 'wine_cellar']),
    
    ('SP25-0002',
     'Beachfront House in Santorini',
     'Παραθαλάσσια Κατοικία στη Σαντορίνη',
     'Exclusive beachfront property with direct access to the beach. Traditional Cycladic architecture meets modern luxury.',
     'Αποκλειστικό παραθαλάσσιο ακίνητο με άμεση πρόσβαση στην παραλία. Παραδοσιακή κυκλαδίτικη αρχιτεκτονική συναντά τη σύγχρονη πολυτέλεια.',
     'house', 'sale', 'available', 1800000.00, 'EUR',
     4, 3, 280.00, 800.00, 2019,
     santorini_id, 'Santorini', 'Σαντορίνη', elena_id, true, true,
     '/beachfront-house-santorini.jpg',
     ARRAY['beachfront', 'sunset_view', 'traditional_design', 'renovated'],
     ARRAY['pool', 'garden', 'parking', 'bbq', 'outdoor_shower']),
    
    ('SP25-0003',
     'Modern Apartment in Athens City Center',
     'Μοντέρνο Διαμέρισμα στο Κέντρο της Αθήνας',
     'Contemporary apartment in the heart of Athens. Walking distance to Acropolis and all major attractions.',
     'Σύγχρονο διαμέρισμα στην καρδιά της Αθήνας. Σε απόσταση βαδίσματος από την Ακρόπολη και όλα τα σημαντικά αξιοθέατα.',
     'apartment', 'sale', 'available', 450000.00, 'EUR',
     3, 2, 120.00, NULL, 2021,
     athens_id, 'Athens', 'Αθήνα', maria_id, false, true,
     '/modern-apartment-athens-city.jpg',
     ARRAY['city_center', 'new_construction', 'energy_efficient', 'balcony'],
     ARRAY['elevator', 'storage', 'heating', 'air_conditioning', 'security_door'])
  ) AS v(property_code, title_en, title_gr, description_en, description_gr,
         property_type, listing_type, status, price_sale, currency,
         bedrooms, bathrooms, area_sqm, plot_size_sqm, year_built,
         region_id, city_en, city_gr, agent_id, featured, published,
         main_image_url, features, amenities)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.properties WHERE property_code = v.property_code
  );

END $$;

-- ============================================================================
-- TASK TEMPLATES (if not already inserted by migration)
-- ============================================================================

INSERT INTO public.task_templates (stage, title, description, relative_due_days, is_active)
VALUES
  ('new', 'Initial Contact', 'Reach out to the lead within 24 hours', 1, true),
  ('contacted', 'Send Property Details', 'Send detailed information about requested properties', 1, true),
  ('contacted', 'Schedule Property Viewing', 'Arrange a convenient time for property viewing', 2, true),
  ('qualified', 'Property Viewing', 'Conduct property viewing and answer questions', 0, true),
  ('viewing', 'Follow Up After Viewing', 'Contact lead for feedback after viewing', 1, true),
  ('viewing', 'Send Additional Information', 'Provide any additional documents or information requested', 1, true),
  ('negotiating', 'Prepare Offer Documents', 'Draft offer letter and required documents', 2, true),
  ('negotiating', 'Request Financial Pre-approval', 'Ensure buyer has financing in place', 3, true),
  ('offer', 'Review Offer Terms', 'Review and negotiate offer terms with client', 1, true),
  ('offer', 'Coordinate with Legal Team', 'Arrange legal review and contract preparation', 3, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SYNDICATION MAPPINGS (if not already inserted by migration)
-- ============================================================================

INSERT INTO public.syndication_mappings (portal, mapping_json, is_active)
VALUES
  ('spitogatos', '{"title": "title", "description": "description", "price": "price", "location": "city"}', false),
  ('xe', '{"title": "title", "description": "description", "price": "price", "location": "city"}', false),
  ('idealista', '{"title": "title", "description": "description", "price": "price", "location": "city"}', false)
ON CONFLICT (portal) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count seeded records
DO $$
DECLARE
  region_count INT;
  agent_count INT;
  property_count INT;
  task_template_count INT;
BEGIN
  SELECT COUNT(*) INTO region_count FROM public.regions;
  SELECT COUNT(*) INTO agent_count FROM public.agents;
  SELECT COUNT(*) INTO property_count FROM public.properties;
  SELECT COUNT(*) INTO task_template_count FROM public.task_templates;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'SEED DATA SUMMARY';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Regions: %', region_count;
  RAISE NOTICE 'Agents: %', agent_count;
  RAISE NOTICE 'Properties: %', property_count;
  RAISE NOTICE 'Task Templates: %', task_template_count;
  RAISE NOTICE '============================================';
END $$;

-- ============================================================================
-- SEED COMPLETE ✅
-- ============================================================================
-- Your database now has sample data for:
-- - 7 regions (Athens, Mykonos, Santorini, Thessaloniki, Crete, Rhodes, Corfu)
-- - 4 agents (Maria, Nikos, Elena, Dimitris)
-- - 3 properties (Mykonos villa, Santorini house, Athens apartment)
-- - 10 task templates
-- - 3 syndication mappings
--
-- This seed can be run multiple times without creating duplicates.
-- ============================================================================

