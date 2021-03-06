import {
  OverlayBoard,
  TeamBudgetState,
  MarketPlayersBoard,
  PlayerChangeSuccessOverlay,
} from '@components';
import { useDispatch } from 'react-redux';
import { toggleOverlay, signPlayer, setStudent } from '@redux/actions';
import { ConfirmSignOverlay } from './ConfirmSignOverlay';
import { getPlayerPositon } from '@utils';
import { updateStudentById } from '../../api-helper';
import { cloneDeep } from 'lodash';
import '@css/components/team-page/SignPlayerOverlay.css';

const getAvailableSlots = (props, team) => {
  return props.reduce((total, p) => {
    if (!team[p]) {
      total++;
    }
    return total;
  }, 0);
};

export const SignPlayerOverlay = ({ team, assignment, student }) => {
  const dispatch = useDispatch();

  const availableSlots = {
    forwards: getAvailableSlots(['fOne', 'fTwo', 'fThree'], team),
    defender: getAvailableSlots(['dOne', 'dTwo'], team),
    goalie: getAvailableSlots(['gOne'], team),
    bench: getAvailableSlots(['benchOne', 'benchTwo', 'benchThree'], team),
  };

  const signCancelled = () => {
    dispatch(
      toggleOverlay({
        isOpen: true,
        template: (
          <SignPlayerOverlay
            team={team}
            assignment={assignment}
            student={student}
          />
        ),
      })
    );
  };

  const signConfirmed = (signedPlayer) => {
    signedPlayer.playerAssignment = assignment;

    const playersCopy = cloneDeep(student.players);
    playersCopy.splice(
      playersCopy.findIndex((p) => p._id === signedPlayer._id),
      1,
      signedPlayer
    );

    updateStudentById(student._id, {
      [assignment]: signedPlayer._id,
      players: playersCopy,
    })
      .then((res) => {
        dispatch(signPlayer(signedPlayer, assignment));
        dispatch(setStudent(res.updatedStudent));
        dispatch(
          toggleOverlay({
            isOpen: true,
            template: (
              <PlayerChangeSuccessOverlay
                player={signedPlayer}
                message=' Player has been signed!'
              />
            ),
          })
        );
      })
      .catch((err) => console.error(err));
  };

  const confirmSign = (player) => {
    dispatch(
      toggleOverlay({
        isOpen: true,
        template: (
          <ConfirmSignOverlay
            player={player}
            position={assignment}
            confirm={signConfirmed.bind(this, player)}
            cancel={signCancelled}
          />
        ),
      })
    );
  };

  return (
    <OverlayBoard>
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: '3rem 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className='sign-player-overlay-top' style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <TeamBudgetState />
          </div>
          <div style={{ flex: 1 }}>
            <h3
              className='color-primary'
              style={{
                fontSize: '1.5rem',
              }}
            >
              Spaces On Your Team
            </h3>
            <div className='team-slots-board'>
              <div className='team-slots-board-row'>
                <span className='color-primary'>Forwards:</span>
                <span className='color-accent'>{availableSlots.forwards}</span>
              </div>
              <div className='team-slots-board-row'>
                <span className='color-primary'>Defenders:</span>
                <span className='color-accent'>{availableSlots.defender}</span>
              </div>
              <div className='team-slots-board-row'>
                <span className='color-primary'>Goalie:</span>
                <span className='color-accent'>{availableSlots.goalie}</span>
              </div>
              <div className='team-slots-board-row'>
                <span className='color-primary'>Bench:</span>
                <span className='color-accent'>{availableSlots.bench}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='market-players-board-container'>
          <MarketPlayersBoard
            initialPosition={getPlayerPositon(assignment)}
            onPlayerCardClick={confirmSign}
            student={student}
          />
        </div>
      </div>
    </OverlayBoard>
  );
};
