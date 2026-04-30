import './FieldInput.css';


type FieldInputProps = {
  setField: (value: any) => void
  placeholder?: string
  password?: boolean
}


function FieldInput({ 
  setField, 
  password = false, 
  placeholder = ''
}: FieldInputProps) {
  const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
    setField(event.target.value)
  }

  return (
    <input 
      type={password ? 'password' : 'text'}
      className='field-input'
      placeholder={placeholder}
      onChange={updateField}
    />
  )
};

export default FieldInput;