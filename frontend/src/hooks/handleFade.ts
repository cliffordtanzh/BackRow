import { useEffect } from 'react'


export function handleFade(
  field: string | null, 
  setField: React.Dispatch<React.SetStateAction<string | null>>, 
  setFade:  React.Dispatch<React.SetStateAction<boolean>>, 
) {
  useEffect(() => {
    if (field) {
      const fadeTimer = setTimeout(() => setFade(true), 100);
      const timer = setTimeout(() => setField(null), 2000);
      return () => {
        clearTimeout(timer);
        clearTimeout(fadeTimer);
      }
    }
  }, [field])
}

export default handleFade