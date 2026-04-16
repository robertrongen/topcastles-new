<?php
	$host = "localhost";
	$user = "topkastelen";
	$pass = "9kowbh6g";
	$dbname = "topkastelen_nl_-_topkastelen";
	// verbinding maken met MySQL database
	$link = mysql_connect($host,$user,$pass) or die("Could not connect : " . mysql_error()."<BR>");
	mysql_select_db($dbname) or die("Could not select database");
?>