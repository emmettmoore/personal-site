d3.tsv("https://s3.us-east-2.amazonaws.com/emmettwmoore-assets/climbing-data.tsv", buildCharts)

PERIOD_START = new Date(2012, 1, 1);
PERIOD_END = new Date(2017, 12, 1);

Y_DOMAIN_START = 0;
Y_DOMAIN_END = 31;
Y_AXIS_TICK_MARGIN = 13;;

CHART_MARGIN = {top: 0, right: 20, bottom: 50, left: 20};
CHART_WIDTH = 964;
CHART_HEIGHT = 300;

OCCUPATION_COLOR_MAP = {
    "student": {
        "title": "College Student",
        "color": "#4d2612"
    },
    "break": {
        "title": "College Break",
        "color": "#ff7300",
    },
    "waiter": {
        "title": "Waiter",
        "color": "#fff52e",
    },
    "intern": {
        "title": "Intern at IBM",
        "color": "#99e0ff",
    },
    "unemployed": {
        "title": "Unemployed",
        "color": "#ff0000",
    },
    "insight": {
        "title": "Engineer at InsightSquared",
        "color": "#00B3E9",
    }
}


function buildCharts(data) {
    parseDate = d3.timeParse("%d-%b-%Y");
    for (i=0; i<data.length; i++) {
        data[i].date = parseDate(data[i].date);
        data[i].numDays = Number(data[i].numDays);
    }
    svg = d3.select(".line-graph");
    sizeSVG(svg);
    xAxis = getXAxis();
    yAxis = getYAxis();
    makeOccupationGraph(svg, data, xAxis, yAxis);
    legend = d3.select(".legend");
    makeLineGraph(svg, data, xAxis, yAxis);
    makeLegend(legend);
}

function makeLineGraph(svg, data, xAxis, yAxis) {
    lineGraph = getLineGraph(svg);
    addXAxis(lineGraph, xAxis);
    addYAxis(lineGraph, yAxis);
    addLine(lineGraph, data, xAxis, yAxis);
    addDots(lineGraph, data, xAxis, yAxis);
}

function sizeSVG(svg) {
        svg.attr(
            "width",
            CHART_WIDTH + CHART_MARGIN.left + CHART_MARGIN.right + Y_AXIS_TICK_MARGIN
         )
        .attr(
            "height",
            CHART_HEIGHT + CHART_MARGIN.top + CHART_MARGIN.bottom
        ) // svg height
}

function getLineGraph(svg) {
    return svg.append("g")
        .attr(
            "transform", // move right / down a bit
            "translate(" + CHART_MARGIN.left + "," + CHART_MARGIN.top + ")"
         )
}

function getXAxis() {
    return xAxis = d3.scaleTime()
        .domain([PERIOD_START, PERIOD_END])
        .range([0, CHART_WIDTH]);
}

function addXAxis(lineGraph, xAxis) {
    lineGraph.append("g")
        .attr("transform", "translate(" + Y_AXIS_TICK_MARGIN +"," + CHART_HEIGHT + ")")
        .call(
            d3.axisBottom(xAxis)
                .tickFormat(d3.timeFormat("%b %y"))
                .ticks(15)
        )
        .select(".domain")
        .remove()
}

function getYAxis() {
    return yAxis = d3.scaleLinear()
        .domain([Y_DOMAIN_START, Y_DOMAIN_END])
        .range([CHART_HEIGHT, 0]);
}

function addYAxis(lineGraph, yAxis) {
    lineGraph.append("g")
        .call(d3.axisLeft(yAxis))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Days per Month");
}

function getLine(xAxis, yAxis) {
    return d3.line()
        .x(function(d) { return xAxis(d.date); })
        .y(function(d) { return yAxis(d.numDays); })
        .curve(d3.curveCatmullRom.alpha(0.5))
}

function addLine(svg, data, xAxis, yAxis) {
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", getLine(xAxis, yAxis))
        .attr(
            "transform",
             "translate(" + Y_AXIS_TICK_MARGIN + ",0)"
        );
}

function addDots(lineGraph, data, xAxis, yAxis) {
    var tooltip = d3.select("body").append("div")
        .attr("class", "d3-tooltip")
        .style("opacity", 0);

    lineGraph.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d) { return xAxis(d.date) + Y_AXIS_TICK_MARGIN; })
        .attr("cy", function(d) { return yAxis(d.numDays); })
        .on("mouseover", function(d) {
            tooltip.transition().duration(200).style("opacity", 0.9)
            height = 50;
            width = 200;
            html = "<p>";
            if (d.location !== "") {
                height += 10;
                html += "<strong>"+d.location+"</strong><br>";
            }
            html += d3.timeFormat('%B %Y')(d.date) + "<br>";
            html += d.numDays + " Days<br>";
            if (d.comment !== "") {
                height += 40;
                html += d.comment + "</p>";
            }
            tooltip.html(html)
               .style("left", (d3.event.pageX) + "px")
               .style("top", (d3.event.pageY - (Number(height)) + "px"))
               .style("width", width + "px")
               .style("height", height + "px");
        })
       .on("mouseout", function(d) {
           tooltip.transition()
           .duration(500)
           .style("opacity", 0);
       });
}

function makeOccupationGraph(svg, data, xAxis, yAxis) {
    occupationGraph = svg.append("g");
    for (i=0; i< data.length; i++) {
        new_x = xAxis(data[i].date) + Y_AXIS_TICK_MARGIN + CHART_MARGIN.left;
        if (i != 0) {
            width = new_x - x;
            color = OCCUPATION_COLOR_MAP[data[i].occupation].color;
            addRect(occupationGraph, color, x, CHART_HEIGHT, width);
        }
        x = new_x;
    }
}

function addRect(svg, color, x, height, width) {
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", x)
        .attr("fill-opacity", "0.7")
        .attr("fill", color)
        .attr("shape-rendering","crispEdges")
}

function makeLegend(svg) {
    svg.attr("width", "200px")
        .attr("height", CHART_HEIGHT + CHART_MARGIN.top + CHART_MARGIN.bottom)
    keys = Object.keys(OCCUPATION_COLOR_MAP);
    y = 10;
    for (i=0; i<keys.length; i++) {
        title = OCCUPATION_COLOR_MAP[keys[i]].title;
        color = OCCUPATION_COLOR_MAP[keys[i]].color;
        addLegendItem(svg, title, color, y);
        y += 30;
    }
    fakeLineData = [3, 17];
    svg.append("path")
        .datum(fakeLineData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line().x(function(d) { return d; })
                            .y(function(d) { return y; })
        )
    svg.selectAll("dot")
        .data(fakeLineData)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d) { return d; })
        .attr("cy" , y);
    svg.append("text")
        .attr("x", 30)
        .attr("y", y+5)
        .attr("font-size", 10)
        .text("Days Climbed per Month");

}

function addLegendItem(svg, name, color, y) {
    svg.append("circle")
        .attr("r", 10)
        .attr("cx", 10)
        .attr("cy", y)
        .attr("fill-opacity", "0.7")
        .attr("fill", color)
        .attr("stroke-width", 3);
    svg.append("text")
        .attr("x", 30)
        .attr("y", y+5)
        .attr("font-size", 10)
        .text(name);


}
