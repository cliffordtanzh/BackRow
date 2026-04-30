import type { Response } from "../../types/Response"

import './ErrorMessage.css'

type errorMessageProps = { response: Response }


function ErrorMessage({ response }: errorMessageProps) {
  const { message, fade } = response

  return (
    <div key={`stats: ${message}`} className={`error-message ${fade ? 'fade-out' : ''}`}>
      <div className='error-message__text'>{message}</div>
    </div>
  )
}

export default ErrorMessage