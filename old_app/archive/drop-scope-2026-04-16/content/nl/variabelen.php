<?php
//	Teksten op SiteInfo
	$SiteInfoText_1 = " bezoeken";
	$SiteInfoText_2 = "laatste wijziging op ";

//	MenuTeksten
	if (empty($SubMenu))
		{
			$SubMenu = "main";
		}
//	Statistics
	$Text_Sh = "laatste stemmen";
	$Text_S1 = "kasteel oordeel";
	$Text_S2 = "datum";
	$Text_S3 = "antwoord";
	$Text_S4 = "enquete";
	$Text_S5 = "stemmen van";
	$Text_S6 = "bezoekers";
	$Text_S7 = "totaal aantal stemmen:";

//	Random
	$Text_Rh = "willekeurig kasteel";

//	Menu Index
	if ($Menu == "index")
	{
		$MenuText = "start";
		$Text_1 = "enquete";
		if ($SubMenu == "main")
		{
			$SubMenuText = " ";
			$MenuText_4 = "Webrings en weblinks";
			$Text_4 = "Webrings en sites met link naar topkastelen.nl";
			$Text_5 = "Met speciale dank aan Wikimedia Commons community voor de vele open source afbeeldingen.";
		}
	}
//	Menu Achtergrond
	else if ($Menu == "achtergrond")
	{
		$MenuText = "achtergrond";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = "topkastelen";
		$MenuText_1_1 = "definitie van kasteel";
		$MenuText_1_2 = "type kastelen";
		$MenuText_2 = "de top 100";
		$MenuText_2_1 = "bepaling van de scores";
		$MenuText_2_2 = "bronnen";
		$MenuText_3 = "meer info";
		$MenuText_3_1 = "websites";
		$MenuText_3_2 = "boeken";
		$MenuText_4 = "enqu&ecirc;tes";
		$MenuText_4_1 = "resultaat";
		$MenuText_4_2 = "oude enqu&ecirc;tes";
		$MenuText_5 = "afbeeldingen";
		$MenuText_5_1 = "bijdragen";
		$MenuText_5_2 = "stuur een bericht";
		if ($SubMenu == "main")
		{
			$SubMenuText = " > definitie";
		}
	}
//	Menu Bezoekers
	else if ($Menu == "bezoekers")
	{
		$MenuText = "doe mee";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = $MenuText;
		$MenuText_1_0 = "gastenboek";
		$MenuText_1_1 = "enqu&ecirc;teresultaat";
		$MenuText_1_2 = "oude enqu&ecirc;tes";
		$MenuText_1_3 = "fotografen";
		$MenuText_1_4 = "stuur een bericht";
		$MenuText_1_5 = "aangeboden";
		$MenuText_1_6 = "afbeeldingen";
		if ($SubMenu == "main")
		{
			$SubMenuText = " > uw kastelenfoto?";
		}
		if ($SubMenu == "afbeeldingen")
		{
			$SubMenuText = " > kastelen zonder afbeelding";
			$FeatureTitel_1 = "Kastelen waarbij nog een afbeelding ontbreekt";
		}
	}
