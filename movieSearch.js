var apikey = "37e7a5cb2b4f66257a0b6632a59060a5";
var genres;
$(document).ready(function() {
	var favIds = [];
	/*$( "search" ).autocomplete({
		minLength: 1,
		source: function( request, response ) {
			$.getJSON( "https://api.themoviedb.org/3/search/movie?api_key=" + apikey + "&language=en-US&query=" + request.ter + "&page=1&include_adult=false", function( data, status, xhr ) {
				var results = [];
				$.each(data["results"], function(index, value) {
					results += value["title"];
				});
				response( results );
			});
		}
	});*/
	$.getJSON("https://api.themoviedb.org/3/genre/movie/list?api_key=" + apikey +"&language=en-US", function(data) {
		genres = data["genres"];
	});
	$( "#movies" ).accordion({
		collapsible: true,
		heightStyle: "content",
		header: "> div > h3"
	});
	$( "#favList" ).accordion({
		collapsible: true,
		heightStyle: "content",
		header: "> div > h3",
	})
	$("#favList").droppable({
		drop: function( event, ui ) {
			let isInList = false;
			$.each(favIds, function (index, value) {
				if (value === ui["draggable"].attr('id')) {
					isInList = true;
				}
			});
			if (!isInList) {
				favIds.push(ui["draggable"].attr('id'));
				$.getJSON("https://api.themoviedb.org/3/movie/"+ ui["draggable"].attr('id') + "?api_key=" + apikey +"&language=en-US", function (data) {
					//alert(createMovieItem(data));
					$(createMovieItem(data, "fav")).appendTo( "#favList" );
					if (data["vote_count"] > 0){
						$( "#ratings" + data["id"] + "fav" ).progressbar({
							value: data["vote_average"],
							max: 10
						});
						$('<div class="rLabel">' + data["vote_average"]*10 + '%</div>').appendTo("#ratings" + data["id"] + "fav");
						if (data["vote_average"] <= 5){
							$("#ratings" + data["id"] +"fav" ).find( ".ui-progressbar-value" ).css({"background" : "#E61E0A"});
						}
						else if (data["vote_average"] <= 7.5) {
							let colorval = (data["vote_average"] -5)*160;
							let colorstring = "rgb(230," + Math.floor(colorval+30) + ", 10)";
							$("#ratings" + data["id"] +"fav" ).find( ".ui-progressbar-value" ).css({"background" : colorstring});
						}
						else {
							let colorval = (data["vote_average"] -7.5)*160;
							let colorstring = "rgb(" + Math.floor(230-colorval) + ", 230, 10)";
							$("#ratings" + data["id"] +"fav" ).find( ".ui-progressbar-value" ).css({"background" : colorstring});
						}
					}
					else {
						$( "#ratings" + data["id"] + "fav" ).progressbar({
							value: 10,
							max: 10
						});
						$('<div class="rLabel"> No Rating </div>').appendTo("#ratings" + data["id"] + "fav");
					}
					$("#favList").accordion("refresh");
				}); //endGetJSON
			}
  		}
	});

	$("button#searchB").click(function () {searchDB($("input#search").val(), 1)});
	$('input#search').keypress(function(event) {
    	if (event.keyCode == 13 || event.which == 13) {
        	searchDB($("input#search").val(), 1);
        	event.preventDefault();
    	}
	});
});

