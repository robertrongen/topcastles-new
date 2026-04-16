<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html>
<!-- DW6 -->
<head>
	<META http-equiv="Content-Type" CONTENT="text/html; charset=iso-8859-1">
	<META NAME="author" CONTENT="Robert Rongen">
	<?php
		//Vaststellen van de taal en zetten van $Language
		if (empty($Language)) 
		{
			if (ereg("topcastles", strtolower($_SERVER['HTTP_HOST'])))
			{$Language = "en";}
			else
			{$Language = "nl";}
		}	
			include ("content/$Language/ct_main_metadata.htm");
			include ("variables.php");
	?>
	<LINK REL="stylesheet" HREF="style/2col_leftNav.css" type="text/css">
	<LINK REL="shortcut icon" HREF="style/tk-shield.ico">
</head>
