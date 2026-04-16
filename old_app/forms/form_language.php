<FORM method="post" action="index.php" id=form1 name=form1>
<?php
 if (isset($HTTP_POST_VARS["Language"]))
	{$Language=$HTTP_POST_VARS["Language"];}
 else
	{
	if (!isset($Language)) {$Language="nl";}
	}
?>
<input type="Hidden" id="Language" name="Language" value="<?php echo $Language ?>">
</FORM>
