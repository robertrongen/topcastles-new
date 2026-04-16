<?php
	function PerformQuery($SelectString, $Table, $WhereString, $OrderbyString)
	{
		$host = "localhost";
		$user = "topkastelen";
		$pass = "9kowbh6g";
		$dbname = "topkastelen_nl_-_topkastelen";
	// 	Verbinding maken met MySQL database
		$link = mysql_connect($host,$user,$pass) or die("Could not connect : " . mysql_error()."<BR>");
		mysql_select_db($dbname) or die("Could not select database");
	// 	Query uitvoeren
		$sSQL = "SELECT {$SelectString} FROM {$Table} {$WhereString} {$OrderbyString}" ;
	// 	Resultaat teruggeven
		global $result;
		$result = mysql_query($sSQL) or die("Query failed : " . mysql_error());
		return $result;
	}
?>
