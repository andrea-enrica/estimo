import {LocalStorageProperties} from "../utils/Enums";

export const getAuthenticatedUserClaim = (
  claim: keyof typeof LocalStorageProperties
) => {
  try {
    return localStorage.getItem(LocalStorageProperties[claim]);
  } catch (error) {
    alert(`Error retrieving user claim ${claim}: ${error}`);
    return null;
  }
};

export const getAuthenticatedUserDecodedToken = () => {
  try {
    const token = localStorage.getItem(LocalStorageProperties.token);
    if (token) {
      return JSON.parse(atob(token.split(".")[1]));
    } else {
      return null;
    }
  } catch (error) {
    alert(`Error retrieving token: ${error}`);
    return null;
  }
};

export const clearAuthenticatedUserData = () => {
  localStorage.removeItem(LocalStorageProperties.token);
  localStorage.removeItem(LocalStorageProperties.role);
  localStorage.removeItem(LocalStorageProperties.id);
  localStorage.removeItem(LocalStorageProperties.email);
};
