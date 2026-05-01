import { type Lang } from '../../types/Lang';

import './LanguageSelector.css';


type LanguageSelectorProps = {
  lang: Lang,
  setLang: React.Dispatch<React.SetStateAction<Lang>>
}


function LanguageSelector({ lang, setLang }: LanguageSelectorProps) {
  const updateLang = () => {
    const lang = localStorage.getItem('lang');
    
    localStorage.setItem('lang', lang === 'en' ? 'cn' : 'en')
    setLang(lang === 'en' ? 'cn' : 'en');
  }

  return (
    <div className='language-selector'>
      <button 
        className='language-selector__button'
        onClick={updateLang}
        >{lang === 'en' ? '中文' : 'English'}</button>
    </div>
  )
}

export default LanguageSelector;