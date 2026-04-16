<div id="content" style="z-index: 4">
	<div class="feature">
		<h2 id="top">
		<?php
		//  Query definieren
			$SelectString = "*";
			$Table = "castles";
			$WhereString = "WHERE land LIKE ('$SelCountry')";
			$OrderbyString = "";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
			$line2 = mysql_fetch_array($result, MYSQL_ASSOC);
			if ($Language=="nl") {$SelText = $line2['land'];} else {$SelText = $line2['country'];}
			$SelText = ucwords($SelText);
			echo $FeatureTitel_1.$SelText; 
		?>
		</h2>
		<br>
		<?php 

		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 110;

		//	Tabel opbouwen
			include ("content/{$Language}/tabel_20plaatjes.php");
		//  DataBase connectie sluiten
		//	include ("includes/dbclose.php");
		?>
	</div>

	<div class="feature">
		<br>
		<h3><?php echo $FeatureTitel_2; ?></h3><br>
		<?php
		//  Query definieren
			$SelectString = "*";
			$Table = "castles";
			$WhereString = "WHERE land LIKE ('$SelCountry')";
			$OrderbyString = "";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 110;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_top100_land.php");
		//  DataBase connectie sluiten
			include ("includes/dbclose.php");
		?>
	</div>

</div>