	<!-- variabelen zetten -->
	<?php
		//Forms laden
		include ("functions/perform_query.php");
		if (isset ($SelCastle)) { Global $SelCastle ; } 
		include ("forms/form_menu.php");
		include ("forms/form_kasteel.php");
		$Menu = strtolower($Menu);
		$SubMenu = strtolower($SubMenu);
		if (!isset($Language) || $Language !== "en")
			{$Language = "en";}
		$FormExist = "forms/form_{$Menu}.php";
		if (file_exists($FormExist))
			{include ("forms/form_{$Menu}.php");}
		//Variabelen laden
		include ("content/{$Language}/variabelen.php");
	?>
	
	<body bgcolor="#00005C">
	
		<!-- tabel voor positionering van pagina -->
		<table cellspacing="0" id="Main" width="1000px" border="0" cellpadding="0" bgcolor="#FFFFFF" align="center">
				<tr>
				<td colspan="2">
					<a name="top"></a>
					
					<!-- laden forms header, menu's en contentpagina's -->
					<?php
						include ("includes/header.php");
					//	include ("includes/breadcrumbs.php");
						include ("includes/ct_{$Menu}_{$SubMenu}.php");
						include ("includes/nb_{$Menu}.php");
						include ("includes/nb_random.php");
						include ("includes/nb_statistics.php");
					//  include ("includes/nb_amazon.php");
						include ("includes/siteinfo.php");
					?>
				</td>
			</tr>
			
		</table>
		
	</body>

</html>