<?php
// $img_folder is the path to the folder containing the images
// $th_folder is the path to the folder containing the thumbnails
// It is important that the filenames of the thumbnails are the
// same as the images
$img_folder = 'img_1440/';
$th_folder = 'img_120/';

//listing the files
$files = array();
foreach (glob($img_folder."*.[jJ][pP][gG]") as $file) {
	list($width, $height) = getimagesize($file);
	$files[] = array(
		'src' => $file,
		'w' => $width,
		'h' => $height,
		//'title' => $some_title //implement if you want to add titles to the images
		'msrc' => $th_folder.substr($file, strlen($img_folder))
	);
}
echo json_encode($files);
?>	