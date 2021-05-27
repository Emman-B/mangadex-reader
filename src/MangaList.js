import { AppBar, createMuiTheme, InputBase, List, ListItem, 
  ListItemText, makeStyles, ThemeProvider, Toolbar } from "@material-ui/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { useHistory } from "react-router";

// ===================================================
// Variables
// ===================================================

// tag for english language stuff
const englishLanguageTag = "en";

// theme to use
const theme = createMuiTheme({
});

// height of the appBar
const appBarHeight = "50pt";

// styles to use
const useStyles = makeStyles((theme) => ({
  body: {
    // move the body to be below the app bar
    marginTop: appBarHeight,
  },
  appBar: {
    // height of app bar
    height: appBarHeight,
  },
  search: {
    // set the vertical position
    position: "absolute",
    top: "30%",

    // set color of search bar
    backgroundColor: theme.palette.common.white,

    // add padding to the left
    paddingLeft: "5pt",

    // round the border
    borderRadius: theme.shape.borderRadius,
  },
}));

// ===================================================
// Helper Functions
// ===================================================
/**
 * Makes a GET request to the Mangadex API to search for manga
 * @param {string} searchQuery the search query that is made
 * @param {object} history the react router history
 * @param {function} setMangaList sets the mangaList variable
 * @param {function} setCurrentManga sets the current manga (stored in App.js)
 */
function getMangaDexListOfManga(searchQuery, history, setMangaList, setCurrentManga) {
  // query parameter for title
  const titleQuery = (searchQuery)?`title=${searchQuery}`:"";
  // provide GET request to retrieve the manga list
  axios.get(`https://api.mangadex.org/manga?${titleQuery}`)
    .then((response) => {
      // retrieve the list of manga UUIDs
      const {results: mangaUUIDsList} = response.data;

      // produce a List of the results
      setMangaList(
        <>
          {/* Print out the list of manga */}
          {mangaUUIDsList.map((resultItem) => {
              return(
                // Use the UUID as the list item key
                // also make the list item a button that sets the current manga and updates the page history
                <ListItem key={resultItem.data.id} button divider onClick={() => {
                    setCurrentManga(resultItem.data.id);
                    history.push("/manga"); // opens the chapter page
                  }}>
                  <ListItemText>
                    {/* Get the title of the manga and use it as text */}
                    {resultItem.data.attributes.title[englishLanguageTag]}
                  </ListItemText>
                </ListItem>
              );
            }
          )}
        </>
      );
    }
  ).catch((error) => {
    // log possible errors
    console.error(error);
  }
  );
}

// ===================================================
// Component Function
// ===================================================
function MangaList(props) {
  // == Styles to use ==
  const classes = useStyles();

  // == State to keep track of ==
  // state of the user's manga title query
  const [searchQuery, setSearchQuery] = useState("");

  // state of the manga list to display
  const [mangaList, setMangaList] = useState(undefined);

  // == Other Variables ==
  // react router history for linking to other parts of the router
  const history = useHistory();

  /**
   * Effect hook. Acts on:
   *  - the modification of the search query
   *  - react router history
   *  - not sure why, but also the function "setCurrentManga"
   */
  useEffect(() => {
    getMangaDexListOfManga(searchQuery, history, setMangaList, props.setCurrentManga);
  }, [searchQuery, history, props.setCurrentManga]);

  // == Component Return Value ==
  return(
    <ThemeProvider theme={theme}>
      <div>
        {/* AppBar used for searching for manga */}
        <AppBar className={classes.appBar}>
          <Toolbar>
            <div className={classes.search}>
              <InputBase onInput={(value) => setSearchQuery(value.target.value)}></InputBase>
            </div>
          </Toolbar>
        </AppBar>

        {/* List of manga to display */}
        <List className={classes.body}>
          {mangaList}
        </List>
      </div>
    </ThemeProvider>
  );
}

export default MangaList;
