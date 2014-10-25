// ====
// Main
// ====

this.Twitter = {
  urls : {
    auth : 'https://api.twitter.com/oauth2/token',
    trends : 'https://api.twitter.com/1.1/trends/place.json?id=1'
  }
}

function whatsTrending () {
  var bearer = TwitterTokens.findOne({},  { sort: { 'date_created' : 1 } } )

  HTTP.call(
    'GET',
    this.Twitter.urls.trends,
    {
      'headers' : {
        'Authorization' : 'Bearer ' + bearer.access_token
      }
    }, function ( error, result ) {
      if ( ! error ) {
        var trends = JSON.parse( result.content )

        for ( var trend in trends.trends ) {
          TwitterTrends.insert( trend )
        }
      }
    } )
}


/**
 * Server Boot
 * ===========
 */
Meteor.startup(function () {
  // code to run on server at startup

  // TODO this should happen whenever the token would expire
  var textBlob = Assets.getText( 'ConfigurationTwitter.json' )
  var twitterConfig = JSON.parse( textBlob )

  var credentials = twitterConfig.consumerKey + ":" + twitterConfig.consumerSecret

  var base64Creds = Base64.encode( credentials )

  var bearer = HTTP.call(
    'POST', 
    this.Twitter.urls.auth,
    {
      'headers' : {
        'Authorization' : 'Basic ' + base64Creds,
        'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      'content' : 'grant_type=client_credentials'
    }
    )

  var response = JSON.parse( bearer.content )
  var accessToken = response.access_token

  TwitterTokens.insert( {
    access_token : accessToken,
    date_created : Date.now ()
  } )

  // Boot up reoccuring pull
  whatsTrending ()
  Meteor.setInterval (whatsTrending, 1000 * 60 * 5 /* 5 minute */ )
} )