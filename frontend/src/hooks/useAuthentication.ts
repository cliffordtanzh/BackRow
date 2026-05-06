import { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";

import { type Role, DEFAULT_ROLE } from "../types/Role";
import { type JwtPayload } from "../types/JwtPayload";


function useAuthentication(): [
  string | null,
  React.Dispatch<React.SetStateAction<string | null>>,
  Role,
  React.Dispatch<React.SetStateAction<Role>>,
] {
  const [jwtToken, setJwtToken] = useState<string | null>(localStorage.getItem('jwtToken'));
  const [authorisation, setAuthorisation] = useState<Role>(DEFAULT_ROLE);

  useEffect(() => {
    if (jwtToken !== null) {
      const decoded = jwtDecode<JwtPayload>(jwtToken);
      setAuthorisation(decoded['role'])

      localStorage.setItem('playerID', String(decoded['playerID']))
      localStorage.setItem('playerName', decoded['playerName'])
      localStorage.setItem('teamID', String(decoded['teamID']))
      localStorage.setItem('teamName', decoded['teamName'])
    }
  }, [jwtToken])

  return [jwtToken, setJwtToken, authorisation, setAuthorisation]
}

export default useAuthentication;