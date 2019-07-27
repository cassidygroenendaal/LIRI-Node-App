//================================================
// CONFIGS
//------------------------------------------------

require('dotenv').config();

const SPOTIFY_API = require('node-spotify-api'),
	MOMENT = require('moment'),
	AXIOS = require('axios'),
	FS = require('fs');

const KEYS = require('./keys');

const SPOTIFY = new SPOTIFY_API(KEYS.spotify),
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
		switch (command) {
			case 'concert-this':
				AXIOS.get(this.bandsURL1 + this.userInput + this.bandsURL2)
					.then((res) => {
						if (!res.data.length) {
							throw new Error(
								'This artist has no upcoming concerts.'
							);
						}
						let artist = res.data[0].lineup[0] || this.userInput;
						let vName = res.data[0].venue.name || 'Not Available';
						let vCity = res.data[0].venue.city || 'Not Available';
						let vRegion = res.data[0].venue.region || 'Not Available';
						let vCountry =
							res.data[0].venue.country || 'Not Available';
						let vLocation = vCity + ', ' + vRegion + ', ' + vCountry;
						let vDate =
							MOMENT(res.data[0].datetime, MOMENT.ISO_8601).format(
								'L HH:mm'
							) || 'Not Available';
						this.logConcert(artist, vName, vLocation, vDate);
					})
					.catch((err) =>
						this.logError('Artist', this.userInput, err)
					);
				break;
			case 'spotify-this-song':
				if (this.userInput === '') {
					this.userInput = 'The Sign Ace of Base';
				}
				SPOTIFY.search({ type: 'track', query: this.userInput })
					.then((res) => {
						let artist =
							res.tracks.items[0].artists[0].name || 'Not Available';
						let song = res.tracks.items[0].name || 'Not Available';
						let link =
							res.tracks.items[0].preview_url || 'Not Available';
						let album =
							res.tracks.items[0].album.name || 'Not Available';
						this.logSong(artist, song, link, album);
					})
					.catch((err) => {
						console.log(err);
					});
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
							let title = res.data.Title || 'Not Available';
							let year = res.data.Released || 'Not Available';
							let imdbIndex = res.data.Ratings.findIndex((rating) => {
								return rating.Source === 'Internet Movie Database';
							});
							let imdb =
								res.data.Ratings[imdbIndex].Value || 'Not Available';
							let tomatoIndex = res.data.Ratings.findIndex(
								(rating) => {
									return rating.Source === 'Rotten Tomatoes';
								}
							);
							let tomato =
								res.data.Ratings[tomatoIndex].Value ||
								'Not Available';
							let country = res.data.Country || 'Not Available';
							let lang = res.data.Language || 'Not Available';
							let plot = res.data.Plot || 'Not Available';
							let actors = res.data.Actors || 'Not Available';
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
					this.userInput = data.split(',')[1];
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
		let logText =
			`\n${this.logTime}\n` +
			`Artist:          ${artist}\n` +
			`Venue:           ${venue}\n` +
			`Location:        ${location}\n` +
			`Date:            ${date}\n` +
			this.logSeparator;
		console.log(logText);
		FS.appendFile('log.txt', logText, (err) => {
			if (err) {
				return console.log(err);
			}
		});
	},
	logSong      : function(artist, song, link, album) {
		let logText =
			`\n${this.logTime}\n` +
			`Artist:          ${artist}\n` +
			`Song:            ${song}\n` +
			`Preview Link:    ${link}\n` +
			`Album:           ${album}\n` +
			this.logSeparator;
		console.log(logText);
		FS.appendFile('log.txt', logText, (err) => {
			if (err) {
				return console.log(err);
			}
		});
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
			`\n${this.logTime}\n` +
			`Title:           ${title}\n` +
			`Released:        ${year}\n` +
			`IMDB:            ${imdb}\n` +
			`Rotten Tomatoes: ${tomato}\n` +
			`Countries:       ${country}\n` +
			`Languages:       ${lang}\n` +
			`Plot:            ${plot}\n` +
			`Actors:          ${actors}\n` +
			this.logSeparator;
		console.log(logText);
		FS.appendFile('log.txt', logText, (err) => {
			if (err) {
				return console.log(err);
			}
		});
	},

	logError     : function(type, query, err) {
		let logText =
			`\n${this.logTime}\n` +
			`${type}:           ${query}\n` +
			`Error:           ${err}\n` +
			this.logSeparator;
		console.log(logText);
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
