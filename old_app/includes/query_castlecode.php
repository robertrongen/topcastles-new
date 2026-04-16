<?php
//  verbinding maken met MySQL database
	include ("includes/dbconnect.php");
	
//	query uitvoeren
	$sSQL = "SELECT * FROM castles WHERE castle_code LIKE '$SelCastle'" ;
	$result = mysql_query($sSQL) or die("Query failed : " . mysql_error());

//	data laden
	$line = mysql_fetch_array($result, MYSQL_ASSOC);
?>
