$(function () {
  // Start by calling the initializeMap function, and wrap everything else in that
  var map = initializeMap();

  // Object containing category and id for each container, ie hotels, restaurants & activities
  var containerToInfo = {
    hotelOptionsContainer:['hotels', 'hotelListId'],
    restaurantOptionsContainer:['restaurants', 'restaurantListId'],
    activitiesOptionsContainer:['activities', 'activitiesListId']
  };
  // Tracker of number of days, default 1
  var days = 1;
  // Tracker of accumulated ids of items we add to itinerary
  var itemId = 0;
  // Array of day objects - each object consisting of key-value pairs where key is the category and value is an array of all the items of that category
  var dayArr = [{}, {}];
  // [{hotels: [hotel1, hotel2], restaurants: []...}, {hotels...}]

  // Add options to the dropdown menues to select from
  // Each category is an array
  function addOptions (category, id) {
    // Loop through each of the categories
    for(var i = 0; i < category.length; i++) {
      // Create an option element
      var element = document.createElement('OPTION');
      var textnode = document.createTextNode(category[i].name);
      element.appendChild(textnode);
      // Then append it as a child to the appropriate parent / select section, ie hotels, restaurants etc.
      document.getElementById(id).appendChild(element);
    }
    return element;
  }

  // The below invocations add all our options to each of the categories
  addOptions(hotels, 'hotel-choices');
  addOptions(restaurants, 'restaurant-choices');
  addOptions(activities, 'activity-choices');

  // Helper function to add a new item to the itinerary
  function addToItinerary (category, item, dayIndex) {
  	item.id = itemId;
  	itemId++;
    // check if the dayArr at the given index has a key for the given category
  	if (dayArr[dayIndex][category]) {
      // if so, push the new item to that array
  		dayArr[dayIndex][category].push(item);
  	} else {
      // if not, create a key value pair and put the item in the value array
  		dayArr[dayIndex][category] = [item];
  	}
  }

 function removeFromItinerary (category, item, dayIndex) {
 	var listOfAttractions = dayArr[dayIndex][category];
 	for(var i = 0; i < listOfAttractions.length; i++) {
 		if (listOfAttractions[i].id === item.id) {
 			dayArr[dayIndex][category].splice(i, 1);
 			break;
 		}
 	}
  }

  // Event Handler that adds items from dropdown menus to itinerary
  $('.btn').on('click', function () {
    var optionsContainer;
    var select;
    var val;
    // Check that the clicked button is an add button
    if($(this).data('action') === 'add') {
      // Get the data that we clicked on
      // First we need to get the parent of the button, an optionsContainer for either hotels, restaurants, or activities, in order to then access the select dropdown menu
      optionsContainer = $(this).parent();
      // We want to select index 1 of the children, which is all the items on the dropdown menu
      select = $(optionsContainer).children()[1];
      val = $(select).val(); // The selected value; a string e.g. 'Andaz Wall Street'
      // Create the list item, including its children
      var element = document.createElement('DIV');
      $(element).addClass('itinerary-item');
      var spanElement = document.createElement('SPAN');
      var textnode = document.createTextNode(val);
      spanElement.appendChild(textnode);
      $(spanElement).addClass('title');
      var newButton = document.createElement('BUTTON');
      textnode = document.createTextNode('x');
      newButton.appendChild(textnode);
      // Customizing button classes to match the other buttons
      $(newButton).addClass('btn btn-xs btn-danger remove btn-circle');
      element.appendChild(spanElement);
      element.appendChild(newButton);
      // Append the list item to the correct category in itinerary
      // First access the id of the parent element, in order to match it to the correct category
      var info = containerToInfo[$(optionsContainer).attr('id')];
      // Grab the id of the element as well
      var listId = info[1];
      // And grab the coordinates, to mark it on the map accordingly
      var coordinates;
      for(var i = 0; i < window[info[0]].length; i++) {
        // if the name of the category array index matches the val string we're looking for, then we can grab the coordinates
        if(window[info[0]][i].name === val) {
          // coordinates come from Place.location plus the category it belongs to
          coordinates = window[info[0]][i].place.location;
        }
      }
      // Draw out the markers
      var markerObj = drawMarker(info[0], coordinates, map);
      // Setting the data for marker and category
      $(element).data('marker', markerObj);
      $(element).data('category', info[0]); // category = 'hotels' etc
      document.getElementById(listId).appendChild(element);
      // Add to itinerary
      var currentDay = getCurrentDay();
      addToItinerary(info[0], element, currentDay);
    }
  });

  // function mapMarking () {

  // }

  function getCurrentDay () {
  	return Number($('.current-day').text());
  }

  // Event handler that removes items from itinerary and from map
  $('.list-group').on('click', '.remove', function () {
  	var category = $(this).parent().data('category');
  	var currentDay = getCurrentDay();
  	removeFromItinerary(category, $(this).parent()[0], currentDay);
    $(this).parent().data('marker').setMap(null);
  	$(this).parent().remove();
  });

  // Switching days
  function switchDay (targetDay) {
    // // Start with a blank map ????
    // $('.current-day').data('marker').setMap(null);
    // Sets the current-day class
	  $('.current-day').removeClass('current-day');
	  $(targetDay).addClass('current-day');
	  // Displaying the correct itinerary
	  // Empty the itinerary
	  $('#hotelListId').empty();
	  $('#restaurantListId').empty();
	  $('#activitiesListId').empty();
	  // Add the new stuff
	  var currentDay = getCurrentDay();
	  // Hotels
	  var hotelsArr = dayArr[currentDay]['hotels'] || [];
	  for(var i = 0; i < hotelsArr.length; i++) {
		  document.getElementById('hotelListId').appendChild(hotelsArr[i]);
	  }
	  // Restaurants
	  var restaurantsArr=dayArr[currentDay]['restaurants'] || [];
	  for(var i=0;i<restaurantsArr.length;i++){
		  document.getElementById('restaurantListId').appendChild(restaurantsArr[i]);
	  }
	  // Activities
	  var activitiesArr=dayArr[currentDay]['activities'] || [];
	  for(var i = 0; i < activitiesArr.length; i++) {
		  document.getElementById('activitiesListId').appendChild(activitiesArr[i]);
	  }
	  $('#displayed-day').text('Day ' + $(targetDay).text());
  }


  $('#day-buttons').on('click', '.day-btn', function () {
  	if(this.id !== 'day-add'){
  		switchDay(this);
    }
  })


  // Adding days to itinerary - clicking on '+' button
  $('#day-add').on('click', function () {
  	days++;
  	// var element=addElement('BUTTON',days.toString(),'day-buttons',['btn btn-circle day-btn current-day']);
  	if (!dayArr[days]) {
  		dayArr[days] = {};
  	}
	var element = document.createElement('BUTTON');
    var textnode = document.createTextNode(days.toString());
    element.appendChild(textnode);
    $(element).addClass('btn btn-circle day-btn');
    switchDay(element);
  	$(element).insertBefore($(this));
  });

// Remove a day
 $('#day-killer').on('click', function () {
 	if (days >= 1) {
 		days--;
 	}
 	// Remove the actual button
 	// Grab the thing before it
 	var target;
 	var dayToDelete = getCurrentDay();
 	if ($('.current-day').prev()[0]){
 		target = $('.current-day').prev();
 	} else {
 		if ($('.current-day').next()[0].id !== 'day-add'){
 			target = $('.current-day').next();
 		} else {
 			target = $('.current-day');
 		}
 	}
 	$('.day-btn:nth-last-child(2)').remove();
 	// Switch the view to another day & display

 	// Remove that day from the dayArr
 	dayArr.splice(dayToDelete,1);
 	switchDay(target);
 });



})


