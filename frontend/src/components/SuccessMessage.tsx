import './SuccessMessage.css'


type successMessageProps = {
  success: string | null
  fade: boolean
}


function SuccessMessage({ success, fade }: successMessageProps) {
  return (
    <div className={`success-message ${fade ? 'fade-out' : ''}`}>
      <div className='success-message__text'>{success}</div>
    </div>
  )
}

export default SuccessMessage