//function to search the database
function searchDB(searchString, pageNo) {
	$.getJSON("https://api.themoviedb.org/3/search/movie?api_key=" + apikey + "&language=en-US&query=" + searchString + "&page=" + pageNo + "&include_adult=false", function(data) {
		if(data["status_code"]) {
			alert("error");
		} //end if
		else {

			$("#movies").empty();
			$("#movies").append("<br>");
			$.each(data["results"], function(index, value) {
				$(createMovieItem(value, "movie")).appendTo( "#movies" );
				if (value["vote_count"] > 0){
					$( "#ratings" + value["id"] +"movie" ).progressbar({
						value: value["vote_average"],
						max: 10
					});
					$('<div class="rLabel">' + value["vote_average"]*10 + '%</div>').appendTo("#ratings" + value["id"] +"movie" );
					if (value["vote_average"] <= 5){
						$("#ratings" + value["id"] +"movie" ).find( ".ui-progressbar-value" ).css({"background" : "#E61E0A"});
					}
					else if (value["vote_average"] <= 7.5) {
						let colorval = (value["vote_average"] -5)*160;
						let colorstring = "rgb(230," + Math.floor(colorval+30) + ", 10)";
						$("#ratings" + value["id"] +"movie" ).find( ".ui-progressbar-value" ).css({"background" : colorstring});
					}
					else {
						let colorval = (value["vote_average"] -7.5)*160;
						let colorstring = "rgb(" + Math.floor(230-colorval) + ", 230, 10)";
						$("#ratings" + value["id"] +"movie" ).find( ".ui-progressbar-value" ).css({"background" : colorstring});
					}
				}
				else {
					$( "#ratings" + value["id"]  +"movie" ).progressbar({
						value: 10,
						max: 10
					});
					$('<div class="rLabel"> No Rating </div>').appendTo("#ratings" + value["id"]  +"movie" );
				}
			});
			$( "#movies" ).accordion( "refresh" );
			$( "#movies > div > .movieItem" ).draggable({ revert: true, cursor: "grab", zIndex: 10, helper: "clone", handle: "#handle" });
			$("#movies").append('<br><div class="controls"><button id="prev"><span class="ui-icon ui-icon-arrow-1-w">' +
			'</span>Prev</button><button id ="pageno">' + pageNo + '</button><button id="next">Next' +
			'<span class="ui-icon ui-icon-arrow-1-e"></span></div><br>');
			$( "#pageno" ).button({disabled: true});
			if (pageNo === 1) {
				$( "#prev" ).button({disabled: true});
			} else {
				$( "#prev" ).button({disabled: false});
			}
			if (pageNo === data["total_pages"]) {
				$( "#next" ).button({disabled: true});
			} else {
				$( "#next" ).button({disabled: false});
			}
			$("#movies").append('<script>$("button#prev").click(function() {searchDB("'+ searchString + '", '+ (pageNo-1) + ')});'+
			' $("button#next").click(function() {searchDB("'+ searchString + '", ' + (pageNo+1) +')});</script>')
		} //end else
	});//end getJSON
}//end searchDB

//function to create an item to display
function createMovieItem (value, typeString) {
	var resultString = '<div>';
	resultString += '<h3 id="' + value["id"] + '" class="movieItem"><span id="handle">' + value["title"] + "</span></h3>";
	resultString +='<div class="movieContent">';
	resultString += '<div class="ratings" style="position:relative" id="ratings' + value["id"] + typeString +'"></div>';
	if (value["poster_path"] !== null) {
		resultString += '<div class="poster">';
		resultString += '<img src="https://image.tmdb.org/t/p/w185' + value["poster_path"] + '" alt="' + value["title"] + '">';
		resultString += '</div>'
	}
	resultString += '<div class= "movieData"><h3 class="title">' + value["title"] + '</h3>';
	resultString += '<span class="genres">';
	if ("genre_ids" in value) {
		if (value["genre_ids"].length > 0){
			$.each(value["genre_ids"], function(j, genreID) {
				if (j>0) {
				resultString += ", "
				}
				$.each(genres, function(i, genre2) {
					if (genre2["id"] === genreID) {
						resultString += genre2["name"];
					}
				});
			});
		}
		else {
			resultString += "No Genres Found"
		}
	}
	else if ("genres" in value) {
		if (value["genres"].length > 0) {
			$.each(value["genres"], function (i, genre) {
				if (i>0) {
					resultString += ", "
				}
				resultString += genre["name"] + "";
			});
		}
		else {
			resultString += "No Genres Found"
		}
	}
	resultString += "</span>"
	if (value["overview"].length > 0) {
		resultString +='<p class="overview">' + value["overview"] + "<p>";
	}
	else {
		resultString += '<p class="overview"> No Overview Found <p>';
	}
	resultString +="</div>";
	resultString += '</div>';
	return resultString + "</div>";
} //end createMovieItem