//	Menu Topkastelen
	else if ($Menu == "topkastelen")
	{
		$MenuText = "topkastelen";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = "de top 100 van 2012";
		$MenuText_1_1 = "top 100";
		$MenuText_4 = "onderliggende lijsten";
		$MenuText_2_1 = "bronnen top 100";
		$MenuText_2_2 = "bezoekers top 100";
		$MenuText_2 = "actuele bezoekers lijsten";
		$MenuText_2_2a = "grootste sprong";
		$MenuText_2_3 = "meeste stemmen";
		$MenuText_2_4 = "zonder stemmen";
		$MenuText_2_5 = "laagste score";
		$MenuText_3 = "oude lijsten";
		$FeatureTitel_2 = "De lijst";

		if ($SubMenu == "main")
		{
			$SubMenuText = " > de top 100";
			$FeatureTitel_1 = "De top 100 van middeleeuwse kastelen";
			$FeatureText1 = "Samengesteld uit de oorspronkelijke top 100 volgens de bronnen van topkastelen.nl en de bezoekers top 100 tot en met 1 januari 2012.";
			$TextStemmenVan = "stemmen van";
			$TextBezoekers = "bezoekers";
		}
		if ($SubMenu == "main7")
		{
			$SubMenuText = " > de lijst";
			$FeatureTitel_1 = "De top 100 van 2007";
			$FeatureText1 = "Samengesteld uit de oorspronkelijke top 100 volgens de bronnen van topkastelen.nl en de bezoekers top 100 van 1 januari 2007.";
			$TextStemmenVan = "stemmen van";
			$TextBezoekers = "bezoekers";
		}
		if ($SubMenu == "main8")
		{
			$SubMenuText = " > de lijst";
			$FeatureTitel_1 = "De top 100 van 2008";
			$FeatureText1 = "Samengesteld uit de oorspronkelijke top 100 volgens de bronnen van topkastelen.nl en de bezoekers top 100 van 1 januari 2008.";
			$TextStemmenVan = "stemmen van";
			$TextBezoekers = "bezoekers";
		}
		if ($SubMenu == "main9")
		{
			$SubMenuText = " > de lijst";
			$FeatureTitel_1 = "De top 100 van 2009";
			$FeatureText1 = "Samengesteld uit de oorspronkelijke top 100 volgens de bronnen van topkastelen.nl en de bezoekers top 100 van 1 januari 2009.";
			$TextStemmenVan = "stemmen van";
			$TextBezoekers = "bezoekers";
		}
		if ($SubMenu == "main10")
		{
			$SubMenuText = " > de lijst";
			$FeatureTitel_1 = "De top 100 van 2010";
			$FeatureText1 = "Samengesteld uit de oorspronkelijke top 100 volgens de bronnen van topkastelen.nl en de bezoekers top 100 van 1 januari 2010.";
			$TextStemmenVan = "stemmen van";
			$TextBezoekers = "bezoekers";
		}
		if ($SubMenu == "main11")
		{
			$SubMenuText = " > de lijst";
			$FeatureTitel_1 = "De top 100 van 2011";
			$FeatureText1 = "Samengesteld uit de oorspronkelijke top 100 volgens de bronnen van topkastelen.nl en de bezoekers top 100 van 1 januari 2011.";
			$TextStemmenVan = "stemmen van";
			$TextBezoekers = "bezoekers";
		}
		if ($SubMenu == "lijsten")
		{
			$FeatureTitel_1_1 = "Positie";
			$FeatureTitel_1_2 = "van de kastelen top 100";
			$SubMenuText = " > per 100";
		}
		if ($SubMenu == "bronnen")
		{
			$SubMenuText = " > bronnen 2012";
			$FeatureTitel_1 = "De top 100 kastelen volgens de bronnen gebruikt voor topkastelen.nl";
			$FeatureText1 = "Samengesteld aan de hand van de bronnen van topkastelen.nl. Deze lijst is gebruikt voor het samenstellen van de top 100 voor 2012, zie menu achtergrond.";
		}
		if ($SubMenu == "bezoekers")
		{
			$SubMenuText = " > bezoekers top 100";
			$FeatureTitel_1 = "De bezoekers top 100 op 1 januari 2012.";
			$FeatureText1 = "Samengesteld door de bezoekers van topkastelen.nl. De scores uit de referentielijst is hier net meegenomen. Deze lijst is gebruikt voor het samenstellen van de top 100 voor 2012.";
			$TextStemmenVan = "stemmen van";
			$TextBezoekers = "bezoekers";
		}
		if ($SubMenu == "jump")
		{
			$SubMenuText = " > grootste sprong";
			$FeatureTitel_1 = "De grootste sprong in de top 100";
			$FeatureText1 = "De kastelen die door stemmen van bezoekers de grootste sprong hebben gemaakt in de top 100 lijst van 2012 vergeleken met de <a href='topkastelen.php?SubMenu=bronnen&Language=nl'>referentielijst</a>:";
		}
		if ($SubMenu == "preview")
		{
			$SubMenuText = " > sneak preview";
			$FeatureTitel_1 = "Sneak preview: De top 100 voor 2014 in de maak";
			$FeatureText1 = "Deze lijst is actueel bijgewerkt met de laatste bezoekersoordelen en nieuwe bronnen. Op 1 januari 2014 wordt dit de nieuwe lijst voor 2014.";
			$TextStemmenVan = "stemmen van";
			$TextBezoekers = "bezoekers";
		}
		if ($SubMenu == "bezoekersaantal")
		{
			$SubMenuText = " > meeste stemmen";
			$FeatureTitel_1 = "De kastelen met de meeste stemmen";
			$FeatureText1 = "";
			$TextStemmenVan = "stemmen van";
			$TextBezoekers = "bezoekers";
		}
		if ($SubMenu == "bezoekerslaag")
		{
			$SubMenuText = " > laagste score bezoekers";
			$FeatureTitel_1 = "De kastelen met de laagste score van bezoekers";
			$TextStemmenVan = "stemmen van";
			$TextBezoekers = "bezoekers";
		}
	}
