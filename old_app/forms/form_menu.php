<FORM method="post" action="<?php echo $Menu ?>.php" id=form3 name=form3>
	<?php
	 if (isset($HTTP_POST_VARS["SubMenu"]))
		{$SubMenu=$HTTP_POST_VARS["SubMenu"];}
	 else if (isset($_GET['SubMenu']))
	 	{$SubMenu= $_GET['SubMenu'];}
	 else if (!isset($SubMenu))
	 	{$SubMenu="main";}

	if ($Menu == "topkastelen")
	{
		$BlockedSubMenus = array("bezoekers", "jump", "preview", "bezoekersaantal", "bezoekerslaag", "evenveel", "zonder", "totaal");
		if (in_array($SubMenu, $BlockedSubMenus))
			{$SubMenu="main";}
	}
	if ($Menu == "top100" && $SubMenu == "totaal")
		{$SubMenu="main";}
	if ($Menu == "achtergrond") {
		$BlockedSubMenus = array("enquetes", "resultaat", "reageer");
		if (in_array($SubMenu, $BlockedSubMenus))
			{$SubMenu="main";}
	}
	if ($Menu == "bezoekers") {
		$BlockedSubMenus = array("enquetes", "resultaat", "stemmen");
		if (in_array($SubMenu, $BlockedSubMenus))
			{$SubMenu="main";}
	}
	?>
	<input type="Hidden" id="Menu" name="Menu" value="<?php echo $Menu ?>">
	<input type="Hidden" id="SubMenu3" name="SubMenu" value="<?php echo $SubMenu ?>">
</FORM>

<FORM method="post" action="landen.php" id=form42 name=form42>
	<?php
	 if (isset($HTTP_POST_VARS["SubMenu"]))
		{$SubMenu=$HTTP_POST_VARS["SubMenu"];}
	 else if (isset($_GET['SubMenu']))
	 	{$SubMenu= $_GET['SubMenu'];}
	 else if (!isset($SubMenu))
	 	{$SubMenu="main";}

	 if (isset($HTTP_POST_VARS["SelGebied"]))
		$SelGebied=$HTTP_POST_VARS["SelGebied"];
	 else
		$SelGebied="Benelux";

	 if (isset($HTTP_POST_VARS["SelCountry"]))
		$SelCountry=$HTTP_POST_VARS["SelCountry"];
	 else
		$SelCountry="Nederland";

	 if (isset($HTTP_POST_VARS["SelRegion"]))
		$SelRegion=$HTTP_POST_VARS["SelRegion"];
	 else
		$SelRegion="Gelderland";

	 if (isset($HTTP_POST_VARS["SelText"]))
		{
		$SelText=ucfirst($HTTP_POST_VARS["SelText"]);
		}
	 else
		$SelText=$SelCountry;

	?>
	<input type="Hidden" id="SubMenu" name="SubMenu" value="<?php echo $SubMenu ?>">
	<input type="Hidden" id="SelGebied" name="SelGebied" value="<?php echo $SelGebied ?>">
	<input type="Hidden" id="SelCountry" name="SelCountry" value="<?php echo $SelCountry ?>">
	<input type="Hidden" id="SelRegion" name="SelRegion" value="<?php echo $SelRegion ?>">
	<input type="Hidden" id="SelText" name="SelText" value="<?php echo $SelText ?>">
	<input type="Hidden" id="Language42" name="Language" value="<?php echo $Language ;?>">
</FORM>

