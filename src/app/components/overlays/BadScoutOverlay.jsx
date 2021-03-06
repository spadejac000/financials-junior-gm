import { OverlayBoard } from '@components';
import { toggleOverlay } from '@redux/actions';
import { useDispatch } from 'react-redux';
import '@css/components/overlay-btns.css';

export const BadScoutOverlay = () => {
  const dispatch = useDispatch();

  const closeOverlay = () => {
    dispatch(
      toggleOverlay({
        isOpen: false,
        template: null,
      })
    );
  };

  return (
    <OverlayBoard>
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: '6rem 0 3rem 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h3
            className='color-primary'
            style={{ marginBottom: '2rem', fontSize: '2.15rem' }}
          >
            The contract you are offering this player is not high enough!
          </h3>
          <p className='color-primary' style={{ fontSize: '1.75rem' }}>
            Try putting them in a higher level to offer them more money.
          </p>
        </div>
        <div className='overlay-buttons-wrap'>
          <div className={`box-shadow overlay-btn`} onClick={closeOverlay}>
            <div className='overlay-btn-inner'>
              <span className='outline-black'>Try Again</span>
            </div>
          </div>
        </div>
      </div>
    </OverlayBoard>
  );
};
