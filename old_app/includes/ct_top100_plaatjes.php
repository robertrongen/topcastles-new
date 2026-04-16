<div id="content" style="z-index: 4"> 
	<div class="feature">
	<h2 id="top">
		<?php
			echo $FeatureTitel_1_1;
			if ($TellerVan=="1") 
			{
				?> 1-20 <?php 
			}
			elseif ($TellerVan=="21")
			{
				?> 21-40 <?php 
			}
			elseif ($TellerVan=="41")
			{
				?> 41-60 <?php 
			}
			elseif ($TellerVan=="61")
			{
				?> 61-80 <?php 
			}
			else 
			{
				?> 81-100 <?php 
			}
		
		 echo $FeatureTitel_1_2; ?></h2>
	<br>
		<?php
	//  Query definieren
		$SelectString = "*";
		$Table = "castles";
		$WhereString = "";
		$OrderbyString = "";
	//  Query laden
		PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	//	Variabelen voor tabelopbouw zetten
		$Teller = 1;
		$TellerEind = $TellerVan + 19;
	//	Tabel opbouwen
		include ("content/{$Language}/tabel_20plaatjes.php");
	//  DataBase connectie sluiten
		include ("includes/dbclose.php");
		?> 
	</div>
	
	<div class="feature">
		<br>
		<h3><?php echo $FeatureTitel_2; ?></h3><br>
		<?php
	//  Query definieren
		$SelectString = "*";
		$Table = "castles";
		$WhereString = "";
		$OrderbyString = "";
	//  Query laden
		PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	//	Variabelen voor tabelopbouw zetten
		$Teller = 1;
		$TellerEind = $TellerVan + 19;
	//	Tabel opbouwen
		include ("content/{$Language}/tabel_top100.php");
	//  DataBase connectie sluiten
	//	include ("includes/dbclose.php");
		?>
	</div>
</div>
