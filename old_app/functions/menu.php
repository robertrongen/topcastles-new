<?php 

function Menu($Menu,$Language,$NewSubMenu)
{
	$Url = $Menu .".php?SubMenu=" . $NewSubMenu."&amp;Language=".$Language;
	echo $Url;
}

function SelMenu($Menu,$Language,$NewSubMenu,$Select,$Value)
{
	$Url = $Menu .".php?SubMenu=" . $NewSubMenu ."&amp;" . $Select . "=" . $Value . "&amp;Language=".$Language;
	echo $Url;
}

//*******************************
//LOOKUP FUNCTIONS
//*******************************

function LookupPosition($Selection)
{
//  Verbinding maken met MySQL database
	include ("includes/dbconnect.php");
//  Query laden
	$SelectString = "position";
	$Table = "castles";
	$WhereString = "WHERE castle_code LIKE ('$Selection')";
	$OrderbyString = "";
//  Query laden
	$result = PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	$line = mysql_fetch_array($result, MYSQL_ASSOC);
//	SelPosition zetten
	$SelectedPosition = $line['position'] ;
	return $SelectedPosition ;
}

function LookupCountry($Selection)
{
//  Verbinding maken met MySQL database
	include ("includes/dbconnect.php");
//  Query laden
	$SelectString = "country";
	$Table = "castles";
	$WhereString = "WHERE castle_code LIKE ('$Selection')";
	$OrderbyString = "";
//  Query laden
	$result = PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	$line = mysql_fetch_array($result, MYSQL_ASSOC);
//	SelCountry zetten
	$SelectedCountry = $line['country'] ;
	return $SelectedCountry ;
}

function LookupRegion($Selection)
{
//  Verbinding maken met MySQL database
	include ("includes/dbconnect.php");
//  Query laden
	$SelectString = "region";
	$Table = "castles";
	$WhereString = "WHERE castle_code LIKE ('$Selection')";
	$OrderbyString = "";
//  Query laden
	$result = PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	$line = mysql_fetch_array($result, MYSQL_ASSOC);
//	SelCountry zetten
	$SelectedRegion = $line['region'] ;
	return $SelectedRegion ;
}

//*******************************
// NEXTCASTLE FUNCTIONS
//*******************************

function LookupNextCastlePosition($NextPosition)
{
//  Verbinding maken met MySQL database
	include ("includes/dbconnect.php");
//  Query laden
	$SelectString = "castle_code";
	$Table = "castles";
	$WhereString = "WHERE position LIKE ('$NextPosition')";
	$OrderbyString = "";
//  Query laden
	$result = PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	global $line ;
	$line = mysql_fetch_array($result, MYSQL_ASSOC);
//	SelPosition zetten
	global $Found ;
	if (!empty ($line)) 
		{ 
		$Found = 1 ; 
		return $line['castle_code'] ; 
		}
	else 
		{ $Found = 0 ; }
}

function NextCastleUp($CurrentCastle)
{
	$SelectedPosition = LookupPosition($CurrentCastle) ;
	
	global $PositionUp ;
	$PositionUp = $SelectedPosition + 1 ;
	global $CastleUp ;
	$CastleUp = LookupNextCastlePosition($PositionUp) ;
}

function NextCastleDown($CurrentCastle)
{
	$SelectedPosition = LookupPosition($CurrentCastle) ;

	global $PositionDown ;
	$PositionDown = $SelectedPosition - 1 ;
	global $CastleDown ;
	$CastleDown = LookupNextCastlePosition($PositionDown) ;
}

//*******************************
// NEXTCASTLECOUNTRY FUNCTIONS
//*******************************

function LookupNextCastleCountry($ThisCountry, $NextPosition, $Direction)
{
//  Zoek het volgende kasteel in de lijst
	global $Found ;
	$Found = 0;
	while (($Found == 0) AND ($NextPosition > 0) AND ($NextPosition < 1100))
	{
	//  Controleer het land van het volgende/vorige kasteel in de lijst
		$NextPosition = $NextPosition + $Direction;
	//	Query uitvoeren: haal info volgend kasteel op
		$SelectString = "castle_code, position, country";
		$Table = "castles";
		$WhereString = "WHERE position LIKE ('$NextPosition')";
		$OrderbyString = "";
	//  Query laden
		$result = PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		global $line ;
		$line = mysql_fetch_array($result, MYSQL_ASSOC);

	//  Kasteel uit hetzelfde land gevonden?
		$CheckCountry = $line['country'] ;
	//	Volgende kasteel is gevonden -> zoektocht beeindigen!
		if ($CheckCountry == $ThisCountry)
		{ 
			$Found = 1 ; 
			return $line['castle_code'] ; 
		}
	}
}

function NextCastleCountryUp($CurrentCastle)
{
	$SelectedCountry = LookupCountry($CurrentCastle) ;
	$SelectedPosition = LookupPosition($CurrentCastle) ;
	global $CastleCountryUp ; 
	$CastleCountryUp = LookupNextCastleCountry($SelectedCountry, $SelectedPosition, 1) ; 
	if ($Found == 1) 
	{ 
		return $CastleCountryUp ;
	}
}

function NextCastleCountryDown($CurrentCastle)
{
	$SelectedCountry = LookupCountry($CurrentCastle) ;
	$SelectedPosition = LookupPosition($CurrentCastle) ;
	global $CastleCountryDown ; 
	$CastleCountryDown = LookupNextCastleCountry($SelectedCountry, $SelectedPosition, -1) ; 
	if ($Found == 1) 
	{ 
		return $CastleCountryDown ;
	}
}

//*******************************
// NEXTCASTLEREGION FUNCTIONS
//*******************************

function LookupNextCastleRegion($ThisRegion, $NextPosition, $Direction)
{
//  Zoek het volgende kasteel in de lijst
	global $Found ;
	$Found = 0;
	while (($Found == 0) AND ($NextPosition > 0) AND ($NextPosition < 1100))
	{
	//  Controleer het land van het volgende/vorige kasteel in de lijst
		$NextPosition = $NextPosition + $Direction;
	//	Query uitvoeren: haal info volgend kasteel op
		$SelectString = "castle_code, position, region";
		$Table = "castles";
		$WhereString = "WHERE position LIKE ('$NextPosition')";
		$OrderbyString = "";
	//  Query laden
		$result = PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		global $line ;
		$line = mysql_fetch_array($result, MYSQL_ASSOC);

	//  Kasteel uit hetzelfde land gevonden?
		$CheckRegion = $line['region'] ;
	//	Volgende kasteel is gevonden -> zoektocht beeindigen!
		if ($CheckRegion == $ThisRegion)
		{ 
			$Found = 1 ; 
			return $line['castle_code'] ; 
		}
	}
}

function NextCastleRegionUp($CurrentCastle)
{
	$SelectedRegion = LookupRegion($CurrentCastle) ;
	$SelectedPosition = LookupPosition($CurrentCastle) ;
	global $CastleRegionUp ; 
	$CastleRegionUp = LookupNextCastleRegion($SelectedRegion, $SelectedPosition, 1) ; 
	if ($Found == 1) 
	{ 
		return $CastleRegionUp ;
	}
}

function NextCastleRegionDown($CurrentCastle)
{
	$SelectedRegion = LookupRegion($CurrentCastle) ;
	$SelectedPosition = LookupPosition($CurrentCastle) ;
	global $CastleRegionDown ; 
	$CastleRegionDown = LookupNextCastleRegion($SelectedRegion, $SelectedPosition, -1) ; 
	if ($Found == 1) 
	{ 
		return $CastleRegionDown ;
	}
}

?>
