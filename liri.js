//================================================
// CONFIGS
//------------------------------------------------

require('dotenv').config();

const SPOTIFY = require('node-spotify-api'),
	MOMENT = require('moment'),
	AXIOS = require('axios'),
	FS = require('fs');

const KEYS = require('./keys');

const SPOTIFY_KEY = new SPOTIFY(KEYS.spotify),
	OMDB_KEY = KEYS.omdb,
	BANDS_KEY = KEYS.bands;

//================================================
// LIRI OBJECT
//------------------------------------------------

const LIRI = {
	omdbURL      : `http://www.omdbapi.com/?apikey=${OMDB_KEY}&t=`,
	bandsURL1    : 'https://rest.bandsintown.com/artists/',
	bandsURL2    : `/events?app_id=${BANDS_KEY}`,

	logNum       : 0,
	logSeparator : '-------------------------------',
	userInput    : process.argv.slice(3).join('+'),

	askLIRI      : function(command) {
		switch (command) {
			case 'concert-this':
				//node liri.js concert-this <artist name/band name>
				//search bands in town for an artist
				AXIOS.get(this.bandsURL1 + this.userInput + this.bandsURL2)
					.then((res) => {
						let artist, vName, vCity, vRegion, vCountry, vDate;
						if (!res.data.length) {
							artist = this.userInput;
							vName = 'Not Available';
							vCity = 'Not Available';
							vRegion = 'Not Available';
							vCountry = 'Not Available';
							vDate = 'Not Available';
							return console.log(
								'This artist has no upcoming concerts.'
							);
						}
						artist = res.data[0].lineup[0];
						vName = res.data[0].venue.name;
						vCity = res.data[0].venue.city;
						vRegion = res.data[0].venue.region;
						vCountry = res.data[0].venue.country;
						vLocation = vCity + ', ' + vRegion + ', ' + vCountry;
						vDate = res.data[0].datetime;
						console.log(
							artist + '\n' + vName + '\n' + vLocation + '\n' + vDate
						);
						// this.logConcert(artist, vName, vLocation, vDate);
					})
					.catch((err) => console.log(err));
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
				FS.readFile('random.txt', 'utf8', (err, data) => {
					if (err) return console.log(err);
					this.askLIRI(data.split(',')[0]);
				});
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
		console.log('logged concert');
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
		console.log('logged song');
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
		console.log('logged movie');
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
