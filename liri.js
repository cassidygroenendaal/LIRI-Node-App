//================================================
// CONFIGS
//------------------------------------------------

require('dotenv').config();

const SPOTIFY = require('node-spotify-api'),
	MOMENT = require('moment'),
	AXIOS = require('axios'),
	FS = require('fs');

const KEYS = require('./keys');

const Spotify = new SPOTIFY(KEYS.spotify);

//================================================
// LIRI OBJECT
//------------------------------------------------

const LIRI = {
	logNum       : 0,
	logSeparator : '-------------------------------',

	askLIRI      : function(command) {
		switch (command) {
			case 'concert-this':
				//node liri.js concert-this <artist name/band name>
				//search bands in town for an artist
				//give following info:
				//	name of venue
				//	venue location
				//	date of event, MM/DD/YYYY
				this.logConcert();
				break;
			case 'spotify-this-song':
				//node liri.js spotify-this <song-name-here>
				//search node-spotify-api for the song
				//	artist name
				//	song name
				//	preview link of song from spotify
				//	album the song is from
				//default song: "The Sign" by Ace of Base
				this.logSong();
				break;
			case 'movie-this':
				//node liri.js movie-this <movie name here>
				//search omdb api for movie name
				//	title
				//	release year
				//	IMDB rating
				//	Rotten Tomatoes rating
				//	Country where produced
				//	language of movie
				//	plot of movie
				//	actors in movie
				//default movie: "Mr. Nobody"
				this.logMovie();
				break;
			case 'do-what-it-says':
				//read random.txt
				//split at comma
				//call askLIRI(firstIndex)
				this.askLIRI(command);
				this.logSong();
				break;
			case 'help':
				console.log(
					'List of Commands\n' +
						'   concert-this <artist/band name>\n' +
						'   spotify-this-song <song title>\n' +
						'   movie-this <movie title>\n' +
						'   do-what-it-says'
				);
				break;
			default:
				console.log(
					"Command not recognized. Type 'help' for a list of commands."
				);
		}
	},
	logConcert   : function(artist, venue, location, date) {
		//append to log.txt
		//log num
		//artist
		//	venue
		//	location
		//	date
		//log separator
		this.logNum++;
	},
	logSong      : function(artist, song, link, album) {
		//append to log.txt
		//log num
		//	artist
		//	song
		//	link
		//	album
		//log separator
		//log num ++
	},
	logMovie     : function(
		title,
		year,
		imdb,
		tomato,
		country,
		lang,
		plot,
		actors
	) {
		//append to log.txt
		//log num
		//	title
		//	year
		//	imdb
		//	tomato
		//	country
		//	lang
		//	plot
		//	actors
		//log separator
		//log num ++
	},

	init         : function() {
		//Get last used log num from log.txt
		this.askLIRI(process.argv[2]);
	}
};

//================================================
// INIT
//------------------------------------------------

LIRI.init();
