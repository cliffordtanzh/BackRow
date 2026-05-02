import { useState, useEffect } from 'react';
import axios from 'axios';

import { type Lang } from '../types/Lang';
import { type Player, DEFAULT_PLAYER } from '../types/Player';
import { type Team, DEFAULT_TEAM } from '../types/Team';
import { type Response, DEFAULT_RESPONSE } from '../types/Response';

import responses from '../assets/responses.json'


export function useEntity(lang: Lang, entityName: 'player' | 'team'):[
  Team[] | Player[],
  Team | Player,
  React.Dispatch<React.SetStateAction<Team | Player>>,
  Response,
  () => void,
] {
  const[entity, setEntity] = useState<Team[] | Player[]>([])
  const[selectedEntity, setSelectedEntity] = useState<Team | Player>(
    entityName === 'player' ? DEFAULT_PLAYER : DEFAULT_TEAM
  )

  const[entityError, setEntityError] = useState<Response>(DEFAULT_RESPONSE);

  const fetchEntities = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/${entityName}`)
    .then((resp) => setEntity(resp.data.data))
    .catch((resp) => {
      const response_key: string = resp.response.data.detail.split(': ')[1]
      setEntityError((prev) => ({
        ...prev, 
        message: responses[response_key as keyof typeof responses][lang]
      }))
    })
  }

  useEffect(() => { fetchEntities() }, [])
  useEffect(() => {

    if((entity.length > 0) && (localStorage.getItem(`${entityName}ID`))) {
      const entityID = Number(localStorage.getItem(`${entityName}ID`))

      setSelectedEntity((
        entity.find((entity) => entity.ID === entityID) || entity[0]
      ))
    }

    else if(entity.length > 0) {
      setSelectedEntity(entity[0])
    }

  }, [entity])
  
  return [ entity, selectedEntity, setSelectedEntity, entityError, fetchEntities ]
}