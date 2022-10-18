let songPair = new Set();

/**
 *
 * @param {string} id The Id of the song (Youtube ID)
 * @param {string} name The user Input
 * @param {string} youtubeName The title of the video on youtube that was used to download the song
 * @param {number} deleteAfter Delete the pair after a certain amount of time.
 *
 * Adds a song pair to the Set
 */
function Add(id, name, youtubeName, ogUserId, deleteAfter) {
  songPair.add({ id, name, youtubeName, ogUserId });
  setTimeout(function () {
    Delete(id);
  }, deleteAfter);
}
/**
 *
 * @param {string} id The Id of the song (Youtube ID)
 *
 * Get a song pair by the id of the youtube video
 */
function Get(id) {
  for (const item of songPair) {
    if (item.id == id) {
      return [item.name, item.youtubeName, item.ogUserId];
    }
  }
  return false;
}
/**
 *
 * @param {string} id The Id of the song (Youtube ID)
 *
 * delete a song pair by the id of the video
 */
function Delete(id) {
  for (const item of songPair) {
    if (item.id == id) {
      songPair.delete(item);
    }
  }
}

/**
 * log the song pair set
 */
function Debug() {
  console.log(songPair);
}

module.exports = {
  Add,
  Get,
  //Delete // not using because when creating a pair it will delete it automatically after a certain amount of time
  Debug,
};

// not gonna use collections because I dont wanna learn them.
