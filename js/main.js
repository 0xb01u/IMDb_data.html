function purge(array, attr, check, n) {
	return array.sort((a, b) => {
		if (isNaN(a[attr]) || isNaN(a[check])) return -1;
		if (isNaN(b[attr]) || isNaN(b[check])) return 1;
		return a[attr] - b[attr];
	}).slice(array.length - samples);
}

function databox(d) {
	tooltip.raise();
	tooltip.style("opacity", 0)
		.transition()
		.duration(250)
		.style("opacity", 1);
	tooltip.html(`<big><b>${d.title}</b></big><br><p align="left"><b>Año: </b>${d.year}<b><br>${text_labels[dep]}: </b>${d[dep]}<br><b>${text_labels[indep]}: </b>${d[indep]}</p><b>Haz click para acceder a su página de IMDb.</b>`)
		.style("left", `${d3.event.pageX}px`)
		.style("top", `${d3.event.pageY + 10}px`);

	svg.select(`.bar#${d.ID}`).attr("stroke", "red");
}

function undatabox(d) {
	tooltip.style("opacity", 1)
		.transition()
		.duration(250)
		.style("opacity", 0);

	svg.select(`.bar#${d.ID}`).attr("stroke", "black");
}

async function main() {
	await raw;
	data = purge(raw.slice(), indep, dep, samples);

	var height = parseInt(svg.style("height")) - margin.top - margin.bottom,
		width = parseInt(svg.style("width")) - margin.left - margin.right;

	svg = svg.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`)

	var chartArea = { "width": width - margin.left - margin.right,
			"height": height - margin.top - margin.bottom };

	var min_y = d3.min(data.map(d => { return d[dep]; })),
		max_y = d3.max(data.map(d => { return d[dep]; })),
		init = Math.round(max_y / Math.round(1 + max_y / min_y));

	var x = d3.scaleBand().rangeRound([0, width]).domain(data.map(d => { return d[indep]; })).padding(.15);
		y = d3.scaleLinear().range([height, 0]).domain([init, max_y]);


	var xAxis = d3.axisBottom(x),
		yAxis = d3.axisLeft(y).ticks(5),
		yGrid = d3.axisLeft(y).ticks(5).tickSize(-width, 0, 0).tickFormat("");

	svg.append("g")
		.attr("class", "xAxis")
		.attr("transform", `translate(0, ${height})`)
		.call(xAxis);
	svg.append("g")
		.attr("class", "yAxis")
		.call(yAxis);
	svg.append("g")
		.attr("class", "grid")
		.call(yGrid);

	if (samples > 25 && (
		indep == "worldwide_gross" ||
		indep == "gross_usa" ||
		indep == "opening_weekend_usa" ||
		indep == "budget"))
			svg.select(".xAxis").selectAll(".tick text")
				.attr("text-anchor", "end")
				.attr("transform", `rotate(-${samples/60 * 45})`);

	let background = svg.append("g")
		.attr("class", "bg");
	for (let d of data) {
		let names = background.append("g")
			.attr("id", d.ID)
			.attr("transform", "rotate(-90)")
			.data([d]);
		names.append("text")
			.attr("opacity", 0)
			.attr("y", x(d[indep]) + x.bandwidth() / 2 + 5)
			.attr("x", -height + x.bandwidth() / 4)
			.attr("font-family", "verdana")
			.attr("font-size", `${Math.min(30/samples * 18, 18)}px`)
			.attr("fill", "#999999")
			.text(d.title)
			.on("click", d => window.open(url + d.ID))
			.on("mouseover", databox)
			.on("mouseout", undatabox)
			.transition()
			.duration(load)
			.attr("opacity", 1);
	}

	svg.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
	 	.attr("id", d => { return d.ID; })
		.attr("x", d => { return x(d[indep]); })
		.attr("width", x.bandwidth())
		.attr("y", height)
		.attr("height", 0)
		.attr("fill", d => { return color(d.year, d3.min(data.map(e => { return e.year; })), d3.max(data.map(e => { return e.year; }))); })
		.attr("stroke", "black")
		.attr("stroke-width", 3)
		.on("click", d => window.open(url + d.ID))
		.on("mouseover", databox)
		.on("mouseout", undatabox)
		.transition()
		.duration(load)		
		.attr("y", d => { return y(d[dep]); })
		.attr("height", d => { return height - y(d[dep]) });

	labels = svg.append("g")
		.attr("class", "labels");
	labels.append("text")
		.attr("y", -50)
		.attr("x", -height / 2)
		.attr("font-size", "26px")
		.attr("transform", "rotate(-90)")
		.attr("text-anchor", "middle")
		.attr("font-family", "verdana")
		.text(text_labels[dep]);
	labels.append("text")
		.attr("y", height + 60)
		.attr("x", width / 2)
		.attr("font-size", "26px")
		.attr("text-anchor", "middle")
		.attr("font-family", "verdana")
		.text(text_labels[indep]);

	for (let d of data) {
		let names = labels.append("g")
			.attr("id", d.ID)
			.attr("transform", "rotate(-90)")
			.data([d]);
		names.append("clipPath")
			.attr("id", `clip${d.ID}`)
			.append("rect")
				.attr("y", x(d[indep]))
				//.attr("x", 0)				// Inverse animation.
				.attr("x", -height)			// Regular animation.
				.attr("height", x.bandwidth())
				.attr("width", 0)
				.transition()
				.duration(load)
				//.attr("x", -height)		// Inverse animation.
				.attr("width", height - y(d[dep]));
		names.append("text")
			.attr("opacity", 0)
			.attr("y", x(d[indep]) + x.bandwidth() / 2 + 5)
			.attr("x", -height + x.bandwidth() / 4)
			//.attr("font-weight", "bold")
			.attr("font-family", "verdana")
			.attr("font-size", `${Math.min(30/samples * 18, 18)}px`)
			.text(d.title)
			.attr("style", `clip-path: url(#clip${d.ID})`)
			.on("click", d => window.open(url + d.ID))
			.on("mouseover", databox)
			.on("mouseout", undatabox)
			.transition()
			.duration(load)
			.attr("opacity", 1);
	}

	let dates = d3.range(d3.min(data.map(d => { return d.year; })), d3.max(data.map(d => { return d.year; })) + 1);

	legend = svg.append("g")
		.attr("transform", "translate(5, 5)")
		.attr("class", "legend");

	legend.append("rect")
		.attr("class", "box")
		.attr("x", 4/5*width - 15)
		.attr("y", 1.2*height - 45)
		.attr("width", 250)
		.attr("height", 90)
		.attr("fill", "#e8e8e8")
		.attr("stroke", "black")
		.attr("stroke-width", 1);

	legend.append("text")
		.attr("x", 4/5*width - 5)
		.attr("y", 1.2*height - 23)
		.attr("font-family", "verdana")
		.attr("font-weight", "bold")
		.text("Leyenda");

	legend.append("text")
		.attr("x", 4/5*width + 15)
		.attr("y", 1.2*height)
		.attr("font-family", "verdana")
		.text("estreno:");

	legend.append("text")
		.attr("x", 4/5*width + 8.5*8)
		.attr("y", 1.2*height + 25)
		.attr("font-family", "verdana")
		.text(`${d3.min(dates)}`);

	legend.append("text")
		.attr("x", 4/5*width + 8.5*8 + 120)
		.attr("y", 1.2*height + 25)
		.attr("font-family", "verdana")
		.text(`${d3.max(dates)}`);

	for (let d of dates) {
		legend.append("rect")
			.attr("class", "bar")
			.attr("id", "legend-bar")
			.attr("transform", `translate(${-margin.left}, ${-margin.top})`)
			.attr("x", `${4/5 * width + 100 + 11*8 + dates.indexOf(d)*((600/5) / dates.length)}px`)
			.attr("width", (600/5) / dates.length + 1)
			.attr("y", `${1.2*height + 50}px`)
			.attr("height", 25)
			.attr("fill", color(d, dates[0], dates[dates.length - 1]));
	}
}

var svg = d3.select("#svg_main");

var tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

main();
