import { type Response } from '../../types/Response'

import './SuccessMessage.css'


type SuccessMessageProps = {response: Response}


function SuccessMessage({ response }: SuccessMessageProps) {
  const { message, fade } = response;

  return (
    <div className={`success-message ${fade ? 'fade-out' : ''}`}>
      <div className='success-message__text'>{message}</div>
    </div>
  )
}

export default SuccessMessage