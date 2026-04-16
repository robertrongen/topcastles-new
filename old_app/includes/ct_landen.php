<?php 
	if (($Keuze == "Land") OR ($Keuze == "Gebied") OR ($Keuze == "Regio"))
	{
		include ("includes/_ct_landen_main.php"); 
	}
	else if ($Keuze == "Toplanden")
	{
		include ("includes/_ct_landen_toplanden.php"); 
	}
	else
	{
		include ("includes/_ct_landen_topregios.php"); 
	}
?>
