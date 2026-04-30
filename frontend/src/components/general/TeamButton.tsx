import './TeamButton.css';


type teamButtonProps = {
  label: string,
  onClick: () => void
}

function TeamButton({
  label,
  onClick,
}: teamButtonProps) {
  const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1)

  return (
    <div>
      <button 
        className='team-button'
        onClick={onClick}
        >{formattedLabel}</button>
    </div>
  )
}

export default TeamButton;