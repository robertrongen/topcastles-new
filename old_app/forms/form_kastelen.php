<!-- action was naar _next -->
<FORM method="post" action="kastelen.php" id=form82 name=form82>
	<?php

	 if (isset($HTTP_POST_VARS["SelCountry"]))
		$SelCountry=$HTTP_POST_VARS["SelCountry"];
	 else
		$SelCountry="nederland";
	 
	if (isset($HTTP_POST_VARS["NextCountry"]))
		$NextCountry=$HTTP_POST_VARS["NextCountry"];
	else
		$NextCountry="0";

/*	 if (isset($HTTP_POST_VARS["SelCastle"]))
		$SelCastle=$HTTP_POST_VARS["SelCastle"];
	 else if (isset($_GET['SelCastle']))
	 	{$SelCastle= $_GET['SelCastle'];}
	 else if (!isset($SelCastle))
	 	{$SelCastle="krak";}
*/	 ?>
	<input type="Hidden" id="SelCountry" name="SelCountry" value="<?php echo $SelCountry ?>">
	<input type="Hidden" id="NextCountry" name="NextCountry" value="<?php echo $NextCountry ?>">
	<input type="Hidden" id="Language" name="Language" value="<?php echo $Language ;?>">

</FORM>

<!-- action was naar _rated -->
<FORM method="post" action="kastelen.php" id=form83 name=form83>
	<input type="Hidden" id="Language" name="Language" value="<?php echo $Language ;?>">
</FORM>

