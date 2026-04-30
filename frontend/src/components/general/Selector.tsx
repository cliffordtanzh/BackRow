import { useState, useEffect, useRef } from 'react';

import './Selector.css'


type selectorProps<T> = {
  items: T[],
  selected: T,
  setSelected: React.Dispatch<React.SetStateAction<T>>,
  getID: (item: T) => string | number,
  getName: (item: T) => string,
}


function Selector<T>({
  items,
  selected,
  setSelected, 
  getID,
  getName,
}: selectorProps<T>) {

  const[query, setQuery] = useState<string>(getName(selected));
  const[isOpen, setIsOpen] = useState<boolean>(false);

  const filtered: T[] = items
    .sort((a, b) => {
      const q = query.toLowerCase()
      const aStarts = getName(a).toLowerCase().startsWith(q)
      const bStarts = getName(b).toLowerCase().startsWith(q)

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0
    })
  
  // For closing dropbox when clicking outside the dropbox
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    setQuery(getName(selected))
  }, [selected])
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the menu is open and the click is NOT inside the dropdownRef element
      if (isOpen && ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); // Re-run effect when isOpen changes


  return (
    <div className='selector' ref={ref}>
      <input className='selector__input'
        value={query}
        onChange={(event) => {setQuery(event.target.value); setIsOpen(true)}}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && <ul className='selector__dropdown'>
        {
          filtered.map((item: T) => (
            <li
              key={getID(item)}
              className='selector__option'
              value={getName(item)}
              onClick={() => {setSelected(item); setQuery(getName(item)); setIsOpen(false)}}
            >{getName(item)}</li>
          ))
        }
      </ul>}
    </div>
  )
}

export default Selector;