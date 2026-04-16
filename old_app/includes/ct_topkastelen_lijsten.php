<div id="content" style="z-index: 4"> 
	<div class="feature">
	<h2 id="top">
		<?php
			echo $FeatureTitel_1_1;
			if ($TellerVan=="101") 
			{
				?> 101-200 <?php 
			}
			elseif ($TellerVan=="201") 
			{
				?> 201-300 <?php 
			}
			elseif ($TellerVan=="301")
			{
				?> 301-400 <?php 
			}
			elseif ($TellerVan=="401") 
			{
				?> 401-500 <?php 
			}
			elseif ($TellerVan=="501")
			{
				?> 501-600 <?php 
			}
			elseif ($TellerVan=="601")
			{
				?> 601-700 <?php 
			}
			elseif ($TellerVan=="701") 
			{
				?> 701-800 <?php 
			}
			elseif ($TellerVan=="801") 
			{
				?> 801-900 <?php 
			}
			else 
			{
				?> 901-1000 <?php 
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
		$TellerEind = $TellerVan + 199;
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
		$TellerEind = $TellerVan + 199;
	//	Tabel opbouwen
		include ("content/{$Language}/tabel_top100.php");
	//  DataBase connectie sluiten
	//	include ("includes/dbclose.php");
		?>
	</div>
</div>
