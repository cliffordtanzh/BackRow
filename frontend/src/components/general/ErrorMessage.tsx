import { type Response } from "../../types/Response"

import './ErrorMessage.css'


type ErrorMessageProps = { response: Response }


function ErrorMessage({ response }: ErrorMessageProps) {
  const { message, fade } = response

  return (
    <div className={`error-message ${fade ? 'fade-out' : ''}`}>
      <div className='error-message__text'>{message}</div>
    </div>
  )
}

export default ErrorMessage