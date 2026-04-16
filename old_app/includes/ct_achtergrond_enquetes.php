<div id="content" style="z-index: 4">
<?php
	$Teller = $Enquete - 1;
	while ($Teller > 0)
	{
		$EnqueteContent = $Teller;
		$Antwoord1 = Enquete($Teller,1);
		$Antwoord2 = Enquete($Teller,2);
		$Antwoord3 = Enquete($Teller,3);
		$Antwoord4 = Enquete($Teller,4);
		$Antwoord5 = Enquete($Teller,5);
		$Antwoord6 = Enquete($Teller,6);
		$total = $Antwoord1 + $Antwoord2 + $Antwoord3 + $Antwoord4 + $Antwoord5 + $Antwoord6;
		include ("content/{$Language}/ct_{$Menu}_{$SubMenu}.php");
		$Teller = $Teller - 1;
	}
?>
</div>
