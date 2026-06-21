/**
 * REED Clothing — Secure API Dispatch Module
 *
 * Provides authenticated HTTP requests to the secured Express backend.
 * Extracts the current admin's Firebase ID token and attaches it
 * as a Bearer token in the Authorization header.
 */

import { auth } from './firebase';

/**
 * Dispatch an authenticated POST request to the Gemini AI generation endpoint.
 *
 * @param userPrompt - The prompt text to send to the AI model
 * @returns The generated text response from the AI model
 * @throws Error if user is not authenticated or request fails
 */
export async function dispatchAIGenerationRequest(userPrompt: string): Promise<string> {
  // 1. Validate the active admin session
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Active admin session required. Please sign in first.');
  }

  // 2. Extract a fresh ID token (force refresh to ensure validity)
  const tokenSignature = await currentUser.getIdToken(true);

  // 3. Forward request with secure Authorization header
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenSignature}`,
    },
    body: JSON.stringify({ prompt: userPrompt }),
  });

  const outputData = await response.json();

  if (!response.ok || !outputData.success) {
    throw new Error(outputData.error || `Request failed with status ${response.status}`);
  }

  return outputData.text;
}

/**
 * Dispatch an authenticated GET request to a secured API endpoint.
 *
 * @param path - The API path (e.g., '/api/health')
 * @returns The JSON response data
 */
export async function secureGet(path: string): Promise<any> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Active admin session required.');
  }

  const token = await currentUser.getIdToken(true);

  const response = await fetch(path, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.json();
}
