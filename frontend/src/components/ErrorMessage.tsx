type errorMessageProps = {
  error: string | null
}


function ErrorMessage({ error }: errorMessageProps) {
  return (
    <div key={`stats: ${error}`} className='error-message'>
      <div className='error-message__text'>{error}</div>
    </div>
  )
}

export default ErrorMessage