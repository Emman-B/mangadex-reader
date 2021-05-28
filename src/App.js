import './App.css';
import MangaList from './MangaList.js';
import ChapterList from './ChapterList';
import {HashRouter, Redirect, Route, Switch} from 'react-router-dom';
import { useEffect, useState } from 'react';

// ===================================================
// Main App Function
// ===================================================
function App() {
  // == State to keep track of ==
  // current manga as a string UUID
  const [currentManga, setCurrentManga] = useState("");

  // current chapter as a string UUID
  // const [currentChapter, setCurrentChapter] = useState("");

  /**
   * == Effect hook. Acts on: ==
   *  - when currentManga is modified
   */
  useEffect(() => {
  }, [currentManga]);

  return (
    <HashRouter>
      <Switch>
        {/* Main Route w/ Manga List */}
        <Route
          exact path='/'
          render={() => {
              // render manga list
              return(<MangaList setCurrentManga={setCurrentManga} />);
            }
          }
        />

        {/* Chapter List Route */}
        <Route 
          exact path='/manga' 
          render={() => 
            // verify if current manga has been set or not by checking its length
            (currentManga.length > 0)?
              // if so, then open the ChapterList
              <ChapterList currentManga={currentManga} />:
              // if not set, then redirect to main
              <Redirect to="/" />
          }
        />
        
        {/* Redirect to / path if URL is invalid */}
        <Redirect to="/"></Redirect>
      </Switch>
    </HashRouter>
  );
}

export default App;
