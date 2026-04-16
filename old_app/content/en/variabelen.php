<?php
//	Teksten op SiteInfo
	$SiteInfoText_1 = " visits";
	$SiteInfoText_2 = "last change on ";

//	MenuTeksten
	if (empty($SubMenu))
		{
			$SubMenu = "main";
		}
//	Statistics
	$Text_Sh = "latest votes";
	$Text_S1 = "castle rating";
	$Text_S2 = "date";
	$Text_S3 = "answer";
	$Text_S4 = "poll";
	$Text_S5 = "votes of";
	$Text_S6 = "visitors";
	$Text_S7 = "total votes:";

//	Random
	$Text_Rh = "random castle";

//	Menu Index
	if ($Menu == "index")
	{
		$MenuText = "start";
		$Text_1 = "poll";
		if ($SubMenu == "main")
		{
			$SubMenuText = " ";
			$MenuText_4 = "Webrings and weblinks";
			$Text_4 = "Webrings and sites that link to topcastles.com";
			$Text_5 = "Special thanks to Wikimedia Commons community for the many open source pictures!";
		}
	}
//	Menu Achtergrond
	else if ($Menu == "achtergrond")
	{
		$MenuText = "background";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = "topcastles";
		$MenuText_1_1 = "definition of a castle";
		$MenuText_1_2 = "types of castles";
		$MenuText_2 = "the top 100";
		$MenuText_2_1 = "score calculation";
		$MenuText_2_2 = "resources";
		$MenuText_3 = "read more";
		$MenuText_3_1 = "websites";
		$MenuText_3_2 = "books";
		$MenuText_4 = "polls";
		$MenuText_4_1 = "poll results";
		$MenuText_4_2 = "former polls";
		$MenuText_5 = "pictures";
		$MenuText_5_1 = "photographers";
		$MenuText_5_2 = "send a message";
		if ($SubMenu == "main")
		{
			$SubMenuText = " > definition";
		}
	}
//	Menu Bezoekers
	else if ($Menu == "bezoekers")
	{
		$MenuText = "participate";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = $MenuText;
		$MenuText_1_0 = "guestbook";
		$MenuText_1_1 = "poll results";
		$MenuText_1_2 = "former polls";
		$MenuText_1_3 = "photographers";
		$MenuText_1_4 = "send a message";
		$MenuText_1_5 = "market place";
		$MenuText_1_6 = "missing pictures";
		if ($SubMenu == "main")
		{
			$SubMenuText = " > your castle photo";
		}
		if ($SubMenu == "afbeeldingen")
		{
			$SubMenuText = " > castles without picture";
			$FeatureTitel_1 = "Castles that have no picture yet";
		}
	}
