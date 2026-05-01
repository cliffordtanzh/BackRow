import './StatsButton.css';


type StatsButtonProps = {
  label: string,
  onClick: () => void
}

function StatsButton({
  label,
  onClick,
}: StatsButtonProps) {
  const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1)

  return (
    <div>
      <button 
        className='stats-button'
        onClick={onClick}
        >{formattedLabel}</button>
    </div>
  )
}

export default StatsButton;