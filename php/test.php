<?php
/**
 * Higanbana
 * 2018.10.10
 * @return 调用接口
 */
include './BigFile.php';
// if(!isset($_GET['fun']) && empty($_GET['fun'])) ;
if (!isset($_GET['fun'])) {
	$get = null;
}else{
	$get = $_GET['fun'];
}

// 确定有参数
$post = isset($_POST)?$post = $_POST:null;
$file = isset($_FILES)?$file = $_FILES:null; 
// 实例化对象
$BigFile = new BigFile();
$data = $BigFile->chuli($get,$post,$file);
echo $data;