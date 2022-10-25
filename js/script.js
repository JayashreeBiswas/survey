function startSurvey() {
	$("#msform").css("display", "block");
	$("#welcome_block_container").css("display", "none");
}
//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches
$("#msform").on( 'click', '.next', function(){
	console.log("hit");
	// console.log($("h4").html());
	// console.log($("input").val());
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	next_fs = $(this).parent().next();
	
	//activate next step on progressbar using the index of next_fs
	$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
	
	//show the next fieldset
	next_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale current_fs down to 80%
			scale = 1 - (1 - now) * 0.2;
			//2. bring next_fs from the right(50%)
			left = (now * 50)+"%";
			//3. increase opacity of next_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({
        'transform': 'scale('+scale+')',
        'position': 'absolute'
      });
			next_fs.css({'left': left, 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
});

$("#msform").on( 'click', '.previous', function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	previous_fs = $(this).parent().prev();
	
	//de-activate current step on progressbar
	$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
	
	//show the previous fieldset
	previous_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale previous_fs from 80% to 100%
			scale = 0.8 + (1 - now) * 0.2;
			//2. take current_fs to the right(50%) - from 0%
			left = ((1-now) * 50)+"%";
			//3. increase opacity of previous_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'left': left});
			previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
});

function submitform() {
	// Get the modal
	var modal = document.getElementById("myModal");
	modal.style.display = "block";

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	  modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	  if (event.target == modal) {
	    modal.style.display = "none";
	  }
	}
}

function submitSurvey() {
	var complete_survey = "completed";
	$("#myModal").css("display", "none");
	var $radio_inputs = $('#msform :input[type="radio"]');
	var $text_inputs = $('#msform :input[type="text"]');
    var values = {};
    $radio_inputs.each(function() {
        values[this.name] = $("input:radio[name="+this.name+"]:checked").val();
    });
    $text_inputs.each(function() {
        values[this.name] = $("input:text[name="+this.name+"]").val();
    });
    console.log(values);
    // var values = JSON.stringify(values);
    $.ajax({
    	url: "./controller/survey-backend.php",
    	data: {
          values: JSON.stringify(values),
          complete_survey: complete_survey
      	},
	    dataType: "json",
	    async: true,
	    cache: false,
    	type: "POST",
    	success: function(result) {
    		console.log(result);
    		if(result.status == "success"){
    			$("#msform").css("display", "none");
				$("#welcome_block_container").html("Thank you for your time and your valuable feedback!!!").css("display", "block");
    		}
    	}
    });
}

// fetch questions--------------
$(document).ready(function () {
    getSurveyQuestion();
});
function getSurveyQuestion() {
    // $(".page-loader").addClass("remove-translate");
    $.ajax({
        url: "./js/survey_questionaire.json",
        dataType: "json",
        type: "get",
        success: function(result){
            console.log(result);
            for (var i = 0; i < result.length; i++) {
            	
            	$("#progressbar").append("<li></li>");
            	if(result[i].input_type == "radio" && result[i].options != null){
            		var options = result[i].options.split(',');
            		console.log(options);
            		var type = result[i].input_type;
            		var name = result[i].input_name;
            		var field = "";
            		for (var j = 0; j < options.length; j++) {
            			console.log(options[j]); 
            			// <label><input type="radio" name="select" /><span>a</span> Item 1</label>
            			var field = field + "<label><input type='"+type+"' name='"+name+"' value='"+options[j]+"'><span>"+[j+1]+"</span></label>";
            		}
            		// var field = "<input type='"+result[i].input_type+"' name='"+result[i].input_name+"'>"
            	}
            	else if(result[i].input_type == "text" && result[i].options == null){
            		var field = "<input type='"+result[i].input_type+"' name='"+result[i].input_name+"' value=''>";
            	}
            	$("#msform").append("<fieldset id='"+result[i].id+"'><h2 class='fs-title'>Feedback</h2><h3 class='fs-subtitle'>This is step "+[i+1]+" of "+result.length+"</h3><h4>"+result[i].question+"</h4><div class='form-group'>"+field+"</div><input type='button' name='previous' class='previous action-button' value='Previous' /><input type='button' name='next' class='next action-button' value='Next' /></fieldset>");
            }
            $("#msform fieldset:first input.previous").remove();
            $("#msform fieldset:last-child input.next").remove();
            $("#msform fieldset:last-child").append("<input type='submit' name='submit' class='submit action-button' value='Submit' />");
            $("#progressbar li:first-child").addClass("active");
            // $(".page-loader").removeClass("remove-translate");
        }
    })
}