<html>
<body>
 <?php
$con=mysqli_connect("mysql.enginmercan.com","quoteuser","220588","enginmercancom_quotes");

if (mysqli_connect_errno()){
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

$result = mysqli_query($con,"SELECT * FROM quotes ORDER BY RAND() LIMIT 1");
$row = mysqli_fetch_array($result);

echo $row[1];

mysqli_close($con);
?> 

</body>
</html>