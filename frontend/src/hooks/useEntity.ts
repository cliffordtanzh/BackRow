import { useState, useEffect } from 'react';
import axios from 'axios';

import { type Lang } from '../types/Lang';
import { type Player, DEFAULT_PLAYER } from '../types/Player';
import { type Team, DEFAULT_TEAM } from '../types/Team';
import { type Response, DEFAULT_RESPONSE } from '../types/Response';

import responses from '../assets/responses.json'


type EntityMap = {
  team: Team,
  player: Player
}


export function useEntity<K extends keyof EntityMap>(
  lang: Lang, 
  entityName: K
):[
  EntityMap[K][],
  EntityMap[K],
  React.Dispatch<React.SetStateAction<EntityMap[K]>>,
  Response,
  () => void,
] {
  const[entity, setEntity] = useState<EntityMap[K][]>([])
  const[selectedEntity, setSelectedEntity] = useState<EntityMap[K]>(
    entityName === 'player' ? DEFAULT_PLAYER as EntityMap[K]: DEFAULT_TEAM as EntityMap[K]
  )

  const[entityError, setEntityError] = useState<Response>(DEFAULT_RESPONSE);

  const fetchEntities = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/${entityName}`)
    .then((resp) => setEntity(resp.data.data))
    .catch((resp) => {
      const responseKey: string = resp.response.data.detail.split(': ')[1]
      setEntityError((prev) => ({
        ...prev, 
        message: responses[responseKey as keyof typeof responses][lang]
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