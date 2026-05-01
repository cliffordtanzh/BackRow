import './FieldInput.css';


type FieldInputProps = {
  setField: (value: any) => void
  password?: boolean
  value?: string
  placeholder?: string
}


function FieldInput({ 
  setField, 
  password = false, 
  value = '',
  placeholder = ''
}: FieldInputProps) {
  const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
    setField(event.target.value)
  }

  return (
    <input 
      type={password ? 'password' : 'text'}
      className='field-input'
      value={value}
      placeholder={placeholder}
      onChange={updateField}
    />
  )
};

export default FieldInput;