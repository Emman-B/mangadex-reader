import { Button, Collapse, Divider, List, ListItem, ListItemText, Toolbar, Typography } from "@material-ui/core";
import axios from "axios";
import { useState, useEffect } from "react";
import { parseEntities } from 'parse-entities';
import { useHistory } from "react-router";

// ===================================================
// Variables
// ===================================================
// tag for english language stuff
const englishLanguageTag = "en";

// limit value used when GET'ing chapters
const chapterLimit = 25;


// ===================================================
// Helper Functions
// ===================================================
/**
 * Makes a GET request to the MangaDex API to retrieve manga information
 * @param {string} currentManga UUID of current manga
 * @param {function} setMangaInfo function to set the manga info object
 */
function getMangaInfo(currentManga, setMangaInfo) {
  // make the get request
  axios.get(`https://api.mangadex.org/manga/${currentManga}`)
    .then((response) => {
      // shorthand variable to get the data from the response
      const mangaData = response.data.data;

      // set the manga info object using the attributes field
      setMangaInfo(mangaData.attributes);
    });
}

/**
 * Returns a JSX component that displays the mangaInfo into something usable
 * @param {object} mangaInfo the mangaInfo object to display
 * @param {boolean} expandDescription expand description state
 * @param {function} setExpandDescription updates the expand description state
 * @returns {JSX} JSX to display
 */
function displayMangaInfo(mangaInfo, expandDescription, setExpandDescription) {
  try {
    return (
      <div>
        <Typography variant="h5">
          {mangaInfo.title[englishLanguageTag]}
        </Typography>
        <Button onClick={() => setExpandDescription(!expandDescription)}>Show/Hide Full Description</Button>
        <Collapse in={expandDescription}>
          <Typography variant="body2">
            {parseEntities(mangaInfo.description[englishLanguageTag])}
          </Typography>
        </Collapse>
      </div>
    );
  } catch (error) {
    return (<div></div>);
  }
}
/**
 * Makes a GET request to the MangaDex API to retrieve the chapter list for a manga
 * @param {string} currentManga UUID of current manga 
 * @param {function} setChapterList function to set the chapter list
 * @param {number} chapterLimitOffset used for splitting a large list of chapters into multiple pages
 * @param {function} setNumberOfShownChapters used to update how many chapters are shown
 */
function getChapterList(currentManga, setChapterList, chapterLimitOffset, setNumberOfShownChapters) {
  // turn query params into an object that can be turned into a string later
  const queryParams = {
    "translatedLanguage[]": englishLanguageTag,
    "order[chapter]": "asc",
    limit: chapterLimit,
    offset: chapterLimitOffset,
  };

  // convert the query params object into a string
  let resultQueryParamString = '';
  for (const queryParam in queryParams) {
    // if there is nothing in the result query parameter string, insert a question mark.
    //  otherwise, insert an ampersand
    if (!resultQueryParamString) {
      resultQueryParamString += '?';
    }
    else {
      resultQueryParamString += '&';
    }
    // add the query param pair to the string
    resultQueryParamString += `${queryParam}=${queryParams[queryParam]}`;
  }

  // make the GET request to get the list of chapters
  axios.get(encodeURI(`https://api.mangadex.org/manga/${currentManga}/feed${resultQueryParamString}`))
    .then((response) => {
      // get the list of chapters
      const listOfChapters = response.data.results;

      // set the # of shown chapters
      setNumberOfShownChapters(listOfChapters.length);

      // sort the list of chapters by chapter # (which are strings)
      listOfChapters.sort((mangaA, mangaB) => {
        return parseFloat(mangaA.data.attributes.chapter) - parseFloat(mangaB.data.attributes.chapter);
      });

      // creates the chapter list
      setChapterList(
        listOfChapters.map((element) => {
        // extract the volume #, chapter #, and title (all strings)
        const { volume, chapter, title } = element.data.attributes;
        // volume display format: check if volume is null or undefined, if so just use ? for volume number
        const volumeDisplay = `Vol. ${(volume != null)?`${volume}`:`?`}`;
        // chapter display format
        const chapterDisplay = `Ch. ${chapter}`;
        // title display format: if title empty, then use empty string
        const titleDisplay = `${(title)?title:''}`;

        return {
          id: element.data.id,
          volume: volumeDisplay,
          chapter: chapterDisplay,
          title: titleDisplay,
        };
      }));
    });
}

/**
 * Turns the chapter list into an array of JSX elements
 * @param {array} chapterList 
 * @returns JSX array
 */
function turnChapterListIntoJSX(chapterList, setCurrentChapter, history) {
  if (chapterList) {
    return chapterList.map((chapter) => (
      <ListItem key={chapter.id} button divider onClick={() => {
          history.push('/reader');
          setCurrentChapter(chapter.id);
        }}>
        <ListItemText>
          {`${chapter.volume}, ${chapter.chapter} ${chapter.title}`}
        </ListItemText>
      </ListItem>
    ));
  }
}

/**
 * Creates the chapter page navigation toolbar (going next and prev pages)
 * @param {number} chapterLimitOffset the current offset
 * @param {function} setChapterLimitOffset used to update the offset
 * @param {number} numberOfShownChapters indicates how many chapters are being shown
 */
function makePageNavToolbar(chapterLimitOffset, setChapterLimitOffset, numberOfShownChapters) {
  return(
    <Toolbar>
      {/* Prev button needs to be disabled if the chapter limit offset is 0 */}
      <Button disabled={chapterLimitOffset === 0} onClick={() => {
        setChapterLimitOffset(chapterLimitOffset - chapterLimit);
      }}>Prev</Button>

      {/* Next button needs to be disabled if the number of shown chapters is less than or equal to the limit */}
      <Button disabled={numberOfShownChapters < chapterLimit} onClick={() => {
        setChapterLimitOffset(chapterLimitOffset + chapterLimit);
      }}>Next</Button>
    </Toolbar>
  );
}

// ===================================================
// Component Function
// ===================================================
function ChapterList(props) {
  // == State to keep track of ==
  // state: manga information
  const [mangaInfo, setMangaInfo] = useState(undefined);

  // state: list of chapters
  const [chapterList, setChapterList] = useState(undefined);

  // state: number of chapters that are shown
  const [numberOfShownChapters, setNumberOfShownChapters] = useState(0);

  // state: description expansion
  const [expandDescription, setExpandDescription] = useState(false);

  // state: current limit offset
  const [chapterLimitOffset, setChapterLimitOffset] = useState(0);

  // == Other Variables ==

  // history react router
  const history = useHistory();

  /**
   * == Effect hook. Acts on: ==
   *  - apparently the currentManga prop
   *  - the modification of the chapter list
   */
  useEffect(() => {
    // gets any manga info
    getMangaInfo(props.currentManga, setMangaInfo);
    // gets the chapter list
    getChapterList(props.currentManga, setChapterList, chapterLimitOffset, setNumberOfShownChapters);
  }, [props.currentManga, chapterLimitOffset]);

  // == Component Return Value ==
  return (
    <>
      <Button onClick={() => {
        history.push('/');
      }}>Go Back</Button>
      {displayMangaInfo(mangaInfo, expandDescription, setExpandDescription)}
      <Divider />
      <Typography variant="h6" >Chapter List</Typography>
      {makePageNavToolbar(chapterLimitOffset, setChapterLimitOffset, numberOfShownChapters)}
      <List>
        {turnChapterListIntoJSX(chapterList, props.setCurrentChapter, history)}
      </List>
      {makePageNavToolbar(chapterLimitOffset, setChapterLimitOffset, numberOfShownChapters)}
    </>
  );
}

export default ChapterList;
