// Constants declaration:
var datapath = "../data/movies.tsv";	// TSV path.
var legend = ["ID", "title", "year", "runtime", "rating", "votes", "budget", "opening_weekend_usa", "gross_usa", "worldwide_gross", "genres"];
var text_labels = {
	"year": "Año",
	"runtime": "Duración (min)",
	"rating": "Valoración sobre 10",
	"votes": "Cantidad de valoraciones (miles)",
	"budget": "Presupuesto (millones de $)",
	"opening_weekend_usa": "Recaudación USA primer fin de semana (mill de $)",
	"gross_usa": "Recaudación en USA (millones de $)",
	"worldwide_gross": "Recaudación (millones de $)"
};

function color(year) {
	let r = ("00" + (0xff - parseInt(Math.min(35, year - 1950)*(255/35))).toString(16)).substr(-2);
	let g = ("00" + (parseInt(Math.min(35, year - 1915)*(255/35))).toString(16)).substr(-2);
	let b = ("00" + (parseInt(Math.min(35, year - 1984)*(255/35))).toString(16)).substr(-2);
	return `#${r}${g}${b}`
}

var url = "https://www.imdb.com/title/";

var margin = { top: 100, right: 190, bottom: 150, left: 100 };
var samples = 10;
var indep = "worldwide_gross";
var dep = "budget";

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
