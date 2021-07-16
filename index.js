function getTweets() {
  fetch('https://api.twitter.com/2/tweets/search/recent?query=from:twitterdev')
  .then(response => response.json())
  .then(data => console.log(data));
}

getTweets();



  