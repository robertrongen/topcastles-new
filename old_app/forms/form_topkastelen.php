<FORM method="post" action="topkastelen.php" id=form31 name=form31>
	<?php
	 if (isset($HTTP_POST_VARS["TellerVan"]))
		$TellerVan=$HTTP_POST_VARS["TellerVan"];
	 else
		$TellerVan="1";

	 if (isset($HTTP_POST_VARS["SubMenu"]))
		{$SubMenu=$HTTP_POST_VARS["SubMenu"];}
	 else if (!isset($SubMenu))
	 	{$SubMenu="main";}
	?>
	<input type="Hidden" id="TellerVan" name="TellerVan" value="<?php echo $TellerVan ?>">
	<input type="Hidden" id="SubMenu" name="SubMenu" value="<?php echo $SubMenu ?>">
	<input type="Hidden" id="Language" name="Language" value="<?php echo $Language ;?>">
</FORM>
