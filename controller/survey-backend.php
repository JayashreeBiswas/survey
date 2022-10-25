<?php session_start(); 
$sessionId = session_id();
$conn = mysqli_connect('localhost', 'jayashree', 'password@1');
$ab = mysqli_select_db($conn, 'survey');
if ($ab) {
	// echo "connected";
	$values = isset($_POST['values']) ? mysqli_real_escape_string($conn, $_POST['values']) : "";
	$complete_survey = isset($_POST['complete_survey']) ? mysqli_real_escape_string($conn, $_POST['complete_survey']) : "";
	// echo $_POST['values'];
	// exit();
	$sql = "INSERT INTO survey_feedback (session_id, feedback, status) VALUES ('$sessionId', '$values', '$complete_survey');";
	$post_data_query = mysqli_query($conn, $sql)or die(mysqli_error($conn));
	if($post_data_query){
		$json = array("status" => "success", "Success" => "added successfully!");
	}
	else{
		$json = array("status" => "failure", "Error" => "Error adding! Please try again!");
	}
	@mysqli_close($conn);
header('Content-type: application/json');

echo json_encode($json);
}
else{
	echo "Not connected";
}