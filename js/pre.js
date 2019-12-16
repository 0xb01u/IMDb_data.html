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

var url = "https://www.imdb.com/title/";

var margin = { top: 100, right: 100, bottom: 100, left: 100 },
	color = d3.scaleOrdinal(d3.schemePaired);	// 6 paired colors.

var samples = 30;
var indep = "worldwide_gross";
var dep = "runtime";

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
