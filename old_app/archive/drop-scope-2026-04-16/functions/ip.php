<?php

function IP_lookup($IP)
{
	$ip_long = sprintf("%u", ip2long($IP));
//  verbinding maken met MySQL database
	include ("includes/dbconnect.php");

//  mysql_query("DELETE FROM stemmen WHERE FROM_UNIXTIME(time,'%d') != FROM_UNIXTIME(unix_timestamp(),'%d')");
	$query = mysql_query("SELECT * FROM `iptoc` WHERE (`ip_from` <= '" . $ip_long . "') AND (`ip_to` >= '" . $ip_long . "') LIMIT 1") or die(mysql_error());
    $result = mysql_num_rows($query);
	$countrycheck = mysql_fetch_array($query, MYSQL_ASSOC);
//	Controle of al gestemd is
	global $Country;
	if(empty($result))
	{ 
		$Country = "";
	}
	else 
	{ 
		$Country = $countrycheck['country_name'];
		$Country = ucwords(strtolower($Country));
	}
	return $Country;
}


function ip2country($ip)
{
    // Database
    mysql_connect('localhost', 'user', 'pass') or die('Cannot connect to server.');
    mysql_select_db('dbname') or die('Cannot find DB on server.');


    // Visit www.ip-to-country.com for the latest ip-to-country translations
        $ip_long = sprintf("%u", ip2long($ip));
        $sql = "SELECT * FROM `ip2country` WHERE (`range_start` <= '" . $ip_long . "') AND (`range_end` >= '" . $ip_long . "') LIMIT 1;";
        $rs = mysql_query($sql) or die('Error in query');

        if(mysql_num_rows($rs) > 0)
        {
            mysql_fetch_assoc($rs);
			return $array['country_name'];
        }
        else
        {
            return false;
        }
}

?>  
