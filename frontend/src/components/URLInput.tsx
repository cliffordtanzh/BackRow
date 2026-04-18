import './URLInput.css';


type URLInputProps = {
    setVideoURL: React.Dispatch<React.SetStateAction<string>>
}

function URLInput({setVideoURL}: URLInputProps) {
  const updateURL = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVideoURL(event.target.value)
  }

  return (
    <input 
      className='team-page__url-input' 
      placeholder='YouTube URL'
      onChange={updateURL}
    />
  )
};

export default URLInput;