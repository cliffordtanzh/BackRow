import { useState } from 'react';

import SuccessMessage from './SuccessMessage';
import ErrorMessage from './ErrorMessage';
import Selector from './Selector';

import type { Lang } from '../types/Lang';

import headers from '../assets/headers.json';
import roleHeaders from '../assets/role_inputs.json';

import './ManageInputs.css'


type manageRoleProps = {
  lang: Lang
  chooseProps: (header: string) => any
}


function ManageRole({ 
  lang,
  chooseProps,
}: manageRoleProps) {

  const[error, setError] = useState<string | null>(null);
  const[success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
  }

  return (
    <div className='manage-inputs'>
      <form onSubmit={handleSubmit}>
        <div className='role_manage-inputs'>
          {
            roleHeaders.map((header) => (
              <div key={header['en']} className='manage-inputs__field'>
                <label className='manage-inputs__label'>{header[lang]}</label>
                <Selector {...chooseProps(header['key'])}/>
              </div>
            ))
          }
        </div>

        <div className='manage-inputs__field'>
          <button className='manage-inputs__submit' type='submit'>
            {headers['manage_submit_button'][lang]}
          </button>
          {error && <ErrorMessage error={error}/>}
          {success && <SuccessMessage success={success}/>}
        </div>

      </form>
  </div>
  )
}

export default ManageRole;