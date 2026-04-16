<?php
	$Antwoord1 = Enquete($Enquete,1);
	$Antwoord2 = Enquete($Enquete,2);
	$Antwoord3 = Enquete($Enquete,3);
	$Antwoord4 = Enquete($Enquete,4);
	$Antwoord5 = Enquete($Enquete,5);
	$total = $Antwoord1 + $Antwoord2 + $Antwoord3 + $Antwoord4 + $Antwoord5;
?>
<div id="content" style="z-index: 4">
<?php
	include ("content/{$Language}/ct_{$Menu}_{$SubMenu}.php");
?>
</div>
