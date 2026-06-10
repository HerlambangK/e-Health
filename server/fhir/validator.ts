export function validateFHIRResource(resource: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!resource.resourceType) {
    errors.push("Missing resourceType");
  }

  if (!resource.meta?.profile && resource.resourceType !== "Bundle") {
    errors.push(`Missing meta.profile for ${resource.resourceType}`);
  }

  if (resource.resourceType === "Patient") {
    if (!resource.identifier?.length) {
      errors.push("Patient must have at least one identifier");
    }
    if (resource.identifier) {
      const hasNIK = resource.identifier.some(
        (id: any) => id.system === "https://fhir.kemkes.go.id/id/nik"
      );
      if (!hasNIK) {
        errors.push("Patient must have NIK identifier");
      }
    }
  }

  if (resource.resourceType === "Encounter") {
    if (!resource.status) {
      errors.push("Encounter must have status");
    }
    if (!resource.class) {
      errors.push("Encounter must have class");
    }
  }

  return { valid: errors.length === 0, errors };
}
