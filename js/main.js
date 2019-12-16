function purge(array, attr, check, n) {
	return array.sort((a, b) => {
		if (isNaN(a[attr]) || isNaN(a[check])) return -1;
		if (isNaN(b[attr]) || isNaN(b[check])) return 1;
		return a[attr] - b[attr];
	}).slice(array.length - samples);
}

function databox(d) {
	
}

async function main() {
	await raw;
	data = purge(raw.slice(), indep, dep, samples);

	var svg = d3.select("#svg_main");

	var height = parseInt(svg.style("height")) - margin.top - margin.bottom,
		width = parseInt(svg.style("width")) - margin.left - margin.right;

	svg = svg.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`)

	var chartArea = { "width": width - margin.left - margin.right,
			"height": height - margin.top - margin.bottom };

	var min_y = d3.min(data.map(d => { return d[dep]; })),
		max_y = d3.max(data.map(d => { return d[dep]; })),
		init = Math.round(max_y / Math.round(1 + max_y / min_y));

	// console.log(data.map(d => { return d[indep]; }), data.map(d => { return d[dep]; }));

	var x = d3.scaleBand().rangeRound([0, width]).domain(data.map(d => { return d[indep]; })).padding(.05);
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

	if (samples > 30 && (
		indep == "worldwide_gross" ||
		indep == "gross_usa" ||
		indep == "opening_weekend_usa" ||
		indep == "budget"))
			svg.select(".xAxis").selectAll(".tick text")
				.attr("text-anchor", "end")
				.attr("transform", `rotate(-${samples/70 * 45})`);

	let background = svg.append("g")
		.attr("class", "bg");
	for (let d of data) {
		let names = background.append("g")
			.attr("id", d.ID)
			.attr("transform", "rotate(-90)");
		names.append("text")
			.attr("y", x(d[indep]) + x.bandwidth() / 2 + 5)
			.attr("x", -height + x.bandwidth() / 4)
			.attr("font-family", "verdana")
			.attr("font-size", `${Math.min(30/samples * 22, 22)}px`)
			.attr("fill", "#999999")
			.text(d.title)
			.on("click", _ => window.open(url + d.ID));
	}

	svg.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", d => { return x(d[indep]); })
		.attr("width", x.bandwidth())
		.attr("y", d => { return y(d[dep]); })
		.attr("height", d => { return height - y(d[dep]) })
		.attr("fill", "lime")
		.on("click", d => window.open(url + d.ID));;

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
		.attr("y", height + 50 + (samples/70 * 10))
		.attr("x", width / 2)
		.attr("font-size", "26px")
		.attr("text-anchor", "middle")
		.attr("font-family", "verdana")
		.text(text_labels[indep]);

	for (let d of data) {
		let names = labels.append("g")
			.attr("id", d.ID)
			.attr("transform", "rotate(-90)");
		names.append("clipPath")
			.attr("id", `clip${d.ID}`)
			.append("rect")
				.attr("y", x(d[indep]))
				.attr("x", -height)
				.attr("height", x.bandwidth())
				.attr("width", height - y(d[dep]));
		names.append("text")
			.attr("y", x(d[indep]) + x.bandwidth() / 2 + 5)
			.attr("x", -height + x.bandwidth() / 4)
			//.attr("font-weight", "bold")
			.attr("font-family", "verdana")
			.attr("font-size", `${Math.min(30/samples * 22, 22)}px`)
			.text(d.title)
			.attr("style", `clip-path: url(#clip${d.ID})`)
			.on("click", _ => window.open(url + d.ID));;
	}
}

main();
