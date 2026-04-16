<?php

function SchrijfAntwoord($Enquete,$Answer)
{
	// Poll voting is intentionally disabled in static mode.
	return;
}

function Enquete($Enquete,$Answer)
{
//  verbinding maken met MySQL database
	$host = "localhost";
	$user = "topkastelen";
	$pass = "9kowbh6g";
	$dbname = "topkastelen_nl_-_topkastelen";
	$tblname = "enquetes";
	$link = mysql_connect($host,$user,$pass) or die("Could not connect : " . mysql_error()."<BR>");
	mysql_select_db($dbname) or die("Could not select database");

	$EnqueteResult = mysql_query("SELECT count(*) AS score FROM enquetes where enquete='".$Enquete."' AND answer='".$Answer."' ");
	$EnqueteLine = mysql_fetch_array($EnqueteResult, MYSQL_ASSOC);
	if (!$EnqueteResult)
		return 0;
	else
		return $EnqueteLine['score'];
}

function Blok($Aantal,$Kleur)
{
	if ($Aantal >= 1)
	{
	$width = ($Aantal * 3);
	$Blokjes = "
	<img height = '12' src='images/bar/bar_center_" . $Kleur . ".jpg' width='" . $width . "'>
	";
	return $Blokjes;
	}
}
//	<img src='images/bar/bar_left_" . $Kleur . ".jpg'>
//	<img src='images/bar/bar_right_" . $Kleur . ".jpg'>

function perc_result($count, $total)
{
    if($count!==0)
	{
        $perc=round(($count/$total)*100);
        return $perc;
	} 
	else 
	{
		return 0;
	}
}

function GetEnquetevragen($EnqueteContent,$Content)
{
//  verbinding maken met MySQL database
	include ("includes/dbconnect.php");

//  query uitvoeren
	$tblname = "enquetevragen";
	$EnqueteVragenResult = mysql_query("SELECT * FROM enquetevragen where enquete_content='".$EnqueteContent."'");
	$EnqueteLine = mysql_fetch_array($EnqueteVragenResult, MYSQL_ASSOC);
	if (!$EnqueteVragenResult)
		return 0;
	else
	{
		$ReturnContent = $EnqueteLine[$Content];
		return $ReturnContent;
	}
}

?>