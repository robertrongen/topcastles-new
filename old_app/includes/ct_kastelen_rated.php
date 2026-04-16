<div id="content" style="z-index: 4">
  <div class="feature">
	<?php
	//	Controle of gestemd is
		if (isset($HTTP_POST_VARS["Rating"]))
			{
			$Rating=$HTTP_POST_VARS["Rating"];
			$CastleCode = $SelCastle;
			SchrijfRating($CastleCode,$Rating);

	//	Melding dat niet gestemd is
			}
		else
			{
			$Rating = $Text1;
			}
	//	Melding dat niet gestemd is
		if ($Rating == "al")
		{
			$Rating = $Text3;
		}
		echo $Text2.$Rating.$Text4;

	//	Variabelen zetten
		$SelectString = "*";
		$Table = "castles";
		$WhereString = "WHERE castle_code LIKE ('$SelCastle')";
		$OrderbyString = "";
	//  Query laden
		include ("functions/perform_query.php");
		PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		$line = mysql_fetch_array($result, MYSQL_ASSOC);
	//	SelPosition zetten
		//$SelPosition = "SELECT position FROM castles WHERE castle_code LIKE ('$SelCastle')" ;
	//	tabel laden
		include ("content/$Language/tabel_kasteel.php");
	?>
  </div>
</div>