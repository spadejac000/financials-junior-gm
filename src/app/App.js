import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Intro from './pages/Intro';
import HomePage from './pages/HomePage';
import TeamPage from './pages/TeamPage';
import Season from './pages/Season';
import ScoutPage from './pages/ScoutPage';
import { IceBackground } from '@components';
import BudgetPage from './pages/BudgetPage';
import Dashboard from './pages/Dashboard';
import TeacherLogin from './pages/login/Teacher.jsx';
import StudentLogin from './pages/login/Student.jsx';
import TeacherDashboard from './pages/TeacherDashboard';
import PageNotFound from './components/page-not-found';
import TeacherPortal from './pages/portal/Teacher';
import StudentPortal from './pages/portal/Student';
import { setStudent, setInitialPlayersState } from '@redux/actions';
import {
  getCurrentUser,
  initPlayersByLevel,
  setInitialTeam,
} from './api-helper';
import '@css/App.css';

const App = () => {
  const dispatch = useDispatch();

  const loginState = useSelector((state) => state.loginState);
  const loginStateRef = useRef(loginState);
  if (
    loginState.role === 'student' &&
    loginState.isLoggedIn &&
    loginState.isLoggedIn !== loginStateRef.current.isLoggedIn
  ) {
    getCurrentUser()
      .then((studentRes) => {
        const student = studentRes.data;
        if (!studentRes.success || !student) {
          console.error(
            new Error('Unexpected error fetching the current user')
          );
          return;
        }
        // don't initialize players if theyre already there
        if (student.players && student.players.length) {
          dispatch(setStudent(student));
          dispatch(setInitialPlayersState(student.players, student));
          return;
        }

        // initialize players on student
        initPlayersByLevel(student.level)
          .then((initializedStudentRes) => {
            if (!initializedStudentRes.success || !initializedStudentRes.data) {
              console.error(new Error('Unexpected error initializing players'));
              return;
            }

            // update the student with the hard coded initial team
            setInitialTeam(initializedStudentRes.data)
              .then((updatedStudentRes) => {
                if (
                  !updatedStudentRes.success ||
                  !updatedStudentRes.updatedStudent
                ) {
                  console.error(
                    new Error('Unexpected error initializing team')
                  );
                  return;
                }
                dispatch(setStudent(updatedStudentRes.updatedStudent));
                dispatch(
                  setInitialPlayersState(
                    updatedStudentRes.updatedStudent.players,
                    updatedStudentRes.updatedStudent
                  )
                );
              })
              .catch((err) => console.error(err));
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  }
  loginStateRef.current = loginState;

  return (
    <div className='app-container'>
      <Router>
        <Switch>
          <Route exact path='/' component={Intro} />
          <Route
            exact
            path='/home'
            render={(props) => <StudentPortal screen={<HomePage />} />}
          />
          <Route
            exact
            path='/team'
            render={(props) => <StudentPortal screen={<TeamPage />} />}
          />
          <Route
            exact
            path='/scout'
            render={(props) => <StudentPortal screen={<ScoutPage />} />}
          />
          <Route
            exact
            path='/budget'
            render={(props) => <StudentPortal screen={<BudgetPage />} />}
          />
          <Route
            exact
            path='/season'
            render={(props) => <StudentPortal screen={<Season />} />}
          />
          <Route exact path='/dashboard' component={Dashboard} />
          <Route exact path='/login/teacher' component={TeacherLogin} />
          <Route exact path='/login/student' component={StudentLogin} />
          {/* <Route exact path='/teacher/home' component={TeacherDashboard} /> */}
          <Route
            exact
            path="/teacher/home"
            render={(props) => (
              <TeacherPortal
                screen={
                  <TeacherDashboard {...props}/>
                }
              />
            )}
          />
          <Route component={PageNotFound} />
        </Switch>
        <IceBackground />
      </Router>
    </div>
  );
};
export default App;
