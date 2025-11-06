-- Create function to automatically log changes
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, diff_json)
    VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      OLD.id,
      'delete',
      jsonb_build_object('old', to_jsonb(OLD))
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, diff_json)
    VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      NEW.id,
      'update',
      jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, diff_json)
    VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      NEW.id,
      'create',
      jsonb_build_object('new', to_jsonb(NEW))
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for important tables
CREATE TRIGGER properties_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER leads_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON leads
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER offers_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON offers
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER documents_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
