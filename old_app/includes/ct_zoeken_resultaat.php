<div id="content" style="z-index: 4">

	<div class="feature">
		<h2><?php echo $FeatureTitel_1;?></h2><br>
		
		<table>
			<?php 
				if ($SearchCastle <> "0" AND $SearchCastle <> "") 
					{ ?> <tr><td width="50"><?php echo "Naam: "?> </td><td width=100> <strong><?php echo $SearchCastle; ?></strong></td><?php } 
				if ($SearchDesciption <> "0" AND $SearchDesciption <> "") 
					{ ?> <tr><td width="50"><?php echo "Beschrijving: "?> </td><td width=100> <strong><?php echo $SearchDesciption; ?></strong></td><?php } 
				if ($SearchPlace <> "0")
					{ ?> <tr><td width="50"><?php echo "Plaats: "?></td><td width=100> <strong><?php echo $SearchPlace; ?></strong> </td> <?php }
				if ($SearchRegion <> "0")
					{ ?> <tr><td width=50><?php echo "Regio: "?></td><td width=100> <strong><?php echo $SearchRegion; ?></strong> </td> <?php }
				if ($SearchCountry <>"Leeg")
					{ ?> <tr><td width="50"><?php echo "Land: "?></td><td width=100> <strong><?php echo $SearchCountry; ?></strong> </td> <?php }
				if ($SearchGebied <>"Leeg")
					{ ?> <tr><td width="50"><?php echo "Gebied: "?></td><td width=100> <strong><?php echo $SearchGebied; ?></strong> </td> <?php }
				if ($SearchCastleType > 0)
					{ ?> <tr><td width="50"><?php echo "Ligging: "?></td><td width=100> <strong><?php echo $SearchCastleType; ?></strong> </td> <?php }
				if ($SearchCastleConcept > 0)
					{ ?> <tr><td width="50"><?php echo "Bouwconcept: "?></td><td width=100> <strong><?php echo $SearchCastleConcept; ?></strong> </td> <?php }
				if ($SearchFounder <> "0")
					{ ?> <tr><td width="50"><?php echo "Stichter: "?></td><td width=100> <strong><?php echo $SearchFounder; ?></strong> </td> <?php }
				if ($SearchEra > 0)
					{ ?> <tr><td width="50"><?php echo "Tijdperk: "?></td><td width=100> <strong><?php echo $SearchEra; ?></strong> </td> <?php }
				if ($SearchCondition > 0)
					{ ?> <tr><td width="50"><?php echo "Toestand: "?></td><td width=100> <strong><?php echo $SearchCondition; ?></strong> </td> <?php }
			?>
		</table> 
	
		<?php
			//base query
			$searchStmt = " " ;
			//plus concatenated query
			if ($SearchCastle <> "0" AND $SearchCastle<>"")
			{
				$searchStmt .= "castle_name LIKE '%$SearchCastle%' and " ;
			}
			if ($SearchDesciption <> "0" AND $SearchDesciption<>"")
			{
				$searchStmt .= "description LIKE '%$SearchDesciption%' OR remarkable LIKE '%$SearchDesciption%' and " ;
			}
			if ($SearchPlace <> "0")
			{
  				$searchStmt .= "place LIKE '%$SearchPlace%' and " ;
			}
			if ($SearchRegion <> "0")
			{
			   	$searchStmt .= "region LIKE '%$SearchRegion%' and " ;
			}
			if ($SearchCountry <> "Leeg")
			{
			   	$searchStmt .= "land LIKE '$SearchCountry' and " ;
			}
			if ($SearchGebied <> "Leeg")
			{
			   	$searchStmt .= "Gebied LIKE '%$SearchGebied%' and " ;
			}
			if ($SearchCastleType > 0)
			{
			   	$searchStmt .= "ct_code LIKE '$SearchCastleType' and " ;
			}
			if ($SearchCastleConcept > 0)
			{
			   	$searchStmt .= "cc_code LIKE '$SearchCastleConcept' and " ;
			}
			if ($SearchFounder > "0")
			{
			   	$searchStmt .= "founder LIKE '%$SearchFounder%' and " ;
			}
			if ($SearchEra > 0)
			{
			   	$searchStmt .= "era LIKE '$SearchEra' and " ;
			}
			if ($SearchCondition > 0)
			{
			   	$searchStmt .= "c_code LIKE '$SearchCondition' and " ;
			}
			
			//  Query definieren
				$SelectString = "*";
				$Table = "castles";
				$WhereString = "WHERE ". $searchStmt . "position > 0 ";
				//substr($searchStmt, 0, strlen($searchStmt)-4) ;  // haalt "and " van de string;
				$OrderbyString = "ORDER BY $Sorteer";
			//  Query laden
				PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
			//	echo $SelectString . $WhereString . $OrderbyString;
		
			//	Variabelen voor tabelopbouw zetten
				$TellerVan = 1;
				$Teller = 1;
				$TellerEind = 100;
		
			//	Tabel opbouwen
				include ("content/{$Language}/tabel_top100.php");
			//  DataBase connectie sluiten
				include ("includes/dbclose.php");
		?>
	</div>

</div>