//	Menu Topkastelen
	else if ($Menu == "topkastelen")
	{
		$MenuText = "topkastelen";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = "top 100 of 2012";
		$MenuText_1_1 = "the top 100";
		$MenuText_4 = "reference lists";
		$MenuText_2_1 = "sources rating";
		$MenuText_2_2 = "visitors rating 2012";
		$MenuText_2 = "actual visitors rating";
		$MenuText_2_2a = "biggest jump";
		$MenuText_2_3 = "most votes";
		$MenuText_2_4 = "no votes";
		$MenuText_2_5 = "lowest ratings";
		$MenuText_3 = "former lists";
		$FeatureTitel_2 = "The list";
		
		if ($SubMenu == "main")
		{
			$SubMenuText = " > the top 100";
			$FeatureTitel_1 = "The top 100 of medieval castles";
			$FeatureText1 = "Sum of the original top 100 derived from references used by topcastles.com and the visitors top 100 until January 1st, 2012.";
			$TextStemmenVan = "votes of";
			$TextBezoekers = "visitors";
		}
		if ($SubMenu == "main7")
		{
			$SubMenuText = " > the list";
			$FeatureTitel_1 = "The top 100 of 2007";
			$FeatureText1 = "Sum of the original top 100 derived from references used by topcastles.com and the visitors top 100 of January 1st, 2007.";
			$TextStemmenVan = "votes of";
			$TextBezoekers = "visitors";
		}
		if ($SubMenu == "main8")
		{
			$SubMenuText = " > the list";
			$FeatureTitel_1 = "The top 100 of 2008";
			$FeatureText1 = "Sum of the original top 100 derived from references used by topcastles.com and the visitors top 100 of January 1st, 2008.";
			$TextStemmenVan = "votes of";
			$TextBezoekers = "visitors";
		}
		if ($SubMenu == "main9")
		{
			$SubMenuText = " > the list";
			$FeatureTitel_1 = "The top 100 of 2009";
			$FeatureText1 = "Sum of the original top 100 derived from references used by topcastles.com and the visitors top 100 of January 1st, 2009.";
			$TextStemmenVan = "votes of";
			$TextBezoekers = "visitors";
		}
		if ($SubMenu == "main10")
		{
			$SubMenuText = " > the list";
			$FeatureTitel_1 = "The top 100 of 2010";
			$FeatureText1 = "Sum of the original top 100 derived from references used by topcastles.com and the visitors top 100 of January 1st, 2010.";
			$TextStemmenVan = "votes of";
			$TextBezoekers = "visitors";
		}
		if ($SubMenu == "main11")
		{
			$SubMenuText = " > the list";
			$FeatureTitel_1 = "The top 100 of 2011";
			$FeatureText1 = "Sum of the original top 100 derived from references used by topcastles.com and the visitors top 100 of January 1st, 2011.";
			$TextStemmenVan = "votes of";
			$TextBezoekers = "visitors";
		}
		if ($SubMenu == "lijsten")
		{
			$FeatureTitel_1_1 = "Position";
			$FeatureTitel_1_2 = "of the castle top 100";
			$SubMenuText = " > per 100";
		}
		if ($SubMenu == "bronnen")
		{
			$SubMenuText = " > sources 2012";
			$FeatureTitel_1 = "The top 100 of castles according to the sources used by topcastles.com.";
			$FeatureText1 = "Scores calculated by counting the reference score in topcastles.com's sources. This list is used for the top 100 of 2012, see menu 'background'.";
		}
		if ($SubMenu == "bezoekers")
		{
			$SubMenuText = " > visitors top 100 2012";
			$FeatureTitel_1 = "The visitors top 100 on Januari 1st 2012";
			$FeatureText1 = "This top 100 of castles according to visitors of topcastles.com. This list is used for the top 100 of 2012, see menu 'background'.";
			$TextStemmenVan = "votes of";
			$TextBezoekers = "visitors";
		}
		if ($SubMenu == "jump")
		{
			$SubMenuText = " > biggest jump";
			$FeatureTitel_1 = "Biggest jump in the top 100";
			$FeatureText1 = "The castles that made the biggest jump in the top 100 list of 2012 compared with the <a href='topkastelen.php?SubMenu=bronnen&Language=en'> reference list</a> due to votes of visitors of this site:";
		}
		if ($SubMenu == "preview")
		{
			$SubMenuText = " > sneak preview";
			$FeatureTitel_1 = "Sneak preview: The top 100 of 2014 in progress...";
			$FeatureText1 = "This list contains the latest visitors ratings which leads to the new top 100 for 2014 on January 1st of that year.";
			$TextStemmenVan = "votes of";
			$TextBezoekers = "visitors";
		}
		if ($SubMenu == "bezoekersaantal")
		{
			$SubMenuText = " > most rating by visitors";
			$FeatureTitel_1 = "The castles that that received the most votes";
			$FeatureText1 = "";
			$TextStemmenVan = "votes of";
			$TextBezoekers = "visitors";
		}
		if ($SubMenu == "bezoekerslaag")
		{
			$SubMenuText = " > lowest ratings by visitors";
			$FeatureTitel_1 = "Castles received low ratings by visitors of this site";
			$TextStemmenVan = "votes of";
			$TextBezoekers = "visitors";
		}
	}
