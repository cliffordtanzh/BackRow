import './GeneralButton.css';


type GeneralButtonProps = {
  label: string,
  onClick: () => any,
}


function GeneralButton({ label, onClick }: GeneralButtonProps) {
  return (
    <div className='button'>
      <button 
        className='button__button'
        onClick={onClick}
        onMouseUp={e => e.currentTarget.blur()}
      >{label}</button>
    </div>
  )
}

export default GeneralButton