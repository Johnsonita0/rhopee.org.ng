export function filterRegistrations(registrations, filters = {}, trackLabels = {}) {
  const normalizedTrack = (filters.track || 'all').toString().trim().toLowerCase();
  const normalizedStatus = (filters.status || 'all').toString().trim().toLowerCase();
  const searchQuery = (filters.search || '').toString().trim().toLowerCase();

  return registrations.filter((registration) => {
    const registrationTrack = registration?.training_track || '';
    const displayTrack = registration?.training_track_name || trackLabels[registrationTrack] || registrationTrack || 'Unassigned';
    const statusValue = String(registration?.status || 'registered').trim().toLowerCase();

    const matchesTrack =
      normalizedTrack === 'all' ||
      registrationTrack.toLowerCase() === normalizedTrack ||
      displayTrack.toLowerCase() === normalizedTrack ||
      trackLabels[registrationTrack]?.toLowerCase() === normalizedTrack;

    const matchesStatus = normalizedStatus === 'all' || statusValue === normalizedStatus;

    const haystack = [
      registration?.full_name,
      registration?.email,
      registration?.phone,
      registration?.confirmation_code,
      registration?.role,
      registration?.lga,
      registration?.ward,
      displayTrack,
      statusValue,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = !searchQuery || haystack.includes(searchQuery);

    return matchesTrack && matchesStatus && matchesSearch;
  });
}
