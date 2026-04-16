<?php
//  Menukeuze vaststellen en bijbehorende data ophalen

//	1. Keuze voor volgend kasteel in top 100 lijst? (NextCountry == 0)
	if ($NextCountry == 0)
	{
		$SelectString = "*";
		$Table = "castles";
		$WhereString = "WHERE position LIKE ('$SelPosition')";
		$OrderbyString = "";
	//  Query laden
		PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		$line = mysql_fetch_array($result, MYSQL_ASSOC);
	}

//	2. Keuze voor volgend kasteel uit het huidige land? 
	else
	{
	//	Variabelen zetten: huidige kasteel 
		$CurrentPosition = $SelPosition;

	//  Zoek het volgende kasteel in de lijst
		$Found = 0;
		while (($Found == 0) AND ($SelPosition > 0) AND ($SelPosition < 1000))
		{
		//  Controleer het land van het volgende/vorige kasteel in de lijst
			$SelPosition = $SelPosition + $NextCountry;
		//	Query uitvoeren: haal info volgend kasteel op
			$SelectString = "country";
			$Table = "castles";
			$WhereString = "WHERE position LIKE ('$SelPosition')";
			$OrderbyString = "";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
			$line = mysql_fetch_array($result, MYSQL_ASSOC);

		//  Kasteel uit hetzelfde land gevonden?
			$CheckCountry = $line['country'] ;

		//	Volgende kasteel is gevonden -> zoektocht beeindigen!
			if ($CheckCountry == $SelCountry)
			{
				$Found = 1;
			}
		}

		//	Melden dat er geen volgend kasteel is gevonden
		if ($Found == 0)
		{
			echo "Geen kasteel gevonden";
		//	SelPosition resetten naar positie van oorspronkelijk kasteel
			$SelPosition = $CurrentPosition;
		}

		//	Haal info kasteel op
			$SelectString = "*";
			$Table = "castles";
			$WhereString = "WHERE position LIKE ('$SelPosition')";
			$OrderbyString = "";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
			$line = mysql_fetch_array($result, MYSQL_ASSOC);
	}
?>
