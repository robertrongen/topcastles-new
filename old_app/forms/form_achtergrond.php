<FORM method="post" action="achtergrond.php" id=form71 name=form71>
	<?php
		if (isset($HTTP_POST_VARS["Answer"]))
		{
			$Answer=$HTTP_POST_VARS["Answer"];
		}
		else
		{
			$Answer="0";
		}
		
		if (isset($HTTP_POST_VARS["SubMenu"]))
		{
			$SubMenu=$HTTP_POST_VARS["SubMenu"];
		}
	?>
	<input type="Hidden" id="Answer" name="Answer" value="<?php echo $Answer ?>">
	<input type="Hidden" id="SubMenu" name="SubMenu" value="<?php echo $SubMenu ?>">
	<input type="Hidden" id="Enquete" name="Enquete" value="<?php echo $Enquete ?>">
	<?php
		include ("functions/enquete.php");
		SchrijfAntwoord($Enquete,$Answer);
	?>
</FORM>

<FORM method="post" action="achtergrond.php" id=form72 name=form72>
	<?php
		if (isset($HTTP_POST_VARS["SubMenu"]))
		{
			$SubMenu=$HTTP_POST_VARS["SubMenu"];
		}
	?>
	<input type="Hidden" id="SubMenu" name="SubMenu" value="<?php echo $SubMenu ?>">
	<input type="hidden" name="MAX_FILE_SIZE" value="1000000">
	<input type="hidden" name="path_to_file" value="/var/www/html/upload">
	<input type="hidden" name="require" value="email">
	<input type="hidden" name="recipient" value="topkastelen@topkastelen.nl">
	<input type="hidden" name="env_report" value="REMOTE_HOST,HTTP_USER_AGENT">
</FORM>
