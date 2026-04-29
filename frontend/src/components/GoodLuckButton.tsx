import './GoodLuckButton.css';


function GoodLuckButton() {
    return (
        <div className='goodluck-button'>
            <button 
                className='goodluck-button__button'
                onMouseUp={e => e.currentTarget.blur()}
            >Good Luck</button>
        </div>
    )
}

export default GoodLuckButton