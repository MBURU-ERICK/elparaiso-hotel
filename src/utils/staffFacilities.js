export function permitsFacilityType(user, types, action = 'view') {
  return Boolean(user.is_superuser || user.facilities?.some(f => types.includes(f.facility_type) && f.actions?.includes(action)));
}
