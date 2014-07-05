var cardImageAspectRatio = 750 / 1050; // width / height
var currentCardID = 'factions';
var returnToCardID = null;

document.addEventListener('deviceready', function() {
	StatusBar.hide();
	$('#back').tap(function() {
		changeCard(currentCardID, returnToCardID);
	});
	$('.change-card').tap(function() {
		changeCard(currentCardID, $(this).attr('data-card-id'));
	});
}, false);

function htmlEncode(value){
	return $('<div/>').text(value).html().replace(/\"/g, '&quot;');
}

function changeCard(visibleCardID, newCardID) {
	$('#'+visibleCardID).hide();
	$('#title').html(htmlEncode($('#'+newCardID).attr('data-title')));
	$('#'+newCardID).show();
	if ($('#'+newCardID).attr('data-back-card-id')) {
		returnToCardID = $('#'+newCardID).attr('data-back-card-id');
		$('#back').show();
	} else {
		returnToCardID = null;
		$('#back').hide();
	}
	currentCardID = newCardID;
}