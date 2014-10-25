// ====
// Main
// ====

var _$ = this

_$.Twitter = {
  urls : {
    auth : 'https://api.twitter.com/oauth2/token',
    trends : 'https://api.twitter.com/1.1/trends/place.json?id=1',
    search : 'https://api.twitter.com/1.1/search/tweets.json?count=100&q='
  }
}

function whatsTrending () {
  console.log ( 'Finding what is trending' )

  var bearer = TwitterTokens.findOne( { 
    date_created : { 
      $exists : true 
    } 
  },  { 
    sort: { 
      date_created : 1 
    } 
  } )

  HTTP.call(
    'GET',
    _$.Twitter.urls.trends,
    {
      'headers' : {
        'Authorization' : 'Bearer ' + bearer.access_token
      }
    }, function ( error, result ) {
      if ( ! error ) {
        var trends = JSON.parse( result.content )

        for ( var index in trends[0].trends ) {
          var insert = trends[0].trends[index]
          insert.date_created = Date.now()
          // TODO only insert if new
          TwitterTrends.insert( insert )

        }

      } else {
        Logger.insert ( error )
      }
    } )
}

function getBearer () {
  // TODO cache
  return TwitterTokens.findOne( { 
    date_created : { 
      $exists : true 
    } 
  },  { 
    sort: { 
      date_created : 1 
    } 
  } )
}

/**
 * Server Boot
 * ===========
 */
Meteor.startup(function () {
  // code to run on server at startup

  Meteor.methods( {
    search : function ( searchTerm ) {
      var search = _$.Twitter.urls.search + encodeURIComponent ( searchTerm )

      var bearer = getBearer ()

      try {
        var result = HTTP.call(
          'GET',
          search,
          {
            'headers' : {
              'Authorization' : 'Bearer ' + bearer.access_token
            }
          } )

        var statuses = JSON.parse( result.content ).statuses

        var counts = {};

        // Tally and insert into the database
        _.forEach ( statuses, function ( status ) {
          // TODO only insert if new
          TwitterTweets.insert( status, function () { /* force async */ } )

          var username = status.user.name

          // TODO only insert if new
          // TODO do this in a seperate "thread"
          TwitterUsers.insert ( status.user, function () { /* force async */ } )
          
          if ( counts[username] !== undefined ) {
            counts[username]++
          } else {
            counts[username] = 1
          }
        } )

        // TODO Sort tallies

        // Transform counts into an array
        topUsers = []

        for ( var prop in counts ) {
          if ( counts.hasOwnProperty(prop) ) {
            topUsers.push( {
              user : prop,
              count :  counts[prop]
            } )
          }
        }

        // Return
        return topUsers

      } catch ( error ) {
        Logger.insert ( {
          error : error
        } )
        return "Error, try again later"
      }
    }
  } )

  // TODO refactor
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