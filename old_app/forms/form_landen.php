<FORM method="post" action="landen.php" id=form41 name=form41>
	<?php
	 if (isset($HTTP_POST_VARS["TellerVan"]))
		$TellerVan=$HTTP_POST_VARS["TellerVan"];
	 else
		$TellerVan="1";
	?>
	<input type="Hidden" id="TellerVan" name="TellerVan" value="<?php echo $TellerVan ?>">
</FORM>

