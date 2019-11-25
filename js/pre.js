// Constants declaration:
var datapath = "../data/movies.tsv";	// TSV path.
var legend = ["ID", "name", "year", "runtime", "rating", "votes", "budget", "gross_opUSA", "gross_USA", "gross", "genres"];

var margin = { top: 70, right: 20, bottom: 20, left: 40 },
	height = 576, width = 720,		// Standard 576p resolution.
	color = d3.scaleOrdinal(d3.schemePaired);	// 6 paired colors.

var x = d3.scaleBand().rangeRound([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var data = d3.tsv(datapath)
	.then(d => data = d)
	.catch(e => console.error(e));
