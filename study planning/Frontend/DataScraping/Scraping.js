
var vidMap = ;





/////////////////////////////////////////////////////
//                Getting All Week ID's           //
/////////////////////////////////////////////////////

var weekList = [];
var full;
var weekOnly;
var uniqueWeek = [];

// Get all Weeks

$( "h4 a" ).each(function( index ) {
  full = $( this ).attr("href");
  var split = full.split("/");
  weekOnly = split[4];
  weekList.push(weekOnly);
});


// Get Unique Weeks

$.each(weekList, function(i, el){
    if($.inArray(el, uniqueWeek) === -1) uniqueWeek.push(el);
});

// Get total # weeks

var totalWeeks = uniqueWeek.length;



/////////////////////////////////////////////////////
//         Getting the number of Quiz Questions    //
/////////////////////////////////////////////////////


// Begin Snippet A

var chaps = [];
$( ".chapters section" ).each( function( index, element ){
    chaps.push($( this ).find( "dd" ).length);
});
var quMap = chaps.reduce(function(acc, cur, i) {
  acc[i] = cur;
  return acc;
}, {});

// End Snippet A



/////////////////////////////////////////////////////
//                Final Mapping                    //
/////////////////////////////////////////////////////

// Convert Objects to Arrays

var vidArray = $.map(vidMap, function(value, index) {
    return [value];
});
vidArray = vidArray.map(Number);

var quizArray = $.map(quMap, function(value, index) {
    return [value];
});
quizArray = quizArray.map(Number);


// Combine all 3 Arrays

var mapped = [];
for (i=0; i < uniqueWeek.length; i++) {
  mapped[i] = [uniqueWeek[i], vidArray[i], quizArray[i]]
};
copy(mapped);


