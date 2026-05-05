import axios, { endpoints } from 'src/utils/axios';
import { encryptAESSlaes } from 'src/utils/cryptoUtils';

import { useUserStore } from 'src/store';

import { setSession } from './utils';
import { STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  userName: string;
  password: string;
  languageID?: number;
  isMobile?: boolean;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({
  userName,
  password,
  languageID = 1,
  isMobile = false,
}: SignInParams): Promise<void> => {
  try {
    const params = {
      userName: encryptAESSlaes(userName),
      password: encryptAESSlaes(password),
      languageID,
      isMobile,
    };

    // Ensure no old token is sent with the login request
    await setSession(null);

    const res = await axios.post(endpoints.auth.signIn, params);

    const { tokenAsString, userDetails, roles } = res.data;

    const accessToken = tokenAsString;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);

    // Update global store with user details and roles
    if (userDetails?.[0]) {
      useUserStore.getState().setUser({
        ...userDetails[0],
        roles,
        accessToken,
      });
    }
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams): Promise<void> => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
