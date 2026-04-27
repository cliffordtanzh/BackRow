import './FieldInput.css';


type FieldInputProps = {
  setField: React.Dispatch<React.SetStateAction<string>>
  placeholder: string
}

function FieldInput({ setField, placeholder }: FieldInputProps) {
  const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
    setField(event.target.value)
  }

  return (
    <input 
      className='team-page__field-input' 
      placeholder={placeholder}
      onChange={updateField}
    />
  )
};

export default FieldInput;