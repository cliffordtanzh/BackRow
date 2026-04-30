type errorMessageProps = {
  error: string | null
  fade: boolean
}


function ErrorMessage({ error, fade }: errorMessageProps) {
  return (
    <div key={`stats: ${error}`} className={`error-message ${fade ? 'fade-out' : ''}`}>
      <div className='error-message__text'>{error}</div>
    </div>
  )
}

export default ErrorMessage