//	Menu Kastelen
	else if ($Menu == "kastelen")
	{
		$MenuText = "top 100 > kasteel";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = "browse the list";
		$MenuText_1_1 = "next";
		$MenuText_1_2 = "previous";
		$MenuText_2 = "browse country";
		$MenuText_5 = "browse region";
		$MenuText_3 = "rate this castle";
		$MenuText_3_1 = "You can submit one vote per castle.";
		$MenuText_3_2 = "Your rating will be used in the top 100.<br>You can submit one vote per castle.<br><ul><li>1&nbsp;=&nbsp;Worthless&nbsp;&nbsp;&nbsp;10&nbsp;&nbsp;&nbsp;=&nbsp;Topcastle</li></ul>";
		$MenuText_4 = "rate";
		$Text1 = "not";
		$Text2 = "You rated ";
		$Text3 = "already";
		$Text4 = "";
		$SubMenuText = " ";
	}
//	Menu Per Land
	else if ($Menu == "landen")
	{
		$MenuText = "per country";
		$FeatureTitel_2 = "The list";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = "statistics";
		$MenuText_1_1 = "top countries";
		$MenuText_1_2 = "top regions";
		$MenuText_2 = "per country";
		$MenuText_2_1 = "belgium";
		$MenuText_2_2 = "germany";
		$MenuText_2_3 = "england";
		$MenuText_2_4 = "france";
		$MenuText_2_5 = "italy";
		$MenuText_2_6 = "netherlands";
		$MenuText_2_65 = "poland";
		$MenuText_2_7 = "scotland";
		$MenuText_2_8 = "spain";
		$MenuText_2_9 = "wales";
		$MenuText_2_10 = "czechia";
		$MenuText_2_11 = "austria";
		$MenuText_2_12 = "switzerland";
		$MenuText_2_13 = "hungary";
		$MenuText_3 = "per area";
		$MenuText_3_1 = "alps";
		$MenuText_3_2 = "benelux";
		$MenuText_3_3 = "british islands";
		$MenuText_3_4 = "outside europe";
		$MenuText_3_5 = "crusades";
		$MenuText_3_6 = "eastern europe";
		$MenuText_3_7 = "nordic";
		$MenuText_3_8 = "balkans";
		$MenuText_3_9 = "holy roman empire";
		$MenuText_3_10 = "asia";
		if ($SubMenu == "main")
		{
			$FeatureTitel_1 = "The top castles of ";
			$SubMenuText = " > country";
		}
		else if ($SubMenu == "gebied")
		{
			$FeatureTitel_1 = "The top castles of the area ";
			$SubMenuText = " > area";
		}
		else if ($SubMenu == "regio")
		{
			$FeatureTitel_1 = "The top castles of the region ";
			$SubMenuText = " > region";
		}
		else if ($SubMenu == "toplanden")
		{
			$FeatureTitel_1 = "The countries with the most top castles";
			$SubMenuText = " > top countries";
		}
		else if ($SubMenu == "topregios")
		{
			$FeatureTitel_1 = "The regions with the most top castles";
			$FeatureText_1 =   "Hover with your mouse over the thumbnail to enlarge the picture. 
								The pictures and the regions link to the list of top castles in that region.";
			$SubMenuText = " > top regions";
		}
	}
