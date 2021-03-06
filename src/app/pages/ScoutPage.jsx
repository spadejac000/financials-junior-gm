import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  PlayerDropContainer,
  PlayerDragItem,
  HeaderComponent,
  PlayerCard,
  ScoutingCompleteOverlay,
  Overlay,
  PlayerDetailsOverlay,
  LoadingSpinner,
  BadScoutOverlay,
} from '@components';
import scoutStick from '@images/scout-stick.svg';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { scoutSlides, SharkieButton, Tutorial } from '@tutorial';
import { useHistory } from 'react-router-dom';
import { PageBoard } from './../components/PageBoard';
import {
  setTutorialState,
  updateScoutPlayer,
  toggleOverlay,
  scoutingComplete,
} from '@redux/actions';
import { isEqual } from 'lodash';
import { getMoneyLevels } from '@utils';
import { updatePlayerOnServer } from '@data/players/players-service';
import { cloneDeep } from 'lodash';
import { PlayerAssignments } from '@data/players/players';
import '@css/pages/ScoutPage.css';

const boardMap = {
  available: {},
  levelOne: {},
  levelTwo: {},
  levelThree: {},
};

const ScoutPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const tutorialActive = useSelector((state) => state.tutorial.isActive);
  const student = useSelector((state) => state.studentState.student);
  const { scoutPlayers, scoutingState } = useSelector((state) => state.players);
  const availablePlayersAnimationState = useSelector(
    (state) => state.tutorial.scout.availablePlayersBoard
  );
  const finishedBtnAnimationState = useSelector(
    (state) => state.tutorial.scout.finishedBtn
  );
  const moneyLevelAnimationStates = useMemo(() => ({}), []);
  moneyLevelAnimationStates[0] = useSelector(
    (state) => state.tutorial.scout.moneyLevel1
  );
  moneyLevelAnimationStates[1] = useSelector(
    (state) => state.tutorial.scout.moneyLevel2
  );
  moneyLevelAnimationStates[2] = useSelector(
    (state) => state.tutorial.scout.moneyLevel3
  );

  const [availablePlayersBoard, setAvailablePlayersBoard] = useState([]);
  const [offeredPlayersBoard, setOfferedPlayersBoard] = useState([]);

  // Local methods
  const onTutorialComplete = () => {
    dispatch(setTutorialState({ isActive: false }));
  };

  const showPlayerDetails = useCallback(
    (player) => {
      dispatch(
        toggleOverlay({
          isOpen: true,
          template: (
            <PlayerDetailsOverlay
              player={player}
              includeActions={false}
              student={student}
            />
          ),
        })
      );
    },
    [dispatch, student]
  );

  const getDroppableItem = useCallback(
    (player, key, small = false) => {
      const level = key.split('-')[0];
      boardMap[level][key] = player;

      const isEmpty = !player && level === 'available';
      const playerCard = !isEmpty ? (
        player ? (
          <Draggable
            key={player.playerName}
            draggableId={player.playerName}
            index={0}
            className='draggable-player'
          >
            {(dragProvided, dragSnapshot) => (
              <div
                style={
                  small && !dragSnapshot.isDragging
                    ? {
                        transform: 'scale(0.85)',
                      }
                    : {}
                }
              >
                <PlayerDragItem
                  small={small}
                  provided={dragProvided}
                  innerRef={dragProvided.innerRef}
                  player={player}
                  isDragging={dragSnapshot.isDragging}
                  onClick={showPlayerDetails.bind(this, player)}
                ></PlayerDragItem>
              </div>
            )}
          </Draggable>
        ) : (
          <div style={small ? { transform: 'scale(0.85)' } : {}}>
            <PlayerCard key={`${key}-empty`} />
          </div>
        )
      ) : (
        <div className='empty-player-slot'></div>
      );

      return (
        <div
          key={`${key}-droppable-wrap`}
          className={`player-card-drop${
            small ? ' player-card-drop-small' : ''
          }`}
          style={
            !!player && level !== 'available'
              ? {
                  position: 'relative',
                  top: '-7px',
                }
              : {}
          }
        >
          <Droppable
            key={`${key}-droppable`}
            droppableId={`${key}`}
            isDropDisabled={!!player}
          >
            {(dropProvided, dropSnapshot) => (
              <>
                <PlayerDropContainer
                  provided={dropProvided}
                  innerRef={dropProvided.innerRef}
                  player={player}
                  isDraggingOver={dropSnapshot.isDraggingOver}
                >
                  {playerCard}
                </PlayerDropContainer>
              </>
            )}
          </Droppable>
        </div>
      );
    },
    [showPlayerDetails]
  );

  const getAvailablePlayersBoard = useCallback(
    (_players) => {
      if (!scoutPlayers.available) {
        return;
      }

      const availablePlayers = [];
      for (let i = 0; i < Math.max(9, scoutPlayers.available.length); i++) {
        availablePlayers.push(getDroppableItem(_players[i], `available-${i}`));
      }

      let availablePlayerRowIndex = 0;
      return availablePlayers
        .reduce((rows, p, i) => {
          if (rows[availablePlayerRowIndex]) {
            rows[availablePlayerRowIndex].push(p);
          } else {
            rows.push([p]);
          }
          if ((i + 1) % 3 === 0) {
            availablePlayerRowIndex++;
          }
          return rows;
        }, [])
        .map((row, j) => (
          <div
            key={`available-player-row-${j}`}
            className='available-player-row'
          >
            {row.map((p) => p)}
          </div>
        ));
    },
    [scoutPlayers.available, getDroppableItem]
  );

  const getOfferedPlayersBoard = useCallback(
    (_levelOne, _levelTwo, _levelThree, moneyLevels) => {
      if (!moneyLevels) {
        return;
      }

      const levelOnePlayers = [];
      const levelTwoPlayers = [];
      const levelThreePlayers = [];

      for (let i = 0; i < Math.max(2, scoutPlayers.levelOne.length); i++) {
        levelOnePlayers.push(getDroppableItem(_levelOne[i], `levelOne-${i}`));
      }

      for (let i = 0; i < Math.max(3, scoutPlayers.levelTwo.length); i++) {
        levelTwoPlayers.push(getDroppableItem(_levelTwo[i], `levelTwo-${i}`));
      }

      for (let i = 0; i < Math.max(4, scoutPlayers.levelThree.length); i++) {
        levelThreePlayers.push(
          getDroppableItem(_levelThree[i], `levelThree-${i}`, true)
        );
      }

      const offeredPlayers = [
        levelOnePlayers,
        levelTwoPlayers,
        levelThreePlayers,
      ];
      return offeredPlayers.map((row, i) => (
        <div
          key={`offered-player-row-${i}`}
          className='offered-player-row-wrap'
        >
          <span className='money-level-short color-primary'>
            {moneyLevels[i].short}
          </span>
          <p className={`money-level-text money-level-text-${i}`}>
            These players get a {moneyLevels[i].long} offered
          </p>
          <motion.div
            className='offered-player-row'
            animate={moneyLevelAnimationStates[i]}
          >
            <div className={`offered-player-row-inner level-${i + 1}`}>
              {row.map((p) => p)}
            </div>
          </motion.div>
        </div>
      ));
    },
    [moneyLevelAnimationStates, scoutPlayers, getDroppableItem]
  );

  const onPlayerDropped = (e) => {
    // find the dropped player in the board map
    if (!e.destination || !e.source) {
      return;
    }

    const dropLevel = e.destination.droppableId.split('-')[0];
    const sourceLevel = e.source.droppableId.split('-')[0];
    const droppedPlayer = boardMap[sourceLevel][e.source.droppableId];

    if (droppedPlayer.overallRank >= 15 && dropLevel === 'levelThree') {
      dispatch(
        toggleOverlay({
          isOpen: true,
          template: <BadScoutOverlay />,
        })
      );
      return;
    }

    // update the map where the player was dropped
    boardMap[dropLevel][e.destination.droppableId] = droppedPlayer;

    // update the slot the player was moved from
    boardMap[sourceLevel][e.source.droppableId] = null;

    // update scouting state
    dispatch(
      updateScoutPlayer({
        [dropLevel]: Object.keys(boardMap[dropLevel]).map(
          (k) => boardMap[dropLevel][k]
        ),
        [sourceLevel]: Object.keys(boardMap[sourceLevel]).map(
          (k) => boardMap[sourceLevel][k]
        ),
      })
    );
  };

  const handleScoutingInvalid = () => {
    console.log('INVALID SCOUTING');
  };

  const handleScoutingComplete = () => {
    const moneyLevels = getMoneyLevels(student.level || 1);

    const levelOneCloned = cloneDeep(scoutPlayers.levelOne);
    const levelTwoCloned = cloneDeep(scoutPlayers.levelTwo);
    const levelThreeCloned = cloneDeep(scoutPlayers.levelThree);

    levelOneCloned.forEach((p) => {
      p.playerCost = moneyLevels[0].num;
      p.playerAssignment = PlayerAssignments.MARKET;
    });
    levelTwoCloned.forEach((p) => {
      p.playerCost = moneyLevels[1].num;
      p.playerAssignment = PlayerAssignments.MARKET;
    });
    levelThreeCloned.forEach((p) => {
      p.playerCost = moneyLevels[2].num;
      p.playerAssignment = PlayerAssignments.MARKET;
    });

    updatePlayerOnServer(null)
      .then((res) => {
        dispatch(
          toggleOverlay({
            isOpen: true,
            template: <ScoutingCompleteOverlay />,
            canClose: false,
          })
        );
        dispatch(
          scoutingComplete(levelOneCloned, levelTwoCloned, levelThreeCloned)
        );
        window.setTimeout(() => {
          history.push('/team');
          dispatch(
            toggleOverlay({
              isOpen: false,
              template: null,
              canClose: true,
            })
          );
        }, 5000);
      })
      .catch((err) => console.error(err));
  };

  const validateScouting = () => {
    // check that the available board is empty
    if (!Object.keys(boardMap.available).some((k) => !!boardMap.available[k])) {
      handleScoutingComplete();
    } else {
      handleScoutingInvalid();
    }
  };

  const setBoards = useCallback(
    (available, offered) => {
      if (!scoutPlayers.available) {
        return;
      }

      if (available) {
        setAvailablePlayersBoard(
          getAvailablePlayersBoard(scoutPlayers.available)
        );
      }
      console.log('STUDENT:::: ', student, getMoneyLevels(student.level));
      if (offered) {
        setOfferedPlayersBoard(
          getOfferedPlayersBoard(
            scoutPlayers.levelOne,
            scoutPlayers.levelTwo,
            scoutPlayers.levelThree,
            getMoneyLevels(student.level || 1)
          )
        );
      }
    },
    [student, getAvailablePlayersBoard, getOfferedPlayersBoard, scoutPlayers]
  );

  const prevAvailableRef = useRef(null);
  const prevL1Ref = useRef(null);
  const prevL2Ref = useRef(null);
  const prevL3Ref = useRef(null);
  useEffect(() => {
    if (!scoutPlayers.available) {
      return;
    }

    const setAvailable = !isEqual(
      scoutPlayers.available,
      prevAvailableRef.current
    );

    const setOffered =
      !isEqual(scoutPlayers.levelOne, prevL1Ref.current) ||
      !isEqual(scoutPlayers.levelTwo, prevL2Ref.current) ||
      !isEqual(scoutPlayers.levelThree, prevL3Ref.current);

    setBoards(setAvailable, setOffered);

    prevAvailableRef.current = scoutPlayers.available;
    prevL1Ref.current = scoutPlayers.levelOne;
    prevL2Ref.current = scoutPlayers.levelTwo;
    prevL3Ref.current = scoutPlayers.levelThree;
  }, [setBoards, scoutPlayers]);

  return scoutPlayers.available ? (
    <div className='page-container scout-page-container'>
      <HeaderComponent
        stickBtn={scoutStick}
        largeStick={true}
        objectives={['1. Scout players to sign to your bench!']}
        level={student.level}
      />
      <PageBoard hideCloseBtn={true} includeBackButton={true}>
        <div className='scout-page-board-header'>
          <p className='color-primary scout-page-helper-text'>
            Give each new player a offered value by dragging them to their money
            level!
          </p>
          <span
            style={{ position: 'absolute', right: '0.5rem', top: '0.25rem' }}
          >
            <SharkieButton tutorialSlides={[scoutSlides]} textPosition='left' />
          </span>
        </div>

        <DragDropContext onDragEnd={onPlayerDropped}>
          <div className='scout-page-board-inner'>
            <div className='scout-page-board-left'>
              {tutorialActive ? (
                <motion.div
                  className='scout-board'
                  animate={availablePlayersAnimationState}
                  transition={{ default: { duration: 1 } }}
                >
                  {availablePlayersBoard}
                </motion.div>
              ) : (
                <div className='scout-board'>{availablePlayersBoard}</div>
              )}
            </div>

            <div className='scout-page-board-right'>
              <div style={{ position: 'relative', top: '-13px' }}>
                {offeredPlayersBoard}
              </div>
            </div>
          </div>
        </DragDropContext>
        <div className='scout-page-board-footer'>
          <p className='color-primary'>
            Remember to tap a player to learn more about them!
          </p>
          <motion.div
            className='color-primary finished-btn'
            animate={finishedBtnAnimationState}
          >
            <div
              className={scoutingState.isComplete ? 'disabled' : ''}
              onClick={() => {
                if (!scoutingState.isComplete) {
                  validateScouting();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <span>Click here when you finish!</span>
              <div className='check-btn-small'></div>
            </div>
          </motion.div>
        </div>
      </PageBoard>
      <Overlay />
      {tutorialActive && (
        <Tutorial slides={[scoutSlides]} onComplete={onTutorialComplete} />
      )}
    </div>
  ) : (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LoadingSpinner />
    </div>
  );
};

export default ScoutPage;