//	Menu Kastelen
	else if ($Menu == "kastelen")
	{
		$MenuText = "top 100 > kasteel";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = "blader in de lijst";
		$MenuText_1_1 = "volgende";
		$MenuText_1_2 = "vorige";
		$MenuText_2 = "blader in land";
		$MenuText_5 = "blader in regio";
		$MenuText_3 = "stem op dit kasteel";
		$MenuText_3_1 = "U kunt per kasteel &eacute;&eacute;n keer stemmen.";
		$MenuText_3_2 = "Uw stem wordt meegeteld in de top 100.<br>U kunt per kasteel &eacute;&eacute;n keer stemmen.<br>1&nbsp;=&nbsp;waardeloos&nbsp;&nbsp;&nbsp;10&nbsp;=&nbsp;topkasteel&nbsp;</li></ul>";
		$MenuText_4 = "stem";
		$Text1 = "niet";
		$Text2 = "U heeft ";
		$Text3 = "al";
		$Text4 = " gestemd";
		$SubMenuText = " ";
	}
//	Menu Per Land
	else if ($Menu == "landen")
	{
		$MenuText = "per land";
		$FeatureTitel_2 = "De lijst";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = "statistieken";
		$MenuText_1_1 = "toplanden";
		$MenuText_1_2 = "topregio's";
		$MenuText_2 = "per land";
		$MenuText_2_1 = "belgi&euml;";
		$MenuText_2_2 = "duitsland";
		$MenuText_2_3 = "engeland";
		$MenuText_2_4 = "frankrijk";
		$MenuText_2_5 = "itali&euml";
		$MenuText_2_6 = "nederland";
		$MenuText_2_65 = "polen";
		$MenuText_2_7 = "schotland";
		$MenuText_2_8 = "spanje";
		$MenuText_2_9 = "wales";
		$MenuText_2_10 = "tsjechi&euml";
		$MenuText_2_11 = "oostenrijk";
		$MenuText_2_12 = "zwitserland";
		$MenuText_2_13 = "hongarije";
		$MenuText_3 = "per gebied";
		$MenuText_3_1 = "alpen";
		$MenuText_3_2 = "benelux";
		$MenuText_3_3 = "britse eilanden";
		$MenuText_3_4 = "buiten europa";
		$MenuText_3_5 = "kruistochten";
		$MenuText_3_6 = "oost europa";
		$MenuText_3_7 = "noord europa";
		$MenuText_3_8 = "balkan";
		$MenuText_3_9 = "heilige roomse rijk";
		$MenuText_3_10 = "azi&euml;";
		if ($SubMenu == "main")
		{
			$FeatureTitel_1 = "De topkastelen van ";
			$SubMenuText = " > land";
		}
		else if ($SubMenu == "gebied")
		{
			$FeatureTitel_1 = "De topkastelen van het gebied ";
		}
		else if ($SubMenu == "regio")
		{
			$FeatureTitel_1 = "De topkastelen van de regio ";
		}
		else if ($SubMenu == "toplanden")
		{
			$FeatureTitel_1 = "De landen met de meeste topkastelen";
		}
		else if ($SubMenu == "topregios")
		{
			$FeatureTitel_1 = "De regio's met de meeste topkastelen";
			$FeatureText_1 =   "Ga met de muis op een thumbnail staan om het plaatje te vergroten. 
								Als u op het plaatje of de regio klikt gaat u naar de lijst van kastelen in die regio.";
			$SubMenuText = " > topregio\'s";
		}
	}
