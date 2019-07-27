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
	omdbURL       : `http://www.omdbapi.com/?apikey=${OMDB_KEY}&t=`,
	bandsURL1     : 'https://rest.bandsintown.com/artists/',
	bandsURL2     : `/events?app_id=${BANDS_KEY}`,
	userInput     : process.argv.slice(3).join('+'),
	logTime       : '',
	logSeparator  : '==========================================',
	itemSeparator : '------------------------------------------',

	askLIRI       : function(command) {
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
						let concertData = '';
						let result = 1;
						let artist = res.data[0].lineup[0] || this.userInput;
						// console.log(res.data);
						res.data.forEach((concert) => {
							let vName = concert.venue.name || 'Not Available';
							let vCity = concert.venue.city || 'Not Available';
							let vRegion = concert.venue.region || 'Not Available';
							let vCountry = concert.venue.country || 'Not Available';
							let vLocation =
								vCity + ', ' + vRegion + ', ' + vCountry;
							if (vRegion === 'Not Available') {
								vLocation = vCity + ', ' + vCountry;
							}
							let vDate =
								MOMENT(concert.datetime, MOMENT.ISO_8601).format(
									'L HH:mm'
								) || 'Not Available';
							concertData +=
								`\nConcert ${result}\n` +
								`Venue:           ${vName}\n` +
								`Location:        ${vLocation}\n` +
								`Date:            ${vDate}\n` +
								`${this.itemSeparator}`;
							result++;
						});
						this.logConcert(artist, concertData);
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
						let trackData = '';
						let result = 1;
						res.tracks.items.forEach((track) => {
							let artist = track.artists[0].name || 'Not Available';
							let song = track.name || 'Not Available';
							let link = track.preview_url || 'Not Available';
							let album = track.album.name || 'Not Available';
							trackData +=
								`\nTrack ${result}\n` +
								`Artist:          ${artist}\n` +
								`Song:            ${song}\n` +
								`Preview Link:    ${link}\n` +
								`Album:           ${album}\n` +
								`${this.itemSeparator}`;
							result++;
						});
						this.logSong(trackData);
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
	logConcert    : function(artist, concertData) {
		let logText =
			`\n${this.logTime}\n` +
			`Artist:          ${artist}\n` +
			`${concertData}\n` +
			this.logSeparator;
		console.log(logText);
		FS.appendFile('log.txt', logText, (err) => {
			if (err) {
				return console.log(err);
			}
		});
	},
	logSong       : function(trackData) {
		let logText =
			`\n${this.logTime}\n` + `${trackData}\n` + this.logSeparator;
		console.log(logText);
		FS.appendFile('log.txt', logText, (err) => {
			if (err) {
				return console.log(err);
			}
		});
	},
	logMovie      : function(
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

	logError      : function(type, query, err) {
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
