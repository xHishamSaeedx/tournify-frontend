/**
 * Utility functions for determining tournament status based on match_start_time
 */

/**
 * Determine tournament status based on match_start_time
 * @param {string} matchStartTime - ISO string of match start time
 * @returns {string} - 'upcoming', 'ongoing', or 'done'
 */
export const getTournamentStatus = (matchStartTime) => {
  if (!matchStartTime) return 'unknown';
  
  const now = new Date();
  const startTime = new Date(matchStartTime);
  const timeDiff = now.getTime() - startTime.getTime();
  const minutesDiff = timeDiff / (1000 * 60);
  
  if (minutesDiff < 0) {
    // Match hasn't started yet
    return 'upcoming';
  } else if (minutesDiff <= 10) {
    // Match is ongoing (within 10 minutes of start time)
    return 'ongoing';
  } else {
    // Match is done (more than 10 minutes after start time)
    return 'done';
  }
};

/**
 * Get status display text and styling class
 * @param {string} matchStartTime - ISO string of match start time
 * @returns {object} - { text: string, className: string }
 */
export const getStatusDisplay = (matchStartTime) => {
  const status = getTournamentStatus(matchStartTime);
  
  switch (status) {
    case 'upcoming':
      return {
        text: 'Upcoming',
        className: 'status upcoming'
      };
    case 'ongoing':
      return {
        text: 'Ongoing',
        className: 'status ongoing'
      };
    case 'done':
      return {
        text: 'Completed',
        className: 'status completed'
      };
    default:
      return {
        text: 'Unknown',
        className: 'status unknown'
      };
  }
};

/**
 * Format match start time for display
 * @param {string} matchStartTime - ISO string of match start time
 * @returns {string} - Formatted date string
 */
export const formatMatchStartTime = (matchStartTime) => {
  if (!matchStartTime) return 'TBD';
  
  const date = new Date(matchStartTime);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
