<?php
	$Antwoord1 = Enquete(6,1);
	$Antwoord2 = Enquete(6,2);
	$Antwoord3 = Enquete(6,3);
	$Antwoord4 = Enquete(6,4);
	$Antwoord5 = Enquete(6,5);
	$total = $Antwoord1 + $Antwoord2 + $Antwoord3 + $Antwoord4 + $Antwoord5;
	include ("functions/swap_image.js");
?>
<body onLoad="MM_preloadImages('images/large/doornroosje.jpg')">

<div id="content" style="z-index: 4">
<?php
	include ("content/{$Language}/ct_{$Menu}_{$SubMenu}.php");
?>
</div>
