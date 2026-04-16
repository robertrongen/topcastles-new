<div id="content" style="z-index: 4"> 
	<div class="feature">
	<h2 id="top"><?php echo $FeatureTitel_1; ?></h2>
	<br>
	<?php echo $FeatureText1; ?>
	<br>
	<br>
		<?php
		//  Query definieren
			$SelectString = "*";
			$Table = "castles";
			$WhereString = "WHERE position_ref > 0";
			$OrderbyString = "ORDER BY position_ref";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 100;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_20plaatjes.php");
		//  DataBase connectie sluiten
		//	include ("includes/dbclose.php");
		?>
	</div>
	
	<div class="feature">
		<br>
		<h3><?php echo $FeatureTitel_2; ?></h3><br>
	<br>
	<?php
	//  Query definieren
		$SelectString = "*";
		$Table = "castles";
		$WhereString = "WHERE position > 0";
		$OrderbyString = "ORDER BY position_ref";
	//  Query laden
		PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	//	echo $sSQL;
		$TellerVan = 1;
		$Teller = 1;
		$TellerEind = 100;
	//	Tabel opbouwen
		include ("content/{$Language}/tabel_top100ref.php");
	//  DataBase connectie sluiten
		include ("includes/dbclose.php");
	?> 
	</div>
</div>
