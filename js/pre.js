// Constants declaration:
var datapath = "../data/movies.tsv";	// TSV path.
var legend = ["ID", "title", "year", "runtime", "rating", "votes", "budget", "opening_weekend_usa", "gross_usa", "worldwide_gross", "genres"];
var text_labels = {
	"year": "Año",
	"runtime": "Duración (min)",
	"rating": "Valoración sobre 10",
	"votes": "Cantidad de valoraciones (miles)",
	"budget": "Presupuesto (millones de $)",
	"opening_weekend_usa": "Recaudación USA 1er fin de semana (mill $)",
	"gross_usa": "Recaudación en USA (millones de $)",
	"worldwide_gross": "Recaudación (millones de $)"
};

function color(year, min, max) {
	let diff = max - min;
	num = i => parseInt(Math.min(diff/2, Math.max(0, year - (min + diff * i/2)))*(0xff * 2/diff));
	let r = ("00" + (0xff - num(0)).toString(16)).substr(-2);
	let g = "ff"
	let b = ("00" + num(1).toString(16)).substr(-2);
	return `#${r}${g}${b}`
}

var url = "https://www.imdb.com/title/";
var margin = { top: 70, right: 190, bottom: 200, left: 100 };
var samples = 25;
var year_low = 1915;
var year_high = 2019;
var indep = "worldwide_gross";
var dep = "rating";
var load = 2000;	// ms for the "load" animation.

// Data reading:
var raw = d3.tsv(datapath)
	.then(d => {
		for (let row of d) {
			for (let r in row)
				row[r] = isNaN(row[r]) ? row[r] : +row[r];
			row.budget /= 1000000;
			row.opening_weekend_usa = Math.round(row.opening_weekend_usa / 10000) / 100;
			row.gross_usa = Math.round(row.gross_usa / 10000) / 100;
			row.worldwide_gross = Math.round(row.worldwide_gross / 10000) / 100;
			row.votes = Math.round(row.votes / 1000);
		}
		raw = d;
	})
	.catch(e => console.error(e));
