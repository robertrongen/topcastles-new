<FORM method="post" action="soorten.php" id=form51 name=form51>
	<?php
	 if (isset($HTTP_POST_VARS["TellerVan"]))
		$TellerVan=$HTTP_POST_VARS["TellerVan"];
	 else
		$TellerVan="1";
	?>
	<input type="Hidden" id="TellerVan" name="TellerVan" value="<?php echo $TellerVan ?>">
	<input type="Hidden" id="Language" name="Language" value="<?php echo $Language ;?>">
</FORM>

<FORM method="post" action="soorten.php" id=form52 name=form52>
	<?php
	 if (isset($HTTP_POST_VARS["SelCastleType"]))
		{
			$SelCastleType=$HTTP_POST_VARS["SelCastleType"];
			$SubMenu= "ligging";
		}
	 else
		{$SelCastleType= "0" ;}
?>
	<input type="Hidden" id="SelCastleType" name="SelCastleType" value="<?php echo $SelCastleType ?>">
	<input type="Hidden" id="SubMenu" name="SubMenu" value="<?php echo $SubMenu ?>">
	<input type="Hidden" id="Language52" name="Language" value="<?php echo $Language ;?>">
</FORM>

<FORM method="post" action="soorten.php" id=form54 name=form54>
	<?php
	 if (isset($HTTP_POST_VARS["SelCastleToestand"]))
		{
			$SelCastleType=$HTTP_POST_VARS["SelCastleToestand"];
			$SubMenu= "toestand";
		}
	 else
		{$SelCastleType= "0" ;}
?>
	<input type="Hidden" id="SelCastleToestand" name="SelCastleToestand" value="<?php echo $SelCastleToestand ?>">
	<input type="Hidden" id="SubMenu" name="SubMenu" value="<?php echo $SubMenu ?>">
	<input type="Hidden" id="Language54" name="Language" value="<?php echo $Language ;?>">
</FORM>

<FORM method="post" action="soorten.php" id=form53 name=form53>
	<?php
	 if (isset($HTTP_POST_VARS["SelCastleConcept"]))
		{
			$SelCastleConcept=$HTTP_POST_VARS["SelCastleConcept"];
			$SubMenu= "bouwconcept";
		}
	 else
		{$SelCastleConcept= "0" ;}
?>
	<input type="Hidden" id="SelCastleConcept" name="SelCastleConcept" value="<?php echo $SelCastleConcept ?>">
	<input type="Hidden" id="SubMenu" name="SubMenu" value="<?php echo $SubMenu ?>">
	<input type="Hidden" id="Language53" name="Language" value="<?php echo $Language ;?>">
</FORM>
