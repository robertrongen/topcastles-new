<div id="navBar">

	<div id="sectionLinks" style="z-index: 3">
		<h3><?php echo $MenuText_1; ?></h3>
		<ul>
			<li><a href="javascript:document.form3.SubMenu.value='main';document.form3.submit();">
			&nbsp;&nbsp;<?php echo $MenuText_1_1; ?></a></li>
			<li><a href="javascript:document.form32.SubMenu.value='plaatjes';document.form32.TellerVan.value='1';document.form32.submit();">
			&nbsp;&nbsp;thumbnails 1-20</a></li>
			<li><a href="javascript:document.form32.SubMenu.value='plaatjes';document.form32.TellerVan.value='21';document.form32.submit();">
			&nbsp;&nbsp;thumbnails 21-40</a></li>
			<li><a href="javascript:document.form32.SubMenu.value='plaatjes';document.form32.TellerVan.value='41';document.form32.submit();">
			&nbsp;&nbsp;thumbnails 41-60</a></li>
			<li><a href="javascript:document.form32.SubMenu.value='plaatjes';document.form32.TellerVan.value='61';document.form32.submit();">
			&nbsp;&nbsp;thumbnails 61-80</a></li>
			<li><a href="javascript:document.form32.SubMenu.value='plaatjes';document.form32.TellerVan.value='81';document.form32.submit();">
			&nbsp;&nbsp;thumbnails 81-100</a></li>
		</ul>
        <h3><?php if ($Language==nl) { echo "de hele lijst" ; } else { echo "the whole list" ; } ?></h3>
		<ul>
			<li><a href="<?php Menu(topkastelen,$Language,main) ?>"><?php if ($Language==nl) { echo "&nbsp;&nbsp;en meer lijsten" ; } else { echo "&nbsp;&nbsp;and more lists" ; } ?></a></li>
		</ul>
	</div> 


</div>