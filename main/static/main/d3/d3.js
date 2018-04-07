d3.tsv("https://s3.us-east-2.amazonaws.com/emmettwmoore-assets/climbing-data.tsv", buildCharts)

function buildCharts(data) {
    for (i=0; i<data.length; i++) {
        data[i].date = parseDate(data[i].date);
        data[i].numDays = Number(data[i].numDays);
    }
    makeLineGraph(data);
}

parseDate = d3.timeParse("%d-%b-%Y");

function makeLineGraph(data) {
    var yAxisTickMargin = 13;
    var chartMargin = {top: 0, right: 20, bottom: 50, left: 20};
    var chartWidth = 964, chartHeight = 300;
    var x = d3.scaleTime()
        .domain([new Date(2012, 1, 1),
                 new Date(2017, 12, 1)])
        .range([0, chartWidth]);
    var y = d3.scaleLinear()
        .domain([0, 31])
        .range([chartHeight, 0]);

    function customXAxis(g) {
        g.call(xAxis);
        g.select(".domain").remove();
    }

    function customYAxis(g) {
        g.call(yAxis);
        g.select(".domain").remove();
        g.selectAll(".tick line")
            .attr("stroke", "#777")
            .attr("stroke-dasharray", "2,2")
        g.selectAll(".tick text").attr("x", -yAxisTickMargin).attr("dy", 3);
    }

    var tooltip = d3.select("body").append("div")
        .attr("class", "d3-tooltip")
        .style("opacity", 0);

    var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.numDays); })
        .curve(d3.curveCatmullRom.alpha(0.5))

    var xAxis = d3.axisBottom(x)
        .ticks(d3.timeYear);

    var yAxis = d3.axisRight(y)
        .tickSize(chartWidth + 8)
        .tickFormat(function(d) { return d; })
        .ticks(5);

    var lineGraph = d3.select(".line-graph")
        .attr("width", chartWidth + chartMargin.left + chartMargin.right)  //svg width
        .attr("height", chartHeight + chartMargin.top + chartMargin.bottom) // svg height
        .append("g")
        .attr(
            "transform", // move right / down a bit
            "translate(" + chartMargin.left + "," + chartMargin.top + ")"
         )

    lineGraph.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(x))
        .select(".domain")
        .remove()

    lineGraph.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Days per Mo.");

    lineGraph.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line)
        .attr(
            "transform",
             "translate(" + yAxisTickMargin + ",0)"
        );
    // Add the scatterplot
    lineGraph.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d) { return x(d.date) + yAxisTickMargin; })
        .attr("cy", function(d) { return y(d.numDays); })
        .on("mouseover", function(d) {
            if (d.location !== "") {
                height = "30";
                tooltip.transition().duration(200)
                .style("opacity", 0.9)
                html = "<h6>" + d.location+"</h6>";
                if (d.comment !== "") {
                    // programmatically set height XXX
                    height = "80";
                    html += "<p>" + d.comment + "</p>";
                }
                tooltip.html(html)
                   .style("left", (d3.event.pageX) + "px")
                   .style("top", (d3.event.pageY - (Number(height)) + "px"))
                   .style("height", height + "px");
            }
        })
       .on("mouseout", function(d) {
           tooltip.transition()
           .duration(500)
           .style("opacity", 0);
       });
}
