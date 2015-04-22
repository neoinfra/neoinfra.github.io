var directionMap = {
	latlngMap: {
		electronicCity : {
			lat: 12.839939,
        	lng: 77.677003
		},
		narayana : {
			lat: 12.809295,
        	lng: 77.695092
		},
		hclOffice : {
			lat: 12.7881976,
        	lng: 77.6470337
		},
		biocon : {
			lat: 12.821019,
        	lng: 77.675277
		},
		sarala : {
			lat: 12.8088475,
        	lng: 77.5838234
		},
		ryan : {
			lat: 12.8056715,
        	lng: 77.586529
		},
		amc : {
			lat: 12.828508,
        	lng: 77.589101
		}
	},
	googleDirectionDisplay: new google.maps.DirectionsRenderer(),
	googleDirectionService : new google.maps.DirectionsService(),
	start : function () { return new google.maps.LatLng(12.779381, 77.654005)},
	mapOptions : {
	    center: new google.maps.LatLng(12.779381, 77.654005),
	    zoom: 12
	},
	destination : function(key){ 
		var latlng  = this.latlngMap[key];
		return new google.maps.LatLng(latlng.lat, latlng.lng); 
	} ,
 	getDirections : function(key, map){
		var _that  = this;
		var request = {
			origin : _that.start(),
			destination: _that.destination(key),
			travelMode: google.maps.TravelMode.DRIVING
		}
		_that.googleDirectionService.route(request, function(response, status){
			if(status == google.maps.DirectionsStatus.OK){
				$('span.distance').html('<i class="fa fa-car fa-lg"></i>'+response.routes[0].legs[0].distance.text);
				directionMap.googleDirectionDisplay.setDirections(response);
				google.maps.event.trigger(map, 'resize');
			}
		});
	},
	display: function(key){
		var map = new google.maps.Map(document.getElementById('map-canvas'), this.mapOptions);
		this.googleDirectionDisplay.setMap(map); 
		this.getDirections(key, map);
	}
}

var recaptchaResponse = undefined;
function hrefscroll(e){
    if($(this).hasClass('carousel-control'))
    	return
	 // target element id
    var id = $(this).attr('href');

    // target element
    var $id = $(id);
    if ($id.length === 0) {
        return;
    }

    // prevent standard hash navigation (avoid blinking in IE)
    e.preventDefault();

    // top position relative to the document
    var pos = $(id).offset().top;
    // animated top scrolling
    $('body, html').animate({scrollTop: pos});
}

function openRecaptcha(){ 
    grecaptcha.render('recaptcha', {
        'sitekey': '6LfRoAUTAAAAAP_J_rFSfQ8QYV6BDdsns_wa1FI5',
        'callback': function(response){
        	recaptchaResponse = response;
        }
    });
}

function validateEmail(email) {
    var re = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    return re.test(email);
}

function validatePhone(phone){
	var re = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;
	return re.test(phone);
}

function validateForm(name, email, phone){
	if(name.length == 0){
		$('div.modal-body .alert span.message').html("Please provide your name. It makes it personal.");
		$('div.modal-body .alert').addClass('in');
		return false;
	}
	if(!validateEmail(email)){
		$('div.modal-body .alert span.message').html("Please enter a valid email");
		$('div.modal-body .alert').addClass('in');
		return false;
	}
	if(!validatePhone(phone)){
		$('div.modal-body .alert span.message').html("Please enter a valid phone number");
		$('div.modal-body .alert').addClass('in');
		return false;
	}
	if(recaptchaResponse === undefined){
		$('div.modal-body .alert span.message').html("Please complete the recaptcha. We can only contact humans.");
		$('div.modal-body .alert').addClass('in');
		return false;	
	}
	return true;
}

function getRegistrationFormData(){
	var email = $('form#register input#email').val();
	var phone = $('form#register input#phone').val();
	var name = $('form#register input#name').val();
	if(validateForm(name, email, phone)){
		submitForm({
			name : name,
			email : email,
			phone : phone,
			recaptcha : recaptchaResponse
		});
	}
}

function submitForm(formData) {
    var contactFormHost = 'http://neoinfra-contact.herokuapp.com/';
    //var contactFormHost = 'http://localhost:4567/';
    $.ajax({
        type: 'POST',
        url: contactFormHost + 'register',
        data: formData,
        dataType: 'json',
        success: function(response) {
            switch (response.message) {
                case 'success':
                	$('div.modal-body .alert span.message').html("Success. We'll get back to you as soon as we can!");
                    $('div.modal-body .alert').removeClass('alert-danger').addClass('alert-success in');
                    break;
                case 'failure_captcha':
                	alert("recaptcha failed");
                    break;

                case 'failure_email':
                	alert("failed to send email");
                	break;
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
        	console.log(thrownError);
        }
    });
}



$(document).ready(function(){
	if($(window).width() > 993)
		$("section, footer").height($(window).height());
	else{
		$("section#banner").height($(window).height());
		$("section:not(#banner), footer").css("padding", "200px 0");
	}
	if(google){
    	directionMap.display('electronicCity');
	}
    
    $("section#distances ul.map-index li").click(function(e){
    	$("section#distances ul.map-index li").removeClass("active");
    	$(e.target).addClass('active');
    	if(google)
    		directionMap.display($(e.target).attr('rel'));
    });
    
    $('header ul.nav li').on('click', function(e){
    	$('button#navbar-toggle').click();
    });
	
	$(document).on('click', 'a[href^="#"]', hrefscroll);
	
	$("#plotimg, #routeimg").elevateZoom({ 
		zoomType	: "inner", 
		cursor: "crosshair" 
	}); 

	$('button#location-toggle').on('click', function(e){
		$('#map-canvas').toggle();
		$('button#location-toggle i').removeClass("fa-chevron-down").addClass("fa-chevron-up");
	});
	
	$('#location-nav li').on('click', function(e){
		$('button#location-toggle span').replaceWith("<span>"+$(e.target).html()+"</span>");
		$('button#location-toggle i').removeClass("fa-chevron-up").addClass("fa-chevron-down");
		$('#location-nav').removeClass('in');
		$('#map-canvas').toggle();
	});

	$('div.modal button#form-submit').on('click', getRegistrationFormData);
	$('div.modal form input').on('focus', function(){
		$('div.modal div.alert').removeClass('in');
	});

	$('#register-modal').on('shown.bs.modal', function () {
		openRecaptcha();
  		$('form.input#name').focus();
	})
});
