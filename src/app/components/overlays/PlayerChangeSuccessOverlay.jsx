import { ReactSVG } from 'react-svg';
import { OverlayBoard, PlayerCard, TeamBudgetState } from '@components';
import notepad from '@images/icons/notepaper-pen.svg';

export const PlayerChangeSuccessOverlay = ({ player, message }) => {
  return (
    <OverlayBoard>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          padding: '4rem 0',
        }}
      >
        <h2 className='color-primary' style={{ marginBottom: '2rem' }}>
          {message}
        </h2>
        <div
          className='player-released-overlay-body'
          style={{
            display: 'flex',
            flex: 1,
            width: '100%',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TeamBudgetState isLarge={true} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <PlayerCard size='medium' player={player} />
            </div>
            <div
              style={{
                flex: 0.75,
                transform: 'scale(0.75)',
                transformOrigin: '70% 100%',
              }}
            >
              <ReactSVG src={notepad} />
            </div>
          </div>
        </div>
      </div>
    </OverlayBoard>
  );
};