//	Menu Per Soort
	else if ($Menu == "soorten")
	{
		$MenuText = "per type";
		$FeatureTitel_2 = "De lijst";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = "ligging";
		$MenuText_1_1 = "hoogteburchten";
		$MenuText_1_2 = "rotsburchten";
		$MenuText_1_3 = "waterburchten";
		$MenuText_1_4 = "havenburchten";
		$MenuText_1_5 = "stadsburchten";
		$MenuText_2 = "bouwconcept";
		$MenuText_2_1 = "mottekastelen";
		$MenuText_2_2 = "later normandisch";
		$MenuText_2_3 = "ringburchten";
		$MenuText_2_4 = "torenkastelen";
		$MenuText_2_5 = "rechthoekig";
		$MenuText_2_6 = "donjon binnen weerm.";
		$MenuText_2_7 = "donjon in weermuren";
		$MenuText_2_8 = "donjon buiten weerm.";
		$MenuText_4 = "toestand";
		$MenuText_4_1 = "intakt";
		$MenuText_4_2 = "herbouwd/verbouwd";
		$MenuText_4_3 = "beschadigd";
		$MenuText_4_4 = "ru&iuml;ne/restant";
		$MenuText_4_5 = "verwoest";
		$MenuText_3 = "extra";
		$MenuText_3_1 = "buitencategorie";
		if ($SubMenu == "main")
		{
			$SubMenuText = " > type";
		}
		else if ($SubMenu == "bouwconcept")
		{
			if ($SelCastleConcept == "1") {$KeuzeText = "Mottekastelen (vroege normandische kastelen)";}
			elseif ($SelCastleConcept == "2") {$KeuzeText = "Latere normandische kastelen"; }
			elseif ($SelCastleConcept == "3") {$KeuzeText = "Ringburchten";}
			elseif ($SelCastleConcept == "4") {$KeuzeText = "Toren- of compacte kastelen";}
			elseif ($SelCastleConcept == "5") {$KeuzeText = "Rechthoekige of veelhoekige kastelen";}
			elseif ($SelCastleConcept == "6") {$KeuzeText = "Kastelen met donjon binnen de weermuren";}
			elseif ($SelCastleConcept == "7") {$KeuzeText = "Kastelen met donjon in de weermuren";}
			elseif ($SelCastleConcept == "8") {$KeuzeText = "Kastelen met donjon buiten de weermuren";}
		}
		else if ($SubMenu == "ligging")
		{
			if ($SelCastleType == "1") {$KeuzeText = "Hoogteburchten";}
			elseif ($SelCastleType == "2") {$KeuzeText = "Rotsburchten"; }
			elseif ($SelCastleType == "3") {$KeuzeText = "Waterburchten";}
			elseif ($SelCastleType == "4") {$KeuzeText = "Havenburchten";}
			elseif ($SelCastleType == "5") {$KeuzeText = "Stadsburchten";}
		}
		else if ($SubMenu == "toestand")
		{
			$SubMenuText = " > toestand";
			if ($SelCastleType == "1") {$KeuzeText = "Intakte kastelen";}
			elseif ($SelCastleType == "2") {$KeuzeText = "Herbouwde of verbouwde kastelen"; }
			elseif ($SelCastleType == "3") {$KeuzeText = "Beschadigde kastelen";}
			elseif ($SelCastleType == "4") {$KeuzeText = "Ru&iuml;nes of kastelen waar alleen restant van over is";}
			elseif ($SelCastleType == "5") {$KeuzeText = "Verwoeste kastelen";}
		}
		else if ($SubMenu == "buitencategorie")
		{
			$FeatureTitel_1 = "Topkastelen die niet voldoen aan de definitie van kasteel";
			$FeatureText_1 =   "Topkastelen die niet voldoen aan de definitie van kasteel zoals die door deze site is gebruikt 
								(zie menu achtergrond</a>) 
								maar die in de bronnen die voor het bepalen van de top 100 scores zijn gebruikt wel besproken worden.";
		}
	}
//	Menu Zoeken
	else if ($Menu == "zoeken")
	{
		$MenuText = "zoeken";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = "zoeken";
		$MenuText_1_1 = "wijzig zoekactie";
		$MenuText_1_2 = "zoek opnieuw";
		if ($SubMenu == "main")
		{
			$SubMenuText = " ";
		}
		if ($SubMenu == "resultaat")
		{
			$FeatureTitel_1 = "Zoekresultaat";
			$SubMenuText = " > resultaat";
		}
	}
	else
	{
		$MenuText = $Menu;
		if ($SubMenu == "main")
		{
			$SubMenuText = " ";
		}
	}
	if (empty($SubMenuText))
		{
			$SubMenuText = " > " . $SubMenu;
		}
?>