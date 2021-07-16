fetch('https://api.twitter.com/2/tweets/search/recent?query=from:twitterdev'--header 'Authorization: Bearer AAAAAAAAAAAAAAAAAAAAAFfdRgEAAAAA1DtfpgGzB9iuoifRo%2BKhpcPj9%2B0%3DUVZP7FRJOqBh8lKFfls9GJCAOSoaKCkl6JBUugQJ43s8XUAmSW')
.then(response => response.json())
.then(data => console.log(data));




  