import './SuccessMessage.css'


type successMessageProps = {
  success: string | null
}


function SuccessMessage({ success }: successMessageProps) {
  return (
    <div key={`stats: ${success}`} className='success-message'>
      <div className='success-message__text'>{success}</div>
    </div>
  )
}

export default SuccessMessage