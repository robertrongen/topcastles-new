<FORM method="post" action="zoeken.php" id=form61 name=form61 >
	<?php
	 if (isset($HTTP_POST_VARS["SearchCastle"]) AND ($HTTP_POST_VARS["SearchCastle"]<>""))
		{$SearchCastle=$HTTP_POST_VARS["SearchCastle"];}
	 else
	 	{$SearchCastle="0";}

	 if (isset($HTTP_POST_VARS["SearchDesciption"]) AND ($HTTP_POST_VARS["SearchDesciption"]<>""))
		{$SearchDesciption=$HTTP_POST_VARS["SearchDesciption"];}
	 else
	 	{$SearchDesciption="0";}

	 if (isset($HTTP_POST_VARS["SearchPlace"]) AND ($HTTP_POST_VARS["SearchPlace"]<>""))
		{$SearchPlace=$HTTP_POST_VARS["SearchPlace"];}
	 else
	 	{$SearchPlace="0";}

	 if (isset($HTTP_POST_VARS["SearchRegion"]) AND ($HTTP_POST_VARS["SearchRegion"]<>""))
		{$SearchRegion=$HTTP_POST_VARS["SearchRegion"];}
	 else
	 	{$SearchRegion="0";}

	 if (isset($HTTP_POST_VARS["SearchCountry"]))
		{$SearchCountry=$HTTP_POST_VARS["SearchCountry"];}

	 if (isset($HTTP_POST_VARS["SearchGebied"]))
		{$SearchGebied=$HTTP_POST_VARS["SearchGebied"];}

	 if (isset($HTTP_POST_VARS["SearchCastleType"]))
		{$SearchCastleType=$HTTP_POST_VARS["SearchCastleType"];}

	 if (isset($HTTP_POST_VARS["SearchCastleConcept"]))
		{$SearchCastleConcept=$HTTP_POST_VARS["SearchCastleConcept"];}

	 if (isset($HTTP_POST_VARS["SearchFounder"]) AND ($HTTP_POST_VARS["SearchFounder"]<>""))
		{$SearchFounder=$HTTP_POST_VARS["SearchFounder"];}
	 else
	 	{$SearchFounder="0";}

	 if (isset($HTTP_POST_VARS["SearchEra"]))
		{$SearchEra=$HTTP_POST_VARS["SearchEra"];}

	 if (isset($HTTP_POST_VARS["SearchCondition"]))
		{$SearchCondition=$HTTP_POST_VARS["SearchCondition"];}

	 if (isset($HTTP_POST_VARS["Sorteer"]))
		{$Sorteer=$HTTP_POST_VARS["Sorteer"];}
	 else
	 	{$Sorteer="";}

	 if (isset($HTTP_POST_VARS["SubMenu"]))
		{$SubMenu=$HTTP_POST_VARS["SubMenu"];}
	 else
	 	{$SubMenu="main";}
	?>
	<input type="Hidden" id="SearchCastle" name="SearchCastle" value="<?php echo $SearchCastle ?>">
	<input type="Hidden" id="SearchDesciption" name="SearchDesciption" value="<?php echo $SearchDesciption ?>">
	<input type="Hidden" id="SearchPlace" name="SearchPlace" value="<?php echo $SearchPlace ?>">
	<input type="Hidden" id="SearchRegion" name="SearchRegion" value="<?php echo $SearchRegion ?>">
	<input type="Hidden" id="SearchCountry" name="SearchCountry" value="<?php echo $SearchCountry ?>">
	<input type="Hidden" id="SearchGebied" name="SearchGebied" value="<?php echo $SearchGebied ?>">
	<input type="Hidden" id="SearchCastleType" name="SearchCastleType" value="<?php echo $SearchCastleType ?>">
	<input type="Hidden" id="SearchCastleConcept" name="SearchCastleConcept" value="<?php echo $SearchCastleConcept ?>">
	<input type="Hidden" id="SearchFounder" name="SearchFounder" value="<?php echo $SearchFounder ?>">
	<input type="Hidden" id="SearchEra" name="SearchEra" value="<?php echo $SearchEra ?>">
	<input type="Hidden" id="SearchCondition" name="SearchCondition" value="<?php echo $SearchCondition ?>">
 	<input type="Hidden" id="Sorteer" name="Sorteer" value="<?php echo $Sorteer ?>">
 	<input type="Hidden" id="SubMenu" name="SubMenu" value="<?php echo $SubMenu ?>">
	<input type="Hidden" id="Language" name="Language" value="<?php echo $Language ;?>">
</FORM>
