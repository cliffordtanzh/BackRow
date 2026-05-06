import { useState, useEffect } from 'react'

import { type Response } from '../types/Response';
import { DEFAULT_RESPONSE } from '../types/Response';


export function useResponse(): [
  Response,
  React.Dispatch<React.SetStateAction<Response>>,
  Response,
  React.Dispatch<React.SetStateAction<Response>>,
] {
  const [success, setSuccess] = useState<Response>(DEFAULT_RESPONSE);
  const [error, setError] = useState<Response>(DEFAULT_RESPONSE);

  useEffect(() => {
    if (success.message) {
      const fadeTimer = setTimeout(() => setSuccess((prev) => ({...prev, fade: true})), 100);
      const fieldTimer = setTimeout(() => setSuccess(DEFAULT_RESPONSE), 2000);

      return () => {
        clearTimeout(fieldTimer);
        clearTimeout(fadeTimer);
      }
    }
  }, [success.message])

  useEffect(() => {
    if (error.message) {
      const fadeTimer = setTimeout(() => setError((prev) => ({...prev, fade: true})), 100);
      const fieldTimer = setTimeout(() => setError(DEFAULT_RESPONSE), 3000);

      return () => {
        clearTimeout(fieldTimer);
        clearTimeout(fadeTimer);
      }
    }
  }, [error.message])

  return [ success, setSuccess, error, setError ]
}