import { TeamBudgetState, ConfirmOverlay, PlayerCard } from '@components';

export const ConfirmReleaseOverlay = ({ cancel, confirm, player }) => {
  return (
    <ConfirmOverlay
      message='Are you sure you want to release this player?'
      cancel={cancel}
      confirm={confirm}
    >
      <div className='confirm-release-overlay'>
        <div style={{ display: 'flex', padding: '2rem 3rem 0 3rem' }}>
          <div style={{ flex: 1, marginRight: '3rem' }}>
            <TeamBudgetState title='Changes to Rank and Budget' />
          </div>
          <div style={{ flex: 1 }}>
            <PlayerCard size='medium' player={player} />
          </div>
        </div>
      </div>
    </ConfirmOverlay>
  );
};
