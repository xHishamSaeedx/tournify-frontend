// Profile validation utilities for Valorant tournaments

/**
 * Check if a user's basic profile is complete
 * @param {Object} playerData - The player data from the API
 * @returns {boolean} - True if basic profile is complete
 */
export const isBasicProfileComplete = (playerData) => {
  if (!playerData) return false;

  return !!(
    playerData.display_name &&
    playerData.username &&
    playerData.DOB &&
    playerData.VPA
  );
};

/**
 * Check if a user's Valorant profile is complete
 * @param {Object} playerData - The player data from the API
 * @returns {boolean} - True if Valorant profile is complete
 */
export const isValorantProfileComplete = (playerData) => {
  if (!playerData) return false;

  // Check if basic profile is complete
  if (!isBasicProfileComplete(playerData)) {
    return false;
  }

  // Check if Valorant data exists and is complete
  // The data is now in valorant_users array (one-to-one relationship)
  const valorantData = playerData.valorant_users && playerData.valorant_users[0];

  if (!valorantData) return false;

  return !!(
    valorantData.valorant_name &&
    valorantData.valorant_tag &&
    valorantData.platform &&
    valorantData.region
  );
};

/**
 * Get missing fields for Valorant profile
 * @param {Object} playerData - The player data from the API
 * @returns {Object} - Object with missing fields categorized
 */
export const getMissingValorantFields = (playerData) => {
  const missing = {
    basic: [],
    valorant: [],
  };

  if (!playerData) {
    missing.basic = ["display_name", "username", "DOB", "VPA"];
    missing.valorant = ["valorant_name", "valorant_tag", "platform", "region"];
    return missing;
  }

  // Check basic fields
  if (!playerData.display_name) missing.basic.push("display_name");
  if (!playerData.username) missing.basic.push("username");
  if (!playerData.DOB) missing.basic.push("DOB");
  if (!playerData.VPA) missing.basic.push("VPA");

  // Check Valorant fields
  const valorantData = playerData.valorant_users && playerData.valorant_users[0];
  if (!valorantData) {
    missing.valorant = ["valorant_name", "valorant_tag", "platform", "region"];
  } else {
    if (!valorantData.valorant_name) missing.valorant.push("valorant_name");
    if (!valorantData.valorant_tag) missing.valorant.push("valorant_tag");
    if (!valorantData.platform) missing.valorant.push("platform");
    if (!valorantData.region) missing.valorant.push("region");
  }

  return missing;
};

/**
 * Get a user-friendly message about missing profile fields
 * @param {Object} playerData - The player data from the API
 * @returns {string} - User-friendly message about missing fields
 */
export const getProfileCompletionMessage = (playerData) => {
  const missing = getMissingValorantFields(playerData);

  if (missing.basic.length > 0 && missing.valorant.length > 0) {
    return "Please complete your basic profile and Valorant information to join tournaments.";
  } else if (missing.basic.length > 0) {
    return "Please complete your basic profile information to join tournaments.";
  } else if (missing.valorant.length > 0) {
    return "Please complete your Valorant profile information to join tournaments.";
  }

  return "Your profile is complete!";
};
