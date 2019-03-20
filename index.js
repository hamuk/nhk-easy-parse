const FeedParser = require("feedparser");
const request = require("request");
const fs = require("fs");

const req = request("https://nhkeasier.com/feed/");
const feedparser = new FeedParser({});

const relativeRegex = /\/media\/mp3\/(.*)\.mp3/g;
const fileNameRegex = /k(\d*)/g;

req.on("error", function(error) {
  console.log("oh no", error);
});

req.on("response", function(res) {
  const stream = this;

  if (res.statusCode !== 200) {
    this.emit("error", new Error("Bad status code"));
  } else {
    stream.pipe(feedparser);
  }
});

feedparser.on("error", function(error) {
  console.log("oh no", error);
});

feedparser.on("readable", function() {
  const stream = this;
  let item;

  while ((item = stream.read())) {
    const relativeUrl = item.description.match(relativeRegex)[0];
    console.log(`relative url ${relativeUrl}`);

    const fullUrl = `https://nhkeasier.com${relativeUrl}`;
    console.log(`full url ${fullUrl}`);

    const fileName = item.description.match(fileNameRegex)[0] + ".mp3";
    console.log(`file name ${fileName}`);

    request(fullUrl).pipe(fs.createWriteStream(fileName));
  }
});
