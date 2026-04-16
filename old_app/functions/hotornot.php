<?php

function Rated($RatedCastleCode)
{
//  verbinding maken met MySQL database
	include ("includes/dbconnect.php");

//  mysql_query("DELETE FROM stemmen WHERE FROM_UNIXTIME(time,'%d') != FROM_UNIXTIME(unix_timestamp(),'%d')");
	$query = mysql_query("SELECT * FROM stemmen WHERE ip='".$_SERVER['REMOTE_ADDR']."' AND castle_code='".$RatedCastleCode."'") or die(mysql_error());
    $result = mysql_num_rows($query);
	$ratingcheck = mysql_fetch_array($query, MYSQL_ASSOC);
//	Controle of al gestemd is
	global $Rated;
	if(empty($result))
	{ 
		$Rated = 0;
	}
	else 
	{ 
		$Rated = 1;
		global $Rating;
		$Rating = $ratingcheck['Rating'];
	}
}

function SchrijfRating($CastleCode,$Rating)
{
	// Voting is intentionally disabled in static top-100 mode.
	return;
}

function HotOrNot($RatingCastlecode)
{
//  verbinding maken met MySQL database
	include ("includes/dbconnect.php");

//	query uitvoeren
	$RatingResult = mysql_query("SELECT ((sum(Rating)+5)/(count(*)+1)) AS gemiddelde FROM stemmen where castle_code='".$RatingCastlecode."'");
	$RatingLine = mysql_fetch_array($RatingResult, MYSQL_ASSOC);
	if (!$RatingResult)
		return 0;
	else
	{
		return round($RatingLine['gemiddelde'], 1);
	}	
}

function Bezoekers($RatingCastlecode)
{
//  verbinding maken met MySQL database
	include ("includes/dbconnect.php");

//	query uitvoeren
	$RatingResult = mysql_query("SELECT count(*) AS bezoekers FROM stemmen where castle_code='".$RatingCastlecode."'");
	$RatingLine = mysql_fetch_array($RatingResult, MYSQL_ASSOC);
	if (!$RatingResult)
		return 0;
	else
	{
		return $RatingLine['bezoekers'];
	}	
}
?>