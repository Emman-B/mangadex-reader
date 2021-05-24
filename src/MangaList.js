import { List, ListItemText, TextField } from "@material-ui/core";
import axios from "axios";
import { useEffect, useState } from "react";

function getMangaDexListOfManga(setMangaList, searchQuery) {
  // provide GET request to retrieve the manga list
  axios.get("https://api.mangadex.org/manga?title=" + searchQuery)
    .then((response) => {
      // retrieve the list of manga UUIDs
      const {results: mangaUUIDsList} = response.data;


      // produce a List of the results
      setMangaList(
        <List>
          {/* Print out the list of manga */}
          {mangaUUIDsList.map((resultItem) => {
              return(
                <ListItemText>
                  {resultItem.data.attributes.title["en"]}
                </ListItemText>
              );
            }
          )}
        </List>
      );
    });
}

function MangaList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mangaList, setMangaList] = useState(undefined);

  useEffect(() => {
    getMangaDexListOfManga(setMangaList, searchQuery);
  }, [searchQuery]);

  return(
    <div>
      <TextField onChange={(value) => setSearchQuery(value.target.value)}></TextField>
      {mangaList}
    </div>
  );
}

export default MangaList;
