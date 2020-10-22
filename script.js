//Treemap with D3

document.addEventListener('DOMContentLoaded', function(){

	//fetch initial data selection from select
	let dataselect = document.getElementById("dataselect"); 
	let sourceData = selectData(dataselect.value); 
	generatePage(sourceData);

	//fetch change on dataset selection 
	dataselect.addEventListener("change", function (){
		sourceData = selectData(dataselect.value);
		generatePage(sourceData);
	});

	function selectData(dataSelectValue){
		//Datasets
		const VIDEOGAMES = {
			title : "Video Games Sales",
			subtitle : "Top 100 Most Sold Video Games, categorized by platform", 
			link : "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
		}; 

		const KICKSTARTER = {
			title : "Kickstarter Pledges",
			subtitle : "Most popular by category", 
			link : "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
		}; 

		const MOVIESALES = {
			title : "Movie Sales",
			subtitle : "Most popular by category", 
			link : "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
		}; 

		switch (dataSelectValue){
			case "kickstarter" :
				return KICKSTARTER;
			case "movie" :
				return MOVIESALES;
			default :
				return VIDEOGAMES;	
		}		
	};
	
	function generatePage(sourceData){
		//Title
		d3.select("main")
		  .html("") //erase previous chart
		  .append("h1")
		  .attr("id", "title")
		  .text(sourceData.title);
		
		//Description
		d3.select("main")  
		  .append("p")
		  .attr("id", "description")
		  .text(sourceData.subtitle);

		//Parameters
		const w = 1000;
		const h = 700;
		const padding = 200; 
		
		//svg
		const svg = d3
			.select("main")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

		//Tooltip
      	const tooltip = d3
			.select("main")
			.append("div")
			.attr("id","tooltip")
			.style("visibility","hidden")
			.style("position","absolute");

		//get Data
		d3.json(sourceData.link)
			.then(response => plotTree(response),
			   	error => {
					throw new Error(error.message);
				})
			.catch(error => { console.log(error.message); alert(error.message); });


		function plotTree(data){

			//Get categories
			let categories = data.children.map(x => x.name);
			let root = d3
			 .hierarchy(data)
			 .sum(function(d){return d.value})
			 .sort( (a,b) => b.value - a.value); 
	
			//Colors
			let colors = d3.schemeSet3;
			colors = [...colors, "gold",  "yellow", "pink", "slateblue", "orange", "brown", "blue", "green","black", "grey", "darkgreen"];

			//Initialize tree map
			d3
			  .treemap()
			  .size([w, h - padding])
			  .padding(0)
			  (root);

			//Build groups
			const tree = svg
				.selectAll("g")
				.data(root.leaves())
				.enter()
				.append("g")
				.attr("class","group")
				.attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')');

			//Add rects and tooltip
			tree
			  .append("rect")
		      .attr('width', function (d) { return d.x1 - d.x0; })
		      .attr('height', function (d) { return d.y1 - d.y0; })
		      .style("stroke", "white")
		      .style("fill", d => getColor(d, categories, colors))
		      .attr("class","tile")
		      .attr("data-name", d => d.data.name)
		      .attr("data-category", d => d.data.category)
		      .attr("data-value", d => d.data.value)
		      .on("mouseover", function(event,d) {
		   		tooltip.transition().duration(100).style("visibility", "visible");
		   		tooltip.html(d.data.name + "<br>" + d.data.category + "<br>" + d.data.value )
		   			   .style("left",  event.pageX + 20 + "px" )
		   			   .style("top", event.pageY  + "px")
		   			   .attr("data-value", d.data.value );
		  	  })   
		  	  .on("mouseout",function(event){
		  		tooltip.transition().duration(100).style("visibility", "hidden");
		  	  })

		    //Add Label
		    tree
		       .append("text")
		       .selectAll("tspan")
		       .data(d => d.data.name.split(/\s(?=[A-Z][^A-Z])/))
		       .enter()
		       .append("tspan")   
      		   .text(d => d)
      		   .attr("x",5)
      		   .attr("dy", (d,idx) => {return (idx===0)? "0.7rem" : "0.6rem"});


      		//Add Legend
      		const legend = d3
				.select("svg")
				.append("g")
				.attr("id","legend")
				.attr('transform', 'translate( 0,' + (h - padding + 50) + ')');

	      	const nbCategories = categories.length; 
	      	const wLegendItem = 20 ; 
		  	const wLegend = wLegendItem * nbCategories ;
		  	const hLegend = wLegend / nbCategories ;
		  	const spacingLegend = 30;

	  		legend
	  		  .selectAll("g")
	  		  .data(colors.slice(0,nbCategories))
	  		  .enter()
	  		  .append("g")
	  		  .attr("class","legend-group")
	  		  .append("rect")
	  		  .attr("class","legend-item")
	  		  .attr("y",0)
	  		  .attr("x", (d, i) => i * (wLegend / nbCategories + spacingLegend))
	  		  .attr("width", wLegend / nbCategories)
	  		  .attr("height", wLegend / nbCategories)
	  		  .attr("fill", (d, i) => d);

	  		d3
	  		  .selectAll(".legend-group")
	  		  .append("text")
	  		  .attr("transform",(d,i) => "translate(" + (i * (wLegend / nbCategories + spacingLegend)) + ",20)")
	  		  .selectAll("tspan")	  			
		      .data((d,i) => categories[i].split(/\s/g))
		      .enter()
		      .append("tspan") 
		      .text(d => d)
		      .attr("x",0)
      		  .attr("dy", 10);	    	
		}	
  		   
		function getColor(d, categories, colors){

			let index = categories.indexOf(d.data.category); 
			return colors[index];

		}
	}
});