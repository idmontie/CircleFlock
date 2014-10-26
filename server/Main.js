/**
 * ===========================================
 * Server Main
 *
 * Grab Twitter credentials, get trends, and
 * statuses.
 * ===========================================
 */

var _$ = this

// 20 requests a minute
var REQUEST_LIMIT = 20
var FLOOD_TIME = 1000 * 60
var NUMBER_OF_TWEETS = 100

//100 Tweet limit
_$.Twitter = {
  urls : {
    auth : 'https://api.twitter.com/oauth2/token',
    trends : 'https://api.twitter.com/1.1/trends/place.json?id=1',
    search : 'https://api.twitter.com/1.1/search/tweets.json?result_type=recent&count=100&q='
  }
}

/** 
 * Get Statuses by using the given bearer, and search term.
 *
 * @param bearer Object A Twitter bearer token (has property access_token)
 * @param search String A phrase
 * @param limit Number The amount of tweets to get, optional (defaults 100)
 * @return statuses Array
 */
function getStatuses ( bearer, search, limit ) {
  if ( typeof limit === "undefined" ) {
    limit = 100
  }

  var result = HTTP.call(
    'GET',
    search,
    {
      'headers' : {
        'Authorization' : 'Bearer ' + bearer.access_token
      }
    } 
  )

  var statuses = JSON.parse( result.content ).statuses

  // TODO this does not work yet

  /*while ( statuses.length < limit ) {
    var result = HTTP.call(
      'GET',
      search + "&max_id=" + statuses[statuses.length - 1].id,
      {
        'headers' : {
          'Authorization' : 'Bearer ' + bearer.access_token
        }
      } )

    var s = JSON.parse( result.content ).statuses

    statuses = statuses.concat( s )
  }*/

  return statuses

}

/**
 * Credentials
 *
 * Get Twitter Credentials and put them in the database
 */
function credentials () {
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
}

/**
 * Get the latest bearer token
 * 
 * @return bearer Object
 */
function getBearer () {
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
 * Trending: Get whatever is trending from Twitter
 * 
 * If a failure occures, it will be logged
 *
 * On success, the trends will be added to the database
 */
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
          TwitterTrends.upsert( { name : insert.name }, { $set : {
            name : insert.name,
            query : insert.query,
            url : insert.url,
            date_created : Date.now() 
          } } )
        

        }

      } else {
        Logger.insert ( error )
      }
    } )
}

/**
 * If a failure occurres, a String will be returned and
 * the error will be logged in the database.
 * 
 * On success, an array of trending objects will be returned
 *
 * @param searchTerm String the term to search
 * @return String or Array
 */
function search ( searchTerm ) {
  // Terminate early
  if ( searchTerm == null ||
       searchTerm.trim() === '' ) {
    return "Please search for something."
  }

  // (Throttle) Delay due to too many requests
  if ( _$.requestBuffer.isFull() &&
       Date.now() - _$.requestBuffer.first() < FLOOD_TIME ) {
    return "We are over capacity, try again in a bit."
  } else {
    _$.requestBuffer.push( Date.now() )
  }


  Searches.upsert ( { search : searchTerm }, { $set : {
    search : searchTerm,
    date_created : Date.now()
  } }, function () { /* force async */ } )

  var search = _$.Twitter.urls.search + encodeURIComponent ( '"' + searchTerm + '"' )

  var bearer = getBearer ()

  try {
    var statuses = getStatuses( bearer, search, NUMBER_OF_TWEETS )
    var counts = {};

    // Tally and insert into the database
    _.forEach ( statuses, function ( status ) {
      // TODO only insert if new
      TwitterTweets.insert( status, function () { /* force async */ } )

      var username = status.user.name

      // TODO only insert if new
      TwitterUsers.insert ( status.user, function () { /* force async */ } )
      
      if ( counts[username] !== undefined ) {
        counts[username].count++
      } else {
        counts[username] = {
          count : 1,
          user : status.user
        }
      }
    } )

    // Transform counts into an array
    topUsers = []
    topCount = -1

    for ( var prop in counts ) {
      if ( counts.hasOwnProperty(prop) ) {
        topUsers.push( {
          user : counts[prop].user,
          count :  counts[prop].count
        } )

        topCount = Math.max( topCount, counts[prop].count )
      }
    }


    // Sort tallies
    function tallyCompare ( a, b ) {
      if (a.count < b.count)
         return 1;
      if (a.count > b.count)
        return -1;
      return 0;
    }

    topUsers.sort ( tallyCompare )

    // Throw out 1's unless they are all 1's
    if ( topCount > 1 ) {
      topUsers = topUsers.filter( function (u) {
        return u.count > 1
      } )
    }

    topUsers = topUsers.splice( 0, 30 )

    // Return
    return topUsers

  } catch ( error ) {
    console.log ( error )
    Logger.insert ( {
      error : error
    } )
    return "Error, try again later"
  }
}

/**
 * Server Boot
 * ===========
 *
 * Runs once on load.
 *
 * Create a Circular Buffer for throttling. Set up methods
 * for the client to access.  Grab credentials and what is
 * currently trending, then set up 15 minute intervals for each. 
 */
Meteor.startup(function () {
  _$.requestBuffer = new CBuffer( REQUEST_LIMIT )

  Meteor.methods( {
    search : search 
  } )

  // Boot up reoccuring credentials check
  credentials ()
  Meteor.setInterval (credentials, 1000 * 60 * 15 /* 15 minutes */ )

  // Boot up reoccuring pull
  whatsTrending ()
  Meteor.setInterval (whatsTrending, 1000 * 60 * 15 /* 15 minutes */ )
} )