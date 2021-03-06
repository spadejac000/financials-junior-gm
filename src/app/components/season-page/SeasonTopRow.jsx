import React from 'react'
import { ReactSVG } from 'react-svg';
import {LevelStick} from '../LevelStick'
import jrSharksLogoWhiteBg from '@images/icons/jr-sharks-logo-white-bg.svg';
import { InitialJumbotronState } from './InitialJumbotronState';
import {PlayingGame} from './PlayingGame'
import {TeamWon} from './TeamWon'
import {SeasonTopRowSign} from './SeasonTopRowSign';
import { useSelector} from 'react-redux';

export const SeasonTopRow = (jumbotronDisplay) => {

  // const jumbotronDisplay = useSelector((state) => {
  //   return state.season.jumbotronDisplay
  // });

  return (
    <div className='season-dashboard-top-row'>
      <div style={{ paddingTop: '1rem' }}>
        <LevelStick type='teamRank' />
      </div>
      <div>
        <div className='teams-jumbotron'>
          <div className='season-team-left-border'></div>
          <div className='season-teams-playing-box'>
            {jumbotronDisplay}
          </div>
          <div className='season-team-right-border'></div>
        </div>
        <SeasonTopRowSign/>
      </div>
      <div style={{ paddingTop: '1rem' }}>
        <LevelStick type="opponentTeamRank"/>
      </div>
    </div>
  )
}
