import { Button, Collapse, Divider, List, ListItem, ListItemText, Typography } from "@material-ui/core";
import axios from "axios";
import { useState, useEffect } from "react";
import { parseEntities } from 'parse-entities';
import { useHistory } from "react-router";

// ===================================================
// Variables
// ===================================================
// tag for english language stuff
const englishLanguageTag = "en";

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
    return (<div>errored out</div>);
  }
}
/**
 * Makes a GET request to the MangaDex API to retrieve the chapter list for a manga
 * @param {string} currentManga UUID of current manga 
 * @param {function} setChapterList function to set the chapter list
 */
function getChapterList(currentManga, setChapterList) {
  axios.get(`https://api.mangadex.org/manga/${currentManga}/feed?translatedLanguage[]=${englishLanguageTag}`)
    .then((response) => {
      // get the list of chapters
      const listOfChapters = response.data.results;

      // sort the list of chapters by volume # and chapter #
      listOfChapters.sort((mangaA, mangaB) => {
        return parseFloat(mangaA.data.attributes.chapter) - parseFloat(mangaB.data.attributes.chapter);
      });

      // creates the chapter list
      setChapterList(
        <>
          {/* Map each chapter element to a JSX component */}
          {listOfChapters.map((element) => (
            <ListItem key={element.data.id} button divider>
              <ListItemText>
                {`Vol. ${element.data.attributes.volume}, Ch. ${element.data.attributes.chapter} ${(element.data.attributes.title)?`: ${element.data.attributes.title}`:''}`}
              </ListItemText>
            </ListItem>
          ))}
        </>
      );
    });
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

  // state: description expansion
  const [expandDescription, setExpandDescription] = useState(false);

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
    getChapterList(props.currentManga, setChapterList);
  }, [props.currentManga]);

  // == Component Return Value ==
  return (
    <>
      <Button onClick={() => {
        history.push('/');
      }}>Go Back</Button>
      {displayMangaInfo(mangaInfo, expandDescription, setExpandDescription)}
      <Divider />
      <Typography variant="h6">Chapter List</Typography>
      <List>
        {chapterList}
      </List>
    </>
  );
}

export default ChapterList;
