import { AppBar, createMuiTheme, InputBase,Link, List, ListItem, 
  ListItemText, makeStyles, ThemeProvider, Toolbar } from "@material-ui/core";
import axios from "axios";
import { useEffect, useState } from "react";

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
 * @param {function} setMangaList 
 * @param {string} searchQuery 
 */
function getMangaDexListOfManga(setMangaList, searchQuery) {
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
                <ListItem key={resultItem.data.id}>
                  <Link>
                    <ListItemText>
                      {/* Get the title of the manga and use it as text */}
                      {resultItem.data.attributes.title[englishLanguageTag]}
                    </ListItemText>
                  </Link>
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
function MangaList() {
  // == Styles to use ==
  const classes = useStyles();

  // == States to keep track of ==

  // state of the user's manga title query
  const [searchQuery, setSearchQuery] = useState("");

  // state of the manga list to display
  const [mangaList, setMangaList] = useState(undefined);

  /**
   * Effect hook. Acts on:
   *  - the modification of the search query
   */
  useEffect(() => {
    getMangaDexListOfManga(setMangaList, searchQuery);
  }, [searchQuery]);

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