//	Menu Per Soort
	else if ($Menu == "soorten")
	{
		$MenuText = "per type";
		$FeatureTitel_2 = "The list";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = "location types";
		$MenuText_1_1 = "mountain castles";
		$MenuText_1_2 = "rock castles";
		$MenuText_1_3 = "water castles";
		$MenuText_1_4 = "harbour castles";
		$MenuText_1_5 = "city castles";
		$MenuText_2 = "building concepts";
		$MenuText_2_1 = "motte-and-bailey";
		$MenuText_2_2 = "later norman";
		$MenuText_2_3 = "ringwork castles";
		$MenuText_2_4 = "tower castles";
		$MenuText_2_5 = "rectangular";
		$MenuText_2_6 = "donjon inside curtain";
		$MenuText_2_7 = "donjon in curtain";
		$MenuText_2_8 = "donjon ouside curtain";
		$MenuText_4 = "condition types";
		$MenuText_4_1 = "intact";
		$MenuText_4_2 = "rebuild/restored";
		$MenuText_4_3 = "damaged";
		$MenuText_4_4 = "ruined";
		$MenuText_4_5 = "destroyed";
		$MenuText_3 = "extra";
		$MenuText_3_1 = "not a castle";
		if ($SubMenu == "main")
		{
			$SubMenuText = " > types";
		}
		else if ($SubMenu == "bouwconcept")
		{
			$SubMenuText = " > building concept";
			if ($SelCastleConcept == "1") {$KeuzeText = "Motte-and-bailey castles (early norman castles)";}
			elseif ($SelCastleConcept == "2") {$KeuzeText = "Later norman castles"; }
			elseif ($SelCastleConcept == "3") {$KeuzeText = "Ringwork castles";}
			elseif ($SelCastleConcept == "4") {$KeuzeText = "Tower or compact castles";}
			elseif ($SelCastleConcept == "5") {$KeuzeText = "Rectangular or polygonal castles";}
			elseif ($SelCastleConcept == "6") {$KeuzeText = "Castles with donjon inside curtain wall";}
			elseif ($SelCastleConcept == "7") {$KeuzeText = "Castles with donjon in curtain";}
			elseif ($SelCastleConcept == "8") {$KeuzeText = "Castles with donjon outside curtain";}
		}
		else if ($SubMenu == "ligging")
		{
			$SubMenuText = " > location type";
			if ($SelCastleType == "1") {$KeuzeText = "Mountain castles";}
			elseif ($SelCastleType == "2") {$KeuzeText = "Rock castles"; }
			elseif ($SelCastleType == "3") {$KeuzeText = "Water castles";}
			elseif ($SelCastleType == "4") {$KeuzeText = "Harbour castles";}
			elseif ($SelCastleType == "5") {$KeuzeText = "City castles";}
		}
		else if ($SubMenu == "toestand")
		{
			$SubMenuText = " > condition type";
			if ($SelCastleType == "1") {$KeuzeText = "Intact castles";}
			elseif ($SelCastleType == "2") {$KeuzeText = "Rebuild or restored castles"; }
			elseif ($SelCastleType == "3") {$KeuzeText = "Damaged castles";}
			elseif ($SelCastleType == "4") {$KeuzeText = "Ruined castles or castles that are only partly remained";}
			elseif ($SelCastleType == "5") {$KeuzeText = "Destroyed castles";}
		}
		else if ($SubMenu == "buitencategorie")
		{
			$SubMenuText = " > not a castle";
			$FeatureTitel_1 = "Top castles that do not meet the definition of a castle";
			$FeatureText_1 =   "Top castles that do not meet the definition of a castle as used by this site 
								(refer to menu background) 
								but that are mentioned in the resource that are used to calculate the scores for the top 100.";
		}
	}
//	Menu Zoeken
	else if ($Menu == "zoeken")
	{
		$MenuText = "search castle";
	//	Teksten voor Navigatiemenu
		$MenuText_1 = "search";
		$MenuText_1_1 = "change search string";
		$MenuText_1_2 = "new search";
		if ($SubMenu == "main")
		{
			$SubMenuText = " ";
		}
		if ($SubMenu == "resultaat")
		{
			$FeatureTitel_1 = "Search results";
			$SubMenuText = " > results";
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