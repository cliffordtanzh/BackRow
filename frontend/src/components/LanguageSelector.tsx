import type { Lang } from '../types/Lang.ts';
import './LanguageSelector.css';


type languageSelectorProps = {
  lang: Lang;
  setLang: React.Dispatch<React.SetStateAction<Lang>>
}


function LanguageSelector({
  lang,
  setLang,
}: languageSelectorProps) {
  return (
    <div className='language-selector'>
      <button 
        className='language-selector__button'
        onClick={() => setLang((prev) => (prev === 'cn' ? 'en' : 'cn'))}
        >{lang === 'en' ? '中文' : 'English'}</button>
    </div>
  )
}

export default LanguageSelector;