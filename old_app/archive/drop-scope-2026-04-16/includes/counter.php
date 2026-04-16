<?php

//  verbinding maken met MySQL database
	include ("includes/dbconnect.php");

// mySQL QUERIES TO FETCH CURRENT COUNT
	$file_name   = $_SERVER['PHP_SELF'];  //I.E. /mysql_counter.php, allows multipage automation
	$counter_que = "SELECT * FROM counter WHERE file = '$file_name'";
	$counter_sql = mysql_query($counter_que) or die("Query failed : " . mysql_error());
	$counter_row = mysql_fetch_array($counter_sql, MYSQL_ASSOC);
	$ip = getenv('REMOTE_ADDR'); 

// IF QUERY RETURNED EMPTY
	if (empty($counter_row['file']) || empty($counter_row['visitors']))
	// THEN CREATE A NEW COUNT OF 1 AND INSERT INTO DATABASE
		{
		$new_count = 1;
		mysql_query("INSERT INTO counter (file, visitors, ip, time) VALUES ('$file_name', '$new_count', '$ip', UNIX_TIMESTAMP() )");
		}
	
	// OTHERWISE IF NOT ME
	else if /*(($counter_row['ip'] <> $ip) AND */
		($ip <> '86.88.70.198')		/*)*/
	// THEN UPDATE OLD COUNT BY 1 AND INSERT INTO DATABASE
		{
		$new_count = $counter_row['visitors'] + 1;
		mysql_query("UPDATE counter SET visitors=$new_count, time=UNIX_TIMESTAMP(), ip='$ip' WHERE file = '$file_name' AND ip<> '$ip' ") OR DIE(mysql_error()); 
		}
		
	// ELSE RETURN NEWCOUNT
	else
		{
		$new_count = $counter_row['visitors'];
		}
?>