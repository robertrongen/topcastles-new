<!-- start teller -->
<?php	
	include ("includes/counter.php");
?>
 
<!-- start header -->
<div id="masthead">
	<?php 
	//	include ("includes/change_language.php"); 
		include ("functions/menu.php"); 
	//	echo $Menu . "_" . $SubMenu;
		include ("content/$Language/ct_main_menu.php");
	?>
</div>

<!-- insert logo-->
<div id="Layer1" style="position: absolute; z-index:1; top: 0px; ">
	<a href="index.php?Language=<?php echo $Language ?>">	
		<img name="Topkastelen.nl" src="images/general/banner_<?php echo $Language; ?>.gif" alt="Topkastelen.nl">
	</a>
</div>

<!-- 
<div id="Layer1" style="position: absolute; z-index:0; top: 20px;">
	<img name="Topkastelen.nl" src="images/general/tk_achtergrond.gif">
</div>
-->
