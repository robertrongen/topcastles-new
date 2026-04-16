<table border="0" cellpadding="0" cellspacing="0">
	<tr><td>
  	<h2 id="top"><?php echo $line['castle_name'] ?></h2> 
	<table width="590">
		<tr bgcolor="#fff6de">
			<td>Country:&nbsp;</td><td><strong>
				<a href="javascript:document.form42.SubMenu.value='main';document.form42.SelCountry.value='<?php echo $line['land'] ?>';document.form42.submit();" >
			<?php 
				echo $line ['country']; 
			?></a></strong></td>
			<td>Founder:&nbsp;</td><td><strong><?php echo $line ['founder'] ?></strong></td>
		</tr>
		<tr>
			<td>Region:&nbsp;</td><td><strong>
				<a href="javascript:document.form42.SelRegion.value='<?php echo $line['region'] ?>';document.form42.SubMenu.value='regio';document.form42.submit();" >
			<?php 
				echo $line ['region'] 
			?></a></strong></td>
			<td>Building structure:&nbsp;</td><td><strong><?php echo $line ['castle_concept'] ?></strong></td>
		</tr>
		<tr bgcolor="#fff6de">
			<td>Place:&nbsp;</td><td><strong><?php echo $line ['place'] ?></strong></td>
			<td>Castle type:&nbsp;</td><td><strong><?php echo $line ['castle_type'] ?></strong></td>
		</tr>
		<tr>
			<td>Era:&nbsp;</td><td><strong><?php $era = $line ['era']; if ($era > 1) {echo $era."-th century";} ?></strong></td>
			<td>Condition:&nbsp;</td><td><strong><?php echo $line ['condition'] ?></strong></td>
		</tr>
	</table>
	<br>
	<table>
		<tr><td width="80">Description:&nbsp;</td><td><?php echo $line ['description'] ?></td></tr>
		<tr bgcolor="#fff6de"><td width="80">Remarkable:&nbsp;</td><td><?php echo $line ['remarkable'] ?></td></tr>
		<tr><td width="80">Website:&nbsp;</td><td><a href="<?php echo $line ['website'] ?>" target="_blank"><?php echo $line ['website'] ?></a></td></tr>
	</table>
	<br>
	</td>
	</tr>
	<?php
	//controle op images
	$filename="images/large/". $line['castle_code'].".jpg";
	if (file_exists($filename))
	{ ?> 
		<tr><td>
		<Img border=0 SRC=<?php echo "images/large/".$line['castle_code'].".jpg" ?> >
		</td></tr>
	<?php } 
	$filename="images/large/". $line['castle_code']."2.jpg";
	if (file_exists($filename))
	{ ?> 
		<tr><td>
		<Img border=0 SRC=<?php echo "images/large/".$line['castle_code']."2.jpg" ?> >
		</td></tr>
		<?php 
	} 
	$filename="images/large/". $line['castle_code']."3.jpg";
	if (file_exists($filename))
	{ ?> 
		<tr><td>
		<Img border=0 SRC=<?php echo "images/large/".$line['castle_code']."3.jpg" ?> >
		</td></tr>
	<?php 
	} 
	$filename="images/large/". $line['castle_code']."4.jpg";
	if (file_exists($filename))
	{ ?> 
		<tr><td>
		<Img border=0 SRC=<?php echo "images/large/".$line['castle_code']."4.jpg" ?> >
		</td></tr>
	<?php 
	} 
	$filename="images/large/". $line['castle_code']."5.jpg";
	if (file_exists($filename))
	{ ?> 
		<tr><td>
		<Img border=0 SRC=<?php echo "images/large/".$line['castle_code']."5.jpg" ?> >
		</td></tr>
	<?php 
	} 
	?>
	</tr>
</table>
