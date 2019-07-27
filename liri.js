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
	userInput    : process.argv.slice(3).join('+'),
	logTime      : '',
	logSeparator : '------------------------------------------',

	askLIRI      : function(command) {
		this.logTime = MOMENT().format('L HH:mm:ss');
		console.log(this.logTime);
		switch (command) {
			case 'concert-this':
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
						this.logConcert(artist, vName, vLocation, vDate);
					})
					.catch((err) =>
						this.logError('Artist', this.userInput, err)
					);
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
				if (this.userInput === '') {
					this.userInput = 'Mr. Nobody';
				}
				AXIOS.get(this.omdbURL + this.userInput)
					.then((res) => {
						if (res.data.Error) {
							throw new Error(res.data.Error);
						} else {
							console.log(res.data);
							let title = res.data.Title;
							let year = res.data.Released;
							let imdbIndex = res.data.Ratings.findIndex((rating) => {
								return rating.Source === 'Internet Movie Database';
							});
							let imdb = res.data.Ratings[imdbIndex].Value;
							let tomatoIndex = res.data.Ratings.findIndex(
								(rating) => {
									return rating.Source === 'Rotten Tomatoes';
								}
							);
							let tomato = res.data.Ratings[tomatoIndex].Value;
							let country = res.data.Country;
							let lang = res.data.Language;
							let plot = res.data.Plot;
							let actors = res.data.Actors;
							this.logMovie(
								title,
								year,
								imdb,
								tomato,
								country,
								lang,
								plot,
								actors
							);
						}
					})
					.catch((err) => {
						this.logError('Movie', this.userInput, err);
					});
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
		// console.log('logged concert');
		let logText =
			this.logTime +
			'\n' +
			`Artist:          ${artist}\n` +
			`Venue:           ${venue}\n` +
			`Location:        ${location}\n` +
			`Date:            ${date}\n` +
			this.logSeparator +
			'\n';
		FS.appendFile('log.txt', logText, (err) => {
			if (err) {
				return console.log(err);
			}
		});
	},
	logSong      : function(artist, song, link, album) {
		// console.log('logged song');
		//append to log.txt
		//	artist
		//	song
		//	link
		//	album
		//log separator
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
		let logText =
			this.logTime +
			'\n' +
			`Title:           ${title}\n` +
			`Released:        ${year}\n` +
			`IMDB:            ${imdb}\n` +
			`Rotten Tomatoes: ${tomato}\n` +
			`Countries:       ${country}\n` +
			`Languages:       ${lang}\n` +
			`Plot:            ${plot}\n` +
			`Actors:          ${actors}\n` +
			this.logSeparator +
			'\n';
		FS.appendFile('log.txt', logText, (err) => {
			if (err) {
				return console.log(err);
			}
		});
	},

	logError     : function(type, query, err) {
		let logText =
			this.logTime +
			'\n' +
			type +
			':           ' +
			query +
			'\nError:           ' +
			err +
			'\n' +
			this.logSeparator +
			'\n';
		FS.appendFile('log.txt', logText, (err) => {
			if (err) {
				return console.log(err);
			}
		});
	}
};

//================================================
// INIT
//------------------------------------------------

LIRI.askLIRI(process.argv[2]);
