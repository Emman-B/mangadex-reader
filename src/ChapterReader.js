import { List, ListItem } from "@material-ui/core";
import axios from "axios";
import { useEffect, useState } from "react";

// ===================================================
// Helper Function
// ===================================================

function getChapterDetails(currentChapter, setPageList) {
  axios.get(`https://api.mangadex.org/chapter?ids[]=${currentChapter}`)
    .then((chapterDetailsResponse) => {
      axios.get(`https://api.mangadex.org/at-home/server/${currentChapter}`)
        .then((atHomeServerResponse) => {
          // to get a chapter, we need the base url, chapter hash, chapter id, and the arrays of images
          const chapterDetails = {};

          // update the base url
          chapterDetails['baseUrl'] = atHomeServerResponse.data.baseUrl;

          // then get the chapter related information
          const chapterRequestResults = chapterDetailsResponse.data.results;

          // get the chapter hash
          chapterDetails['hash'] = chapterRequestResults[0].data.attributes.hash;

          // get the chapter id (which is already passed in)
          chapterDetails['id'] = currentChapter;

          // get the non-data-saver image filenames
          chapterDetails['data'] = chapterRequestResults[0].data.attributes.data;

          // get the data-saver image filenames
          chapterDetails['dataSaver'] = chapterRequestResults[0].data.attributes.dataSaver;

          createPageList(chapterDetails, setPageList);
        });
    });
}

function createPageList(chapterDetails, setPageList) {
  if (!chapterDetails || !chapterDetails['dataSaver']) {
    return;
  }
  // for now, just use the data-saver images
  const pageList = chapterDetails['dataSaver'].map((filename) => {
    return `${chapterDetails.baseUrl}/data-saver/${chapterDetails.hash}/${filename}`
  });

  setPageList(pageList);
}

// ===================================================
// Component Function
// ===================================================
function ChapterReader(props) {
  // == State to keep track of ==
  // list of manga pages (maybe as an array of URLs?)
  const [pageList, setPageList] = useState([]);

  useEffect(() => {
    getChapterDetails(props.currentChapter, setPageList);
  }, [props.currentChapter]);

  return (
    <List>
      {pageList.map((page) => (
        <ListItem>
          <img src={page} alt={page} />
        </ListItem>
      ))}
    </List>
  );
}

export default ChapterReader;
