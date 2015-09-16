<?php
$files = array();
foreach (glob("img/*.[jJ][pP][gG]") as $file) {
	list($width, $height) = getimagesize($file);
	$files[] = array(
		'src' => $file,
		'w' => $width*20,
		'h' => $height*20
	);
}
echo json_encode($files);
?>	