<?php 
	 if (isset($HTTP_POST_VARS["SelCastle"]))
		$SelCastle=$HTTP_POST_VARS["SelCastle"];
	 else if (isset($_GET['SelCastle']))
	 	{$SelCastle= $_GET['SelCastle'];}
	 else if (!isset($SelCastle))
	 	{$SelCastle="krak";}

	 if (isset($HTTP_POST_VARS["SelCountry"]))
		$SelCountry=$HTTP_POST_VARS["SelCountry"];
	 else if (isset($_GET['SelCountry']))
	 	{$SelCountry= $_GET['SelCountry'];}
	 else if (!isset($SelCountry))
	 	{$SelCountry="nederland";}

	 if (isset($HTTP_POST_VARS["SelGebied"]))
		$SelGebied=$HTTP_POST_VARS["SelGebied"];
	 else if (isset($_GET['SelGebied']))
	 	{$SelGebied= $_GET['SelGebied'];}
	 else if (!isset($SelGebied))
	 	{$SelGebied="benelux";}

	if (isset($HTTP_POST_VARS["Language"]))
		{$Language=$HTTP_POST_VARS["Language"];}
	else if (isset($_GET['Language']))
		{$Language= $_GET['Language'];}
	else if (!isset($Language))
		{$Language="nl";}
?>

<div id="right">
<table align="right">
<tr>
<td valign="middle">
	<a href=
		<?php 
			if ($Language == "nl")
			{ 
			?>
				"<?php echo $Menu . '.php?SubMenu=' . $SubMenu . '&amp;Language=en' ;
				 if (($Menu == "kastelen") AND ($SubMenu == "main")) { echo '&amp;SelCastle=' . $SelCastle ; } 
				 if (($Menu == "landen") AND ($SubMenu == "main")) { echo '&amp;SelCountry=' . $SelCountry ; } 
				 if (($Menu == "landen") AND ($SubMenu == "gebied")) { echo '&amp;SelGebied=' . $SelGebied ; } 
				 ?>">
				switch to english site
				</a>
			<?php 
			}
			else
			{
			?>
				"<?php echo $Menu . '.php?SubMenu=' . $SubMenu . '&amp;Language=nl' ;
				 if (($Menu == "kastelen") AND ($SubMenu == "main")) { echo '&amp;SelCastle=' . $SelCastle ; } 
				 if (($Menu == "landen") AND ($SubMenu == "main")) { echo '&amp;SelCountry=' . $SelCountry ; } 
				 if (($Menu == "landen") AND ($SubMenu == "gebied")) { echo '&amp;SelGebied=' . $SelGebied ; } 
				 ?>">
				naar nederlandse site&nbsp;
				</a>
			<?php 
			}	
		?>
</td>
</tr>
</table>

</div>